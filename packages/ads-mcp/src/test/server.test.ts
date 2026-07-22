import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { AdsService } from '../service.js';
import { createAdsMcpServer } from '../server.js';
import type { CaptureRunner } from '../types.js';

const fakeCapture: CaptureRunner = async ({ states, viewports, outDir, url }) => {
  await mkdir(outDir, { recursive: true });
  const snapshots = [];
  for (const state of states) {
    for (const { width, height } of viewports) {
      const breakpoint = `${width}x${height}`;
      const screenshot = `${state}-${breakpoint}.png`;
      await writeFile(path.join(outDir, screenshot), Buffer.from('fake-png'));
      snapshots.push({ state, breakpoint, screenshot });
    }
  }
  await writeFile(path.join(outDir, 'evidence.json'), `${JSON.stringify({
    url,
    snapshots,
    gates: {
      axeAvailable: true,
      seriousAxeViolations: 0,
      horizontalOverflowAt: [],
      landmarkFailures: [],
      liveRegionFailures: [],
      stateRendered: Object.fromEntries(states.map((state) => [state, true])),
      touchTargetsUnder44: [],
      clsAvailable: true,
      clsFailures: [],
      maxCumulativeLayoutShift: 0,
    },
  })}\n`);
};

test('MCP initialize and tools/list expose exactly the three v0.1 tools', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-server-'));
  const service = await AdsService.create({
    root,
    runsDir: '.ads/runs',
    allowedOrigins: new Set(),
    timeoutMs: 1_000,
  });
  const server = createAdsMcpServer(service);
  const client = new Client({ name: 'ads-test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map(({ name }) => name).sort(), ['ads_evaluate', 'ads_render', 'ads_trace']);
    assert.equal(tools.tools.length, 3);
  } finally {
    await client.close();
    await server.close();
  }
});

test('compiled stdio binary completes the full sequence through a real MCP client', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-stdio-'));
  await Promise.all([
    mkdir(path.join(root, 'skills', 'design-review'), { recursive: true }),
    mkdir(path.join(root, 'src'), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(root, 'skills', 'design-review', 'SKILL.md'), 'Rule: keep actions reachable.\n'),
    writeFile(path.join(root, 'brief.md'), 'Constraint: actions remain reachable.\n'),
    writeFile(path.join(root, 'src', 'Orders.tsx'), 'export default function Orders() { return null; }\n'),
  ]);
  const fixtureServer = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html lang="en"><head><title>Orders</title><meta name="viewport" content="width=device-width"></head><body><main><h1>Orders</h1><button style="min-width:44px;min-height:44px">Create order</button></main></body></html>');
  });
  const port = await new Promise<number>((resolve, reject) => {
    fixtureServer.once('error', reject);
    fixtureServer.listen(0, '127.0.0.1', () => {
      const address = fixtureServer.address();
      if (!address || typeof address === 'string') reject(new Error('fixture server has no port'));
      else resolve(address.port);
    });
  });
  const cli = fileURLToPath(new URL('../cli.js', import.meta.url));
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [cli, '--root', root],
    stderr: 'pipe',
  });
  const client = new Client({ name: 'ads-stdio-test-client', version: '1.0.0' });
  await client.connect(transport);
  try {
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map(({ name }) => name).sort(), ['ads_evaluate', 'ads_render', 'ads_trace']);
    const renderResult = await client.callTool({
      name: 'ads_render',
      arguments: {
        target: { type: 'url', url: `http://127.0.0.1:${port}/` },
        viewports: [{ width: 390, height: 844 }],
        waitFor: 'main',
        settleMs: 25,
        provenance: {
          observedSkillFiles: ['skills/design-review/SKILL.md'],
          sourceFiles: ['brief.md'],
          artifactFiles: ['src/Orders.tsx'],
        },
      },
    });
    const rendered = renderResult.structuredContent as { runId: string; status: string; artifacts: { evidence: string } };
    assert.equal(rendered.status, 'complete');
    const evaluateResult = await client.callTool({
      name: 'ads_evaluate',
      arguments: {
        runId: rendered.runId,
        rubric: { task: 'Review orders', criteria: [{ name: 'Functionality', weight: 100 }] },
      },
    });
    assert.equal((evaluateResult.structuredContent as { status: string }).status, 'needs_human');
    const traceResult = await client.callTool({
      name: 'ads_trace',
      arguments: {
        runId: rendered.runId,
        context: 'Orders review',
        decisions: [{
          id: 'reachable-action',
          decision: 'Keep actions reachable.',
          artifact: { path: 'src/Orders.tsx' },
          rule: { path: 'skills/design-review/SKILL.md', excerpt: 'Rule: keep actions reachable.' },
          sourceConstraint: { path: 'brief.md', excerpt: 'Constraint: actions remain reachable.' },
          evidence: [rendered.artifacts.evidence],
        }],
      },
    });
    assert.equal((traceResult.structuredContent as { valid: boolean }).valid, true);
    const evidence = await client.readResource({ uri: rendered.artifacts.evidence });
    assert.equal(evidence.contents.length, 1);
  } finally {
    await client.close();
    await new Promise<void>((resolve, reject) => fixtureServer.close((error) => error ? reject(error) : resolve()));
  }
});

