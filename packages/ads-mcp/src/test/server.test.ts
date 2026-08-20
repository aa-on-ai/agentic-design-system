import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { AdsService } from '../service.js';
import {
  ADS_REVIEW_APP_MIME_TYPE,
  ADS_REVIEW_APP_URI,
  MCP_APPS_EXTENSION_ID,
  createAdsMcpServer,
} from '../server.js';
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
      touchTargetsUnder48: [],
      clsAvailable: true,
      clsFailures: [],
      maxCumulativeLayoutShift: 0,
      modalInteractions: {
        receiptPath: 'modal-interaction-receipt.json',
        required: false,
        passed: true,
        failures: [],
      },
    },
  })}\n`);
};

test('MCP initialize and tools/list keep the stable three-tool surface in v0.3.0', async () => {
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
    for (const tool of tools.tools) {
      assert.equal(
        (tool._meta as { ui?: { resourceUri?: string } } | undefined)?.ui?.resourceUri,
        ADS_REVIEW_APP_URI,
      );
    }
    assert.deepEqual(client.getServerCapabilities()?.extensions?.[MCP_APPS_EXTENSION_ID], {
      mimeTypes: [ADS_REVIEW_APP_MIME_TYPE],
    });
    const appResource = await client.readResource({ uri: ADS_REVIEW_APP_URI });
    assert.equal(appResource.contents[0]?.mimeType, ADS_REVIEW_APP_MIME_TYPE);
    assert.match('text' in appResource.contents[0]! ? appResource.contents[0].text : '', /ADS evidence review/);
    const render = tools.tools.find(({ name }) => name === 'ads_render');
    const states = (
      render?.inputSchema as { properties?: { states?: { description?: string } } }
    ).properties?.states;
    assert.match(states?.description || '', /#state=<name>/);
    const instructions = client.getInstructions() || '';
    assert.match(instructions, /Call ads_trace only when the render manifest contains/);
    assert.match(instructions, /Never invent provenance paths/);
    assert.ok(instructions.indexOf('Never invent provenance paths') < 512);
    const trace = tools.tools.find(({ name }) => name === 'ads_trace');
    assert.match(trace?.description || '', /Read the manifest first and never invent file paths/);
  } finally {
    await client.close();
    await server.close();
  }
});

test('URL-only runs without provenance return one actionable trace-not-applicable error', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-url-only-trace-'));
  const service = await AdsService.create({
    root,
    runsDir: '.ads/runs',
    allowedOrigins: new Set(),
    timeoutMs: 1_000,
  }, { captureRunner: fakeCapture });
  const server = createAdsMcpServer(service);
  const client = new Client({ name: 'ads-url-only-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const renderResult = await client.callTool({
      name: 'ads_render',
      arguments: {
        target: { type: 'url', url: 'http://localhost:3000/mcp' },
        viewports: [{ width: 390, height: 844 }],
      },
    });
    const rendered = renderResult.structuredContent as {
      runId: string;
      status: string;
      artifacts: { evidence: string; manifest: string };
    };
    assert.equal(rendered.status, 'complete');

    const evaluationResult = await client.callTool({
      name: 'ads_evaluate',
      arguments: {
        runId: rendered.runId,
        rubric: { task: 'Review the public MCP page', criteria: [{ name: 'Functionality', weight: 100 }] },
        judge: { mode: 'none' },
      },
    });
    assert.equal((evaluationResult.structuredContent as { status: string }).status, 'needs_human');

    const manifestResource = await client.readResource({ uri: rendered.artifacts.manifest });
    const manifest = JSON.parse(
      'text' in manifestResource.contents[0]! ? manifestResource.contents[0].text : '{}',
    ) as { skillFiles: unknown[]; sourceFiles: unknown[]; artifactFiles: unknown[] };
    assert.deepEqual(manifest.skillFiles, []);
    assert.deepEqual(manifest.sourceFiles, []);
    assert.deepEqual(manifest.artifactFiles, []);

    const traceResult = await client.callTool({
      name: 'ads_trace',
      arguments: {
        runId: rendered.runId,
        context: 'Public URL review',
        decisions: [{
          id: 'requested-default-capture',
          decision: 'Capture the requested default state.',
          artifact: { path: 'https://agentic-design-system.vercel.app/mcp' },
          rule: { path: 'user-request', excerpt: 'Render the default state.' },
          sourceConstraint: { path: 'user-request', excerpt: 'Render the default state.' },
          evidence: [rendered.artifacts.evidence],
        }],
      },
    });
    const traced = traceResult.structuredContent as { valid: boolean; errors: string[] };
    assert.equal(traced.valid, false);
    assert.deepEqual(traced.errors, [
      'trace not applicable: render manifest is missing required provenance (observed skill files, source files, artifact files); rerun ads_render with provenance.observedSkillFiles, provenance.sourceFiles, and provenance.artifactFiles before calling ads_trace',
    ]);
    assert.doesNotMatch(traced.errors.join('\n'), /ENOENT|realpath|user-request|https:/);
  } finally {
    await client.close();
    await server.close();
  }
});

async function runCompiledStdioSequence(era: 'legacy' | 'modern'): Promise<void> {
  const root = await mkdtemp(path.join(os.tmpdir(), `ads-stdio-${era}-`));
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
    response.end('<!doctype html><html lang="en"><head><title>Orders</title><meta name="viewport" content="width=device-width"></head><body><main><h1>Orders</h1><button style="min-width:48px;min-height:48px">Create order</button></main></body></html>');
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
  const browserEnvironment: Record<string, string> = {};
  for (const key of ['PLAYWRIGHT_BROWSERS_PATH', 'PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH']) {
    const value = process.env[key];
    if (value) browserEnvironment[key] = value;
  }
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [cli, '--root', root],
    env: browserEnvironment,
    stderr: 'pipe',
  });
  const client = new Client({ name: 'ads-stdio-test-client', version: '1.0.0' });
  if (era === 'modern') {
    client.setVersionNegotiation({ mode: { pin: '2026-07-28' } });
  }
  await client.connect(transport);
  try {
    assert.equal(client.getProtocolEra(), era);
    if (era === 'modern') {
      assert.equal(client.getNegotiatedProtocolVersion(), '2026-07-28');
      assert.deepEqual(client.getDiscoverResult()?.capabilities.extensions?.[MCP_APPS_EXTENSION_ID], {
        mimeTypes: [ADS_REVIEW_APP_MIME_TYPE],
      });
    }
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map(({ name }) => name).sort(), ['ads_evaluate', 'ads_render', 'ads_trace']);
    for (const tool of tools.tools) {
      assert.equal(
        (tool._meta as { ui?: { resourceUri?: string } } | undefined)?.ui?.resourceUri,
        ADS_REVIEW_APP_URI,
      );
    }
    const appResource = await client.readResource({ uri: ADS_REVIEW_APP_URI });
    assert.equal(appResource.contents[0]?.mimeType, ADS_REVIEW_APP_MIME_TYPE);
    assert.match('text' in appResource.contents[0]! ? appResource.contents[0].text : '', /ui\/initialize/);
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
    const rendered = renderResult.structuredContent as {
      runId: string;
      status: string;
      blockers: string[];
      artifacts: { evidence: string };
    };
    assert.equal(rendered.status, 'complete', rendered.blockers.join('; '));
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
    const resources = await client.listResources();
    assert.ok(resources.resources.some(({ uri }) => uri === rendered.artifacts.evidence));
    assert.ok(resources.resources.some(({ uri }) => uri.includes(`/screenshots/`)));
  } finally {
    await client.close();
    await new Promise<void>((resolve, reject) => fixtureServer.close((error) => error ? reject(error) : resolve()));
  }
}

test('compiled stdio binary completes the full sequence through legacy initialize', async () => {
  await runCompiledStdioSequence('legacy');
});

test('compiled stdio binary completes the full sequence through modern server/discover', async () => {
  await runCompiledStdioSequence('modern');
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
    const resources = await client.listResources();
    for (const artifact of ['evidence', 'receipt', 'trace', 'trace-validation']) {
      assert.ok(
        resources.resources.some(({ uri }) => uri === `ads://runs/${rendered.runId}/${artifact}`),
        `resources/list is missing ${artifact}`,
      );
    }
  } finally {
    await client.close();
    await server.close();
  }
});

