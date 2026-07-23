import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { AdsService } from '../service.js';
import type { CaptureRunner, ServerConfig } from '../types.js';

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
      touchTargetsUnder44: [],
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
