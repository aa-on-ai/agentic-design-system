import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const ADS_MCP_VERSION = '0.2.2';
export const BROWSER_SETUP_COMMAND = `npx --yes ads-mcp@${ADS_MCP_VERSION} setup`;
export const BROWSER_DOCTOR_COMMAND = `npx --yes ads-mcp@${ADS_MCP_VERSION} doctor`;

export type BrowserStatus = {
  ready: boolean;
  source: 'playwright' | 'environment';
  executablePath: string;
  setupCommand: string;
  doctorCommand: string;
};

async function playwrightExecutablePath(): Promise<string> {
  const { chromium } = await import('playwright-core');
  return chromium.executablePath();
}

export async function browserStatus(): Promise<BrowserStatus> {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim();
  const source = configured ? 'environment' : 'playwright';
  const executablePath = configured ? path.resolve(configured) : await playwrightExecutablePath();
  let ready = false;
  try {
    await access(executablePath, constants.X_OK);
    ready = true;
  } catch {
    ready = false;
  }
  return {
    ready,
    source,
    executablePath,
    setupCommand: BROWSER_SETUP_COMMAND,
    doctorCommand: BROWSER_DOCTOR_COMMAND,
  };
}

export async function requireBrowser(): Promise<void> {
  const status = await browserStatus();
  if (status.ready) return;
  throw new Error(
    `Chromium is not installed for ads-mcp; run "${status.setupCommand}", verify with `
    + `"${status.doctorCommand}", then retry ads_render`,
  );
}

export async function installBrowser(): Promise<BrowserStatus> {
  const require = createRequire(import.meta.url);
  const playwrightPackage = require.resolve('playwright-core/package.json');
  const playwrightCli = path.join(path.dirname(playwrightPackage), 'cli.js');
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [playwrightCli, 'install', 'chromium'], {
      env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_GC: '1' },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Chromium setup failed${signal ? ` (${signal})` : ` with exit code ${code}`}`));
    });
  });
  const status = await browserStatus();
  if (!status.ready) throw new Error('Chromium setup completed without a usable executable');
  return status;
}
