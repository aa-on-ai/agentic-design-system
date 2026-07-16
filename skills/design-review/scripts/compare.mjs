#!/usr/bin/env node
// compare.mjs — before/after visual-delta EVIDENCE for ADS.
//
// capture.mjs records what one revision renders. This script pairs two capture
// runs (a baseline and a candidate) and records what CHANGED between them:
// per-pair diff images and changed-pixel metrics. The output is evidence for a
// report — "what changed, what stayed identical" — NOT a quality verdict. A big
// delta on a redesign is expected; a big delta on a "polish pass" is a finding.
// The only time this script fails on the delta itself is when the caller
// explicitly passes --threshold, i.e. an agreed "nothing should visibly change
// more than X%" budget.
//
// Usage:
//   node compare.mjs <baselineEvidenceDir> <candidateEvidenceDir> [options]
//
// Both dirs must be capture.mjs outputs (evidence.json + <state>-<WxH>.png).
// Pairing is deterministic: snapshots are matched by state@breakpoint key taken
// from each evidence.json (never by directory listing), and processed in sorted
// key order. Captures made with different states or breakpoints do not silently
// cross-diff — unmatched keys are recorded as `incomparable` entries with a reason.
//
// Options:
//   --out <dir>              comparison output dir (default: <candidateDir>/comparison)
//   --threshold <pct>        optional gate: exit 1 if any compared pair's changedPct
//                            exceeds <pct>, or if any expected pair is incomparable
//                            (an attestation can't rest on pairs that never got compared).
//                            Without this flag the delta never fails the run.
//   --pixel-threshold <0..1> per-pixel color tolerance passed to pixelmatch.
//                            Default 0.1 = "visibly changed" semantics: anti-aliasing
//                            noise and imperceptible tint shifts (e.g. #f7f6f3 vs
//                            #e8f0e8) do NOT count as changed. Pass 0 for strict
//                            fidelity/polish reviews where any numeric color drift
//                            must register. Strict mode also includes anti-aliased
//                            pixels. Both settings are recorded in comparison.json.
//
// Output (in --out):
//   comparison.json          structured pairs + metrics + incomparable list
//   diff-<state>-<WxH>.png   per-pair diff image (changed pixels highlighted)
// Also injects the same summary as a `comparison` section into the CANDIDATE's
// evidence.json, so downstream graders see the delta next to the rendered gates.
//
// Full-page screenshots legitimately differ in HEIGHT when content changes
// length, so a height mismatch is NOT incomparable: images are compared over
// the union canvas and the out-of-bounds rows count as changed pixels
// (dimensionsMatch: false records that this happened). A WIDTH mismatch at the
// same breakpoint is an anomaly (the viewport width is fixed, so full-page
// width should match) — those pairs are recorded as incomparable
// (reason: width-mismatch), never force-diffed.
//
// Exit codes: 0 = comparison produced (read comparison.json for the evidence),
//             1 = --threshold was given and the gate failed,
//             2 = could not run (missing deps, unreadable evidence dirs), or
//                 zero pairs were comparable — a comparison that compared
//                 nothing is unusable as evidence and never "succeeds"
//                 (comparison.json is still written for forensics).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SETUP_SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'setup-capture.mjs');
const TOOL_VERSION = '0.4.0'; // bump when metrics/semantics change
const SCHEMA_VERSION = 1; // comparison.json shape version
const DEFAULT_PIXELMATCH_THRESHOLD = 0.1; // "visibly changed": pixelmatch's perceptual default

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length < 2 || args[0].startsWith('-') || args[1].startsWith('-')) {
    console.error(
      'Usage: node compare.mjs <baselineEvidenceDir> <candidateEvidenceDir> ' +
        '[--out dir] [--threshold pct] [--pixel-threshold 0..1]',
    );
    process.exit(2);
  }
  const get = (name, dflt) => {
    const i = args.indexOf(name);
    return i === -1 ? dflt : args[i + 1];
  };
  const thresholdRaw = get('--threshold', null);
  const threshold = thresholdRaw === null ? null : Number(thresholdRaw);
  if (thresholdRaw !== null && (!Number.isFinite(threshold) || threshold < 0)) {
    console.error(`--threshold must be a non-negative number (percent), got: ${thresholdRaw}`);
    process.exit(2);
  }
  const pixelThresholdRaw = get('--pixel-threshold', null);
  const pixelThreshold = pixelThresholdRaw === null ? DEFAULT_PIXELMATCH_THRESHOLD : Number(pixelThresholdRaw);
  if (!Number.isFinite(pixelThreshold) || pixelThreshold < 0 || pixelThreshold > 1) {
    console.error(`--pixel-threshold must be a number between 0 and 1, got: ${pixelThresholdRaw}`);
    process.exit(2);
  }
  return {
    baselineDir: path.resolve(args[0]),
    candidateDir: path.resolve(args[1]),
    out: get('--out', null),
    threshold,
    pixelThreshold,
    // pixelmatch ignores pixels it classifies as anti-aliasing by default. That
    // is useful for perceptual comparisons, but it would make the documented
    // strict mode capable of passing a zero budget despite numeric differences.
    pixelmatchIncludeAA: pixelThreshold === 0,
  };
}

