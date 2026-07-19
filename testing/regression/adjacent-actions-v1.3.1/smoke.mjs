import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { behaviorDigest, repoRoot, suite, suiteRoot } from './lib.mjs';

function run(script, scriptArgs, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [script, ...scriptArgs], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(
    result.status,
    expectedStatus,
    [result.stdout, result.stderr].filter(Boolean).join('\n'),
  );
  return result;
}

const verifyScript = path.join(suiteRoot, 'verify.mjs');
const behaviorGate = path.join(suiteRoot, 'behavior-change-gate.mjs');
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ads-frozen-regression-'));
const candidateRoot = path.join(temporaryRoot, 'candidate');

try {
  const baseline = run(verifyScript, []);
  const baselineReceipt = JSON.parse(baseline.stdout);
  assert.equal(baselineReceipt.mode, 'baseline');
  assert.equal(baselineReceipt.cases.length, 5);

  fs.cpSync(path.join(suiteRoot, 'baseline'), candidateRoot, { recursive: true });
  const behavior = behaviorDigest(repoRoot);
  fs.writeFileSync(
    path.join(candidateRoot, 'run.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        suiteId: suite.suiteId,
        runId: 'smoke-candidate',
        baselineRelease: suite.baselineRelease,
        behaviorDigest: behavior.digest,
        cases: suite.cases.map(({ slug }) => ({
          slug,
          builderContext: `smoke-builder-${slug}`,
          graderContext: `smoke-grader-${slug}`,
        })),
      },
      null,
      2,
    )}\n`,
  );

  const candidate = run(verifyScript, ['--candidate', candidateRoot]);
  const candidateReceipt = JSON.parse(candidate.stdout);
  assert.equal(candidateReceipt.mode, 'candidate');
  assert.equal(candidateReceipt.actionChecks.count, 20);

  const evidencePath = path.join(candidateRoot, 'greenhouse-irrigation', 'rendered', 'evidence.json');
  const cleanEvidence = fs.readFileSync(evidencePath, 'utf8');
  const brokenEvidence = JSON.parse(cleanEvidence);
  brokenEvidence.gates.horizontalOverflowAt = ['error@390x844'];
  fs.writeFileSync(evidencePath, `${JSON.stringify(brokenEvidence, null, 2)}\n`);
  run(verifyScript, ['--candidate', candidateRoot], 1);
  fs.writeFileSync(evidencePath, cleanEvidence);

  run(behaviorGate, ['--changed-file', 'README.md']);
  run(behaviorGate, ['--changed-file', 'skills/agentic-design-system/SKILL.md'], 1);
  const gated = run(behaviorGate, [
    '--changed-file',
    'skills/agentic-design-system/SKILL.md',
    '--candidate',
    candidateRoot,
  ]);
  assert.equal(JSON.parse(gated.stdout).passed, true);

  console.log('[adjacent-action-regression-smoke] 5/5 checks passed');
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
