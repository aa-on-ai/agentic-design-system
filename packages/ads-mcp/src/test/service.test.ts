import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { AdsService } from '../service.js';
import type {
  CaptureRunner,
  ServerConfig,
  SwiftUiRenderer,
  VisualJudge,
  VisualJudgeRequest,
} from '../types.js';

const fakeCapture: CaptureRunner = async ({ states, viewports, outDir, url }) => {
  await mkdir(outDir, { recursive: true });
  const snapshots = [];
  for (const state of states) {
    for (const viewport of viewports) {
      const breakpoint = `${viewport.width}x${viewport.height}`;
      const screenshot = `${state}-${breakpoint}.png`;
      await writeFile(path.join(outDir, screenshot), Buffer.from('fake-png'));
      snapshots.push({ state, breakpoint, screenshot });
    }
  }
  await writeFile(path.join(outDir, 'evidence.json'), `${JSON.stringify({
    url,
    capturedStates: states,
    breakpoints: viewports.map(({ width, height }) => `${width}x${height}`),
    snapshots,
    gates: {
      axeAvailable: true,
      seriousAxeViolations: 0,
      horizontalOverflowAt: [],
      landmarkFailures: [],
      liveRegionFailures: [],
      stateRendered: Object.fromEntries(states.map((state) => [state, true])),
      renderedFonts: ['system-ui'],
      touchTargetsUnder48: [],
      clsAvailable: true,
      clsFailures: [],
      maxCumulativeLayoutShift: 0,
    },
  }, null, 2)}\n`);
};

async function fixture(timeoutMs = 2_000) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-service-'));
  await Promise.all([
    mkdir(path.join(root, 'skills', 'design-review'), { recursive: true }),
    mkdir(path.join(root, 'src'), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(root, 'skills', 'design-review', 'SKILL.md'), 'Rule: keep primary actions reachable.\n'),
    writeFile(path.join(root, 'brief.md'), 'Constraint: primary actions stay reachable on mobile.\n'),
    writeFile(path.join(root, 'src', 'Orders.tsx'), 'export default function Orders() { return null; }\n'),
  ]);
  const config: ServerConfig = {
    root,
    runsDir: '.ads/runs',
    allowedOrigins: new Set(),
    timeoutMs,
  };
  return { root, config };
}

test('full render, evaluate, trace, and resource sequence preserves receipts', async () => {
  const { config } = await fixture();
  const service = await AdsService.create(config, { captureRunner: fakeCapture });
  const rendered = await service.render({
    target: { type: 'url', url: 'http://127.0.0.1:3000/orders?token=secret' },
    states: ['default', 'loading', 'empty', 'error'],
    provenance: {
      observedSkillFiles: ['skills/design-review/SKILL.md'],
      sourceFiles: ['brief.md'],
      artifactFiles: ['src/Orders.tsx'],
      adsRelease: 'v1.3.1',
    },
  });
  assert.equal(rendered.status, 'complete');
  assert.equal(rendered.blockers.length, 0);
  assert.equal(rendered.artifacts.screenshots.length, 8);

  const manifestText = (await service.readResource(rendered.artifacts.manifest)).bytes.toString('utf8');
  assert.doesNotMatch(manifestText, /secret/);
  assert.match(manifestText, /playwright-chromium/);

  const evaluated = await service.evaluate({
    runId: rendered.runId,
    rubric: {
      task: 'Keep the orders workflow understandable',
      criteria: [
        { name: 'Design Quality', weight: 35 },
        { name: 'Originality', weight: 30 },
        { name: 'Craft', weight: 20 },
        { name: 'Functionality', weight: 15 },
      ],
    },
    judge: { mode: 'none' },
  });
  assert.equal(evaluated.status, 'needs_human');
  assert.equal(evaluated.verdict, null);
  const firstReceipt = await service.readResource(evaluated.artifacts.receipt);
  assert.match(firstReceipt.bytes.toString('utf8'), /needs_human/);

  await service.evaluate({
    runId: rendered.runId,
    rubric: { task: 'Second review', criteria: [{ name: 'Functionality', weight: 100 }] },
  });
  const latestReceipt = await service.readResource(evaluated.artifacts.receipt);
  assert.match(latestReceipt.bytes.toString('utf8'), /Second review/);
  assert.notEqual(latestReceipt.bytes.toString('utf8'), firstReceipt.bytes.toString('utf8'));

  const traced = await service.trace({
    runId: rendered.runId,
    context: 'Orders mobile repair',
    decisions: [{
      id: 'mobile-primary-action',
      decision: 'Keep the primary action reachable on mobile.',
      artifact: { path: 'src/Orders.tsx', location: 'primary action row' },
      rule: {
        path: 'skills/design-review/SKILL.md',
        excerpt: 'Rule: keep primary actions reachable.',
      },
      sourceConstraint: {
        path: 'brief.md',
        excerpt: 'Constraint: primary actions stay reachable on mobile.',
      },
      evidence: [rendered.artifacts.evidence],
    }],
  });
  assert.equal(traced.valid, true);
  assert.deepEqual(traced.errors, []);
  const validation = await service.readResource(traced.artifacts.validation);
  assert.match(validation.bytes.toString('utf8'), /"valid": true/);
  const screenshot = await service.readResource(rendered.artifacts.screenshots[0]!);
  assert.equal(screenshot.mimeType, 'image/png');
  assert.equal(screenshot.bytes.toString('utf8'), 'fake-png');
});

