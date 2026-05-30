#!/usr/bin/env node
// render-eval.mjs — render-based self-eval.
//
// Pipeline per variant:  mount (esbuild -> html) -> capture.mjs (screenshots + axe on live
// DOM) -> judge from screenshots.  Every stage failure becomes an explicit skip receipt —
// no silent drops. All generated output lands under evidence/ (gitignored).
//
// Usage:
//   node testing/render-eval.mjs --fixture                 # deterministic, offline fixture path
//   node testing/render-eval.mjs --fixture --dry-run        # validate, no mount/capture
//   node testing/render-eval.mjs --variant path/to/x.tsx --slug myslug --name after \
//        --states default,empty,loading,error --prompt "build an orders page"
//
// Judge: sends screenshots to ANTHROPIC_API_KEY if set; otherwise a deterministic stub
// records which screenshots + gates WOULD be sent. Override model with --judge / EVAL_JUDGE_MODEL.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mountVariant } from './lib/mount.mjs';
import { judgeFromScreenshots } from './lib/judge-render.mjs';

const execFileAsync = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const CAPTURE = path.join(REPO_ROOT, 'skills', 'design-review', 'scripts', 'capture.mjs');
const EVIDENCE_ROOT = path.join(REPO_ROOT, 'evidence', 'render');

// Bundled fixture manifest — proves the path with no creds and no network.
// `good` honors #state= (multi-state capture); `broken` imports a missing lib (forced skip).
const FIXTURE_BATCH = {
  slug: 'fixture-orders',
  prompt: 'build an orders list page for a small commerce admin',
  variants: [
    { name: 'good', src: 'testing/fixtures/variant-orders.tsx', states: 'default,empty,loading,error' },
    { name: 'broken', src: 'testing/fixtures/variant-broken.tsx', states: 'default' },
  ],
};

function parseArgs(argv) {
  const a = argv.slice(2);
  const get = (n, d) => { const i = a.indexOf(n); return i === -1 ? d : a[i + 1]; };
  return {
    fixture: a.includes('--fixture'),
    dryRun: a.includes('--dry-run'),
    variant: get('--variant', null),
    slug: get('--slug', null),
    name: get('--name', 'variant'),
    states: get('--states', 'default'),
    prompt: get('--prompt', ''),
    judge: get('--judge', null),
    tailwind: get('--tailwind', 'none'), // 'cdn' to inject Tailwind Play CDN (needs network)
  };
}

function log(m) { console.log(`[render-eval] ${m}`); }

async function captureMounted({ url, states, outDir }) {
  // capture.mjs exits 0 on success (read evidence.json), 2 if it could not run (e.g. no playwright).
  try {
    const { stdout } = await execFileAsync(
      process.execPath,
      [CAPTURE, url, '--states', states, '--settle', '450', '--out', outDir],
      { cwd: REPO_ROOT },
    );
    return { ok: true, stdout };
  } catch (err) {
    const msg = [err.stdout, err.stderr, err.message].filter(Boolean).join('\n').trim();
    return { ok: false, reason: `capture failed: ${msg.split('\n')[0] || 'unknown'}` };
  }
}

async function runVariant({ slug, name, src, states, prompt, judgeModel, tailwind }) {
  const workDir = path.join(EVIDENCE_ROOT, slug, name);
  const mountDir = path.join(workDir, 'mount');
  const captureDir = path.join(workDir, 'capture');

  log(`mount ${slug}/${name} <- ${src}`);
  const mounted = await mountVariant({ src: path.resolve(REPO_ROOT, src), outDir: mountDir, title: `${slug}/${name}`, tailwind });
  if (!mounted.ok) {
    return { slug, name, src, skipped: true, stage: mounted.stage, reason: mounted.reason };
  }

  log(`capture ${slug}/${name}`);
  const cap = await captureMounted({ url: mounted.url, states, outDir: captureDir });
  if (!cap.ok) {
    return { slug, name, src, skipped: true, stage: 'capture', reason: cap.reason };
  }

  let evidence;
  try {
    evidence = JSON.parse(await fs.readFile(path.join(captureDir, 'evidence.json'), 'utf8'));
  } catch (e) {
    return { slug, name, src, skipped: true, stage: 'evidence', reason: `could not read evidence.json: ${e.message}` };
  }

  log(`judge ${slug}/${name}`);
  let receipt;
  try {
    receipt = await judgeFromScreenshots({ slug, variant: name, prompt, evidence, outDir: captureDir, model: judgeModel });
  } catch (e) {
    return { slug, name, src, skipped: true, stage: 'judge', reason: `judge failed: ${e.message}`, evidencePath: path.join(captureDir, 'evidence.json') };
  }

  const out = {
    slug,
    name,
    src,
    skipped: false,
    mountedHtml: mounted.htmlPath,
    evidencePath: path.join(captureDir, 'evidence.json'),
    gates: evidence.gates,
    judge: receipt,
  };
  await fs.writeFile(path.join(workDir, 'receipt.json'), `${JSON.stringify(out, null, 2)}\n`, 'utf8');
  return out;
}