test('a real MCP client completes render, evaluate, trace, and resource reads', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-client-sequence-'));
  await Promise.all([
    mkdir(path.join(root, 'skills', 'design-review'), { recursive: true }),
    mkdir(path.join(root, 'src'), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(root, 'skills', 'design-review', 'SKILL.md'), 'Rule: keep actions reachable.\n'),
    writeFile(path.join(root, 'brief.md'), 'Constraint: actions remain reachable.\n'),
    writeFile(path.join(root, 'src', 'Orders.tsx'), 'export default function Orders() { return null; }\n'),
  ]);
  const service = await AdsService.create({
    root,
    runsDir: '.ads/runs',
    allowedOrigins: new Set(),
    timeoutMs: 2_000,
  }, { captureRunner: fakeCapture });
  const server = createAdsMcpServer(service);
  const client = new Client({ name: 'ads-sequence-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const renderResult = await client.callTool({
      name: 'ads_render',
      arguments: {
        target: { type: 'url', url: 'http://localhost:3000/orders' },
        provenance: {
          observedSkillFiles: ['skills/design-review/SKILL.md'],
          sourceFiles: ['brief.md'],
          artifactFiles: ['src/Orders.tsx'],
        },
      },
    });
    const rendered = renderResult.structuredContent as { runId: string; status: string; artifacts: { evidence: string } };
    assert.equal(rendered.status, 'complete');

    const evaluateResult = await client.callTool({
      name: 'ads_evaluate',
      arguments: {
        runId: rendered.runId,
        rubric: { task: 'Review orders', criteria: [{ name: 'Functionality', weight: 100 }] },
      },
    });
    const evaluated = evaluateResult.structuredContent as { status: string };
    assert.equal(evaluated.status, 'needs_human');

    const traceResult = await client.callTool({
      name: 'ads_trace',
      arguments: {
        runId: rendered.runId,
        context: 'Orders review',
        decisions: [{
          id: 'reachable-action',
          decision: 'Keep actions reachable.',
          artifact: { path: 'src/Orders.tsx' },
          rule: { path: 'skills/design-review/SKILL.md', excerpt: 'Rule: keep actions reachable.' },
          sourceConstraint: { path: 'brief.md', excerpt: 'Constraint: actions remain reachable.' },
          evidence: [rendered.artifacts.evidence],
        }],
      },
    });
    const traced = traceResult.structuredContent as { valid: boolean };
    assert.equal(traced.valid, true);
    const resource = await client.readResource({ uri: rendered.artifacts.evidence });
    assert.equal(resource.contents.length, 1);
    assert.match('text' in resource.contents[0]! ? resource.contents[0].text : '', /seriousAxeViolations/);
  } finally {
    await client.close();
    await server.close();
  }
});
