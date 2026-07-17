import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'skills', 'agentic-design-system', 'scripts', 'decision-trace.mjs');
const work = await mkdtemp(path.join(os.tmpdir(), 'ads-decision-trace-'));

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function run(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: work,
    encoding: 'utf8',
  });
}

function ok(label) {
  console.log(`ok - ${label}`);
}

try {
  await mkdir(path.join(work, 'skills', 'design-review', 'references'), { recursive: true });
  await mkdir(path.join(work, 'evidence'), { recursive: true });
  await mkdir(path.join(work, 'reports'), { recursive: true });

  const observedRule = 'All consequential controls need a visible, reachable interaction target.';
  const declaredRule = 'Decorative motion is optional.';
  const sourceConstraint = 'The primary action must remain reachable on mobile.';
  await writeFile(path.join(work, 'skills', 'design-review', 'SKILL.md'), `# Design review\n\n${observedRule}\n`);
  await writeFile(path.join(work, 'skills', 'design-review', 'references', 'motion.md'), `# Motion\n\n${declaredRule}\n`);
  await writeFile(path.join(work, 'brief.md'), `# Brief\n\n${sourceConstraint}\n`);
  await writeFile(path.join(work, 'artifact.html'), '<button>Continue</button>\n');
  await writeFile(path.join(work, 'evidence', 'receipt.json'), '{"pass":true}\n');
  await writeFile(path.join(work, 'reports', 'RUN-REPORT.md'), '# run report\n');

  const capture = run(
    'capture',
    '--out', 'evidence/trace/skill-manifest.json',
    '--observed', 'skills/design-review/SKILL.md',
    '--declared', 'skills/design-review/references/motion.md',
    '--source', 'brief.md',
    '--release', 'smoke',
    '--budget-ms', '1000',
  );
  assert.equal(capture.status, 0, capture.stderr || capture.stdout);
  const manifestRaw = await readFile(path.join(work, 'evidence', 'trace', 'skill-manifest.json'), 'utf8');
  const manifest = JSON.parse(manifestRaw);
  assert.equal(manifest.performance.withinBudget, true);
  assert.equal(manifest.performance.modelCalls, 0);
  assert.deepEqual(manifest.skillFiles.map((file) => file.loadStatus).sort(), ['declared', 'observed']);
  ok('capture records observed vs declared files under the local budget');

  const observed = manifest.skillFiles.find((file) => file.loadStatus === 'observed');
  const source = manifest.sourceFiles[0];
  const trace = {
    schemaVersion: 1,
    runId: 'smoke',
    manifestPath: 'evidence/trace/skill-manifest.json',
    manifestSha256: hash(manifestRaw),
    decisions: [
      {
        id: 'mobile-primary-action',
        decision: 'Keep the primary action reachable on mobile.',
        artifact: { path: 'artifact.html', location: 'Continue button' },
        rule: {
          fileId: observed.id,
          excerpt: observedRule,
          excerptSha256: hash(observedRule),
        },
        sourceConstraint: {
          sourceId: source.id,
          excerpt: sourceConstraint,
          excerptSha256: hash(sourceConstraint),
        },
        evidence: [{ type: 'rendered gate', path: 'evidence/receipt.json' }],
        reviewStatus: 'verified',
      },
    ],
  };
  await writeFile(path.join(work, 'decision-trace.json'), `${JSON.stringify(trace, null, 2)}\n`);

  const verify = run(
    'verify',
    '--manifest', 'evidence/trace/skill-manifest.json',
    '--trace', 'decision-trace.json',
    '--report', 'reports/RUN-REPORT.md',
    '--validation', 'validation.json',
    '--budget-ms', '1000',
  );
  assert.equal(verify.status, 0, verify.stderr || verify.stdout);
  const validation = JSON.parse(await readFile(path.join(work, 'validation.json'), 'utf8'));
  const report = await readFile(path.join(work, 'reports', 'RUN-REPORT.md'), 'utf8');
  assert.equal(validation.valid, true);
  assert.match(report, /<!-- ads-decision-provenance:start -->/);
  assert.match(report, /0 model calls, 0 browser calls, 0 network calls/);
  assert.match(report, /mobile-primary-action|Keep the primary action reachable/);
  ok('verify checks hashes and excerpts, then adds an idempotent report block');

  const verifyAgain = run(
    'verify',
    '--manifest', 'evidence/trace/skill-manifest.json',
    '--trace', 'decision-trace.json',
    '--report', 'reports/RUN-REPORT.md',
    '--budget-ms', '1000',
  );
  assert.equal(verifyAgain.status, 0, verifyAgain.stderr || verifyAgain.stdout);
  const reportAgain = await readFile(path.join(work, 'reports', 'RUN-REPORT.md'), 'utf8');
  assert.equal((reportAgain.match(/<!-- ads-decision-provenance:start -->/g) || []).length, 1);
  ok('report enrichment is idempotent');

  const invalidTrace = structuredClone(trace);
  const declared = manifest.skillFiles.find((file) => file.loadStatus === 'declared');
  invalidTrace.decisions[0].rule = {
    fileId: declared.id,
    excerpt: declaredRule,
    excerptSha256: hash(declaredRule),
  };
  await writeFile(path.join(work, 'declared-only-trace.json'), `${JSON.stringify(invalidTrace, null, 2)}\n`);
  const declaredOnly = run(
    'verify',
    '--manifest', 'evidence/trace/skill-manifest.json',
    '--trace', 'declared-only-trace.json',
    '--budget-ms', '1000',
  );
  assert.equal(declaredOnly.status, 1);
  assert.match(declaredOnly.stderr, /verified decisions require an observed skill file/);
  ok('declared-only rules cannot masquerade as verified causality');

  const inventedTrace = structuredClone(trace);
  inventedTrace.decisions[0].rule.excerpt = 'This sentence never existed in the skill.';
  inventedTrace.decisions[0].rule.excerptSha256 = hash(inventedTrace.decisions[0].rule.excerpt);
  await writeFile(path.join(work, 'invented-trace.json'), `${JSON.stringify(inventedTrace, null, 2)}\n`);
  const invented = run(
    'verify',
    '--manifest', 'evidence/trace/skill-manifest.json',
    '--trace', 'invented-trace.json',
    '--budget-ms', '1000',
  );
  assert.equal(invented.status, 1);
  assert.match(invented.stderr, /excerpt is not present/);
  ok('post-hoc invented excerpts fail verification');

  console.log('decision trace smoke passed: 5/5');
} finally {
  await rm(work, { recursive: true, force: true });
}
