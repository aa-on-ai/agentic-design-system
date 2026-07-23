import { execFile } from 'node:child_process';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { mountComponent } from './component.js';
import {
  combineAbortSignals,
  portablePath,
  redactUrl,
  resolveFileInside,
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
  TraceInput,
  TraceOutput,
  Viewport,
} from './types.js';

const execFileAsync = promisify(execFile);
const CAPTURE_SCRIPT = fileURLToPath(new URL('./vendor/capture.mjs', import.meta.url));
const COMPARE_SCRIPT = fileURLToPath(new URL('./vendor/compare.mjs', import.meta.url));
const DEFAULT_STATES = ['default'];
const DEFAULT_VIEWPORTS = [{ width: 390, height: 844 }, { width: 1280, height: 800 }];

type ServiceOptions = {
  captureRunner?: CaptureRunner;
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
  return target.type === 'url'
    ? { type: 'url', url: redactUrl(target.url) }
    : { type: 'component', path: target.path, exportName: target.exportName || 'default' };
}

function arrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function renderBlockers(gates: Record<string, unknown>, states: string[], maxCls: number): string[] {
  const blockers: string[] = [];
  if (gates.axeAvailable !== true) blockers.push('axe evidence is unavailable');
  if (Number(gates.seriousAxeViolations || 0) > 0) blockers.push('serious or critical axe violations remain');
  if (arrayLength(gates.horizontalOverflowAt) > 0) blockers.push('horizontal overflow was rendered');
  if (arrayLength(gates.landmarkFailures) > 0) blockers.push('a rendered state is missing its main landmark');
  if (arrayLength(gates.liveRegionFailures) > 0) blockers.push('a loading or error state is missing live-region semantics');
  if (arrayLength(gates.touchTargetsUnder44) > 0) blockers.push('undersized touch targets remain');
  if (gates.clsAvailable !== true) blockers.push('CLS evidence is unavailable');
  if (Number(gates.maxCumulativeLayoutShift || 0) > maxCls || arrayLength(gates.clsFailures) > 0) {
    blockers.push(`cumulative layout shift exceeds ${maxCls}`);
  }
  const rendered = gates.stateRendered;
  for (const state of states) {
    if (!rendered || typeof rendered !== 'object' || (rendered as Record<string, unknown>)[state] !== true) {
      blockers.push(`requested state did not render distinctly: ${state}`);
    }
  }
  return blockers;
}

async function defaultCaptureRunner(args: Parameters<CaptureRunner>[0]): Promise<void> {
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

  private constructor(config: ServerConfig, store: RunStore, options: ServiceOptions) {
    this.config = config;
    this.store = store;
    this.captureRunner = options.captureRunner || defaultCaptureRunner;
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
    const artifactFiles = await collectRecords(this.config.root, artifactInputs, 'artifact');
    if (input.target.type === 'url') validateRenderUrl(input.target.url, this.config.allowedOrigins);

    const target = sanitizedTarget(input.target);
    const manifest: RunManifest = {
      schemaVersion: 1,
      runId,
      generatedAt: now(),
      projectRootSha256: sha256(this.config.root),
      platform: 'web',
      renderer: 'playwright-chromium',
      detectors: [
        'axe-wcag2a-aa',
        'horizontal-overflow',
        'main-and-live-regions',
        'cumulative-layout-shift',
        'state-distinctness',
        'touch-target-44px',
      ],
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
        evidence = {
          url: target.type === 'url' ? target.url : `component:${target.path}`,
          capturedStates: states,
          breakpoints: viewports.map(({ width, height }) => `${width}x${height}`),
          snapshots: [],
          gates: {},
          captureError,
        };
        await writeJson(path.join(evidenceDirectory, 'evidence.json'), evidence);
      }
      evidence.url = target.type === 'url' ? target.url : `component:${target.path}`;
      await writeJson(path.join(evidenceDirectory, 'evidence.json'), evidence);

      const gates = summarizeCaptureEvidence(evidence);
      const blockers = [
        ...(captureError ? [`capture failed: ${captureError}`] : []),
        ...renderBlockers(gates, states, maxCls),
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
    const evidence = await this.store.readJson<CaptureEvidence>(input.runId, 'evidence/evidence.json');
    const gates = summarizeCaptureEvidence(evidence);
    const judgeMode = input.judge?.mode || 'none';
    if (judgeMode !== 'none') throw new Error(`unsupported judge mode in v0.1: ${judgeMode}`);
    if (!input.rubric.task.trim()) throw new Error('rubric.task is required');
    if (!input.rubric.criteria.length) throw new Error('rubric.criteria needs at least one criterion');

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

      const hardBlocked = run.status !== 'complete' || blockers.some((blocker) =>
        blocker.includes('zero usable pairs') || blocker.includes('baseline run is not complete') || blocker.includes('receipt is missing'),
      );
      const output: EvaluateOutput = {
        schemaVersion: 1,
        runId: input.runId,
        status: hardBlocked ? 'blocked' : 'needs_human',
        verdict: null,
        scores: null,
        findings: [],
        gates,
        comparison,
        nextRevisionPrompt: '',
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
        judge: { mode: judgeMode, modelCalls: 0 },
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
      const skillMap = new Map(manifest.skillFiles.map((record) => [record.path, record]));
      const sourceMap = new Map(manifest.sourceFiles.map((record) => [record.path, record]));
      const artifactMap = new Map(manifest.artifactFiles.map((record) => [record.path, record]));
      const seen = new Set<string>();

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
