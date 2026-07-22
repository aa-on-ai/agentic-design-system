import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import { AdsService } from './service.js';
import type { EvaluateOutput, RenderOutput, TraceOutput } from './types.js';

const targetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('url'), url: z.string().url() }),
  z.object({
    type: z.literal('component'),
    path: z.string().min(1),
    exportName: z.string().min(1).optional(),
  }),
]);

const renderInputSchema = {
  target: targetSchema,
  states: z.array(z.string().min(1)).max(16).optional(),
  viewports: z.array(z.object({
    width: z.number().int().min(240).max(7680),
    height: z.number().int().min(240).max(7680),
  })).max(12).optional(),
  waitFor: z.string().min(1).max(500).optional(),
  settleMs: z.number().int().min(0).max(30_000).optional(),
  maxCls: z.number().min(0).max(1).optional(),
  provenance: z.object({
    observedSkillFiles: z.array(z.string().min(1)).max(100).optional(),
    declaredSkillFiles: z.array(z.string().min(1)).max(100).optional(),
    sourceFiles: z.array(z.string().min(1)).max(100).optional(),
    artifactFiles: z.array(z.string().min(1)).max(100).optional(),
    adsRelease: z.string().min(1).max(200).optional(),
  }).optional(),
};

const renderOutputSchema = {
  schemaVersion: z.literal(1),
  runId: z.string(),
  status: z.enum(['complete', 'blocked']),
  target: targetSchema,
  capturedStates: z.array(z.string()),
  viewports: z.array(z.string()),
  gates: z.record(z.string(), z.unknown()),
  blockers: z.array(z.string()),
  artifacts: z.object({
    evidence: z.string(),
    screenshots: z.array(z.string()),
    manifest: z.string(),
  }),
};

const evaluateInputSchema = {
  runId: z.string().min(1),
  compareToRunId: z.string().min(1).optional(),
  rubric: z.object({
    task: z.string().min(1),
    criteria: z.array(z.object({
      name: z.string().min(1),
      weight: z.number().positive(),
    })).min(1).max(20),
  }),
  judge: z.object({ mode: z.literal('none').optional() }).optional(),
};

const evaluateOutputSchema = {
  schemaVersion: z.literal(1),
  runId: z.string(),
  status: z.enum(['complete', 'blocked', 'needs_human']),
  verdict: z.enum(['satisfied', 'needs_revision', 'failed']).nullable(),
  scores: z.record(z.string(), z.number()).nullable(),
  findings: z.array(z.unknown()),
  gates: z.record(z.string(), z.unknown()),
  comparison: z.record(z.string(), z.unknown()).nullable(),
  nextRevisionPrompt: z.string(),
  blockers: z.array(z.string()),
  artifacts: z.object({ receipt: z.string(), report: z.string() }),
};

const traceInputSchema = {
  runId: z.string().min(1),
  context: z.string().min(1),
  decisions: z.array(z.object({
    id: z.string().min(1),
    decision: z.string().min(1),
    artifact: z.object({
      path: z.string().min(1),
      location: z.string().min(1).optional(),
    }),
    rule: z.object({ path: z.string().min(1), excerpt: z.string().min(1) }),
    sourceConstraint: z.object({ path: z.string().min(1), excerpt: z.string().min(1) }),
    evidence: z.array(z.string().min(1)).min(1),
  })).min(1).max(50),
};

const traceOutputSchema = {
  schemaVersion: z.literal(1),
  runId: z.string(),
  valid: z.boolean(),
  errors: z.array(z.string()),
  manifestSha256: z.string(),
  artifacts: z.object({ trace: z.string(), validation: z.string() }),
};

function resourceLinks(output: RenderOutput | EvaluateOutput | TraceOutput) {
  const uris = 'capturedStates' in output
    ? [output.artifacts.manifest, output.artifacts.evidence, ...output.artifacts.screenshots]
    : 'verdict' in output
      ? [output.artifacts.receipt, output.artifacts.report]
      : [output.artifacts.trace, output.artifacts.validation];
  return uris.map((uri) => ({
    type: 'resource_link' as const,
    uri,
    name: uri.split('/').at(-1) || 'ADS artifact',
    mimeType: uri.endsWith('.png') ? 'image/png' : uri.endsWith('/report') ? 'text/markdown' : 'application/json',
  }));
}

function toolResult(output: RenderOutput | EvaluateOutput | TraceOutput) {
  return {
    content: [
      { type: 'text' as const, text: JSON.stringify(output, null, 2) },
      ...resourceLinks(output),
    ],
    structuredContent: output as unknown as Record<string, unknown>,
  };
}

async function resourceResponse(service: AdsService, uri: URL) {
  const resource = await service.readResource(uri.toString());
  if (resource.mimeType.startsWith('image/')) {
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: resource.mimeType,
        blob: resource.bytes.toString('base64'),
      }],
    };
  }
  return {
    contents: [{
      uri: uri.toString(),
      mimeType: resource.mimeType,
      text: resource.bytes.toString('utf8'),
    }],
  };
}

export function createAdsMcpServer(service: AdsService): McpServer {
  const server = new McpServer(
    { name: 'ads-mcp', version: '0.1.0' },
    {
      instructions: [
        'Use the tools in sequence: ads_render -> ads_evaluate -> ads_trace.',
        'Rendered deterministic gates must complete before evaluation.',
        'ads_evaluate returns needs_human when visual judgment is unresolved.',
      ].join(' '),
    },
  );

  server.registerTool('ads_render', {
    title: 'Render ADS evidence',
    description: 'Render an allowed web URL or root-confined TSX component into ADS screenshots and deterministic gate evidence.',
    inputSchema: renderInputSchema,
    outputSchema: renderOutputSchema,
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async (input, extra) => toolResult(await service.render(input, extra.signal)));

  server.registerTool('ads_evaluate', {
    title: 'Evaluate an ADS run',
    description: 'Normalize deterministic gates and optional baseline comparison for a rendered ADS run.',
    inputSchema: evaluateInputSchema,
    outputSchema: evaluateOutputSchema,
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async (input, extra) => toolResult(await service.evaluate(input, extra.signal)));

  server.registerTool('ads_trace', {
    title: 'Trace ADS decisions',
    description: 'Verify final interface decisions against captured skill rules, source constraints, implementation artifacts, and run evidence.',
    inputSchema: traceInputSchema,
    outputSchema: traceOutputSchema,
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async (input) => toolResult(await service.trace(input)));

  server.registerResource(
    'ads-run-artifact',
    new ResourceTemplate('ads://runs/{runId}/{artifact}', { list: undefined }),
    { title: 'ADS run artifact', mimeType: 'application/octet-stream' },
    async (uri) => resourceResponse(service, uri),
  );
  server.registerResource(
    'ads-run-screenshot',
    new ResourceTemplate('ads://runs/{runId}/screenshots/{filename}', { list: undefined }),
    { title: 'ADS run screenshot', mimeType: 'image/png' },
    async (uri) => resourceResponse(service, uri),
  );

  return server;
}