test('run handles recover across fresh server and service instances without MCP session state', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ads-stateless-recovery-'));
  await Promise.all([
    mkdir(path.join(root, 'skills', 'design-review'), { recursive: true }),
    mkdir(path.join(root, 'src'), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(root, 'skills', 'design-review', 'SKILL.md'), 'Rule: keep actions reachable.\n'),
    writeFile(path.join(root, 'brief.md'), 'Constraint: actions remain reachable.\n'),
    writeFile(path.join(root, 'src', 'Orders.tsx'), 'export default function Orders() { return null; }\n'),
  ]);
  const config = {
    root,
    runsDir: '.ads/runs',
    allowedOrigins: new Set<string>(),
    timeoutMs: 2_000,
  };

  const renderService = await AdsService.create(config, { captureRunner: fakeCapture });
  const renderServer = createAdsMcpServer(renderService);
  const renderClient = new Client({ name: 'ads-render-session', version: '1.0.0' });
  const [renderClientTransport, renderServerTransport] = InMemoryTransport.createLinkedPair();
  await renderServer.connect(renderServerTransport);
  await renderClient.connect(renderClientTransport);
  const renderResult = await renderClient.callTool({
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
  const rendered = renderResult.structuredContent as {
    runId: string;
    artifacts: { evidence: string };
  };
  await renderClient.close();
  await renderServer.close();

  const recoveryService = await AdsService.create(config, { captureRunner: fakeCapture });
  const recoveryServer = createAdsMcpServer(recoveryService);
  const recoveryClient = new Client({ name: 'ads-recovery-session', version: '1.0.0' });
  const [recoveryClientTransport, recoveryServerTransport] = InMemoryTransport.createLinkedPair();
  await recoveryServer.connect(recoveryServerTransport);
  await recoveryClient.connect(recoveryClientTransport);
  try {
    const evaluateResult = await recoveryClient.callTool({
      name: 'ads_evaluate',
      arguments: {
        runId: rendered.runId,
        rubric: { task: 'Review orders', criteria: [{ name: 'Functionality', weight: 100 }] },
      },
    });
    assert.equal((evaluateResult.structuredContent as { status: string }).status, 'needs_human');

    const traceResult = await recoveryClient.callTool({
      name: 'ads_trace',
      arguments: {
        runId: rendered.runId,
        context: 'Recovered orders review',
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
    const resources = await recoveryClient.listResources();
    assert.ok(resources.resources.some(({ uri }) => uri === `ads://runs/${rendered.runId}/trace-validation`));
  } finally {
    await recoveryClient.close();
    await recoveryServer.close();
  }
});
