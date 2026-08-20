import { execFile } from 'node:child_process';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { requireBrowser } from './browser.js';
import { CommandSwiftUiRenderer, CommandVisualJudge } from './command-adapters.js';
import { mountComponent } from './component.js';
import {
  combineAbortSignals,
  portablePath,
  redactUrl,
  resolveFileInside,
  resolvePathInside,
  sha256,
  validateRenderUrl,
} from './security.js';
import { RunStore } from './store.js';
import type {
  CaptureEvidence,
  CaptureRunner,
  EvaluateInput,
  EvaluateOutput,
  FileRecord,
  RenderInput,
  RenderOutput,
  RenderTarget,
  RunManifest,
  ServerConfig,
  SwiftUiRenderer,
  TraceInput,
  TraceOutput,
  VisualJudge,
  VisualJudgeResult,
  Viewport,
} from './types.js';

const execFileAsync = promisify(execFile);
const CAPTURE_SCRIPT = fileURLToPath(new URL('./vendor/capture.mjs', import.meta.url));
const COMPARE_SCRIPT = fileURLToPath(new URL('./vendor/compare.mjs', import.meta.url));
const DEFAULT_STATES = ['default'];
const DEFAULT_VIEWPORTS = [{ width: 390, height: 844 }, { width: 1280, height: 800 }];

export type ServiceOptions = {
  captureRunner?: CaptureRunner;
  visualJudge?: VisualJudge;
  swiftUiRenderer?: SwiftUiRenderer;
};

type ResourceResult = {
  bytes: Buffer;
  mimeType: string;
  name: string;
};

function now(): string {
  return new Date().toISOString();
}