test('trace rejects changed or uncaptured files and invented excerpts', async () => {
  const { root, config } = await fixture();
  const service = await AdsService.create(config, { captureRunner: fakeCapture });
  const rendered = await service.render({
    target: { type: 'url', url: 'http://localhost:3000' },
    provenance: {
      observedSkillFiles: ['skills/design-review/SKILL.md'],
      sourceFiles: ['brief.md'],
      artifactFiles: ['src/Orders.tsx'],
    },
  });
  await writeFile(path.join(root, 'src', 'Orders.tsx'), 'changed after render\n');
  const traced = await service.trace({
    runId: rendered.runId,
    context: 'invalid trace',
    decisions: [{
      id: 'changed',
      decision: 'A changed decision',
      artifact: { path: 'src/Orders.tsx' },
      rule: { path: 'skills/design-review/SKILL.md', excerpt: 'invented rule' },
      sourceConstraint: { path: 'brief.md', excerpt: 'Constraint: primary actions stay reachable on mobile.' },
      evidence: [rendered.artifacts.evidence],
    }],
  });
  assert.equal(traced.valid, false);
  assert.ok(traced.errors.some((error) => error.includes('file changed after render')));
  assert.ok(traced.errors.some((error) => error.includes('excerpt is not present')));
});

test('render blocks honestly on timeout and never treats missing evidence as complete', async () => {
  const { config } = await fixture(100);
  const stalledCapture: CaptureRunner = async ({ signal }) => {
    await new Promise<void>((_resolve, reject) => {
      const keepAlive = setInterval(() => undefined, 25);
      signal?.addEventListener('abort', () => {
        clearInterval(keepAlive);
        reject(new DOMException('aborted', 'AbortError'));
      }, { once: true });
    });
  };
  const service = await AdsService.create(config, { captureRunner: stalledCapture });
  const rendered = await service.render({ target: { type: 'url', url: 'http://localhost:3000' } });
  assert.equal(rendered.status, 'blocked');
  assert.ok(rendered.blockers.some((blocker) => blocker.includes('timed out')));
  const evidence = await service.readResource(rendered.artifacts.evidence);
  assert.match(evidence.bytes.toString('utf8'), /captureError/);
});

test('remote origins and provenance traversal fail before a run is created', async () => {
  const { config } = await fixture();
  const service = await AdsService.create(config, { captureRunner: fakeCapture });
  await assert.rejects(
    service.render({ target: { type: 'url', url: 'https://example.com' } }),
    /not allowed/,
  );
  await assert.rejects(
    service.render({
      target: { type: 'url', url: 'http://localhost:3000' },
      provenance: { artifactFiles: ['../outside.tsx'] },
    }),
    /escapes|ENOENT/,
  );
});

