#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const capture = path.join(root, 'skills', 'design-review', 'scripts', 'capture.mjs');

async function captureFixture(name, outDir) {
  await execFileAsync(process.execPath, [
    capture,
    pathToFileURL(path.join(root, 'testing', 'fixtures', name)).href,
    '--breakpoints', '390x844',
    '--settle', '0',
    '--out', outDir,
  ], { cwd: root });
  return {
    evidence: JSON.parse(await readFile(path.join(outDir, 'evidence.json'), 'utf8')),
    modalReceipt: JSON.parse(await readFile(path.join(outDir, 'modal-interaction-receipt.json'), 'utf8')),
  };
}

const tempDir = path.join(os.tmpdir(), `ads-challenger-contracts-${process.pid}`);

try {
  const failingCapture = await captureFixture('challenger-contracts-fail.html', path.join(tempDir, 'fail'));
  const unverifiedCapture = await captureFixture(
    'challenger-contracts-not-verified.html',
    path.join(tempDir, 'not-verified'),
  );
  const passingCapture = await captureFixture('challenger-contracts-pass.html', path.join(tempDir, 'pass'));
  const failing = failingCapture.evidence;
  const unverified = unverifiedCapture.evidence;
  const passing = passingCapture.evidence;
  const failedDiagnostics = failing.snapshots[0].interactionDiagnostics;
  const unverifiedDiagnostics = unverified.snapshots[0].interactionDiagnostics;
  const passedDiagnostics = passing.snapshots[0].interactionDiagnostics;

  assert.equal(failedDiagnostics.enforcement, 'modal-blocking');
  assert.equal(passedDiagnostics.enforcement, 'modal-blocking');
  assert.equal(failedDiagnostics.hoverEnforcement, 'report-only');
  assert.equal(passedDiagnostics.hoverEnforcement, 'report-only');
  assert.equal(failedDiagnostics.modalContract.status, 'failed');
  assert.equal(failedDiagnostics.modalContract.openedByGenericTrigger, true);
  assert.equal(unverifiedDiagnostics.modalContract.status, 'not_verified');
  assert.equal(passedDiagnostics.modalContract.status, 'verified');
  assert.equal(failedDiagnostics.ungatedHoverMotion.length, 1);
  assert.deepEqual(passedDiagnostics.ungatedHoverMotion, []);
  assert.equal(
    failing.snapshots[0].horizontalOverflow,
    false,
    'modal discovery must not mutate unrelated aria-controls surfaces before overflow evidence is read',
  );

  const failedSurfaces = [failedDiagnostics.modalContract, passedDiagnostics.modalContract]
    .filter(({ status }) => status === 'failed');
  assert.equal(failedSurfaces.length, 1, 'the fixture pair should contain exactly one modal-contract failure');

  assert.equal(failingCapture.modalReceipt.kind, 'ads.modal-interaction-receipt');
  assert.equal(failingCapture.modalReceipt.passed, false);
  assert.equal(unverifiedCapture.modalReceipt.passed, false);
  assert.equal(passingCapture.modalReceipt.passed, true);
  assert.deepEqual(passingCapture.modalReceipt.requiredDialogs, ['review-dialog', 'secondary-dialog']);
  assert.equal(passingCapture.modalReceipt.checks.length, 2, 'every declared dialog must have a deterministic check');
  assert.equal(failing.gates.modalInteractions.passed, false);
  assert.equal(unverified.gates.modalInteractions.passed, false);
  assert.equal(passing.gates.modalInteractions.passed, true);
  assert.ok(
    unverified.gates.modalInteractions.failures.some((failure) => failure.status === 'not_verified'),
    'not_verified modal evidence must be recorded as a blocking failure',
  );
  assert.equal(failing.gates.ungatedHoverMotion, undefined, 'hover checks remain report-only');

  console.log('[challenger-contracts] modal receipt blocks failed and not_verified dialogs');
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