function elapsedMs(started: bigint): number {
  return Number((Number(process.hrtime.bigint() - started) / 1_000_000).toFixed(3));
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function stableUnique(values: string[]): string[] {
  return [...new Set(values)];
}

function traceProvenanceError(manifest: RunManifest): string | null {
  const missing: string[] = [];
  if (!manifest.skillFiles.some((record) => record.loadStatus === 'observed')) {
    missing.push('observed skill files');
  }
  if (!manifest.sourceFiles.length) missing.push('source files');
  if (!manifest.artifactFiles.length) missing.push('artifact files');
  if (!missing.length) return null;
  return [
    `trace not applicable: render manifest is missing required provenance (${missing.join(', ')});`,
    'rerun ads_render with provenance.observedSkillFiles, provenance.sourceFiles,',
    'and provenance.artifactFiles before calling ads_trace',
  ].join(' ');
}

function normalizeStates(states: string[] | undefined): string[] {
  const requested = stableUnique((states?.length ? states : DEFAULT_STATES).map((state) => state.trim()));
  if (requested.some((state) => !/^[a-z][a-z0-9_-]{0,63}$/i.test(state))) {
    throw new Error('states must use letters, numbers, underscores, or hyphens');
  }
  return requested.includes('default') ? requested : ['default', ...requested];
}

function normalizeViewports(viewports: Viewport[] | undefined): Viewport[] {
  const values = viewports?.length ? viewports : DEFAULT_VIEWPORTS;
  const unique = new Map<string, Viewport>();
  for (const viewport of values) {
    if (!Number.isInteger(viewport.width) || !Number.isInteger(viewport.height)) {
      throw new Error('viewport width and height must be integers');
    }
    if (viewport.width < 240 || viewport.width > 7680 || viewport.height < 240 || viewport.height > 7680) {
      throw new Error(`viewport is outside the supported range: ${viewport.width}x${viewport.height}`);
    }
    unique.set(`${viewport.width}x${viewport.height}`, viewport);
  }
  return [...unique.values()];
}

function sanitizedTarget(target: RenderTarget): RenderTarget {
  if (target.type === 'url') return { type: 'url', url: redactUrl(target.url) };
  if (target.type === 'component') {
    return { type: 'component', path: target.path, exportName: target.exportName || 'default' };
  }
  return {
    type: 'swiftui',
    projectPath: target.projectPath,
    scheme: target.scheme,
    ...(target.sourcePath ? { sourcePath: target.sourcePath } : {}),
    configuration: target.configuration || 'Debug',
    ...(target.device ? { device: target.device } : {}),
  };
}

function arrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function stateBlockers(gates: Record<string, unknown>, states: string[]): string[] {
  const blockers: string[] = [];
  const rendered = gates.stateRendered;
  for (const state of states) {
    if (!rendered || typeof rendered !== 'object' || (rendered as Record<string, unknown>)[state] !== true) {
      blockers.push(`requested state did not render distinctly: ${state}`);
    }
  }
  return blockers;
}

function webRenderBlockers(gates: Record<string, unknown>, states: string[], maxCls: number): string[] {
  const blockers: string[] = [];
  if (gates.axeAvailable !== true) blockers.push('axe evidence is unavailable');
  if (Number(gates.seriousAxeViolations || 0) > 0) blockers.push('serious or critical axe violations remain');
  if (arrayLength(gates.horizontalOverflowAt) > 0) blockers.push('horizontal overflow was rendered');
  if (arrayLength(gates.landmarkFailures) > 0) blockers.push('a rendered state is missing its main landmark');
  if (arrayLength(gates.liveRegionFailures) > 0) blockers.push('a loading or error state is missing live-region semantics');
  const undersizedTargets = Array.isArray(gates.touchTargetsUnder48)
    ? gates.touchTargetsUnder48
    : gates.touchTargetsUnder44;
  if (arrayLength(undersizedTargets) > 0) blockers.push('undersized touch targets remain');
  if (gates.clsAvailable !== true) blockers.push('CLS evidence is unavailable');
  if (Number(gates.maxCumulativeLayoutShift || 0) > maxCls || arrayLength(gates.clsFailures) > 0) {
    blockers.push(`cumulative layout shift exceeds ${maxCls}`);
  }
  const modalInteractions = gates.modalInteractions;
  if (!modalInteractions || typeof modalInteractions !== 'object') {
    blockers.push('modal interaction receipt is unavailable');
  } else if ((modalInteractions as Record<string, unknown>).passed !== true) {
    blockers.push('modal interaction receipt failed');
  }
  blockers.push(...stateBlockers(gates, states));
  return blockers;
}

function swiftUiRenderBlockers(
  gates: Record<string, unknown>,
  states: string[],
  detectors: string[],
): string[] {
  const blockers: string[] = [];
  if (gates.adapterAvailable !== true) blockers.push('SwiftUI adapter evidence is unavailable');
  if (gates.buildSucceeded !== true) blockers.push('SwiftUI build or preview capture did not succeed');
  blockers.push(...stateBlockers(gates, states));
  const detectorGates: Record<string, { available: string; failures: string; label: string }> = {
    swiftlint: { available: 'swiftLintAvailable', failures: 'swiftLintErrors', label: 'SwiftLint' },
    swiftsyntax: { available: 'swiftSyntaxAvailable', failures: 'swiftSyntaxErrors', label: 'SwiftSyntax' },
    'asset-catalog': {
      available: 'assetCatalogAvailable',
      failures: 'assetCatalogErrors',
      label: 'asset catalog',
    },
    'touch-target-44pt': {
      available: 'touchTargetsAvailable',
      failures: 'touchTargetsUnder44',
      label: '44pt touch-target',
    },
  };
  for (const detector of detectors) {
    const contract = detectorGates[detector];
    if (!contract) continue;
    if (gates[contract.available] !== true) blockers.push(`${contract.label} evidence is unavailable`);
    if (arrayLength(gates[contract.failures]) > 0) blockers.push(`${contract.label} failures remain`);
  }
  return blockers;
}

async function snapshotBlockers(
  evidenceDirectory: string,
  evidence: CaptureEvidence,
  states: string[],
  viewports: Viewport[],
): Promise<string[]> {
  const blockers: string[] = [];
  const snapshots = evidence.snapshots || [];
  const pairs = new Set<string>();
  for (const snapshot of snapshots) {
    if (
      !snapshot.screenshot
      || path.basename(snapshot.screenshot) !== snapshot.screenshot
      || !snapshot.screenshot.endsWith('.png')
    ) {
      blockers.push('snapshot evidence contains an invalid screenshot filename');
      continue;
    }
    const pair = `${snapshot.state}\u0000${snapshot.breakpoint}`;
    if (pairs.has(pair)) blockers.push(`snapshot evidence contains a duplicate pair: ${snapshot.state}/${snapshot.breakpoint}`);
    pairs.add(pair);
    try {
      await resolveFileInside(evidenceDirectory, snapshot.screenshot);
    } catch {
      blockers.push(`snapshot file is missing: ${snapshot.screenshot}`);
    }
  }
  for (const state of states) {
    for (const { width, height } of viewports) {
      const breakpoint = `${width}x${height}`;
      if (!pairs.has(`${state}\u0000${breakpoint}`)) {
        blockers.push(`snapshot evidence is missing: ${state}/${breakpoint}`);
      }
    }
  }
  return blockers;
}

function validateJudgeResult(
  result: VisualJudgeResult,
  rubric: EvaluateInput['rubric'],
  allowedArtifacts: Map<string, { state: string; breakpoint: string }>,
): VisualJudgeResult {
  if (!result.provider.trim() || !result.model.trim()) throw new Error('judge provider and model are required');
  if (!Number.isInteger(result.modelCalls) || result.modelCalls < 0) {
    throw new Error('judge modelCalls must be a non-negative integer');
  }
  const criteria = new Set(rubric.criteria.map(({ name }) => name));
  const scoreNames = Object.keys(result.scores);
  if (scoreNames.length !== criteria.size || scoreNames.some((name) => !criteria.has(name))) {
    throw new Error('judge scores must match the requested rubric criteria exactly');
  }
  for (const [name, score] of Object.entries(result.scores)) {
    if (!Number.isFinite(score) || score < 0 || score > 10) {
      throw new Error(`judge score must be between 0 and 10: ${name}`);
    }
  }
  for (const finding of result.findings) {
    if (!criteria.has(finding.rubricRow)) throw new Error(`finding references an unknown rubric row: ${finding.rubricRow}`);
    const referencedScreenshot = allowedArtifacts.get(finding.artifact);
    if (!referencedScreenshot) throw new Error(`finding references unknown artifact: ${finding.artifact}`);
    if (
      finding.state !== referencedScreenshot.state
      || finding.breakpoint !== referencedScreenshot.breakpoint
    ) {
      throw new Error('finding state and breakpoint must match its screenshot artifact');
    }
    if (finding.evidence.some((artifact) => !allowedArtifacts.has(artifact))) {
      throw new Error('finding evidence must reference supplied screenshot artifacts');
    }
  }
  if (
    result.verdict === 'satisfied'
    && result.findings.some((finding) =>
      finding.severity === 'blocker'
      || (finding.category === 'cues_affordances' && finding.severity === 'major')
    )
  ) {
    throw new Error('judge cannot return satisfied with blocking findings');
  }
  if (result.verdict !== 'satisfied' && !result.nextRevisionPrompt.trim()) {
    throw new Error('judge must return a nextRevisionPrompt for a non-satisfied verdict');
  }
  return result;
}

async function defaultCaptureRunner(args: Parameters<CaptureRunner>[0]): Promise<void> {
  await requireBrowser();
  const command = [
    CAPTURE_SCRIPT,
    args.url,
    '--states',
    args.states.join(','),
    '--breakpoints',
    args.viewports.map(({ width, height }) => `${width}x${height}`).join(','),
    '--settle',
    String(args.settleMs),
    '--max-cls',
    String(args.maxCls),
    '--out',
    args.outDir,
  ];
  if (args.waitFor) command.push('--wait', args.waitFor);
  const signal = combineAbortSignals(args.signal, args.timeoutMs);
  await execFileAsync(process.execPath, command, {
    cwd: args.cwd,
    signal,
    maxBuffer: 8 * 1024 * 1024,
  });
}

async function fileRecord(
  root: string,
  input: string,
  kind: FileRecord['kind'],
  loadStatus?: FileRecord['loadStatus'],
): Promise<FileRecord> {
  const absolute = await resolveFileInside(root, input);
  const bytes = await readFile(absolute);
  const details = await stat(absolute);
  return {
    path: portablePath(root, absolute),
    sha256: sha256(bytes),
    bytes: details.size,
    kind,
    ...(loadStatus ? { loadStatus } : {}),
  };
}

async function collectRecords(
  root: string,
  paths: string[],
  kind: FileRecord['kind'],
  loadStatus?: FileRecord['loadStatus'],
): Promise<FileRecord[]> {
  const records = await Promise.all(stableUnique(paths).map((input) => fileRecord(root, input, kind, loadStatus)));
  return records.sort((left, right) => left.path.localeCompare(right.path));
}

function mergeSkillRecords(observed: FileRecord[], declared: FileRecord[]): FileRecord[] {
  const records = new Map(declared.map((record) => [record.path, record]));
  for (const record of observed) records.set(record.path, record);
  return [...records.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function summarizeCaptureEvidence(evidence: CaptureEvidence): Record<string, unknown> {
  return evidence.gates && typeof evidence.gates === 'object' ? evidence.gates : {};
}

function resourceUri(runId: string, artifact: string): string {
  return `ads://runs/${runId}/${artifact}`;
}

function safeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'AbortError') return 'operation cancelled or timed out';
    return error.message.split('\n')[0] || error.name;
  }
  return String(error);
}

