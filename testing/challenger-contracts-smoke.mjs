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
  return JSON.parse(await readFile(path.join(outDir, 'evidence.json'), 'utf8'));
}

const tempDir = path.join(os.tmpdir(), `ads-challenger-contracts-${process.pid}`);

try {
  const failing = await captureFixture('challenger-contracts-fail.html', path.join(tempDir, 'fail'));
  const passing = await captureFixture('challenger-contracts-pass.html', path.join(tempDir, 'pass'));
  const failedDiagnostics = failing.snapshots[0].interactionDiagnostics;
  const passedDiagnostics = passing.snapshots[0].interactionDiagnostics;

  assert.equal(failedDiagnostics.enforcement, 'report-only');
  assert.equal(passedDiagnostics.enforcement, 'report-only');
  assert.equal(failedDiagnostics.modalContract.status, 'failed');
  assert.equal(failedDiagnostics.modalContract.openedByGenericTrigger, true);
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

  assert.equal(failing.gates.modalContractFailures, undefined, 'modal checks remain report-only');
  assert.equal(failing.gates.ungatedHoverMotion, undefined, 'hover checks remain report-only');

  console.log('[challenger-contracts] modal and hover evidence passed in report-only mode');
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
