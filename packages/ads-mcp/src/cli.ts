#!/usr/bin/env node

import { serveStdio } from '@modelcontextprotocol/server/stdio';
import {
  ADS_MCP_VERSION,
  browserStatus,
  installBrowser,
} from './browser.js';
import { HELP, parseServerConfig } from './config.js';
import { AdsService } from './service.js';
import { createAdsMcpServer } from './server.js';

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0];
  if (command === 'setup') {
    if (argv.length > 1) throw new Error('setup does not accept additional arguments');
    process.stderr.write('ads-mcp: installing Chromium for rendered evidence...\n');
    const status = await installBrowser();
    process.stdout.write(`ads-mcp: Chromium ready at ${status.executablePath}\n`);
    return;
  }
  if (command === 'doctor') {
    const doctorArgs = argv.slice(1);
    if (doctorArgs.some((argument) => argument !== '--json')) {
      throw new Error('doctor accepts only --json');
    }
    const status = await browserStatus();
    const report = {
      schemaVersion: 1,
      package: 'ads-mcp',
      version: ADS_MCP_VERSION,
      browser: status,
    };
    if (doctorArgs.includes('--json')) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    else {
      process.stdout.write(
        status.ready
          ? `ads-mcp: Chromium ready (${status.executablePath})\n`
          : `ads-mcp: Chromium missing; run "${status.setupCommand}"\n`,
      );
    }
    if (!status.ready) process.exitCode = 1;
    return;
  }

  const config = await parseServerConfig(argv);
  if (!config) {
    process.stdout.write(HELP);
    return;
  }
  const service = await AdsService.create(config);
  await serveStdio(() => createAdsMcpServer(service));
  console.error(`ads-mcp ${ADS_MCP_VERSION} running on stdio for ${config.root}`);
}

main().catch((error) => {
  console.error(`ads-mcp failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