export class AdsService {
  readonly config: ServerConfig;
  readonly store: RunStore;
  private readonly captureRunner: CaptureRunner;
  private readonly visualJudge?: VisualJudge;
  private readonly swiftUiRenderer?: SwiftUiRenderer;

  private constructor(config: ServerConfig, store: RunStore, options: ServiceOptions) {
    this.config = config;
    this.store = store;
    this.captureRunner = options.captureRunner || defaultCaptureRunner;
    this.visualJudge = options.visualJudge || (
      config.judgeCommand ? new CommandVisualJudge(config.judgeCommand) : undefined
    );
    this.swiftUiRenderer = options.swiftUiRenderer || (
      config.swiftUiCommand ? new CommandSwiftUiRenderer(config.swiftUiCommand) : undefined
    );
  }

  static async create(config: ServerConfig, options: ServiceOptions = {}): Promise<AdsService> {
    const store = await RunStore.create(config.root, config.runsDir);
    return new AdsService(config, store, options);
  }

  async render(input: RenderInput, signal?: AbortSignal): Promise<RenderOutput> {
    const started = process.hrtime.bigint();
    const runId = this.store.newRunId();
    const states = normalizeStates(input.states);
    const viewports = normalizeViewports(input.viewports);
    const settleMs = input.settleMs ?? 450;
    const maxCls = input.maxCls ?? 0.1;
    if (!Number.isFinite(settleMs) || settleMs < 0 || settleMs > 30_000) {
      throw new Error('settleMs must be between 0 and 30000');
    }
    if (!Number.isFinite(maxCls) || maxCls < 0 || maxCls > 1) {
      throw new Error('maxCls must be between 0 and 1');
    }

    const provenance = input.provenance || {};
    const observed = await collectRecords(
      this.config.root,
      provenance.observedSkillFiles || [],
      'skill',
      'observed',
    );
    const declared = await collectRecords(
      this.config.root,
      provenance.declaredSkillFiles || [],
      'skill',
      'declared',
    );
    const sourceFiles = await collectRecords(this.config.root, provenance.sourceFiles || [], 'source');
    const artifactInputs = [...(provenance.artifactFiles || [])];
    if (input.target.type === 'component') artifactInputs.push(input.target.path);
    if (input.target.type === 'swiftui' && input.target.sourcePath) artifactInputs.push(input.target.sourcePath);
    const artifactFiles = await collectRecords(this.config.root, artifactInputs, 'artifact');
    if (input.target.type === 'url') validateRenderUrl(input.target.url, this.config.allowedOrigins);
    let swiftProjectPath: string | undefined;
    let swiftSourcePath: string | undefined;
    if (input.target.type === 'swiftui') {
      if (!input.target.scheme.trim()) throw new Error('SwiftUI target scheme is required');
      swiftProjectPath = await resolvePathInside(this.config.root, input.target.projectPath);
      if (input.target.sourcePath) {
        swiftSourcePath = await resolveFileInside(this.config.root, input.target.sourcePath);
      }
    }

    const target = sanitizedTarget(input.target);
    const platform = target.type === 'swiftui' ? 'swiftui' : 'web';
    const renderer = platform === 'swiftui'
      ? this.swiftUiRenderer?.id || 'unconfigured'
      : 'playwright-chromium';
    const detectors = platform === 'swiftui'
      ? this.swiftUiRenderer?.detectors || []
      : [
        'axe-wcag2a-aa',
        'horizontal-overflow',
        'main-and-live-regions',
        'cumulative-layout-shift',
        'state-distinctness',
        'touch-target-48px',
      ];
    const manifest: RunManifest = {
      schemaVersion: 1,
      runId,
      generatedAt: now(),
      projectRootSha256: sha256(this.config.root),
      platform,
      renderer,
      detectors,
      target,
      adsRelease: provenance.adsRelease || null,
      skillFiles: mergeSkillRecords(observed, declared),
      sourceFiles,
      artifactFiles,
    };

    return this.store.createRun(runId, async (directory) => {
      const evidenceDirectory = path.join(directory, 'evidence');
      await writeJson(path.join(directory, 'manifest.json'), manifest);
      let captureUrl = input.target.type === 'url' ? input.target.url : '';
      let closeMounted: (() => Promise<void>) | undefined;
      let captureError: string | null = null;

      try {
        await mkdir(evidenceDirectory, { recursive: true });
        if (input.target.type === 'swiftui') {
          if (!this.swiftUiRenderer || !swiftProjectPath) {
            throw new Error(
              'SwiftUI adapter is not configured; start ads-mcp with --swiftui-command and --swiftui-renderer',
            );
          }
          await this.swiftUiRenderer.render({
            root: this.config.root,
            target: input.target,
            projectPath: swiftProjectPath,
            ...(swiftSourcePath ? { sourcePath: swiftSourcePath } : {}),
            states,
            viewports,
            settleMs,
            outDir: evidenceDirectory,
            timeoutMs: this.config.timeoutMs,
            signal: combineAbortSignals(signal, this.config.timeoutMs),
          });
        } else {
          if (input.target.type === 'component') {
            const mounted = await mountComponent(
              this.config.root,
              input.target.path,
              input.target.exportName || 'default',
              path.join(directory, 'mount'),
            );
            captureUrl = mounted.url;
            closeMounted = mounted.close;
          }
          await this.captureRunner({
            url: captureUrl,
            states,
            viewports,
            ...(input.waitFor ? { waitFor: input.waitFor } : {}),
            settleMs,
            maxCls,
            outDir: evidenceDirectory,
            cwd: this.config.root,
            timeoutMs: this.config.timeoutMs,
            signal: combineAbortSignals(signal, this.config.timeoutMs),
          });
        }
      } catch (error) {
        captureError = safeError(error);
      } finally {
        if (closeMounted) await closeMounted().catch(() => undefined);
        await rm(path.join(directory, 'mount'), { recursive: true, force: true });
      }

      let evidence: CaptureEvidence;
      try {
        evidence = JSON.parse(await readFile(path.join(evidenceDirectory, 'evidence.json'), 'utf8')) as CaptureEvidence;
      } catch {
        const fallbackTarget = target.type === 'url'
          ? target.url
          : target.type === 'component'
            ? `component:${target.path}`
            : `swiftui:${target.projectPath}#${target.scheme}`;
        evidence = {
          url: fallbackTarget,
          capturedStates: states,
          breakpoints: viewports.map(({ width, height }) => `${width}x${height}`),
          snapshots: [],
          gates: target.type === 'swiftui'
            ? { adapterAvailable: Boolean(this.swiftUiRenderer), buildSucceeded: false, stateRendered: {} }
            : {},
          captureError,
        };
        await writeJson(path.join(evidenceDirectory, 'evidence.json'), evidence);
      }
      if (target.type === 'swiftui') {
        delete evidence.url;
        evidence.target = target;
      } else {
        evidence.url = target.type === 'url' ? target.url : `component:${target.path}`;
      }
      await writeJson(path.join(evidenceDirectory, 'evidence.json'), evidence);

      const gates = summarizeCaptureEvidence(evidence);
      const blockers = [
        ...(captureError ? [`capture failed: ${captureError}`] : []),
        ...(platform === 'swiftui'
          ? swiftUiRenderBlockers(gates, states, manifest.detectors)
          : webRenderBlockers(gates, states, maxCls)),
        ...await snapshotBlockers(evidenceDirectory, evidence, states, viewports),
      ];
      const screenshots = (evidence.snapshots || [])
        .map(({ screenshot }) => screenshot)
        .filter((screenshot) => path.basename(screenshot) === screenshot)
        .map((screenshot) => resourceUri(runId, `screenshots/${encodeURIComponent(screenshot)}`));
      const output: RenderOutput = {
        schemaVersion: 1,
        runId,
        status: blockers.length ? 'blocked' : 'complete',
        target,
        capturedStates: states,
        viewports: viewports.map(({ width, height }) => `${width}x${height}`),
        gates,
        blockers: stableUnique(blockers),
        artifacts: {
          evidence: resourceUri(runId, 'evidence'),
          screenshots,
          manifest: resourceUri(runId, 'manifest'),
        },
      };
      await writeJson(path.join(directory, 'run.json'), {
        schemaVersion: 1,
        runId,
        createdAt: manifest.generatedAt,
        completedAt: now(),
        durationMs: elapsedMs(started),
        status: output.status,
        platform: manifest.platform,
        renderer: manifest.renderer,
        detectors: manifest.detectors,
        target,
        states,
        viewports: output.viewports,
        blockers: output.blockers,
      });
      return output;
    });
  }

