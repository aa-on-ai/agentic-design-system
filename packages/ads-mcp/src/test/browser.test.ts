import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { AdsService } from '../service.js';

const markup = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ADS browser fixture</title>
    <style>body{font-family:system-ui;margin:0}main{padding:24px}button{min-width:44px;min-height:44px}</style>
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
    const service = await AdsService.create({
      root,
      runsDir: '.ads/runs',
      allowedOrigins: new Set(),
      timeoutMs: 30_000,
    });
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
      <button type="button" style={{ minWidth: 44, minHeight: 44 }}>Create order</button>}
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
