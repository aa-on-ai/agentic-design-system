import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { behaviorDigest, isBehaviorPath, repoRoot, suite, suiteRoot } from './lib.mjs';

const args = process.argv.slice(2);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
};
const explicitChanged = args
  .flatMap((arg, index) => (arg === '--changed-file' ? [args[index + 1]] : []))
  .filter(Boolean);
const base = valueAfter('--base');
const head = valueAfter('--head') || 'HEAD';
const explicitCandidate = valueAfter('--candidate');
const frozenRoot = 'testing/regression/adjacent-actions-v1.3.1';

function gitLines(gitArgs) {
  return execFileSync('git', gitArgs, { cwd: repoRoot, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

let changedFiles = explicitChanged;
let baseHasFrozenSuite = false;
if (changedFiles.length === 0) {
  if (!base || /^0+$/.test(base)) {
    console.log('[adjacent-action-gate] no comparable base SHA; frozen baseline verification already passed');
    process.exit(0);
  }
  execFileSync('git', ['rev-parse', '--verify', base], { cwd: repoRoot, stdio: 'ignore' });
  changedFiles = gitLines(['diff', '--name-only', '--diff-filter=ACMRT', `${base}...${head}`]);
}

if (base && !/^0+$/.test(base)) {
  const frozenSuiteAtBase = spawnSync(
    'git',
    ['cat-file', '-e', `${base}:${frozenRoot}/suite.json`],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  baseHasFrozenSuite = frozenSuiteAtBase.status === 0;
}

if (baseHasFrozenSuite) {
  const immutableFiles = changedFiles.filter(
    (relativePath) =>
      relativePath.startsWith(`${frozenRoot}/baseline/`) ||
      [
        `${frozenRoot}/baseline.sha256`,
        `${frozenRoot}/contract.md`,
        `${frozenRoot}/suite.json`,
      ].includes(relativePath),
  );
  assert.deepEqual(
    immutableFiles,
    [],
    `the frozen v1.3.1 baseline is immutable: ${immutableFiles.join(', ')}`,
  );

  const modifiedPriorRunFiles = gitLines([
    'diff',
    '--name-only',
    '--diff-filter=MD',
    `${base}...${head}`,
    '--',
    `${frozenRoot}/runs/`,
  ]);
  assert.deepEqual(
    modifiedPriorRunFiles,
    [],
    `candidate runs are append-only: ${modifiedPriorRunFiles.join(', ')}`,
  );
}

const behaviorChanges = changedFiles.filter(isBehaviorPath);
if (behaviorChanges.length === 0) {
  console.log(`[adjacent-action-gate] no ADS behavior change in ${changedFiles.length} changed file(s)`);
  process.exit(0);
}

let candidateRoots = explicitCandidate ? [path.resolve(repoRoot, explicitCandidate)] : [];
if (candidateRoots.length === 0) {
  assert.ok(base, 'a base SHA is required to discover append-only candidate packets');
  const addedRunManifests = gitLines([
    'diff',
    '--name-only',
    '--diff-filter=A',
    `${base}...${head}`,
    '--',
    `${frozenRoot}/runs/*/run.json`,
  ]);
  candidateRoots = addedRunManifests.map((relativePath) => path.join(repoRoot, path.dirname(relativePath)));
}

assert.ok(
  candidateRoots.length > 0,
  [
    `ADS behavior changed in ${behaviorChanges.length} file(s), but no new frozen-suite run was added.`,
    'Create one with:',
    '  npm run regression:prepare -- <run-id>',
    'Baseline directories and prior runs are immutable.',
  ].join('\n'),
);

const currentBehavior = behaviorDigest(repoRoot);
const verified = [];
for (const candidateRoot of candidateRoots) {
  const runPath = path.join(candidateRoot, 'run.json');
  assert.ok(fs.existsSync(runPath), `candidate run.json missing: ${runPath}`);
  const run = JSON.parse(fs.readFileSync(runPath, 'utf8'));
  assert.equal(run.suiteId, suite.suiteId, `${run.runId || candidateRoot}: suite mismatch`);
  assert.equal(
    run.behaviorDigest,
    currentBehavior.digest,
    `${run.runId || candidateRoot}: candidate was not produced from the current ADS behavior tree`,
  );
  const result = spawnSync(
    process.execPath,
    [path.join(suiteRoot, 'verify.mjs'), '--candidate', candidateRoot],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  if (result.status !== 0) {
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    process.exit(result.status || 1);
  }
  const receipt = JSON.parse(result.stdout);
  verified.push({ runId: run.runId, root: path.relative(repoRoot, candidateRoot), mean: receipt.weightedMean });
}

console.log(
  JSON.stringify(
    {
      passed: true,
      suiteId: suite.suiteId,
      behaviorChanges,
      behaviorDigest: currentBehavior.digest,
      verifiedCandidates: verified,
    },
    null,
    2,
  ),
);