  async evaluate(input: EvaluateInput, signal?: AbortSignal): Promise<EvaluateOutput> {
    const run = await this.store.readJson<{ status: 'complete' | 'blocked'; blockers?: string[] }>(input.runId, 'run.json');
    const manifest = await this.store.readJson<RunManifest>(input.runId, 'manifest.json');
    const evidence = await this.store.readJson<CaptureEvidence>(input.runId, 'evidence/evidence.json');
    const gates = summarizeCaptureEvidence(evidence);
    const judgeMode = input.judge?.mode || 'none';
    if (!input.rubric.task.trim()) throw new Error('rubric.task is required');
    if (!input.rubric.criteria.length) throw new Error('rubric.criteria needs at least one criterion');
    const criterionNames = input.rubric.criteria.map(({ name }) => name.trim());
    if (criterionNames.some((name) => !name)) throw new Error('rubric criterion names are required');
    if (new Set(criterionNames).size !== criterionNames.length) throw new Error('rubric criterion names must be unique');
    if (input.rubric.criteria.some(({ weight }) => !Number.isFinite(weight) || weight <= 0)) {
      throw new Error('rubric criterion weights must be positive numbers');
    }

    return this.store.writeStage(input.runId, 'evaluation', async (stageDirectory, stageId) => {
      let comparison: Record<string, unknown> | null = null;
      const blockers = [...(run.blockers || [])];
      if (input.compareToRunId) {
        const baselineRun = await this.store.readJson<{ status: 'complete' | 'blocked' }>(input.compareToRunId, 'run.json');
        if (baselineRun.status !== 'complete') {
          blockers.push(`baseline run is not complete: ${input.compareToRunId}`);
        } else {
          const work = path.join(stageDirectory, 'comparison-work');
          const baseline = path.join(work, 'baseline');
          const candidate = path.join(work, 'candidate');
          await Promise.all([
            this.store.copyEvidence(input.compareToRunId, baseline),
            this.store.copyEvidence(input.runId, candidate),
          ]);
          const comparisonOut = path.join(candidate, 'comparison');
          try {
            await execFileAsync(process.execPath, [COMPARE_SCRIPT, baseline, candidate, '--out', comparisonOut], {
              cwd: this.config.root,
              signal: combineAbortSignals(signal, this.config.timeoutMs),
              maxBuffer: 8 * 1024 * 1024,
            });
          } catch (error) {
            blockers.push(`comparison could not complete: ${safeError(error)}`);
          }
          try {
            comparison = JSON.parse(await readFile(path.join(comparisonOut, 'comparison.json'), 'utf8')) as Record<string, unknown>;
            comparison.baselineRunId = input.compareToRunId;
            comparison.candidateRunId = input.runId;
            delete comparison.baselineDir;
            delete comparison.candidateDir;
            const incomparable = comparison.incomparable;
            if (Array.isArray(incomparable) && incomparable.length) {
              blockers.push(`${incomparable.length} requested comparison pair(s) were incomparable`);
            }
            if (comparison.pairsCompared === 0) blockers.push('comparison produced zero usable pairs');
            await cp(comparisonOut, path.join(stageDirectory, 'comparison'), { recursive: true });
            await writeJson(path.join(stageDirectory, 'comparison', 'comparison.json'), comparison);
          } catch {
            if (!blockers.some((blocker) => blocker.startsWith('comparison could not complete'))) {
              blockers.push('comparison receipt is missing');
            }
          }
          await rm(work, { recursive: true, force: true });
        }
      }

      const hardBlocked = run.status !== 'complete' || blockers.length > 0;
      let judgeResult: VisualJudgeResult | null = null;
      if (!hardBlocked && judgeMode === 'configured') {
        if (!this.visualJudge) {
          blockers.push(
            'configured visual judge is unavailable; start ads-mcp with --judge-command, --judge-provider, and --judge-model',
          );
        } else {
          const screenshots = (evidence.snapshots || []).map((snapshot) => {
            const artifact = resourceUri(
              input.runId,
              `screenshots/${encodeURIComponent(snapshot.screenshot)}`,
            );
            return {
              state: snapshot.state,
              breakpoint: snapshot.breakpoint,
              artifact,
              path: path.join(this.store.runDirectory(input.runId), 'evidence', snapshot.screenshot),
            };
          });
          const allowedArtifacts = new Map(
            screenshots.map(({ artifact, state, breakpoint }) => [artifact, { state, breakpoint }]),
          );
          try {
            judgeResult = validateJudgeResult(
              await this.visualJudge.evaluate({
                schemaVersion: 1,
                runId: input.runId,
                target: manifest.target,
                rubric: input.rubric,
                gates,
                comparison,
                screenshots,
              }, combineAbortSignals(signal, this.config.timeoutMs)),
              input.rubric,
              allowedArtifacts,
            );
          } catch (error) {
            blockers.push(`visual judge could not complete: ${safeError(error)}`);
          }
        }
      }
      const status = hardBlocked || (judgeMode === 'configured' && !judgeResult)
        ? 'blocked'
        : judgeMode === 'none'
          ? 'needs_human'
          : 'complete';
      const output: EvaluateOutput = {
        schemaVersion: 1,
        runId: input.runId,
        status,
        verdict: judgeResult?.verdict || null,
        scores: judgeResult?.scores || null,
        findings: judgeResult?.findings || [],
        gates,
        comparison,
        nextRevisionPrompt: judgeResult?.nextRevisionPrompt || '',
        blockers: stableUnique(blockers),
        artifacts: {
          receipt: resourceUri(input.runId, 'receipt'),
          report: resourceUri(input.runId, 'report'),
        },
      };
      await writeJson(path.join(stageDirectory, 'receipt.json'), {
        ...output,
        stageId,
        generatedAt: now(),
        rubric: input.rubric,
        judge: judgeResult
          ? {
            mode: judgeMode,
            adapter: this.visualJudge?.id,
            provider: judgeResult.provider,
            model: judgeResult.model,
            modelCalls: judgeResult.modelCalls,
          }
          : {
            mode: judgeMode,
            ...(judgeMode === 'configured' && this.visualJudge ? { adapter: this.visualJudge.id } : {}),
            modelCalls: 0,
          },
      });
      const report = [
        `# ADS evaluation ${input.runId}`,
        '',
        `Status: ${output.status}`,
        '',
        `Task: ${input.rubric.task}`,
        '',
        'Deterministic rendered gates are attached in `receipt.json`.',
        judgeMode === 'none' ? 'Visual judgment remains unresolved and requires a human or configured judge.' : '',
        judgeResult ? `Visual judge: ${judgeResult.provider}/${judgeResult.model}` : '',
        judgeResult ? `Verdict: ${judgeResult.verdict}` : '',
        judgeResult ? `Scores: ${JSON.stringify(judgeResult.scores)}` : '',
        judgeResult?.findings.length ? `Findings: ${JSON.stringify(judgeResult.findings)}` : '',
        judgeResult?.nextRevisionPrompt ? `Next revision: ${judgeResult.nextRevisionPrompt}` : '',
        output.blockers.length ? `Blockers: ${output.blockers.join('; ')}` : 'Blockers: none',
        '',
      ].filter(Boolean).join('\n');
      await writeFile(path.join(stageDirectory, 'report.md'), `${report}\n`, 'utf8');
      return output;
    });
  }

