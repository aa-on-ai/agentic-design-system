#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { canonicalRoot, normalizeAllowedOrigin } from './security.js';
import { AdsService } from './service.js';
import { createAdsMcpServer } from './server.js';
import type { ServerConfig } from './types.js';

const HELP = `Usage: ads-mcp --root <absolute-project-path> [options]

Options:
  --runs-dir <relative-path>  Run storage under root (default: .ads/runs)
  --allow-origin <origin>     Allow a non-local HTTP(S) origin; repeatable
  --timeout-ms <number>       Per-tool timeout in milliseconds (default: 30000)
  --help                      Show this help
`;

function valueAfter(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
  return value;
}

export async function parseServerConfig(argv: string[]): Promise<ServerConfig | null> {
  if (argv.includes('--help')) return null;
  let rootInput: string | undefined;
  let runsDir = '.ads/runs';
  let timeoutMs = 30_000;
  const allowedOrigins = new Set<string>();

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
    } else {
      throw new Error(`unknown option: ${flag}`);
    }
  }
  if (!rootInput) throw new Error('--root is required');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 600_000) {
    throw new Error('--timeout-ms must be an integer between 100 and 600000');
  }
  return {
    root: await canonicalRoot(rootInput),
    runsDir,
    allowedOrigins,
    timeoutMs,
  };
}

async function main(): Promise<void> {
  const config = await parseServerConfig(process.argv.slice(2));
  if (!config) {
    process.stdout.write(HELP);
    return;
  }
  const service = await AdsService.create(config);
  const server = createAdsMcpServer(service);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`ads-mcp 0.1.0 running on stdio for ${config.root}`);
}

main().catch((error) => {
  console.error(`ads-mcp failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
