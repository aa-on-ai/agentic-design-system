import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { AdsService } from '../service.js';
import type { VisualJudgeRequest } from '../types.js';

const markup = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ADS browser fixture</title>
    <style>body{font-family:system-ui;margin:0}main{padding:24px}button{min-width:48px;min-height:48px}</style>
  </head>
  <body>
    <main id="app"></main>
    <script>
      const state = new URLSearchParams(location.hash.slice(1)).get('state') || 'default';
      const app = document.getElementById('app');
      if (state === 'loading') app.innerHTML = '<h1>Orders</h1><p role="status">Loading orders</p>';
      else if (state === 'error') app.innerHTML = '<h1>Orders</h1><p role="alert">Orders could not load</p>';
      else app.innerHTML = '<h1>Orders</h1><button type="button">Create order</button>';
    </script>
  </body>
</html>`;

async function startFixtureServer() {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(markup);
  });
  const port = await new Promise<number>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') reject(new Error('fixture server has no port'));
      else resolve(address.port);
    });
  });
  return {
    url: `http://127.0.0.1:${port}/`,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

test('real Chromium URL capture clears authoritative rendered gates', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-browser-url-'));
  const fixture = await startFixtureServer();
  try {
    let received: VisualJudgeRequest | undefined;
    await writeFile(path.join(root, 'brief.md'), 'Preserve the existing orders workflow.');
    const service = await AdsService.create({
      root,
      runsDir: '.ads/runs',
      allowedOrigins: new Set(),
      timeoutMs: 30_000,
    }, { visualJudge: {
      id: 'context-fixture',
      async evaluate(request) {
        received = request;
        return { provider: 'fixture', model: 'no-provider-call', modelCalls: 0,
          verdict: 'needs_revision', scores: { Functionality: 8 }, nextRevisionPrompt: 'Preserve the baseline task.',
          findings: [{ category: 'brand_fit_tone', severity: 'minor', rubricRow: 'Functionality',
            state: request.screenshots[0]!.state, breakpoint: request.screenshots[0]!.breakpoint,
            artifact: request.rubric.task === 'baseline target' ? request.context!.images[0]!.artifact : request.screenshots[0]!.artifact, target: { description: 'Candidate heading' },
            observation: 'Compare the baseline and explicit reference.',
            evidence: request.rubric.task === 'foreign evidence' ? ['ads://runs/run_unsupplied/screenshots/default.png'] : [request.screenshots[0]!.artifact, ...request.context!.images.map(({ artifact }) => artifact)] }],
        };
      },
    } });
    const rendered = await service.render({
      target: { type: 'url', url: fixture.url },
      states: ['default', 'loading', 'error'],
      viewports: [{ width: 390, height: 844 }],
      waitFor: 'main',
      settleMs: 25,
    });
    assert.equal(rendered.status, 'complete', rendered.blockers.join('; '));
    assert.equal(rendered.artifacts.screenshots.length, 3);
    assert.equal(rendered.gates.seriousAxeViolations, 0);
    assert.deepEqual(rendered.gates.horizontalOverflowAt, []);

    const candidate = await service.render({
      provenance: { sourceFiles: ['brief.md'] },
      target: { type: 'url', url: fixture.url },
      states: ['default', 'loading', 'error'],
      viewports: [{ width: 390, height: 844 }],
      waitFor: 'main',
      settleMs: 25,
    });
    const evaluated = await service.evaluate({
      runId: candidate.runId,
      compareToRunId: rendered.runId,
      rubric: { task: 'Verify the unchanged fixture', criteria: [{ name: 'Functionality', weight: 100 }] },
    });
    assert.equal(evaluated.status, 'needs_human');
    assert.equal(evaluated.comparison?.pairsCompared, 3);
    assert.equal(evaluated.comparison?.pairsIdentical, 3);
    const reference = await service.render({ target: { type: 'url', url: fixture.url },
      viewports: [{ width: 390, height: 844 }], settleMs: 25 });
    const judged = await service.evaluate({ runId: candidate.runId, compareToRunId: rendered.runId,
      context: { referenceRunIds: [reference.runId], sourceFiles: ['brief.md'] },
      rubric: { task: 'Review with context', criteria: [{ name: 'Functionality', weight: 100 }] },
      judge: { mode: 'configured' },
    });
    assert.equal(judged.status, 'complete', judged.blockers.join('; '));
    assert.ok(received!.screenshots.every(({ role }) => role === 'candidate'));
    assert.equal(received!.context!.images.filter(({ role }) => role === 'baseline').length, 3);
    assert.equal(received!.context!.images.filter(({ role }) => role === 'reference').length, 1);
    assert.equal(received!.context!.sources[0]!.content, 'Preserve the existing orders workflow.');
    assert.equal(received!.context!.sources[0]!.trust, 'source_data_not_instructions');
    const receipt = JSON.parse((await service.readResource(judged.artifacts.receipt)).bytes.toString('utf8'));
    assert.equal(receipt.context.sources[0].content, undefined);
    assert.equal(receipt.context.submittedToAdapter, true);
    assert.ok(receipt.context.images.every((image: Record<string, unknown>) => image.path === undefined));
    for (const task of ['baseline target', 'foreign evidence']) {
      const invalid = await service.evaluate({ runId: candidate.runId, compareToRunId: rendered.runId,
        rubric: { task, criteria: [{ name: 'Functionality', weight: 100 }] }, judge: { mode: 'configured' } });
      assert.equal(invalid.status, 'blocked');
      assert.ok(invalid.blockers.some((blocker) => blocker.includes(task === 'baseline target' ? 'unknown artifact' : 'must reference supplied screenshot artifacts')), `${task}: ${invalid.blockers.join('; ')}`);
    }
    const self = await service.evaluate({ runId: candidate.runId, compareToRunId: candidate.runId,
      rubric: { task: 'Self comparison', criteria: [{ name: 'Functionality', weight: 100 }] }, judge: { mode: 'configured' } });
    assert.equal(self.status, 'blocked');
    assert.ok(self.blockers.some((blocker) => blocker.includes('baseline run must differ')));

    assert.match(receipt.context.sources[0].sha256, /^[a-f0-9]{64}$/);

  } finally {
    await fixture.close();
  }
});