test('configured visual judge completes evaluation with typed scores, findings, and model receipt', async () => {
  const { config } = await fixture();
  let received: VisualJudgeRequest | undefined;
  const visualJudge: VisualJudge = {
    id: 'fixture-judge',
    async evaluate(request) {
      received = request;
      const artifact = request.screenshots[0]!.artifact;
      return {
        provider: 'fixture-provider',
        model: 'fixture-model',
        modelCalls: 1,
        verdict: 'needs_revision',
        scores: { 'Design Quality': 7, Functionality: 8 },
        findings: [{
          category: 'cues_affordances',
          severity: 'minor',
          rubricRow: 'Functionality',
          state: request.screenshots[0]!.state,
          breakpoint: request.screenshots[0]!.breakpoint,
          artifact,
          target: { description: 'Primary action row' },
          observation: 'The secondary action competes with the primary action.',
          evidence: [artifact],
        }],
        nextRevisionPrompt: 'Reduce the secondary action emphasis, then re-render the same state.',
      };
    },
  };
  const service = await AdsService.create(config, { captureRunner: fakeCapture, visualJudge });
  const rendered = await service.render({ target: { type: 'url', url: 'http://localhost:3000' } });
  const evaluated = await service.evaluate({
    runId: rendered.runId,
    rubric: {
      task: 'Review the primary action hierarchy',
      criteria: [
        { name: 'Design Quality', weight: 60 },
        { name: 'Functionality', weight: 40 },
      ],
    },
    judge: { mode: 'configured' },
  });
  assert.equal(evaluated.status, 'complete');
  assert.equal(evaluated.verdict, 'needs_revision');
  assert.deepEqual(evaluated.scores, { 'Design Quality': 7, Functionality: 8 });
  assert.equal(evaluated.findings.length, 1);
  assert.equal(received?.screenshots.length, 2);
  const receipt = await service.readResource(evaluated.artifacts.receipt);
  assert.match(receipt.bytes.toString('utf8'), /fixture-provider/);
  assert.match(receipt.bytes.toString('utf8'), /fixture-model/);
  assert.match(receipt.bytes.toString('utf8'), /"modelCalls": 1/);
});

test('configured judge fails honestly when unavailable or semantically inconsistent', async () => {
  const { config } = await fixture();
  const serviceWithoutJudge = await AdsService.create(config, { captureRunner: fakeCapture });
  const renderedWithoutJudge = await serviceWithoutJudge.render({
    target: { type: 'url', url: 'http://localhost:3000' },
  });
  const unavailable = await serviceWithoutJudge.evaluate({
    runId: renderedWithoutJudge.runId,
    rubric: { task: 'Review', criteria: [{ name: 'Functionality', weight: 100 }] },
    judge: { mode: 'configured' },
  });
  assert.equal(unavailable.status, 'blocked');
  assert.ok(unavailable.blockers.some((blocker) => blocker.includes('configured visual judge is unavailable')));

  const invalidJudge: VisualJudge = {
    id: 'invalid-judge',
    async evaluate(request) {
      const artifact = request.screenshots[0]!.artifact;
      return {
        provider: 'fixture',
        model: 'fixture',
        modelCalls: 1,
        verdict: 'satisfied',
        scores: { Functionality: 10 },
        findings: [{
          category: 'cues_affordances',
          severity: 'major',
          rubricRow: 'Functionality',
          state: request.screenshots[0]!.state,
          breakpoint: request.screenshots[0]!.breakpoint,
          artifact,
          target: { description: 'Contradictory action' },
          observation: 'An enabled action contradicts the read-only state.',
          evidence: [artifact],
        }],
        nextRevisionPrompt: '',
      };
    },
  };
  const serviceWithInvalidJudge = await AdsService.create(config, {
    captureRunner: fakeCapture,
    visualJudge: invalidJudge,
  });
  const renderedWithInvalidJudge = await serviceWithInvalidJudge.render({
    target: { type: 'url', url: 'http://localhost:3000' },
  });
  const invalid = await serviceWithInvalidJudge.evaluate({
    runId: renderedWithInvalidJudge.runId,
    rubric: { task: 'Review', criteria: [{ name: 'Functionality', weight: 100 }] },
    judge: { mode: 'configured' },
  });
  assert.equal(invalid.status, 'blocked');
  assert.ok(invalid.blockers.some((blocker) => blocker.includes('blocking findings')));

  const mismatchedFindingJudge: VisualJudge = {
    id: 'mismatched-finding-judge',
    async evaluate(request) {
      const artifact = request.screenshots[0]!.artifact;
      return {
        provider: 'fixture',
        model: 'fixture',
        modelCalls: 1,
        verdict: 'needs_revision',
        scores: { Functionality: 5 },
        findings: [{
          category: 'layout_spacing_hierarchy',
          severity: 'major',
          rubricRow: 'Functionality',
          state: 'invented-state',
          breakpoint: request.screenshots[0]!.breakpoint,
          artifact,
          target: { description: 'Invented state' },
          observation: 'This finding claims a state not represented by its screenshot.',
          evidence: [artifact],
        }],
        nextRevisionPrompt: 'Re-render the real state.',
      };
    },
  };
  const serviceWithMismatchedFinding = await AdsService.create(config, {
    captureRunner: fakeCapture,
    visualJudge: mismatchedFindingJudge,
  });
  const renderedWithMismatchedFinding = await serviceWithMismatchedFinding.render({
    target: { type: 'url', url: 'http://localhost:3000' },
  });
  const mismatched = await serviceWithMismatchedFinding.evaluate({
    runId: renderedWithMismatchedFinding.runId,
    rubric: { task: 'Review', criteria: [{ name: 'Functionality', weight: 100 }] },
    judge: { mode: 'configured' },
  });
  assert.equal(mismatched.status, 'blocked');
  assert.ok(mismatched.blockers.some((blocker) => blocker.includes('must match its screenshot')));
});

