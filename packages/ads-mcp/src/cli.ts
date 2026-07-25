#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { HELP, parseServerConfig } from './config.js';
import { AdsService } from './service.js';
import { createAdsMcpServer } from './server.js';

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
  console.error(`ads-mcp 0.2.0 running on stdio for ${config.root}`);
}

main().catch((error) => {
  console.error(`ads-mcp failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