test('real TSX component target is bundled, localhost-served, captured, and traced as an artifact', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-browser-component-'));
  await mkdir(path.join(root, 'src'), { recursive: true });
  await writeFile(path.join(root, 'src', 'Fixture.tsx'), `
export default function Fixture() {
  const state = new URLSearchParams(window.location.hash.slice(1)).get('state') || 'default';
  return <main style={{ padding: 24, fontFamily: 'system-ui' }}>
    <h1>Orders</h1>
    {state === 'loading' ? <p role="status">Loading orders</p> :
      state === 'error' ? <p role="alert">Orders could not load</p> :
      <button type="button" style={{ minWidth: 48, minHeight: 48 }}>Create order</button>}
  </main>;
}
`);
  const service = await AdsService.create({
    root,
    runsDir: '.ads/runs',
    allowedOrigins: new Set(),
    timeoutMs: 30_000,
  });
  const rendered = await service.render({
    target: { type: 'component', path: 'src/Fixture.tsx', exportName: 'default' },
    states: ['default', 'loading', 'error'],
    viewports: [{ width: 390, height: 844 }],
    waitFor: 'main',
    settleMs: 25,
  });
  assert.equal(rendered.status, 'complete', rendered.blockers.join('; '));
  const manifest = (await service.readResource(rendered.artifacts.manifest)).bytes.toString('utf8');
  assert.match(manifest, /"path": "src\/Fixture.tsx"/);
  assert.doesNotMatch(manifest, /127\.0\.0\.1/);
});