  async trace(input: TraceInput): Promise<TraceOutput> {
    const run = await this.store.readJson<{ status: 'complete' | 'blocked' }>(input.runId, 'run.json');
    const manifestBytes = await this.store.readBytes(input.runId, 'manifest.json');
    const manifest = JSON.parse(manifestBytes.toString('utf8')) as RunManifest;
    const manifestSha256 = sha256(manifestBytes);

    return this.store.writeStage(input.runId, 'trace', async (stageDirectory, stageId) => {
      const errors: string[] = run.status === 'complete' ? [] : ['render run is blocked and cannot support a valid trace'];
      const provenanceError = run.status === 'complete' ? traceProvenanceError(manifest) : null;
      if (provenanceError) errors.push(provenanceError);
      const skillMap = new Map(manifest.skillFiles.map((record) => [record.path, record]));
      const sourceMap = new Map(manifest.sourceFiles.map((record) => [record.path, record]));
      const artifactMap = new Map(manifest.artifactFiles.map((record) => [record.path, record]));
      const seen = new Set<string>();

      if (run.status === 'complete' && !provenanceError) {
        for (const [index, decision] of input.decisions.entries()) {
          const label = `decision[${index}] ${decision.id || '(missing id)'}`;
          if (!decision.id.trim()) errors.push(`${label}: id is required`);
          if (seen.has(decision.id)) errors.push(`${label}: duplicate id`);
          seen.add(decision.id);
          if (!decision.decision.trim()) errors.push(`${label}: decision text is required`);

          await this.verifyTracedFile(label, decision.rule.path, decision.rule.excerpt, skillMap, errors, true);
          await this.verifyTracedFile(
            label,
            decision.sourceConstraint.path,
            decision.sourceConstraint.excerpt,
            sourceMap,
            errors,
            false,
          );
          await this.verifyTracedFile(label, decision.artifact.path, null, artifactMap, errors, false);
          if (!decision.evidence.length) errors.push(`${label}: at least one evidence resource is required`);
          for (const evidenceUri of decision.evidence) {
            try {
              const parsed = new URL(evidenceUri);
              const parts = parsed.pathname.split('/').filter(Boolean).map(decodeURIComponent);
              if (parsed.protocol !== 'ads:' || parsed.hostname !== 'runs' || parts[0] !== input.runId) {
                throw new Error('evidence must reference this run');
              }
              await this.readResource(evidenceUri);
            } catch (error) {
              errors.push(`${label}: invalid evidence ${evidenceUri}: ${safeError(error)}`);
            }
          }
        }
      }

      const trace = {
        schemaVersion: 1,
        runId: input.runId,
        stageId,
        generatedAt: now(),
        context: input.context,
        manifestSha256,
        decisions: input.decisions,
      };
      const validation = {
        schemaVersion: 1,
        runId: input.runId,
        stageId,
        generatedAt: now(),
        valid: errors.length === 0,
        decisions: input.decisions.length,
        errors,
      };
      await Promise.all([
        writeJson(path.join(stageDirectory, 'trace.json'), trace),
        writeJson(path.join(stageDirectory, 'trace-validation.json'), validation),
      ]);
      return {
        schemaVersion: 1,
        runId: input.runId,
        valid: errors.length === 0,
        errors,
        manifestSha256,
        artifacts: {
          trace: resourceUri(input.runId, 'trace'),
          validation: resourceUri(input.runId, 'trace-validation'),
        },
      };
    });
  }