async function loadDeps() {
  // pixelmatch + pngjs are peer deps alongside playwright — setup-capture.mjs installs all of them.
  let pixelmatch;
  let PNG;
  try {
    const pm = await import('pixelmatch');
    pixelmatch = pm.default || pm;
    const pngjs = await import('pngjs');
    PNG = pngjs.PNG || pngjs.default?.PNG;
    if (typeof pixelmatch !== 'function' || !PNG) throw new Error('unexpected module shape');
  } catch {
    console.error(
      'compare.mjs needs pixelmatch + pngjs. One-command setup (run from your project root):\n' +
        `  node ${SETUP_SCRIPT}\n` +
        '  (verify only: add --check)',
    );
    process.exit(2);
  }
  return { pixelmatch, PNG };
}

async function loadEvidence(dir, label) {
  const p = path.join(dir, 'evidence.json');
  try {
    const evidence = JSON.parse(await fs.readFile(p, 'utf8'));
    if (!Array.isArray(evidence.snapshots)) throw new Error('no snapshots array');
    return evidence;
  } catch (e) {
    console.error(`could not read ${label} evidence at ${p}: ${e?.message || e}`);
    console.error('both arguments must be capture.mjs output directories.');
    process.exit(2);
  }
}

// key -> snapshot, keyed by the same state@breakpoint identity capture.mjs gates use.
function snapshotMap(evidence) {
  const map = new Map();
  for (const s of evidence.snapshots) {
    if (s.state && s.breakpoint && s.screenshot) map.set(`${s.state}@${s.breakpoint}`, s);
  }
  return map;
}

// Crop an RGBA image to iw x ih (top-left anchored) so pixelmatch can compare
// the region both screenshots actually cover.
function cropToIntersection(png, iw, ih) {
  if (png.width === iw && png.height === ih) return png.data;
  const out = Buffer.alloc(iw * ih * 4);
  for (let y = 0; y < ih; y++) {
    png.data.copy(out, y * iw * 4, y * png.width * 4, y * png.width * 4 + iw * 4);
  }
  return out;
}

