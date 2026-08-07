import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'workbench', 'inspect.mjs');
const FIXTURES = path.join(ROOT, 'testing', 'fixtures', 'workbench-inspector');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'workbench-session.v1.schema.json');
const BANNED_KEYS = new Set(['journey', 'intent', 'report', 'checks', 'approval', 'decision', 'artifact', 'humanConfirmed']);

function hash(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function treeHash(root) {
  const records = [];
  async function walk(directory) {
    const entries = (await readdir(directory, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name, 'en'));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile()) records.push(`${relative}\0${hash(await readFile(absolute))}`);
    }
  }
  await walk(root);
  return hash(records.join('\n'));
}

function run(project, ...args) {
  return spawnSync(process.execPath, [SCRIPT, '--project', project, ...args], { encoding: 'utf8' });
}

function ok(label) {
  console.log(`ok - ${label}`);
}

function assertNoFuturePhaseState(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.equal(BANNED_KEYS.has(key), false, `future-phase key leaked: ${key}`);
    assertNoFuturePhaseState(child);
  }
}

function collectReasonSources(session) {
  const sourcePaths = new Set(session.intake.sources.map((source) => source.path));
  const evidenceRefs = [];
  for (const inference of [...Object.values(session.intake.claims), session.intake.preset]) {
    if (inference.state === 'inferred') evidenceRefs.push(...inference.reasons.flatMap((reason) => reason.evidence));
    if (inference.state === 'conflicted') {
      evidenceRefs.push(...inference.candidates.flatMap((candidate) => candidate.reasons.flatMap((reason) => reason.evidence)));
    }
  }
  for (const question of session.intake.questions) {
    if (question.options) evidenceRefs.push(...question.options.flatMap((option) => option.evidence));
  }
  for (const evidence of evidenceRefs) assert.equal(sourcePaths.has(evidence.source), true, `missing source for evidence: ${evidence.source}`);
}

const schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);
const before = await treeHash(FIXTURES);

for (const fixtureName of ['context-rich', 'context-light', 'conflicting']) {
  const project = path.join(FIXTURES, fixtureName);
  const first = run(project);
  const second = run(project);
  assert.equal(first.status, 0, first.stderr || first.stdout);
  assert.equal(second.status, 0, second.stderr || second.stdout);
  assert.equal(first.stderr, '');
  assert.equal(first.stdout, second.stdout, `${fixtureName} output changed across identical runs`);
  const session = JSON.parse(first.stdout);
  assert.equal(validate(session), true, ajv.errorsText(validate.errors, { separator: '\n' }));
  assert.deepEqual(
    session.intake.sources.map((source) => source.path),
    [...session.intake.sources.map((source) => source.path)].sort((left, right) => left.localeCompare(right, 'en')),
  );
  collectReasonSources(session);
  assertNoFuturePhaseState(session);
}
ok('all fixture outputs are deterministic, schema-valid, provenance-backed, and phase-bounded');

const rich = JSON.parse(run(path.join(FIXTURES, 'context-rich')).stdout);
assert.equal(rich.intake.status, 'ready');
assert.equal(rich.intake.preset.state, 'inferred');
assert.equal(rich.intake.preset.value, 'dense-dashboard');
assert.equal(rich.intake.claims.name.evidenceQuality, 'cross-source');
assert.ok(rich.intake.sources.some((source) => source.kind === 'component'));
assert.ok(rich.intake.sources.some((source) => source.kind === 'design-tokens'));
ok('context-rich non-ADS fixture produces a grounded preset recommendation');

const light = JSON.parse(run(path.join(FIXTURES, 'context-light')).stdout);
assert.equal(light.intake.status, 'needs-human');
assert.equal(light.intake.claims.description.state, 'unknown');
assert.equal(light.intake.preset.state, 'unknown');
assert.ok(light.intake.preset.inspectedKinds.includes('package-manifest'));
ok('context-light fixture exits zero with explicit unknowns');

const conflict = JSON.parse(run(path.join(FIXTURES, 'conflicting')).stdout);
assert.equal(conflict.intake.status, 'blocked');
assert.equal(conflict.intake.claims.audience.state, 'conflicted');
assert.equal(conflict.intake.claims.surface.state, 'conflicted');
assert.equal(conflict.intake.preset.state, 'conflicted');
assert.ok(conflict.intake.questions.every((question) => ['project-identity', 'preset-recommendation'].includes(question.blocks)));
ok('conflicting fixture preserves candidates and blocking questions');

const escaped = run(path.join(FIXTURES, 'context-rich'), '--include', '../context-light/package.json');
assert.notEqual(escaped.status, 0);
assert.equal(escaped.stdout, '');
assert.match(escaped.stderr, /unsafe --include path|escapes the project root/);
const relativeProject = spawnSync(process.execPath, [SCRIPT, '--project', 'testing/fixtures'], { encoding: 'utf8' });
assert.notEqual(relativeProject.status, 0);
assert.equal(relativeProject.stdout, '');
assert.match(relativeProject.stderr, /absolute path/);
ok('unsafe include and implicit relative-root execution fail without JSON output');

const temporary = await mkdtemp(path.join(os.tmpdir(), 'ads-workbench-inspector-'));
try {
  const project = path.join(temporary, 'project');
  const external = path.join(temporary, 'external.md');
  await mkdir(project);
  await symlink(external, path.join(project, 'DESIGN.md'));
  const result = run(project);
  assert.equal(result.status, 0, result.stderr);
  const session = JSON.parse(result.stdout);
  assert.ok(session.intake.notices.some((notice) => notice.code === 'external-symlink-skipped'));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
ok('external symlinks are never followed and are reported');

const after = await treeHash(FIXTURES);
assert.equal(after, before, 'inspector modified a fixture project');
ok('all inspected target trees remain byte-identical');

console.log('workbench inspector smoke passed: 7/7');