  async readResource(uriString: string): Promise<ResourceResult> {
    const uri = new URL(uriString);
    if (uri.protocol !== 'ads:' || uri.hostname !== 'runs') throw new Error('unsupported ADS resource URI');
    const parts = uri.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const runId = parts[0];
    const artifact = parts[1];
    if (!runId || !artifact) throw new Error('ADS resource URI is incomplete');

    if (artifact === 'screenshots') {
      const filename = parts[2];
      if (!filename || parts.length !== 3 || path.basename(filename) !== filename || !filename.endsWith('.png')) {
        throw new Error('invalid screenshot resource');
      }
      const evidence = await this.store.readJson<CaptureEvidence>(runId, 'evidence/evidence.json');
      if (!(evidence.snapshots || []).some((snapshot) => snapshot.screenshot === filename)) {
        throw new Error('screenshot is not listed in the run evidence');
      }
      return {
        bytes: await this.store.readBytes(runId, `evidence/${filename}`),
        mimeType: 'image/png',
        name: filename,
      };
    }
    if (parts.length !== 2) throw new Error('invalid ADS resource URI');
    const resources: Record<string, { path: string | (() => Promise<string>); mimeType: string; name: string }> = {
      manifest: { path: 'manifest.json', mimeType: 'application/json', name: 'ADS run manifest' },
      evidence: { path: 'evidence/evidence.json', mimeType: 'application/json', name: 'ADS rendered evidence' },
      receipt: {
        path: () => this.store.latestStagePath(runId, 'evaluation', 'receipt.json'),
        mimeType: 'application/json',
        name: 'ADS evaluation receipt',
      },
      report: {
        path: () => this.store.latestStagePath(runId, 'evaluation', 'report.md'),
        mimeType: 'text/markdown',
        name: 'ADS evaluation report',
      },
      trace: {
        path: () => this.store.latestStagePath(runId, 'trace', 'trace.json'),
        mimeType: 'application/json',
        name: 'ADS decision trace',
      },
      'trace-validation': {
        path: () => this.store.latestStagePath(runId, 'trace', 'trace-validation.json'),
        mimeType: 'application/json',
        name: 'ADS trace validation',
      },
    };
    const resource = resources[artifact];
    if (!resource) throw new Error(`unknown ADS resource: ${artifact}`);
    const relativePath = typeof resource.path === 'function' ? await resource.path() : resource.path;
    return {
      bytes: await this.store.readBytes(runId, relativePath),
      mimeType: resource.mimeType,
      name: resource.name,
    };
  }