async function main() {
  const opts = parseArgs(process.argv);
  const { pixelmatch, PNG } = await loadDeps();

  const baseline = await loadEvidence(opts.baselineDir, 'baseline');
  const candidate = await loadEvidence(opts.candidateDir, 'candidate');
  const outDir = opts.out ? path.resolve(opts.out) : path.join(opts.candidateDir, 'comparison');
  await fs.mkdir(outDir, { recursive: true });

  const baseMap = snapshotMap(baseline);
  const candMap = snapshotMap(candidate);
  const allKeys = [...new Set([...baseMap.keys(), ...candMap.keys()])].sort();

  const pairs = [];
  const incomparable = [];

  for (const key of allKeys) {
    const b = baseMap.get(key);
    const c = candMap.get(key);
    if (!b) {
      incomparable.push({ key, reason: 'missing-in-baseline' });
      continue;
    }
    if (!c) {
      incomparable.push({ key, reason: 'missing-in-candidate' });
      continue;
    }

    let bPng;
    let cPng;
    try {
      bPng = PNG.sync.read(await fs.readFile(path.join(opts.baselineDir, b.screenshot)));
    } catch {
      incomparable.push({ key, reason: 'screenshot-unreadable-in-baseline', screenshot: b.screenshot });
      continue;
    }
    try {
      cPng = PNG.sync.read(await fs.readFile(path.join(opts.candidateDir, c.screenshot)));
    } catch {
      incomparable.push({ key, reason: 'screenshot-unreadable-in-candidate', screenshot: c.screenshot });
      continue;
    }

    // Same breakpoint => same viewport width => full-page WIDTH must match.
    // A width mismatch means the two captures aren't the same surface — record
    // it as incomparable rather than force-diffing misaligned columns.
    if (bPng.width !== cPng.width) {
      incomparable.push({
        key,
        reason: 'width-mismatch',
        baselineDimensions: `${bPng.width}x${bPng.height}`,
        candidateDimensions: `${cPng.width}x${cPng.height}`,
      });
      continue;
    }

    // Full-page HEIGHTS legitimately differ when content changes length. Compare
    // the intersection region pixel-by-pixel; the non-overlapping rows are
    // changed BY DEFINITION (content was added or removed there), not by color
    // tolerance — otherwise near-white added page area would go uncounted.
    const W = bPng.width;
    const H = Math.max(bPng.height, cPng.height);
    const iw = W;
    const ih = Math.min(bPng.height, cPng.height);
    const dimensionsMatch = bPng.height === cPng.height;

    const interDiff = new PNG({ width: iw, height: ih });
    const interChanged = pixelmatch(
      cropToIntersection(bPng, iw, ih),
      cropToIntersection(cPng, iw, ih),
      interDiff.data,
      iw,
      ih,
      { threshold: opts.pixelThreshold, includeAA: opts.pixelmatchIncludeAA },
    );

    // Diff image on the union canvas: intersection diff top-left, out-of-bounds
    // region painted solid red (it is changed by definition).
    const diff = new PNG({ width: W, height: H });
    for (let i = 0; i < W * H; i++) {
      diff.data[i * 4] = 255;
      diff.data[i * 4 + 1] = 0;
      diff.data[i * 4 + 2] = 0;
      diff.data[i * 4 + 3] = 255;
    }
    for (let y = 0; y < ih; y++) {
      interDiff.data.copy(diff.data, y * W * 4, y * iw * 4, (y + 1) * iw * 4);
    }

    const outOfBoundsPixels = W * H - iw * ih;
    const changedPixels = interChanged + outOfBoundsPixels;
    const totalPixels = W * H;
    // changedPctRaw is exact and is what --threshold enforces; changedPct is the
    // rounded display value. Never gate on the rounded number — one changed pixel
    // in a large canvas rounds to 0.000 and would slip through a zero budget.
    const changedPctRaw = (changedPixels / totalPixels) * 100;
    const changedPct = Number(changedPctRaw.toFixed(3));

    const diffImage = `diff-${key.replace('@', '-')}.png`;
    await fs.writeFile(path.join(outDir, diffImage), PNG.sync.write(diff));

    pairs.push({
      key,
      state: b.state,
      breakpoint: b.breakpoint,
      baselineScreenshot: b.screenshot,
      candidateScreenshot: c.screenshot,
      dimensions: {
        baseline: `${bPng.width}x${bPng.height}`,
        candidate: `${cPng.width}x${cPng.height}`,
        match: dimensionsMatch,
      },
      changedPixels,
      outOfBoundsPixels,
      totalPixels,
      changedPct,
      changedPctRaw,
      identical: changedPixels === 0,
      diffImage,
    });
  }

  const comparedPcts = pairs.map((p) => p.changedPctRaw);
  const summary = {
    generatedBy: 'compare.mjs',
    toolVersion: TOOL_VERSION,
    schemaVersion: SCHEMA_VERSION,
    baselineDir: opts.baselineDir,
    candidateDir: opts.candidateDir,
    baselineUrl: baseline.url || null,
    candidateUrl: candidate.url || null,
    // per-pixel color tolerance used for this run. 0.1 (default) = "visibly changed"
    // semantics; 0 = strict fidelity mode where any numeric color drift registers,
    // including pixels pixelmatch classifies as anti-aliasing.
    pixelmatchThreshold: opts.pixelThreshold,
    pixelmatchIncludeAA: opts.pixelmatchIncludeAA,
    pairsCompared: pairs.length,
    pairsIdentical: pairs.filter((p) => p.identical).length,
    maxChangedPct: comparedPcts.length ? Number(Math.max(...comparedPcts).toFixed(3)) : null,
    meanChangedPct: comparedPcts.length
      ? Number((comparedPcts.reduce((a, x) => a + x, 0) / comparedPcts.length).toFixed(3))
      : null,
    incomparable,
    pairs,
  };

  // Threshold gate — ONLY when the caller supplied an explicit budget.
  // Enforced on the exact changedPctRaw, never the rounded display value.
  if (opts.threshold !== null) {
    summary.threshold = {
      pct: opts.threshold,
      exceededAt: pairs.filter((p) => p.changedPctRaw > opts.threshold).map((p) => p.key),
      incomparableCount: incomparable.length,
      passed:
        pairs.length > 0 &&
        pairs.every((p) => p.changedPctRaw <= opts.threshold) &&
        incomparable.length === 0,
    };
  }

  await fs.writeFile(path.join(outDir, 'comparison.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  // Attach the delta evidence to the candidate's evidence.json so graders see it
  // next to the rendered gates. Diff images stay in outDir (paths are relative to it).
  try {
    const candEvidencePath = path.join(opts.candidateDir, 'evidence.json');
    const candEvidence = JSON.parse(await fs.readFile(candEvidencePath, 'utf8'));
    candEvidence.comparison = { ...summary, outDir };
    await fs.writeFile(candEvidencePath, `${JSON.stringify(candEvidence, null, 2)}\n`, 'utf8');
  } catch (e) {
    console.error(`warning: could not inject comparison into candidate evidence.json: ${e?.message || e}`);
  }

  console.log(`compared ${pairs.length} pair(s) -> ${outDir}`);
  if (opts.pixelThreshold !== DEFAULT_PIXELMATCH_THRESHOLD) {
    console.log(`  pixel threshold: ${opts.pixelThreshold} (strict — default 0.1 is "visibly changed")`);
  }
  console.log(`  identical: ${summary.pairsIdentical}/${pairs.length}`);
  for (const p of pairs) {
    console.log(
      `  ${p.key}: ${p.identical ? 'identical' : `${p.changedPct}% changed (${p.changedPixels}px)`}${
        p.dimensions.match ? '' : ` [dims ${p.dimensions.baseline} vs ${p.dimensions.candidate}]`
      }`,
    );
  }
  if (incomparable.length) {
    console.log(`  incomparable: ${incomparable.map((i) => `${i.key} (${i.reason})`).join(', ')}`);
  }

  // A comparison that compared nothing must never read as success — the
  // evidence is unusable. comparison.json was still written for forensics.
  if (pairs.length === 0) {
    console.error(
      'no comparable pairs — zero snapshots could be paired and diffed; ' +
        'this comparison is unusable as evidence (see incomparable entries in comparison.json).',
    );
    process.exit(2);
  }

  if (opts.threshold !== null && !summary.threshold.passed) {
    const why = [
      ...summary.threshold.exceededAt.map((k) => `${k} exceeds ${opts.threshold}%`),
      ...(incomparable.length ? [`${incomparable.length} incomparable pair(s)`] : []),
    ].join('; ');
    console.error(`threshold gate FAILED: ${why}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`compare.mjs failed: ${e?.stack || e}`);
  process.exit(2);
});
