import { canonicalExecutable, canonicalRoot, normalizeAllowedOrigin } from './security.js';
import type { ServerConfig } from './types.js';

export const HELP = `Usage:
  ads-mcp --root <absolute-project-path> [options]
  ads-mcp setup
  ads-mcp doctor [--json]

Options:
  --runs-dir <relative-path>  Run storage under root (default: .ads/runs)
  --allow-origin <origin>     Allow a non-local HTTP(S) origin; repeatable
  --timeout-ms <number>       Per-tool timeout in milliseconds (default: 30000)
  --judge-command <path>      Absolute visual-judge adapter executable
  --judge-arg <value>         Judge adapter argument; repeatable
  --judge-provider <name>     Provider recorded in configured-judge receipts
  --judge-model <name>        Model recorded in configured-judge receipts
  --swiftui-command <path>    Absolute SwiftUI snapshot adapter executable
  --swiftui-arg <value>       SwiftUI adapter argument; repeatable
  --swiftui-renderer <name>   Renderer recorded in SwiftUI manifests
  --swiftui-detector <name>   SwiftUI detector receipt; repeatable
  --help                      Show this help

Commands:
  setup                       Install the Chromium runtime used by ads_render
  doctor                      Report whether the Chromium runtime is ready
`;

function valueAfter(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
  return value;
}

function rawValueAfter(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (value === undefined) throw new Error(`${flag} requires a value`);
  return value;
}

export async function parseServerConfig(argv: string[]): Promise<ServerConfig | null> {
  if (argv.includes('--help')) return null;
  let rootInput: string | undefined;
  let runsDir = '.ads/runs';
  let timeoutMs = 30_000;
  const allowedOrigins = new Set<string>();
  let judgeCommand: string | undefined;
  const judgeArgs: string[] = [];
  let judgeProvider: string | undefined;
  let judgeModel: string | undefined;
  let swiftUiCommand: string | undefined;
  const swiftUiArgs: string[] = [];
  let swiftUiRenderer = 'swiftui-command';
  let swiftUiRendererConfigured = false;
  const swiftUiDetectors: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--root') {
      rootInput = valueAfter(argv, index, flag);
      index += 1;
    } else if (flag === '--runs-dir') {
      runsDir = valueAfter(argv, index, flag);
      index += 1;
    } else if (flag === '--allow-origin') {
      allowedOrigins.add(normalizeAllowedOrigin(valueAfter(argv, index, flag)));
      index += 1;
    } else if (flag === '--timeout-ms') {
      timeoutMs = Number(valueAfter(argv, index, flag));
      index += 1;
    } else if (flag === '--judge-command') {
      judgeCommand = valueAfter(argv, index, flag);
      index += 1;
    } else if (flag === '--judge-arg') {
      judgeArgs.push(rawValueAfter(argv, index, flag));
      index += 1;
    } else if (flag === '--judge-provider') {
      judgeProvider = valueAfter(argv, index, flag);
      index += 1;
    } else if (flag === '--judge-model') {
      judgeModel = valueAfter(argv, index, flag);
      index += 1;
    } else if (flag === '--swiftui-command') {
      swiftUiCommand = valueAfter(argv, index, flag);
      index += 1;
    } else if (flag === '--swiftui-arg') {
      swiftUiArgs.push(rawValueAfter(argv, index, flag));
      index += 1;
    } else if (flag === '--swiftui-renderer') {
      swiftUiRenderer = valueAfter(argv, index, flag);
      swiftUiRendererConfigured = true;
      index += 1;
    } else if (flag === '--swiftui-detector') {
      swiftUiDetectors.push(valueAfter(argv, index, flag));
      index += 1;
    } else {
      throw new Error(`unknown option: ${flag}`);
    }
  }
  if (!rootInput) throw new Error('--root is required');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 600_000) {
    throw new Error('--timeout-ms must be an integer between 100 and 600000');
  }
  const judgeConfigured = judgeCommand || judgeArgs.length || judgeProvider || judgeModel;
  if (judgeConfigured && (!judgeCommand || !judgeProvider || !judgeModel)) {
    throw new Error('--judge-command, --judge-provider, and --judge-model must be configured together');
  }
  const swiftUiConfigured =
    swiftUiCommand || swiftUiArgs.length || swiftUiRendererConfigured || swiftUiDetectors.length;
  if (swiftUiConfigured && !swiftUiCommand) {
    throw new Error('--swiftui-command is required when SwiftUI adapter options are configured');
  }
  return {
    root: await canonicalRoot(rootInput),
    runsDir,
    allowedOrigins,
    timeoutMs,
    ...(judgeCommand && judgeProvider && judgeModel
      ? {
        judgeCommand: {
          command: await canonicalExecutable(judgeCommand),
          args: judgeArgs,
          provider: judgeProvider,
          model: judgeModel,
        },
      }
      : {}),
    ...(swiftUiCommand
      ? {
        swiftUiCommand: {
          command: await canonicalExecutable(swiftUiCommand),
          args: swiftUiArgs,
          renderer: swiftUiRenderer,
          detectors: swiftUiDetectors.length ? [...new Set(swiftUiDetectors)] : ['swiftui-snapshot'],
        },
      }
      : {}),
  };
}
