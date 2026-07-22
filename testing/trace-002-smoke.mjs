import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const suiteRoot = path.join(root, "testing/regression/adjacent-actions-v1.3.1");
const baseline = path.join(suiteRoot, "baseline/pawprint");
const rerun = path.join(suiteRoot, "runs/2026-07-20-public-hardening");

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const [suite, grade, evidence, run, rerunEvidence, artifact, page, hero, gallery, receipts, header, footer, desktopAsset, mobileAsset] = await Promise.all([
  readJson(path.join(suiteRoot, "suite.json")),
  readJson(path.join(rerun, "pawprint/grade.json")),
  readJson(path.join(baseline, "rendered/evidence.json")),
  readJson(path.join(rerun, "run.json")),
  readJson(path.join(rerun, "pawprint/rendered/evidence.json")),
  readFile(path.join(baseline, "artifact/index.html"), "utf8"),
  readFile(path.join(root, "demos/src/app/trace/002/page.tsx"), "utf8"),
  readFile(path.join(root, "demos/src/app/trace/002/TraceTwoHero.tsx"), "utf8"),
  readFile(path.join(root, "demos/src/app/trace/002/ProofGallery.tsx"), "utf8"),
  readFile(path.join(root, "demos/src/app/trace/002/ProofReceipts.tsx"), "utf8"),
  readFile(path.join(root, "demos/src/app/trace/002/TraceTwoHeader.tsx"), "utf8"),
  readFile(path.join(root, "demos/src/app/SiteFooter.tsx"), "utf8"),
  readFile(path.join(root, "demos/public/trace/002/repaired-error-desktop-2x.png")),
  readFile(path.join(root, "demos/public/trace/002/repaired-error-mobile-2x.png")),
]);

assert.equal(suite.suiteId, "ads-adjacent-actions-v1.3.1");
assert.equal(suite.baselineRelease.tag, "v1.3.1");
assert.equal(suite.baselineRelease.sha, "f7d9037012f4c730150b37fbcf86b510aedd6ecb");
assert.equal(grade.verdict, "satisfied");
assert.equal(grade.weightedScore, 9.21);
assert.deepEqual(grade.findings, []);
assert.equal(grade.priorFindingClosure.status, "closed");

assert.equal(evidence.snapshots.length, 8);
assert.deepEqual(new Set(evidence.snapshots.map(({ state }) => state)), new Set(suite.states));
for (const snapshot of evidence.snapshots) {
  assert.equal(snapshot.horizontalOverflow, false, `${snapshot.state}@${snapshot.breakpoint} overflowed`);
  assert.equal(snapshot.axe.seriousOrCritical, 0, `${snapshot.state}@${snapshot.breakpoint} has serious axe findings`);
  assert.equal(snapshot.smallTouchTargets.length, 0, `${snapshot.state}@${snapshot.breakpoint} has small targets`);
  assert.equal(snapshot.landmarks.main, true, `${snapshot.state}@${snapshot.breakpoint} is missing main`);
  assert.equal(snapshot.cumulativeLayoutShift.value, 0, `${snapshot.state}@${snapshot.breakpoint} shifted`);
}

assert.equal(run.runId, "2026-07-20-public-hardening");
assert.equal(rerunEvidence.snapshots.length, 8);
assert.equal(rerunEvidence.comparison.pairs.length, 8);
assert.ok(rerunEvidence.comparison.pairs.every(({ identical }) => identical));

assert.match(artifact, /button\.disabled = isOffline/);
assert.match(artifact, /data-action="retry"/);
assert.match(page, /<ProofGallery \/>/);
assert.match(page, /<ProofResult \/>/);
assert.match(hero, /ember-peek\.png/);
assert.match(hero, /The schedule went read-only/);
assert.match(gallery, /\["baseline", "repaired", "diff"\]/);
assert.match(gallery, /requestFullscreen/);
assert.match(gallery, /unoptimized/);
assert.match(receipts, /Machine-readable trace/);
assert.match(header, /Proof case 01/);
assert.ok(desktopAsset.length > 200_000, "desktop 2x repair evidence is missing or unexpectedly small");
assert.ok(mobileAsset.length > 100_000, "mobile 2x repair evidence is missing or unexpectedly small");
assert.match(footer, /href="\/trace\/002"/);

console.log("[trace-002-smoke] current release, repair semantics, 2x evidence inspector, rerun lock, and public proof route passed");
