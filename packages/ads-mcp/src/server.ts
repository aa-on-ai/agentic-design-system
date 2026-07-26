import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';
import { ADS_MCP_VERSION } from './browser.js';
import { AdsService } from './service.js';
import type { EvaluateOutput, RenderOutput, TraceOutput } from './types.js';

const targetSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('url'),
    url: z.string().url().describe('Local HTTP(S) URL to render; non-local origins require --allow-origin.'),
  }),
  z.object({
    type: z.literal('component'),
    path: z.string().min(1).describe('Root-confined TSX component path.'),
    exportName: z.string().min(1).optional().describe('Named export to mount; defaults to default.'),
  }),
  z.object({
    type: z.literal('swiftui'),
    projectPath: z.string().min(1).describe('Root-confined Xcode project or workspace path.'),
    scheme: z.string().min(1).describe('Xcode scheme passed to the configured SwiftUI adapter.'),
    sourcePath: z.string().min(1).optional().describe('Optional root-confined Swift source file.'),
    configuration: z.enum(['Debug', 'Release']).optional().describe('Build configuration; defaults to Debug.'),
    device: z.string().min(1).optional().describe('Requested simulator or device label.'),
  }),
]).describe('Interface target to render as web, TSX component, or configured SwiftUI evidence.');

const renderInputSchema = {
  target: targetSchema,
  states: z.array(z.string().min(1)).max(16).optional().describe(
    'States to capture. URL targets receive each non-default state as #state=<name>; '
    + 'the default state uses the original URL. Defaults to ["default"].',
  ),
  viewports: z.array(z.object({
    width: z.number().int().min(240).max(7680).describe('Viewport width in CSS pixels.'),
    height: z.number().int().min(240).max(7680).describe('Viewport height in CSS pixels.'),
  })).max(12).optional().describe('Viewports to capture; defaults to mobile 390x844 and desktop 1280x800.'),
  waitFor: z.string().min(1).max(500).optional().describe('Optional CSS selector to await before capture.'),
  settleMs: z.number().int().min(0).max(30_000).optional().describe('Additional settle time per state in milliseconds.'),
  maxCls: z.number().min(0).max(1).optional().describe('Maximum allowed cumulative layout shift; defaults to 0.1.'),
  provenance: z.object({
    observedSkillFiles: z.array(z.string().min(1)).max(100).optional().describe('Skill files actually observed before render.'),
    declaredSkillFiles: z.array(z.string().min(1)).max(100).optional().describe('Relevant skill files declared but not observed.'),
    sourceFiles: z.array(z.string().min(1)).max(100).optional().describe('Root-confined brief or source-constraint files.'),
    artifactFiles: z.array(z.string().min(1)).max(100).optional().describe('Root-confined implementation artifacts to hash.'),
    adsRelease: z.string().min(1).max(200).optional().describe('Optional ADS release or rule-set label.'),
  }).optional().describe('Files hashed prospectively for later decision-trace verification.'),
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
  judge: z.object({ mode: z.enum(['none', 'configured']).optional() }).optional(),
};

const findingSchema = z.object({
  category: z.enum([
    'layout_spacing_hierarchy',
    'polish_consistency',
    'typography',
    'originality',
    'color_contrast',
    'interaction_motion',
    'cues_affordances',
    'brand_fit_tone',
  ]),
  severity: z.enum(['minor', 'major', 'blocker']),
  rubricRow: z.string(),
  state: z.string(),
  breakpoint: z.string(),
  artifact: z.string(),
  target: z.object({
    description: z.string(),
    normalizedBox: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }).optional(),
  }),
  observation: z.string(),
  evidence: z.array(z.string()),
});

const evaluateOutputSchema = {
  schemaVersion: z.literal(1),
  runId: z.string(),
  status: z.enum(['complete', 'blocked', 'needs_human']),
  verdict: z.enum(['satisfied', 'needs_revision', 'failed']).nullable(),
  scores: z.record(z.string(), z.number()).nullable(),
  findings: z.array(findingSchema),
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
      path: z.string().min(1).describe(
        'Exact root-relative path from manifest.artifactFiles; never use a URL or placeholder.',
      ),
      location: z.string().min(1).optional(),
    }),
    rule: z.object({
      path: z.string().min(1).describe(
        'Exact root-relative path from an observed manifest.skillFiles record; never invent a path.',
      ),
      excerpt: z.string().min(1),
    }),
    sourceConstraint: z.object({
      path: z.string().min(1).describe(
        'Exact root-relative path from manifest.sourceFiles; never use a prompt label or placeholder.',
      ),
      excerpt: z.string().min(1),
    }),
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
    { name: 'ads-mcp', version: ADS_MCP_VERSION },
    {
      instructions: [
        'Use ads_render, then ads_evaluate.',
        'Call ads_trace only when the render manifest contains at least one observed skill file, source file, and artifact file; otherwise stop after evaluation.',
        'Before tracing, read the manifest and use its exact root-relative provenance paths and exact file excerpts.',
        'Never invent provenance paths or use prompt labels or URLs as file paths.',
        'Rendered deterministic gates must complete before evaluation.',
        'ads_evaluate returns needs_human when visual judgment is unresolved, or a typed verdict when judge.mode is configured.',
        'SwiftUI targets require a startup-configured SwiftUI command adapter.',
      ].join(' '),
    },
  );

  server.registerTool('ads_render', {
    title: 'Render ADS evidence',
    description: 'Render an allowed web URL, root-confined TSX component, or configured SwiftUI target into ADS screenshots and deterministic gate evidence.',
    inputSchema: renderInputSchema,
    outputSchema: renderOutputSchema,
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async (input, extra) => {
    const result = toolResult(await service.render(input, extra.signal));
    server.sendResourceListChanged();
    return result;
  });

  server.registerTool('ads_evaluate', {
    title: 'Evaluate an ADS run',
    description: 'Normalize deterministic gates and optional baseline comparison, then run an explicitly configured visual judge when requested.',
    inputSchema: evaluateInputSchema,
    outputSchema: evaluateOutputSchema,
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async (input, extra) => {
    const result = toolResult(await service.evaluate(input, extra.signal));
    server.sendResourceListChanged();
    return result;
  });

  server.registerTool('ads_trace', {
    title: 'Trace ADS decisions',
    description: 'For runs with captured provenance, verify final interface decisions against exact manifest skill, source, artifact, and evidence records. Read the manifest first and never invent file paths.',
    inputSchema: traceInputSchema,
    outputSchema: traceOutputSchema,
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async (input) => {
    const result = toolResult(await service.trace(input));
    server.sendResourceListChanged();
    return result;
  });

  server.registerResource(
    'ads-run-artifact',
    new ResourceTemplate('ads://runs/{runId}/{artifact}', {
      list: async () => ({ resources: await service.listResources() }),
    }),
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
