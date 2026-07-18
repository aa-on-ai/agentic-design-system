#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { assessRenderedVariant } from './lib/render-authority.mjs';

const execFileAsync = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CAPTURE = path.join(ROOT, 'skills', 'design-review', 'scripts', 'capture.mjs');
const STATES = ['default', 'loading', 'empty', 'error'];
const checks = [];

function ok(name, condition, detail = '') {
  checks.push({ name, pass: !!condition, detail });
}

async function captureFixture(name, outDir) {
  const fixture = path.join(HERE, 'fixtures', name);
  await execFileAsync(process.execPath, [
    CAPTURE,
    pathToFileURL(fixture).href,
    '--states', STATES.join(','),
    '--breakpoints', '390x844',
    '--settle', '450',
    '--out', outDir,
  ], { cwd: ROOT });
  return JSON.parse(await fs.readFile(path.join(outDir, 'evidence.json'), 'utf8'));
}

function receiptFor(evidence) {
  return {
    skipped: false,
    gates: evidence.gates,
    judge: {
      judged: true,
      scores: { hierarchy: 8, spacing: 8, copy: 8, productFit: 8, screenshotWorthy: 8 },
      screenshotsSent: [{ label: 'default@390x844', path: 'fixture.png' }],
    },
  };
}

async function main() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ads-production-gates-'));
  try {
    const passEvidence = await captureFixture('production-gates-pass.html', path.join(tempDir, 'pass'));
    const passGates = passEvidence.gates;
    ok('pass fixture records the main-landmark gate', Array.isArray(passGates.landmarkFailures));
    ok('pass fixture clears the main-landmark gate', passGates.landmarkFailures.length === 0, JSON.stringify(passGates.landmarkFailures));
    ok('pass fixture clears state-aware live-region gates', passGates.liveRegionFailures.length === 0, JSON.stringify(passGates.liveRegionFailures));
    ok('hidden live regions do not count in the default state',
      passEvidence.snapshots.find((snapshot) => snapshot.state === 'default')?.statusRegion === false);
    ok('loading status and error alert are observed when rendered',
      passEvidence.snapshots.find((snapshot) => snapshot.state === 'loading')?.statusRegion === true &&
      passEvidence.snapshots.find((snapshot) => snapshot.state === 'error')?.alertRegion === true);
    ok('CLS is available in Chromium', passGates.clsAvailable === true, JSON.stringify(passGates.clsUnavailableAt));
    ok('stable fixture stays within the CLS threshold',
      passGates.clsFailures.length === 0 && passGates.maxCumulativeLayoutShift <= passGates.clsThreshold,
      `${passGates.maxCumulativeLayoutShift}/${passGates.clsThreshold}`);
    let invalidThresholdExit = 0;
    try {
      await execFileAsync(process.execPath, [
        CAPTURE,
        pathToFileURL(path.join(HERE, 'fixtures', 'production-gates-pass.html')).href,
        '--max-cls', 'not-a-number',
      ]);
    } catch (error) {
      invalidThresholdExit = error.code;
    }
    ok('invalid CLS thresholds are rejected before capture', invalidThresholdExit === 2, `exit=${invalidThresholdExit}`);
    ok('a complete production-gate receipt passes rendered authority',
      assessRenderedVariant(receiptFor(passEvidence), { requiredStates: STATES }).status === 'pass');

    const failEvidence = await captureFixture('production-gates-fail.html', path.join(tempDir, 'fail'));
    const failGates = failEvidence.gates;
    ok('missing main fails every captured state', failGates.landmarkFailures.length === STATES.length, JSON.stringify(failGates.landmarkFailures));
    ok('plain loading and error copy fail live-region semantics', failGates.liveRegionFailures.length === 2, JSON.stringify(failGates.liveRegionFailures));
    ok('late insertion produces measured CLS above threshold',
      failGates.maxCumulativeLayoutShift > failGates.clsThreshold && failGates.clsFailures.length > 0,
      `${failGates.maxCumulativeLayoutShift}/${failGates.clsThreshold}`);
    const failRepeatEvidence = await captureFixture('production-gates-fail.html', path.join(tempDir, 'fail-repeat'));
    ok('the same fixture produces the same CLS value on a repeated capture',
      failRepeatEvidence.gates.maxCumulativeLayoutShift === failGates.maxCumulativeLayoutShift,
      `${failGates.maxCumulativeLayoutShift} then ${failRepeatEvidence.gates.maxCumulativeLayoutShift}`);

    const failedAssessment = assessRenderedVariant(receiptFor(failEvidence), { requiredStates: STATES });
    ok('semantic and CLS failures block rendered authority', failedAssessment.status === 'blocked', JSON.stringify(failedAssessment));
    ok('authority names the main-landmark failure', failedAssessment.blockingReasons.some((reason) => /main landmark missing/.test(reason)));
    ok('authority names the live-region failure', failedAssessment.blockingReasons.some((reason) => /required live region missing/.test(reason)));
    ok('authority names the CLS failure', failedAssessment.blockingReasons.some((reason) => /CLS exceeded/.test(reason)));

    const unmeasured = receiptFor(passEvidence);
    delete unmeasured.gates.landmarkFailures;
    delete unmeasured.gates.liveRegionFailures;
    delete unmeasured.gates.clsFailures;
    delete unmeasured.gates.clsAvailable;
    const unmeasuredAssessment = assessRenderedVariant(unmeasured, { requiredStates: STATES });
    ok('missing production measurements cannot silently pass',
      unmeasuredAssessment.status === 'blocked' &&
      unmeasuredAssessment.blockingReasons.some((reason) => /gate was not recorded/.test(reason)),
      JSON.stringify(unmeasuredAssessment));
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  const passed = checks.filter((check) => check.pass).length;
  console.log('[production-gates-smoke] results:');
  for (const check of checks) {
    console.log(`  ${check.pass ? 'PASS' : 'FAIL'}  ${check.name}${check.detail ? `  (${check.detail})` : ''}`);
  }
  console.log(`\n[production-gates-smoke] ${passed}/${checks.length} checks passed`);
  process.exit(passed === checks.length ? 0 : 1);
}

main().catch((error) => {
  console.error(`[production-gates-smoke] fatal: ${error?.stack || error}`);
  process.exit(1);
});
