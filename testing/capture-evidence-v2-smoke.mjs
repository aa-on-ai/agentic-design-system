#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const capture = path.join(root, "skills", "design-review", "scripts", "capture.mjs");

async function captureFixture(name, outDir) {
  await execFileAsync(process.execPath, [
    capture,
    pathToFileURL(path.join(root, "testing", "fixtures", name)).href,
    "--breakpoints", "390x844",
    "--settle", "0",
    "--out", outDir,
  ], { cwd: root });
  return JSON.parse(await readFile(path.join(outDir, "evidence.json"), "utf8"));
}

const tempDir = path.join(os.tmpdir(), `ads-capture-v2-${process.pid}`);

try {
  const failing = await captureFixture("visual-foundation-v2-fail.html", path.join(tempDir, "fail"));
  const clean = await captureFixture("visual-foundation-v2-pass.html", path.join(tempDir, "pass"));

  assert.equal(failing.evidenceFormat, 2);
  assert.equal(clean.evidenceFormat, 2);

  const facts = failing.snapshots[0].visualFoundation;
  assert.equal(facts.roundedSingleEdgeBorders.length, 1);
  assert.equal(facts.oneEdgeShadowCandidates.length, 1);
  assert.equal(facts.forcedUppercase.length, 1);
  assert.ok(facts.typographyCandidates.length >= 1);
  assert.equal(facts.symbolOnlyControls.length, 1);
  assert.equal(facts.statusDotCandidates.length, 1);
  assert.equal(facts.dividerCount, 1);
  assert.equal(facts.colonTextCandidates.length, 1);
  assert.equal(facts.emDashTextCandidates.length, 1);

  const cleanFacts = clean.snapshots[0].visualFoundation;
  assert.deepEqual(cleanFacts.roundedSingleEdgeBorders, []);
  assert.deepEqual(cleanFacts.oneEdgeShadowCandidates, []);
  assert.deepEqual(cleanFacts.forcedUppercase, []);
  assert.deepEqual(cleanFacts.typographyCandidates, []);
  assert.deepEqual(cleanFacts.symbolOnlyControls, []);
  assert.deepEqual(cleanFacts.statusDotCandidates, []);
  assert.equal(cleanFacts.dividerCount, 0);
  assert.deepEqual(cleanFacts.colonTextCandidates, []);
  assert.deepEqual(cleanFacts.emDashTextCandidates, []);

  assert.equal(failing.gates.roundedSingleEdgeBorders, undefined, "new visual measurements must remain report-only");
  assert.equal(failing.gates.statusDotCandidates, undefined, "status-dot heuristics must remain report-only");

  console.log("[capture-evidence-v2] computed visual foundation evidence passed in report-only mode");
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