function buildReport(slug, results) {
  const rendered = results.filter((r) => !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  const lines = [
    `# render-eval — ${slug}`,
    '',
    `rendered: ${rendered.length} | skipped: ${skipped.length}`,
    '',
    '## rendered variants',
    '',
    '| variant | serious axe | overflow | states rendered | judge |',
    '|---|---:|---|---|---|',
    ...rendered.map((r) => {
      const g = r.gates || {};
      const states = Object.entries(g.stateRendered || {}).map(([k, v]) => `${k}=${v ? 'y' : 'N'}`).join(' ');
      const judge = r.judge?.judged
        ? `scored ${r.judge.scoreTotal}/50`
        : `stub (${r.judge?.screenshotsSent?.length || 0} shots ready)`;
      return `| ${r.name} | ${g.seriousAxeViolations ?? '?'} | ${(g.horizontalOverflowAt || []).join(',') || 'none'} | ${states} | ${judge} |`;
    }),
    '',
    '## skipped variants (explicit — no silent drops)',
    '',
    skipped.length ? '| variant | stage | reason |\n|---|---|---|' : 'none',
    ...skipped.map((r) => `| ${r.name} | ${r.stage} | ${r.reason} |`),
    '',
  ];
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  const judgeModel = args.judge || process.env.EVAL_JUDGE_MODEL || 'claude-opus-4-8';
  const hasKey = !!process.env.ANTHROPIC_API_KEY?.trim();

  let batch;
  if (args.fixture) {
    batch = FIXTURE_BATCH;
  } else if (args.variant && args.slug) {
    batch = { slug: args.slug, prompt: args.prompt, variants: [{ name: args.name, src: args.variant, states: args.states }] };
  } else {
    console.error('Usage: render-eval.mjs --fixture | --variant <file> --slug <slug> [--name --states --prompt --judge]');
    process.exit(2);
  }

  if (args.dryRun) {
    log(`Dry run. slug=${batch.slug}, judge=${judgeModel}, ANTHROPIC_API_KEY=${hasKey ? 'present' : 'absent (stub judge)'}`);
    for (const v of batch.variants) log(`  would mount+capture+judge: ${v.name} <- ${v.src} [states: ${v.states}]`);
    log(`Real run drops --dry-run. Needs: npm i -D esbuild playwright @axe-core/playwright && npx playwright install chromium.`);
    return;
  }

  await fs.mkdir(path.join(EVIDENCE_ROOT, batch.slug), { recursive: true });
  const results = [];
  for (const v of batch.variants) {
    results.push(await runVariant({
      slug: batch.slug, name: v.name, src: v.src, states: v.states || 'default',
      prompt: batch.prompt, judgeModel, tailwind: args.tailwind,
    }));
  }

  const skips = results.filter((r) => r.skipped).map(({ name, src, stage, reason }) => ({ name, src, stage, reason }));
  await fs.writeFile(path.join(EVIDENCE_ROOT, batch.slug, 'skips.json'), `${JSON.stringify(skips, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(EVIDENCE_ROOT, batch.slug, 'render-report.md'), buildReport(batch.slug, results), 'utf8');

  log(`done. rendered=${results.length - skips.length}, skipped=${skips.length}`);
  for (const s of skips) log(`  SKIP ${s.name} [${s.stage}]: ${s.reason}`);
  log(`receipts + report under evidence/render/${batch.slug}/`);

  // Non-zero only if NOTHING rendered — a partial batch with explicit skips is success.
  if (results.every((r) => r.skipped)) process.exit(1);
}

main().catch((e) => { console.error(`[render-eval] fatal: ${e?.stack || e}`); process.exit(2); });
