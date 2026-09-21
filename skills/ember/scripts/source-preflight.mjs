#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const hash = value => createHash('sha256').update(value).digest('hex');
const engineNames = ['chromium', 'webkit'];

export async function sourcePreflight({ sourceRoot, scope, url }) {
  if (scope.version !== 1 || !scope.sourceFiles?.length || !scope.states?.length ||
      !scope.engines?.length || scope.engines.some(name => !engineNames.includes(name))) {
    throw new Error('Scope needs version 1, sourceFiles, states and chromium/webkit engines.');
  }
  const root = await realpath(sourceRoot);
  const source = { root, revision: null, workingChanges: null, files: {}, association: 'host-declared; not a deployment attestation' };
  try {
    source.revision = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    source.workingChanges = execFileSync('git', ['-C', root, 'status', '--porcelain', '--', '.'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch { /* Non-Git fixtures are versioned by the explicitly named file hashes. */ }
  for (const name of scope.sourceFiles) {
    if (typeof name !== 'string' || path.isAbsolute(name)) throw new Error('Source files must be relative paths.');
    const absolute = await realpath(path.resolve(root, name));
    const relative = path.relative(root, absolute);
    if (relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)) throw new Error('Source file leaves the source root.');
    source.files[name] = hash(await readFile(absolute));
  }
  for (const state of scope.states) {
    if (!state.id || !state.visible?.length || !Number.isInteger(state.viewport?.width) ||
        !Number.isInteger(state.viewport?.height) || state.viewport.width < 1 || state.viewport.height < 1 ||
        (state.actions ?? []).some(action => Object.keys(action).length !== 1 || typeof action.click !== 'string')) {
      throw new Error('Each state needs id, viewport, visible selectors and optional click actions.');
    }
  }
  const receipt = {
    schema: 'ember.source-preflight.v1', checkedAt: new Date().toISOString(),
    source, url, scopeSha256: hash(JSON.stringify(scope)), rows: [],
    status: 'not_verified', proves: 'declared state reachability only; not quality, focus behavior or repair success'
  };
  if (scope.expectedRevision && source.revision !== scope.expectedRevision) {
    receipt.status = 'version_mismatch';
    receipt.expectedRevision = scope.expectedRevision;
    return receipt;
  }
  const { chromium, webkit } = createRequire(path.join(process.cwd(), 'package.json'))('playwright');
  const engines = { chromium, webkit };
  for (const name of scope.engines) {
    let browser;
    try {
      browser = await engines[name].launch({ headless: true });
      for (const state of scope.states) {
        const row = { engine: name, state: state.id, viewport: state.viewport, status: 'not_verified', checks: [] };
        receipt.rows.push(row);
        const page = await browser.newPage({ viewport: state.viewport });
        page.setDefaultTimeout(2000);
        try {
          const response = await page.goto(url, { waitUntil: 'load', timeout: 15000 });
          if (response && !response.ok()) throw new Error('Surface returned HTTP ' + response.status());
          await page.evaluate(() => document.fonts.ready);
          let gap = false;
          for (const action of state.actions ?? []) {
            const target = page.locator(action.click);
            await target.waitFor({ state: 'visible' }).catch(() => {});
            const reachable = await target.count() === 1 && await target.isVisible() && await target.isEnabled();
            row.checks.push({ action: 'click', selector: action.click, reachable });
            if (!reachable) { gap = true; break; }
            await target.click();
          }
          if (!gap) {
            for (const selector of state.visible) {
              const target = page.locator(selector);
              await target.waitFor({ state: 'visible' }).catch(() => {});
              const visible = await target.count() === 1 && await target.isVisible();
              row.checks.push({ selector, visible });
              if (!visible) gap = true;
            }
          }
          row.status = gap ? 'unavailable' : 'reachable';
          row.mountedHtmlSha256 = hash(await page.content());
        } catch (error) {
          row.status = 'not_verified';
          row.reason = error.message.split('\n')[0];
        } finally { await page.close(); }
      }
    } catch (error) {
      receipt.rows.push({ engine: name, status: 'not_verified', reason: error.message.split('\n')[0] });
    } finally { if (browser) await browser.close(); }
  }
  receipt.status = receipt.rows.length === scope.engines.length * scope.states.length &&
    receipt.rows.every(row => row.status === 'reachable') ? 'capture_ready' : 'scope_gap';
  return receipt;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [sourceRoot, scopePath, url, output] = process.argv.slice(2);
  if (!sourceRoot || !scopePath || !url || !output) {
    console.error('Usage: node source-preflight.mjs <source-root> <scope.json> <url> <new-receipt.json>');
    process.exitCode = 2;
  } else {
    try {
      const scope = JSON.parse(await readFile(scopePath, 'utf8'));
      const receipt = await sourcePreflight({ sourceRoot, scope, url });
      await writeFile(output, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
      console.log(receipt.status + ': ' + output);
      process.exitCode = receipt.status === 'capture_ready' ? 0 : 1;
    } catch (error) {
      console.error(error.message);
      process.exitCode = 2;
    }
  }
}
