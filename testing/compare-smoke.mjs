#!/usr/bin/env node
// Smoke test for compare.mjs (before/after visual-delta evidence). Synthesizes small
// capture-shaped evidence dirs with pngjs — no browser, no network — then asserts:
//   A. identical captures    -> all pairs identical, 0 changed pixels, exit 0
//   B. intentional change    -> nonzero changed-pixel metrics + diff image + comparison
//                               section injected into candidate evidence.json, exit 0
//                               (delta is evidence, not a verdict); also exercises the
//                               union-canvas path via a taller candidate screenshot
//   C. incompatible sets     -> unmatched state/breakpoint keys land in `incomparable`
//                               with reasons, nothing silently cross-diffed, exit 0
//   D. explicit threshold    -> --threshold fails (exit 1) on an exceeded budget or an
//                               incomparable set, and passes (exit 0) on a generous budget
//   E. pixel-threshold modes -> a subtle tint shift (#f7f6f3 -> #e8f0e8) does NOT register
//                               in the default "visibly changed" mode (documented semantics)
//                               but DOES register with --pixel-threshold 0 (strict fidelity);
//                               the threshold + tool/schema versions land in comparison.json
//   F. rounding regression   -> one changed pixel in a 2000x2000 canvas rounds changedPct
//                               to 0 for display but still fails --pixel-threshold 0
//                               --threshold 0 (the gate enforces unrounded changedPctRaw)
//   G. zero comparable pairs -> fully disjoint evidence sets exit 2 (unusable evidence,
//                               with or without --threshold); comparison.json still written
//   H. width mismatch        -> same breakpoint but different widths is incomparable
//                               (reason: width-mismatch), never force-diffed; height-only
//                               differences keep the union-canvas accounting (case B)
//   I. strict anti-aliasing  -> an AA-only numeric change fails a strict zero budget;
//                               perceptual mode continues to ignore AA noise
//
//   node testing/compare-smoke.mjs
//
// Exit 0 = all checks pass, 1 = failure.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');
const COMPARE = path.join(REPO_ROOT, 'skills', 'design-review', 'scripts', 'compare.mjs');
const WORK = path.join(REPO_ROOT, 'evidence', 'compare-smoke');

const { PNG } = await import('pngjs');

const checks = [];
const ok = (name, cond, detail = '') => checks.push({ name, pass: !!cond, detail });
const readJson = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));
const exists = async (p) => { try { await fs.access(p); return true; } catch { return false; } };

function makePng(width, height, rgb, block = null) {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) {
    png.data[i * 4] = rgb[0];
    png.data[i * 4 + 1] = rgb[1];
    png.data[i * 4 + 2] = rgb[2];
    png.data[i * 4 + 3] = 255;
  }
  if (block) {
    for (let y = block.y; y < block.y + block.h; y++) {
      for (let x = block.x; x < block.x + block.w; x++) {
        const i = (y * width + x) * 4;
        png.data[i] = block.rgb[0];
        png.data[i + 1] = block.rgb[1];
        png.data[i + 2] = block.rgb[2];
      }
    }
  }
  return PNG.sync.write(png);
}

