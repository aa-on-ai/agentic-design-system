import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { behaviorDigest, repoRoot, suite, suiteRoot } from './lib.mjs';

const args = process.argv.slice(2);
const runId = args.find((arg) => !arg.startsWith('--'));
assert.match(runId || '', /^[a-z0-9][a-z0-9-]{2,79}$/, 'run id must be 3-80 lowercase letters, numbers, or hyphens');

const runsRoot = path.join(suiteRoot, 'runs');
const target = path.join(runsRoot, runId);
assert.ok(!fs.existsSync(target), `run already exists; frozen runs are append-only: ${target}`);

const behavior = behaviorDigest(repoRoot);
const behaviorCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
fs.mkdirSync(target, { recursive: false });

for (const testCase of suite.cases) {
  const caseRoot = path.join(target, testCase.slug);
  fs.mkdirSync(path.join(caseRoot, 'artifact'), { recursive: true });
  fs.mkdirSync(path.join(caseRoot, 'rendered'), { recursive: true });
  fs.copyFileSync(
    path.join(suiteRoot, 'baseline', testCase.slug, 'outcome.md'),
    path.join(caseRoot, 'outcome.md'),
  );
}

const run = {
  schemaVersion: 1,
  suiteId: suite.suiteId,
  runId,
  createdAt: new Date().toISOString(),
  baselineRelease: suite.baselineRelease,
  behaviorCommit,
  behaviorDigest: behavior.digest,
  behaviorFileCount: behavior.files.length,
  cases: suite.cases.map(({ slug }) => ({
    slug,
    builderContext: '',
    graderContext: '',
  })),
};
fs.writeFileSync(path.join(target, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);

console.log(`prepared ${path.relative(repoRoot, target)}`);
console.log('build each frozen outcome, capture 8 screenshots, add grade and builder/grader reports,');
console.log('then fill distinct builderContext and graderContext receipts in run.json.');
console.log(`verify with: node ${path.relative(repoRoot, path.join(suiteRoot, 'verify.mjs'))} --candidate ${path.relative(repoRoot, target)}`);
