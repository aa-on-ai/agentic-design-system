import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { AdsService } from '../service.js';

const execFileAsync = promisify(execFile);

test('doctor reports an explicit setup path when Chromium is absent', async () => {
  const browserRoot = await mkdtemp(path.join(os.tmpdir(), 'ads-browser-missing-'));
  const cli = fileURLToPath(new URL('../cli.js', import.meta.url));
  try {
    await assert.rejects(
      execFileAsync(process.execPath, [cli, 'doctor', '--json'], {
        env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browserRoot },
      }),
      (error: unknown) => {
        const output = error as { code?: number; stdout?: string };
        assert.equal(output.code, 1);
        const report = JSON.parse(output.stdout || '{}') as {
          version?: string;
          browser?: { ready?: boolean; setupCommand?: string };
        };
        assert.equal(report.version, '0.2.1');
        assert.equal(report.browser?.ready, false);
        assert.equal(report.browser?.setupCommand, 'npx --yes ads-mcp@0.2.1 setup');
        return true;
      },
    );
  } finally {
    await rm(browserRoot, { recursive: true, force: true });
  }
});

test('a missing browser preserves a blocked run with an actionable setup command', async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'ads-browser-blocked-project-'));
  const browserRoot = await mkdtemp(path.join(os.tmpdir(), 'ads-browser-blocked-runtime-'));
  const priorBrowserRoot = process.env.PLAYWRIGHT_BROWSERS_PATH;
  process.env.PLAYWRIGHT_BROWSERS_PATH = browserRoot;
  try {
    const service = await AdsService.create({
      root: projectRoot,
      runsDir: '.ads/runs',
      allowedOrigins: new Set(),
      timeoutMs: 2_000,
    });
    const rendered = await service.render({
      target: { type: 'url', url: 'http://127.0.0.1:65534/' },
      states: ['default'],
      viewports: [{ width: 390, height: 844 }],
    });
    assert.equal(rendered.status, 'blocked');
    assert.ok(rendered.blockers.some((blocker) => blocker.includes('ads-mcp@0.2.1 setup')));
    const evidence = JSON.parse(
      (await service.readResource(rendered.artifacts.evidence)).bytes.toString('utf8'),
    ) as { captureError?: string };
    assert.match(evidence.captureError || '', /Chromium is not installed/);
  } finally {
    if (priorBrowserRoot === undefined) delete process.env.PLAYWRIGHT_BROWSERS_PATH;
    else process.env.PLAYWRIGHT_BROWSERS_PATH = priorBrowserRoot;
    await Promise.all([
      rm(projectRoot, { recursive: true, force: true }),
      rm(browserRoot, { recursive: true, force: true }),
    ]);
  }
});
