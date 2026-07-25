import { spawn } from 'node:child_process';
import * as z from 'zod/v4';
import type {
  SwiftUiRenderArgs,
  SwiftUiRenderer,
  VisualJudge,
  VisualJudgeRequest,
  VisualJudgeResult,
} from './types.js';

const MAX_COMMAND_OUTPUT_BYTES = 1024 * 1024;

const normalizedBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().positive().max(1),
  height: z.number().positive().max(1),
}).strict().refine(
  (box) => box.x + box.width <= 1 && box.y + box.height <= 1,
  'normalized box must remain inside the screenshot',
);

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
  rubricRow: z.string().min(1),
  state: z.string().min(1),
  breakpoint: z.string().min(1),
  artifact: z.string().min(1),
  target: z.object({
    description: z.string().min(1),
    normalizedBox: normalizedBoxSchema.optional(),
  }).strict(),
  observation: z.string().min(1),
  evidence: z.array(z.string().min(1)).min(1),
}).strict();

const visualJudgeResponseSchema = z.object({
  verdict: z.enum(['satisfied', 'needs_revision', 'failed']),
  scores: z.record(z.string(), z.number()),
  findings: z.array(findingSchema),
  nextRevisionPrompt: z.string(),
}).strict();

const swiftUiResponseSchema = z.object({
  status: z.literal('complete'),
}).strict();

type CommandConfig = {
  command: string;
  args: string[];
};

async function runJsonCommand(
  config: CommandConfig,
  request: unknown,
  signal?: AbortSignal,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let outputBytes = 0;
    const stdout: Buffer[] = [];
    const child = spawn(config.command, config.args, {
      stdio: ['pipe', 'pipe', 'ignore'],
      signal,
    });
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      callback();
    };
    child.once('error', (error) => finish(() => reject(error)));
    child.stdout.on('data', (chunk: Buffer) => {
      outputBytes += chunk.byteLength;
      if (outputBytes > MAX_COMMAND_OUTPUT_BYTES) {
        child.kill();
        finish(() => reject(new Error('adapter command output exceeded 1 MiB')));
        return;
      }
      stdout.push(chunk);
    });
    child.once('close', (code) => finish(() => {
      if (code !== 0) {
        reject(new Error(`adapter command exited with code ${code ?? 'unknown'}`));
        return;
      }
      const text = Buffer.concat(stdout).toString('utf8').trim();
      if (!text) {
        reject(new Error('adapter command returned no JSON'));
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch {
        reject(new Error('adapter command returned invalid JSON'));
      }
    }));
    child.stdin.once('error', (error) => finish(() => reject(error)));
    child.stdin.end(`${JSON.stringify(request)}\n`);
  });
}

export class CommandVisualJudge implements VisualJudge {
  readonly id: string;
  private readonly config: CommandConfig;
  private readonly provider: string;
  private readonly model: string;

  constructor(config: CommandConfig & { provider: string; model: string }) {
    this.id = `command:${config.provider}/${config.model}`;
    this.config = { command: config.command, args: [...config.args] };
    this.provider = config.provider;
    this.model = config.model;
  }

  async evaluate(request: VisualJudgeRequest, signal?: AbortSignal): Promise<VisualJudgeResult> {
    const response = visualJudgeResponseSchema.parse(await runJsonCommand(this.config, request, signal));
    return {
      provider: this.provider,
      model: this.model,
      modelCalls: 1,
      verdict: response.verdict,
      scores: response.scores,
      findings: response.findings,
      nextRevisionPrompt: response.nextRevisionPrompt,
    };
  }
}

export class CommandSwiftUiRenderer implements SwiftUiRenderer {
  readonly id: string;
  readonly detectors: string[];
  private readonly config: CommandConfig;

  constructor(config: CommandConfig & { renderer: string; detectors: string[] }) {
    this.id = config.renderer;
    this.detectors = [...config.detectors];
    this.config = { command: config.command, args: [...config.args] };
  }

  async render(args: SwiftUiRenderArgs): Promise<void> {
    const request = {
      schemaVersion: 1,
      root: args.root,
      target: {
        ...args.target,
        projectPath: args.projectPath,
        ...(args.sourcePath ? { sourcePath: args.sourcePath } : {}),
      },
      states: args.states,
      viewports: args.viewports,
      settleMs: args.settleMs,
      outDir: args.outDir,
      timeoutMs: args.timeoutMs,
    };
    swiftUiResponseSchema.parse(await runJsonCommand(this.config, request, args.signal));
  }
}