  async listResources(): Promise<Array<{ uri: string; name: string; mimeType: string }>> {
    const resources: Array<{ uri: string; name: string; mimeType: string }> = [];
    for (const runId of await this.store.listRunIds()) {
      resources.push(
        {
          uri: resourceUri(runId, 'manifest'),
          name: `${runId} manifest`,
          mimeType: 'application/json',
        },
        {
          uri: resourceUri(runId, 'evidence'),
          name: `${runId} rendered evidence`,
          mimeType: 'application/json',
        },
      );
      try {
        const evidence = await this.store.readJson<CaptureEvidence>(runId, 'evidence/evidence.json');
        for (const snapshot of evidence.snapshots || []) {
          if (
            path.basename(snapshot.screenshot) !== snapshot.screenshot
            || !snapshot.screenshot.endsWith('.png')
          ) {
            continue;
          }
          resources.push({
            uri: resourceUri(runId, `screenshots/${encodeURIComponent(snapshot.screenshot)}`),
            name: `${runId} ${snapshot.state}@${snapshot.breakpoint}`,
            mimeType: 'image/png',
          });
        }
      } catch {
        // A preserved run without readable evidence still exposes its manifest.
      }
      for (const stage of [
        { kind: 'evaluation' as const, artifact: 'receipt', file: 'receipt.json', mimeType: 'application/json' },
        { kind: 'evaluation' as const, artifact: 'report', file: 'report.md', mimeType: 'text/markdown' },
        { kind: 'trace' as const, artifact: 'trace', file: 'trace.json', mimeType: 'application/json' },
        {
          kind: 'trace' as const,
          artifact: 'trace-validation',
          file: 'trace-validation.json',
          mimeType: 'application/json',
        },
      ]) {
        try {
          await this.store.latestStagePath(runId, stage.kind, stage.file);
          resources.push({
            uri: resourceUri(runId, stage.artifact),
            name: `${runId} ${stage.artifact}`,
            mimeType: stage.mimeType,
          });
        } catch {
          // The stage has not been written for this run.
        }
      }
    }
    return resources;
  }

  private async verifyTracedFile(
    label: string,
    inputPath: string,
    excerpt: string | null,
    records: Map<string, FileRecord>,
    errors: string[],
    requireObserved: boolean,
  ): Promise<void> {
    let absolute: string;
    try {
      absolute = await resolveFileInside(this.config.root, inputPath);
    } catch (error) {
      errors.push(`${label}: ${safeError(error)}`);
      return;
    }
    const portable = portablePath(this.config.root, absolute);
    const record = records.get(portable);
    if (!record) {
      errors.push(`${label}: file was not captured in the run manifest: ${portable}`);
      return;
    }
    if (requireObserved && record.loadStatus !== 'observed') {
      errors.push(`${label}: verified rules require an observed skill file: ${portable}`);
    }
    const bytes = await readFile(absolute);
    if (sha256(bytes) !== record.sha256) errors.push(`${label}: file changed after render: ${portable}`);
    if (excerpt !== null) {
      if (!excerpt.trim()) errors.push(`${label}: excerpt is required for ${portable}`);
      else if (!bytes.toString('utf8').includes(excerpt)) errors.push(`${label}: excerpt is not present in ${portable}`);
    }
  }
}
