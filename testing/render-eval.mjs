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
// Judge: sends screenshots to the provider selected by --judge / EVAL_JUDGE_MODEL. Without
// a matching API key, the receipt is unresolved and requires human review.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mountVariant } from './lib/mount.mjs';
import { judgeFromScreenshots } from './lib/judge-render.mjs';

const execFileAsync = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const CAPTURE = path.join(REPO_ROOT, 'skills', 'design-review', 'scripts', 'capture.mjs');
export const EVIDENCE_ROOT = path.join(REPO_ROOT, 'evidence', 'render');

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

export async function runVariant({
  slug,
  name,
  src,
  states,
  prompt,
  judgeModel,
  judgeFallbackModel,
  tailwind,
  evidenceRoot = EVIDENCE_ROOT,
  apiKeys,
  judgeVariant,
}) {
  const workDir = path.join(evidenceRoot, slug, name);
  const mountDir = path.join(workDir, 'mount');
  const captureDir = path.join(workDir, 'capture');

  // A failed rerun must not inherit a stale success receipt from an earlier run.
  await fs.rm(workDir, { recursive: true, force: true });

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
    receipt = judgeVariant
      ? await judgeVariant({ slug, variant: name, prompt, evidence, outDir: captureDir, model: judgeModel })
      : await judgeFromScreenshots({
          slug,
          variant: name,
          prompt,
          evidence,
          outDir: captureDir,
          model: judgeModel,
          fallbackModel: judgeFallbackModel,
          apiKeys,
        });
  } catch (e) {
    receipt = {
      slug,
      variant: name,
      judgeModel,
      judged: false,
      scores: null,
      reason: `judge failed: ${e instanceof Error ? e.message : String(e)}; human review required`,
      screenshotsSent: (evidence.snapshots || []).map((snapshot) => ({
        label: `${snapshot.state}@${snapshot.breakpoint}`,
        path: path.join(captureDir, snapshot.screenshot),
      })),
      gates: evidence.gates || {},
    };
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
    '| variant | serious axe | overflow | small targets | states rendered | judge |',
    '|---|---:|---|---:|---|---|',
    ...rendered.map((r) => {
      const g = r.gates || {};
      const states = Object.entries(g.stateRendered || {}).map(([k, v]) => `${k}=${v ? 'y' : 'N'}`).join(' ');
      const judge = r.judge?.judged
        ? `scored ${r.judge.scoreTotal}/50`
        : `needs human (${r.judge?.screenshotsSent?.length || 0} shots ready)`;
      return `| ${r.name} | ${g.seriousAxeViolations ?? '?'} | ${(g.horizontalOverflowAt || []).join(',') || 'none'} | ${(g.touchTargetsUnder44 || []).length} | ${states} | ${judge} |`;
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
  const hasKey = !!(process.env.ANTHROPIC_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim());

  let batch;
  if (args.fixture) {
    batch = FIXTURE_BATCH;
  } else if (args.variant && args.slug) {
    batch = { slug: args.slug, prompt: args.prompt, variants: [{ name: args.name, src: args.variant, states: args.states }] };
  } else {
    console.error('Usage: render-eval.mjs --fixture | --variant <file> --slug <slug> [--name --states --prompt --judge --tailwind]');
    process.exit(2);
  }

  if (args.dryRun) {
    log(`Dry run. slug=${batch.slug}, judge=${judgeModel}, judge key=${hasKey ? 'present' : 'absent (human review)'}`);
    for (const v of batch.variants) log(`  would mount+capture+judge: ${v.name} <- ${v.src} [states: ${v.states}]`);
    log(`Real run drops --dry-run. Needs: npm i -D esbuild playwright @axe-core/playwright && npx playwright install chromium.`);
    return;
  }

  const outcome = await runRenderBatch({
    slug: batch.slug,
    prompt: batch.prompt,
    variants: batch.variants,
    judgeModel,
    judgeFallbackModel: process.env.EVAL_JUDGE_FALLBACK_MODEL?.trim() || null,
    tailwind: args.tailwind,
  });

  log(`done. rendered=${outcome.results.length - outcome.skips.length}, skipped=${outcome.skips.length}`);
  for (const s of outcome.skips) log(`  SKIP ${s.name} [${s.stage}]: ${s.reason}`);
  log(`receipts + report under evidence/render/${batch.slug}/`);

  // An explicit skip receipt is evidence, not success. Exploratory callers can inspect the
  // packet, while authoritative callers receive a non-zero exit for any incomplete batch.
  if (outcome.skips.length > 0) process.exitCode = 1;
}

export async function runRenderBatch({
  slug,
  prompt,
  variants,
  judgeModel,
  judgeFallbackModel = null,
  tailwind = 'none',
  evidenceRoot = EVIDENCE_ROOT,
  apiKeys,
  judgeVariant,
}) {
  const batchDir = path.join(evidenceRoot, slug);
  await fs.mkdir(batchDir, { recursive: true });
  const results = [];
  for (const variant of variants) {
    results.push(await runVariant({
      slug,
      name: variant.name,
      src: variant.src,
      states: variant.states || 'default',
      prompt,
      judgeModel,
      judgeFallbackModel,
      tailwind,
      evidenceRoot,
      apiKeys,
      judgeVariant,
    }));
  }

  const skips = results
    .filter((result) => result.skipped)
    .map(({ name, src, stage, reason }) => ({ name, src, stage, reason }));
  await fs.writeFile(path.join(batchDir, 'skips.json'), `${JSON.stringify(skips, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(batchDir, 'render-report.md'), buildReport(slug, results), 'utf8');
  return { slug, evidenceDir: batchDir, results, skips };
}

const invokedAsScript = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedAsScript) {
  main().catch((e) => { console.error(`[render-eval] fatal: ${e?.stack || e}`); process.exit(2); });
}
