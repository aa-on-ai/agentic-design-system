#!/usr/bin/env node
// Smoke test for the render-based self-eval fixture path. Runs render-eval --fixture and
// asserts the receipts are real: the good variant rendered + axe caught the planted violation
// + all states rendered + the judge received screenshots; the broken variant was explicitly
// skipped with a reason. No API key required (stub judge). Exit 0 = pass, 1 = fail.
//
//   node testing/render-eval-smoke.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const SLUG_DIR = path.join(REPO_ROOT, 'evidence', 'render', 'fixture-orders');

const checks = [];
const ok = (name, cond, detail = '') => checks.push({ name, pass: !!cond, detail });
const readJson = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));
const exists = async (p) => { try { await fs.access(p); return true; } catch { return false; } };

async function main() {
  console.log('[smoke] running: node testing/render-eval.mjs --fixture');
  let renderExit = 0;
  try {
    const { stdout } = await execFileAsync(process.execPath, [path.join(HERE, 'render-eval.mjs'), '--fixture'], { cwd: REPO_ROOT });
    console.log(stdout.trim());
  } catch (e) {
    renderExit = e.code;
    console.log([e.stdout, e.stderr].filter(Boolean).join('\n').trim());
  }

  ok('fixture batch exits 1 because an explicit skip is not success', renderExit === 1, `exit=${renderExit}`);

  // --- good variant ---
  const goodReceiptPath = path.join(SLUG_DIR, 'good', 'receipt.json');
  ok('good/receipt.json written', await exists(goodReceiptPath));
  if (await exists(goodReceiptPath)) {
    const r = await readJson(goodReceiptPath);
    ok('good variant not skipped', r.skipped === false, JSON.stringify(r.reason || ''));
    ok('axe caught the planted violation on rendered DOM', (r.gates?.seriousAxeViolations || 0) >= 1, `serious=${r.gates?.seriousAxeViolations}`);
    const sr = r.gates?.stateRendered || {};
    ok('all 4 states rendered', ['default', 'empty', 'loading', 'error'].every((s) => sr[s]), JSON.stringify(sr));
    ok('judge received screenshots', (r.judge?.screenshotsSent?.length || 0) >= 1, `count=${r.judge?.screenshotsSent?.length}`);
    const firstShot = r.judge?.screenshotsSent?.[0]?.path;
    ok('screenshot file actually exists', firstShot ? await exists(firstShot) : false, firstShot || 'none');
  }

  // --- broken variant: explicit skip, no silent drop ---
  const skipsPath = path.join(SLUG_DIR, 'skips.json');
  ok('skips.json written', await exists(skipsPath));
  if (await exists(skipsPath)) {
    const skips = await readJson(skipsPath);
    const broken = skips.find((s) => s.name === 'broken');
    ok('broken variant listed as skip', !!broken, JSON.stringify(skips));
    ok('skip has a concrete reason', !!broken && /resolve|bundle|import/i.test(broken.reason), broken?.reason || 'none');
    ok('broken receipt.json NOT written (it was skipped)', !(await exists(path.join(SLUG_DIR, 'broken', 'receipt.json'))));
  }

  // --- report ---
  ok('render-report.md written', await exists(path.join(SLUG_DIR, 'render-report.md')));

  const passed = checks.filter((c) => c.pass).length;
  console.log('\n[smoke] results:');
  for (const c of checks) console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.name}${c.detail ? `  (${c.detail})` : ''}`);
  console.log(`\n[smoke] ${passed}/${checks.length} checks passed`);
  process.exit(passed === checks.length ? 0 : 1);
}

main().catch((e) => { console.error(`[smoke] fatal: ${e?.stack || e}`); process.exit(1); });
