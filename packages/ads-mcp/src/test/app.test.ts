import assert from 'node:assert/strict';
import test from 'node:test';
import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright-core';
import { browserStatus } from '../browser.js';

const renderedRun = {
  schemaVersion: 1,
  runId: 'run_app_acceptance',
  status: 'complete',
  target: { type: 'url', url: 'http://127.0.0.1:3000/orders' },
  capturedStates: ['default', 'loading'],
  viewports: ['390x844', '1280x800'],
  gates: {
    seriousAxeViolations: 0,
    horizontalOverflowAt: 0,
    landmarkFailures: 0,
    touchTargetsUnder44: 0,
    maxCumulativeLayoutShift: 0.01,
  },
  blockers: [],
  artifacts: {
    evidence: 'ads://runs/run_app_acceptance/evidence',
    screenshots: ['ads://runs/run_app_acceptance/screenshots/default-390x844.png'],
    manifest: 'ads://runs/run_app_acceptance/manifest',
  },
};

const evaluatedRun = {
  schemaVersion: 1,
  runId: 'run_app_acceptance',
  status: 'needs_human',
  verdict: null,
  scores: null,
  findings: [],
  gates: { seriousAxeViolations: 0 },
  comparison: null,
  nextRevisionPrompt: 'Review hierarchy and action clarity against the captured evidence.',
  blockers: [],
  artifacts: {
    receipt: 'ads://runs/run_app_acceptance/receipt',
    report: 'ads://runs/run_app_acceptance/report',
  },
};

test('MCP App completes the host handshake, renders evidence, and advances to human review', async () => {
  const status = await browserStatus();
  assert.equal(status.ready, true, status.setupCommand);
  const browser = await chromium.launch({ executablePath: status.executablePath });
  try {
    const context = await browser.newContext({ viewport: { width: 980, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript(({ initialResult, evaluationResult }) => {
      const hostCalls: string[] = [];
      const hostMessages: unknown[] = [];
      Object.defineProperty(window, '__adsHostCalls', { value: hostCalls });
      Object.defineProperty(window, '__adsHostMessages', { value: hostMessages });
      window.addEventListener('message', (event) => {
        const message = event.data as {
          jsonrpc?: string;
          id?: string | number;
          method?: string;
          params?: { name?: string };
        };
        if (message?.jsonrpc !== '2.0' || !message.method) return;
        hostCalls.push(message.method);
        hostMessages.push(message);
        const respond = (result: unknown) => {
          window.postMessage({ jsonrpc: '2.0', id: message.id, result }, '*');
        };
        if (message.method === 'ui/initialize') {
          respond({
            protocolVersion: '2026-01-26',
            hostCapabilities: { serverTools: {}, serverResources: {} },
            hostContext: { theme: 'light', availableDisplayModes: ['inline', 'fullscreen'] },
          });
        } else if (message.method === 'ui/notifications/initialized') {
          window.postMessage({
            jsonrpc: '2.0',
            method: 'ui/notifications/tool-input',
            params: { arguments: { target: { type: 'url' } } },
          }, '*');
          window.postMessage({
            jsonrpc: '2.0',
            method: 'ui/notifications/tool-result',
            params: { structuredContent: initialResult },
          }, '*');
        } else if (message.method === 'resources/read') {
          respond({
            contents: [{
              uri: 'ads://runs/run_app_acceptance/screenshots/default-390x844.png',
              mimeType: 'image/png',
              blob: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLZsQAAAABJRU5ErkJggg==',
            }],
          });
        } else if (message.method === 'resources/list') {
          respond({ resources: [] });
        } else if (message.method === 'tools/call' && message.params?.name === 'ads_evaluate') {
          respond({ structuredContent: evaluationResult });
        } else if (message.method === 'ui/update-model-context') {
          respond({});
        }
      });
    }, { initialResult: renderedRun, evaluationResult: evaluatedRun });

    await page.goto(new URL('../app/review.html', import.meta.url).href);
    await page.locator('main[data-state="complete"]').waitFor();
    await assert.doesNotReject(() => page.locator('h1', { hasText: 'The interface is rendered' }).waitFor());
    assert.equal(await page.locator('#status-pill').textContent(), 'Render complete');
    assert.equal(await page.locator('.shot img').count(), 1);
    assert.equal(await page.locator('#primary-action').isEnabled(), true);

    const accessibility = await new AxeBuilder({ page }).analyze();
    assert.deepEqual(
      accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical'),
      [],
    );

    await page.locator('#primary-action').click();
    await page.locator('main[data-state="needs-human"]').waitFor();
    assert.equal(await page.locator('#status-pill').textContent(), 'Human review');
    assert.equal(await page.locator('#primary-action').textContent(), 'Add revision brief');
    assert.equal(await page.locator('.shot img').count(), 1);
    await page.waitForFunction(() => (
      (window as typeof window & { __adsHostCalls: string[] }).__adsHostCalls
        .includes('ui/notifications/size-changed')
    ));
    const hostCalls = await page.evaluate(() => (
      window as typeof window & { __adsHostCalls: string[] }
    ).__adsHostCalls);
    const initializeMessage = await page.evaluate(() => (
      (window as typeof window & { __adsHostMessages: Array<{ method?: string; params?: unknown }> })
        .__adsHostMessages.find(({ method }) => method === 'ui/initialize')
    ));
    assert.deepEqual(initializeMessage?.params, {
      clientInfo: { name: 'ADS evidence review', version: '0.1.0' },
      appCapabilities: { availableDisplayModes: ['inline', 'fullscreen'] },
      protocolVersion: '2026-01-26',
    });
    assert.ok(hostCalls.includes('ui/initialize'));
    assert.ok(hostCalls.includes('resources/read'));
    assert.ok(hostCalls.includes('tools/call'));
    assert.ok(hostCalls.includes('ui/notifications/size-changed'));
  } finally {
    await browser.close();
  }
});
