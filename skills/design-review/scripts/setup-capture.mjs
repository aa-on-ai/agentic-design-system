#!/usr/bin/env node
// setup-capture.mjs — one-command setup for capture.mjs's runtime dependencies.
//
// capture.mjs needs Playwright + @axe-core/playwright + a Chromium browser. Those are peer deps,
// not shipped with the skill, so a freshly-installed agent hits a wall. This removes the scavenger
// hunt: one command installs everything and verifies capture can run.
//
//   node skills/design-review/scripts/setup-capture.mjs            install deps + chromium, then verify
//   node skills/design-review/scripts/setup-capture.mjs --check     verify only (no install)
//
// Run it from your PROJECT ROOT so the deps install into a node_modules that capture.mjs resolves
// (capture.mjs walks up from its own location, so project-root node_modules is on the path).
// Installed agents: see the path-orientation note in agentic-design-system/SKILL.md — under a
// skills install this script lives at .agents/skills/design-review/scripts/setup-capture.mjs.

import { execFileSync } from 'node:child_process';
import process from 'node:process';

const checkOnly = process.argv.includes('--check');

// Is capture able to run right now? Checks the two imports plus a real Chromium launch — a missing
// browser binary is the most common "installed the npm package but capture still fails" trap.
async function readiness() {
  try {
    await import('playwright');
  } catch {
    return { ok: false, missing: 'playwright (npm package)' };
  }
  try {
    await import('@axe-core/playwright');
  } catch {
    return { ok: false, missing: '@axe-core/playwright (npm package)' };
  }
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    await browser.close();
  } catch {
    return { ok: false, missing: 'chromium browser binary' };
  }
  return { ok: true };
}

function run(cmd, args) {
  console.log(`  $ ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { stdio: 'inherit' });
}

const before = await readiness();
if (before.ok) {
  console.log('capture deps ready: playwright + @axe-core/playwright + chromium ✓');
  process.exit(0);
}

if (checkOnly) {
  console.error(
    `capture not ready — missing: ${before.missing}\n` +
      `run (from your project root): node ${process.argv[1]}`,
  );
  process.exit(1);
}

console.log(`setting up capture deps in ${process.cwd()} …`);
try {
  run('npm', ['install', '-D', 'playwright', '@axe-core/playwright']);
  run('npx', ['playwright', 'install', 'chromium']);
} catch (e) {
  console.error(`\nsetup command failed: ${e?.message || e}`);
  console.error('install manually, then re-run with --check:');
  console.error('  npm i -D playwright @axe-core/playwright && npx playwright install chromium');
  process.exit(1);
}

// Verify in a fresh process — module resolution after an in-process install can be stale.
try {
  execFileSync(process.execPath, [process.argv[1], '--check'], { stdio: 'inherit' });
} catch {
  console.error('setup ran but verification failed — check the output above.');
  process.exit(1);
}
console.log('capture deps ready ✓ — now run capture.mjs against a rendered route.');
