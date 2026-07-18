import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FINDING_CATEGORIES,
  aggregateFindingHistory,
  normalizeGrade,
  validateStructuredFinding,
} from '../workflows/lib/structured-findings.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = [];

async function check(name, run) {
  try {
    await run();
    checks.push({ name, passed: true });
  } catch (error) {
    checks.push({ name, passed: false, detail: error?.message || String(error) });
  }
}

const finding = (overrides = {}) => ({
  id: 'finding-001',
  category: 'layout_spacing_hierarchy',
  severity: 'major',
  rubricRow: 'Design Quality',
  state: 'default',
  breakpoint: '390x844',
  artifact: 'evidence/iter1/default-390x844.png',
  target: 'primary CTA row',
  region: { x: 0.08, y: 0.71, width: 0.84, height: 0.12 },
  observation: 'The secondary action wraps into a visually separate section.',
  evidence: 'Rendered screenshot at the mobile breakpoint.',
  ...overrides,
});

const scores = { designQuality: 7, originality: 7, craft: 7, functionality: 7 };

await check('all eight diagnostic categories are stable', () => {
  assert.deepEqual(FINDING_CATEGORIES, [
    'layout_spacing_hierarchy',
    'polish_consistency',
    'typography',
    'originality',
    'color_contrast',
    'interaction_motion',
    'cues_affordances',
    'brand_fit_tone',
  ]);
});

await check('complete finding passes validation', () => {
  assert.deepEqual(validateStructuredFinding(finding()), []);
});

await check('unsupported category fails validation', () => {
  assert.match(validateStructuredFinding(finding({ category: 'model_vibes' }))[0], /unsupported/);
});

await check('missing evidence fails validation', () => {
  assert.match(validateStructuredFinding(finding({ evidence: '' }))[0], /evidence/);
});

await check('out-of-range normalized region fails validation', () => {
  assert.match(
    validateStructuredFinding(finding({ region: { x: 1.2, y: 0, width: 0.5, height: 0.5 } }))[0],
    /region\.x/,
  );
});

await check('blocker cannot remain satisfied', () => {
  const grade = normalizeGrade({
    verdict: 'satisfied',
    scores,
    findings: [finding({ severity: 'blocker' })],
    nextRevisionPrompt: '',
  });
  assert.equal(grade.verdict, 'needs_revision');
  assert.equal(grade.failingRows.length, 1);
  assert.match(grade.nextRevisionPrompt, /finding-001/);
});

await check('major finding cannot remain satisfied', () => {
  const grade = normalizeGrade({
    verdict: 'satisfied',
    scores,
    findings: [finding()],
    nextRevisionPrompt: '',
  });
  assert.equal(grade.verdict, 'needs_revision');
  assert.match(grade.nextRevisionPrompt, /finding-001/);
});

await check('compatibility rows derive only from major and blocker findings', () => {
  const grade = normalizeGrade({
    verdict: 'needs_revision',
    scores,
    findings: [finding(), finding({ id: 'finding-002', severity: 'minor' })],
    failingRows: ['untrusted model output'],
    nextRevisionPrompt: 'Repair the mobile action hierarchy.',
  });
  assert.equal(grade.failingRows.length, 1);
  assert.doesNotMatch(grade.failingRows[0], /untrusted model output/);
  assert.match(grade.nextRevisionPrompt, /finding-001/);
});

await check('minor finding can accompany a satisfied verdict', () => {
  const grade = normalizeGrade({
    verdict: 'satisfied',
    scores,
    findings: [finding({ severity: 'minor' })],
    nextRevisionPrompt: '',
  });
  assert.equal(grade.verdict, 'satisfied');
  assert.deepEqual(grade.failingRows, []);
});

await check('recurrence aggregation preserves evidence across iterations', () => {
  const aggregate = aggregateFindingHistory([
    { iteration: 1, findings: [finding()] },
    { iteration: 2, findings: [finding({ artifact: 'evidence/iter2/default-390x844.png' })] },
  ]);
  assert.equal(aggregate.total, 2);
  assert.equal(aggregate.byCategory.layout_spacing_hierarchy, 2);
  assert.equal(aggregate.bySeverity.major, 2);
  assert.equal(aggregate.categorySeverity.layout_spacing_hierarchy.major, 2);
  assert.equal(aggregate.repeated.length, 1);
  assert.deepEqual(aggregate.repeated[0].iterations, [1, 2]);
  assert.equal(aggregate.repeated[0].evidence.length, 2);
});

await check('duplicates inside one iteration do not count as recurrence', () => {
  const aggregate = aggregateFindingHistory([
    { iteration: 1, findings: [finding(), finding({ id: 'finding-002' })] },
  ]);
  assert.equal(aggregate.total, 2);
  assert.equal(aggregate.repeated.length, 0);
});

await check('workflow normalizes grade and reports aggregate', async () => {
  const source = await readFile(path.join(root, 'workflows/new-page-component.mjs'), 'utf8');
  assert.match(source, /normalizeGrade\(rawGrade\)/);
  assert.match(source, /aggregateFindingHistory/);
  assert.match(source, /finding → revision → evidence/);
});

await check('grader template carries the structured table and blocker rule', async () => {
  const source = await readFile(path.join(root, 'templates/grader-report-template.md'), 'utf8');
  assert.match(source, /## structured findings/);
  assert.match(source, /a blocker cannot return `satisfied`/);
});

await check('run report carries aggregate and trace sections', async () => {
  const source = await readFile(path.join(root, 'templates/run-report-template.md'), 'utf8');
  assert.match(source, /### aggregate across iterations/);
  assert.match(source, /### finding → revision → evidence trace/);
});

await check('influence note rejects model-specific gates', async () => {
  const source = await readFile(path.join(root, 'docs/influences.md'), 'utf8');
  assert.match(source, /Contra Labs landing-page failure annotations/);
  assert.match(source, /not routing rules or hard gates/);
});

console.log('[structured-findings-smoke] results:');
for (const result of checks) {
  console.log(`  ${result.passed ? 'PASS' : 'FAIL'}  ${result.name}${result.detail ? `  (${result.detail})` : ''}`);
}

const passed = checks.filter(({ passed }) => passed).length;
console.log(`\n[structured-findings-smoke] ${passed}/${checks.length} checks passed`);
process.exit(passed === checks.length ? 0 : 1);