// A vertical black rule with gray anti-aliased shoulders. Changing only the
// interior shoulder pixels is classified entirely as anti-aliasing by pixelmatch.
function makeAaEdgePng(changed = false) {
  const width = 7;
  const height = 7;
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = x === 2 || x === 4 ? 192 : x === 3 ? 0 : 255;
      if (changed && y >= 1 && y <= 5 && (x === 2 || x === 4)) value = 180;
      const i = (y * width + x) * 4;
      png.data[i] = value;
      png.data[i + 1] = value;
      png.data[i + 2] = value;
      png.data[i + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

// Write a minimal capture.mjs-shaped evidence dir: evidence.json + one PNG per state@breakpoint.
async function writeEvidenceDir(dir, snapshots) {
  await fs.mkdir(dir, { recursive: true });
  const entries = [];
  for (const s of snapshots) {
    const screenshot = `${s.state}-${s.breakpoint}.png`;
    await fs.writeFile(path.join(dir, screenshot), s.png);
    entries.push({ state: s.state, breakpoint: s.breakpoint, screenshot });
  }
  const evidence = {
    url: `file:///smoke/${path.basename(dir)}`,
    capturedStates: [...new Set(snapshots.map((s) => s.state))],
    breakpoints: [...new Set(snapshots.map((s) => s.breakpoint))],
    axeAvailable: false,
    snapshots: entries,
    gates: {},
  };
  await fs.writeFile(path.join(dir, 'evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  return dir;
}

async function runCompare(baseDir, candDir, extraArgs = []) {
  try {
    const { stdout } = await execFileAsync(
      process.execPath, [COMPARE, baseDir, candDir, ...extraArgs], { cwd: REPO_ROOT },
    );
    return { code: 0, out: stdout };
  } catch (e) {
    return { code: e.code ?? 1, out: [e.stdout, e.stderr].filter(Boolean).join('\n') };
  }
}

async function main() {
  await fs.rm(WORK, { recursive: true, force: true });

  const W = 120;
  const H = 90;
  const gray = [240, 240, 238];
  const base = (state, bp) => ({ state, breakpoint: bp, png: makePng(W, H, gray) });

  // shared baseline: 2 states x 1 breakpoint
  const baselineDir = await writeEvidenceDir(path.join(WORK, 'baseline'), [
    base('default', '390x844'),
    base('empty', '390x844'),
  ]);

  // --- Case A: identical captures ---
  const identicalDir = await writeEvidenceDir(path.join(WORK, 'cand-identical'), [
    base('default', '390x844'),
    base('empty', '390x844'),
  ]);
  const a = await runCompare(baselineDir, identicalDir);
  ok('A: exit 0 on identical captures', a.code === 0, `exit=${a.code}`);
  const aJson = await readJson(path.join(identicalDir, 'comparison', 'comparison.json'));
  ok('A: 2 pairs compared', aJson.pairsCompared === 2, `pairs=${aJson.pairsCompared}`);
  ok('A: all pairs identical, 0 changed pixels',
    aJson.pairsIdentical === 2 && aJson.pairs.every((p) => p.changedPixels === 0),
    JSON.stringify(aJson.pairs.map((p) => p.changedPixels)));
  ok('A: maxChangedPct is 0', aJson.maxChangedPct === 0, `max=${aJson.maxChangedPct}`);

  // --- Case B: intentional change (30x30 block) + taller candidate (union canvas) ---
  const changedPng = makePng(W, H + 20, gray, { x: 10, y: 10, w: 30, h: 30, rgb: [200, 60, 30] });
  const changedDir = await writeEvidenceDir(path.join(WORK, 'cand-changed'), [
    { state: 'default', breakpoint: '390x844', png: changedPng },
    base('empty', '390x844'),
  ]);
  const b = await runCompare(baselineDir, changedDir);
  ok('B: exit 0 without threshold (delta is evidence, not verdict)', b.code === 0, `exit=${b.code}`);
  const bJson = await readJson(path.join(changedDir, 'comparison', 'comparison.json'));
  const bPair = bJson.pairs.find((p) => p.key === 'default@390x844');
  ok('B: changed pixels >= painted block + padded rows',
    bPair && bPair.changedPixels >= 30 * 30 + W * 20,
    `changed=${bPair?.changedPixels}`);
  ok('B: changedPct > 0 and pair not identical', bPair && bPair.changedPct > 0 && !bPair.identical,
    `pct=${bPair?.changedPct}`);
  ok('B: dimension mismatch recorded, still compared', bPair && bPair.dimensions.match === false,
    JSON.stringify(bPair?.dimensions));
  ok('B: untouched pair still identical',
    bJson.pairs.find((p) => p.key === 'empty@390x844')?.identical === true);
  ok('B: diff image written', await exists(path.join(changedDir, 'comparison', bPair?.diffImage || 'missing')));
  const bEvidence = await readJson(path.join(changedDir, 'evidence.json'));
  ok('B: comparison section injected into candidate evidence.json',
    bEvidence.comparison?.generatedBy === 'compare.mjs' && bEvidence.comparison?.pairsCompared === 2,
    JSON.stringify({ has: !!bEvidence.comparison }));

  // --- Case C: incompatible evidence sets ---
  const incompatibleDir = await writeEvidenceDir(path.join(WORK, 'cand-incompatible'), [
    base('default', '390x844'),
    base('error', '390x844'),      // baseline has no `error` state
    base('default', '1280x800'),   // baseline has no desktop breakpoint
  ]);
  const c = await runCompare(baselineDir, incompatibleDir);
  ok('C: exit 0 without threshold (incomparability is a finding)', c.code === 0, `exit=${c.code}`);
  const cJson = await readJson(path.join(incompatibleDir, 'comparison', 'comparison.json'));
  ok('C: only the matching pair compared', cJson.pairsCompared === 1 && cJson.pairs[0].key === 'default@390x844',
    JSON.stringify(cJson.pairs.map((p) => p.key)));
  const reasons = Object.fromEntries(cJson.incomparable.map((i) => [i.key, i.reason]));
  ok('C: candidate-only keys flagged missing-in-baseline',
    reasons['error@390x844'] === 'missing-in-baseline' && reasons['default@1280x800'] === 'missing-in-baseline',
    JSON.stringify(reasons));
  ok('C: baseline-only key flagged missing-in-candidate', reasons['empty@390x844'] === 'missing-in-candidate',
    JSON.stringify(reasons));

  // --- Case D: explicit threshold gate ---
  const dTight = await runCompare(baselineDir, changedDir, ['--threshold', '0.5']);
  ok('D: tight threshold fails (exit 1)', dTight.code === 1, `exit=${dTight.code}`);
  const dTightJson = await readJson(path.join(changedDir, 'comparison', 'comparison.json'));
  ok('D: threshold block records exceeded pair',
    dTightJson.threshold?.passed === false && dTightJson.threshold?.exceededAt.includes('default@390x844'),
    JSON.stringify(dTightJson.threshold));
  const dLoose = await runCompare(baselineDir, changedDir, ['--threshold', '99']);
  ok('D: generous threshold passes (exit 0)', dLoose.code === 0, `exit=${dLoose.code}`);
  const dIncomp = await runCompare(baselineDir, incompatibleDir, ['--threshold', '99']);
  ok('D: threshold fails on incomparable sets (cannot attest)', dIncomp.code === 1, `exit=${dIncomp.code}`);

  // --- Case E: default "visibly changed" vs strict fidelity pixel threshold ---
  const tintBaseDir = await writeEvidenceDir(path.join(WORK, 'tint-baseline'), [
    { state: 'default', breakpoint: '390x844', png: makePng(W, H, [247, 246, 243]) }, // #f7f6f3
  ]);
  const tintCandDir = await writeEvidenceDir(path.join(WORK, 'tint-candidate'), [
    { state: 'default', breakpoint: '390x844', png: makePng(W, H, [232, 240, 232]) }, // #e8f0e8
  ]);
  const eDefault = await runCompare(tintBaseDir, tintCandDir);
  const eDefaultJson = await readJson(path.join(tintCandDir, 'comparison', 'comparison.json'));
  ok('E: subtle tint shift does NOT register in default mode (documented "visibly changed" semantics)',
    eDefault.code === 0 && eDefaultJson.pairs[0].changedPixels === 0,
    `changed=${eDefaultJson.pairs[0].changedPixels}`);
  ok('E: default mode records pixelmatchThreshold 0.1',
    eDefaultJson.pixelmatchThreshold === 0.1 && eDefaultJson.pixelmatchIncludeAA === false,
    `threshold=${eDefaultJson.pixelmatchThreshold} includeAA=${eDefaultJson.pixelmatchIncludeAA}`);
  const eStrict = await runCompare(tintBaseDir, tintCandDir, ['--pixel-threshold', '0']);
  const eStrictJson = await readJson(path.join(tintCandDir, 'comparison', 'comparison.json'));
  ok('E: same tint shift registers fully in strict mode (--pixel-threshold 0)',
    eStrict.code === 0 && eStrictJson.pairs[0].changedPixels === W * H && eStrictJson.pairs[0].changedPct === 100,
    `changed=${eStrictJson.pairs[0].changedPixels}/${W * H} pct=${eStrictJson.pairs[0].changedPct}`);
  ok('E: strict mode records pixelmatchThreshold 0',
    eStrictJson.pixelmatchThreshold === 0 && eStrictJson.pixelmatchIncludeAA === true,
    `threshold=${eStrictJson.pixelmatchThreshold} includeAA=${eStrictJson.pixelmatchIncludeAA}`);
  ok('E: comparison.json carries toolVersion + schemaVersion',
    typeof eStrictJson.toolVersion === 'string' && eStrictJson.schemaVersion === 1,
    JSON.stringify({ tool: eStrictJson.toolVersion, schema: eStrictJson.schemaVersion }));
  ok('E: invalid --pixel-threshold rejected (exit 2)',
    (await runCompare(tintBaseDir, tintCandDir, ['--pixel-threshold', '1.5'])).code === 2);

  // --- Case F: one changed pixel in 2000x2000 must fail a zero budget (raw pct, not rounded) ---
  const BIG = 2000;
  const bigBaseDir = await writeEvidenceDir(path.join(WORK, 'big-baseline'), [
    { state: 'default', breakpoint: '1280x800', png: makePng(BIG, BIG, [255, 255, 255]) },
  ]);
  const bigCandDir = await writeEvidenceDir(path.join(WORK, 'big-candidate'), [
    { state: 'default', breakpoint: '1280x800', png: makePng(BIG, BIG, [255, 255, 255], { x: 5, y: 5, w: 1, h: 1, rgb: [0, 0, 0] }) },
  ]);
  const f = await runCompare(bigBaseDir, bigCandDir, ['--pixel-threshold', '0', '--threshold', '0']);
  ok('F: one pixel in 2000x2000 FAILS --pixel-threshold 0 --threshold 0 (exit 1)', f.code === 1, `exit=${f.code}`);
  const fJson = await readJson(path.join(bigCandDir, 'comparison', 'comparison.json'));
  const fPair = fJson.pairs[0];
  ok('F: exactly one changed pixel counted', fPair.changedPixels === 1, `changed=${fPair.changedPixels}`);
  ok('F: display changedPct rounds to 0 while changedPctRaw stays > 0 (the trap the gate must not use)',
    fPair.changedPct === 0 && fPair.changedPctRaw > 0,
    `pct=${fPair.changedPct} raw=${fPair.changedPctRaw}`);
  ok('F: threshold block records the exceeded pair from the raw value',
    fJson.threshold?.passed === false && fJson.threshold?.exceededAt.includes('default@1280x800'),
    JSON.stringify(fJson.threshold));

  // --- Case G: zero comparable pairs = unusable evidence, exit 2 ---
  const gBaseDir = await writeEvidenceDir(path.join(WORK, 'disjoint-baseline'), [
    base('default', '390x844'),
  ]);
  const gCandDir = await writeEvidenceDir(path.join(WORK, 'disjoint-candidate'), [
    base('error', '390x844'),
  ]);
  const g = await runCompare(gBaseDir, gCandDir);
  ok('G: fully disjoint sets exit 2 (comparison compared nothing)', g.code === 2, `exit=${g.code}`);
  const gJson = await readJson(path.join(gCandDir, 'comparison', 'comparison.json'));
  ok('G: comparison.json still written for forensics (0 pairs, 2 incomparable)',
    gJson.pairsCompared === 0 && gJson.incomparable.length === 2,
    JSON.stringify({ pairs: gJson.pairsCompared, incomparable: gJson.incomparable.length }));
  ok('G: exit 2 also with an explicit threshold (never a passing gate over nothing)',
    (await runCompare(gBaseDir, gCandDir, ['--threshold', '99'])).code === 2);

  // --- Case H: width mismatch at the same breakpoint is incomparable ---
  const hCandDir = await writeEvidenceDir(path.join(WORK, 'cand-width-mismatch'), [
    { state: 'default', breakpoint: '390x844', png: makePng(W + 20, H, gray) }, // wider than baseline
    base('empty', '390x844'),
  ]);
  const h = await runCompare(baselineDir, hCandDir);
  ok('H: exit 0 while at least one pair compared', h.code === 0, `exit=${h.code}`);
  const hJson = await readJson(path.join(hCandDir, 'comparison', 'comparison.json'));
  const hIncomp = hJson.incomparable.find((i) => i.key === 'default@390x844');
  ok('H: width-mismatched pair recorded incomparable, not force-diffed',
    hJson.pairsCompared === 1 && hIncomp?.reason === 'width-mismatch',
    JSON.stringify(hJson.incomparable));
  ok('H: mismatched dimensions recorded on the incomparable entry',
    hIncomp?.baselineDimensions === `${W}x${H}` && hIncomp?.candidateDimensions === `${W + 20}x${H}`,
    JSON.stringify(hIncomp));

  // --- Case I: strict mode must count anti-aliased-only numeric changes ---
  const iBaseDir = await writeEvidenceDir(path.join(WORK, 'aa-baseline'), [
    { state: 'default', breakpoint: '390x844', png: makeAaEdgePng(false) },
  ]);
  const iCandDir = await writeEvidenceDir(path.join(WORK, 'aa-candidate'), [
    { state: 'default', breakpoint: '390x844', png: makeAaEdgePng(true) },
  ]);
  const iDefault = await runCompare(iBaseDir, iCandDir, ['--threshold', '0']);
  const iDefaultJson = await readJson(path.join(iCandDir, 'comparison', 'comparison.json'));
  ok('I: perceptual mode ignores AA-only noise',
    iDefault.code === 0 && iDefaultJson.pairs[0].changedPixels === 0,
    `exit=${iDefault.code} changed=${iDefaultJson.pairs[0].changedPixels}`);
  const iStrict = await runCompare(iBaseDir, iCandDir, ['--pixel-threshold', '0', '--threshold', '0']);
  const iStrictJson = await readJson(path.join(iCandDir, 'comparison', 'comparison.json'));
  ok('I: strict mode fails a zero budget on AA-only numeric changes',
    iStrict.code === 1 && iStrictJson.pairs[0].changedPixels > 0 && iStrictJson.threshold?.passed === false,
    `exit=${iStrict.code} changed=${iStrictJson.pairs[0].changedPixels}`);

  const passed = checks.filter((x) => x.pass).length;
  console.log('\n[compare-smoke] results:');
  for (const x of checks) console.log(`  ${x.pass ? 'PASS' : 'FAIL'}  ${x.name}${x.detail ? `  (${x.detail})` : ''}`);
  console.log(`\n[compare-smoke] ${passed}/${checks.length} checks passed`);
  process.exit(passed === checks.length ? 0 : 1);
}

main().catch((e) => { console.error(`[compare-smoke] fatal: ${e?.stack || e}`); process.exit(1); });