test('SwiftUI renderer adapter preserves platform-specific evidence and detector receipts', async () => {
  const { root, config } = await fixture();
  await Promise.all([
    mkdir(path.join(root, 'App.xcodeproj'), { recursive: true }),
    mkdir(path.join(root, 'App'), { recursive: true }),
  ]);
  await writeFile(path.join(root, 'App', 'ContentView.swift'), 'struct ContentView: View {}\n');
  const swiftUiRenderer: SwiftUiRenderer = {
    id: 'xcode-preview-snapshot',
    detectors: ['swiftlint', 'swiftsyntax', 'asset-catalog'],
    async render({ states, viewports, outDir }) {
      await mkdir(outDir, { recursive: true });
      const snapshots = [];
      for (const state of states) {
        for (const { width, height } of viewports) {
          const breakpoint = `${width}x${height}`;
          const screenshot = `${state}-${breakpoint}.png`;
          await writeFile(path.join(outDir, screenshot), Buffer.from('swiftui-png'));
          snapshots.push({ state, breakpoint, screenshot });
        }
      }
      await writeFile(path.join(outDir, 'evidence.json'), `${JSON.stringify({
        capturedStates: states,
        breakpoints: viewports.map(({ width, height }) => `${width}x${height}`),
        snapshots,
        gates: {
          adapterAvailable: true,
          buildSucceeded: true,
          stateRendered: Object.fromEntries(states.map((state) => [state, true])),
          swiftLintAvailable: true,
          swiftLintErrors: [],
          swiftSyntaxAvailable: true,
          swiftSyntaxErrors: [],
          assetCatalogAvailable: true,
          assetCatalogErrors: [],
        },
      })}\n`);
    },
  };
  const service = await AdsService.create(config, { swiftUiRenderer });
  const rendered = await service.render({
    target: {
      type: 'swiftui',
      projectPath: 'App.xcodeproj',
      scheme: 'App',
      sourcePath: 'App/ContentView.swift',
      device: 'iPhone 16 Pro',
    },
    states: ['default', 'loading'],
    viewports: [{ width: 393, height: 852 }],
  });
  assert.equal(rendered.status, 'complete', rendered.blockers.join('; '));
  assert.equal(rendered.artifacts.screenshots.length, 2);
  const manifest = (await service.readResource(rendered.artifacts.manifest)).bytes.toString('utf8');
  assert.match(manifest, /"platform": "swiftui"/);
  assert.match(manifest, /"renderer": "xcode-preview-snapshot"/);
  assert.match(manifest, /"swiftlint"/);
  assert.match(manifest, /App\/ContentView\.swift/);
});

test('SwiftUI target returns a preserved blocked run when no adapter is configured', async () => {
  const { root, config } = await fixture();
  await mkdir(path.join(root, 'App.xcodeproj'), { recursive: true });
  const service = await AdsService.create(config);
  const rendered = await service.render({
    target: { type: 'swiftui', projectPath: 'App.xcodeproj', scheme: 'App' },
    viewports: [{ width: 393, height: 852 }],
  });
  assert.equal(rendered.status, 'blocked');
  assert.ok(rendered.blockers.some((blocker) => blocker.includes('SwiftUI adapter is not configured')));
  const evidence = await service.readResource(rendered.artifacts.evidence);
  assert.match(evidence.bytes.toString('utf8'), /"adapterAvailable": false/);
});
