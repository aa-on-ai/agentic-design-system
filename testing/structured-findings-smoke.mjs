import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COVERAGE_STATUSES,
  FINDING_CATEGORIES,
  aggregateFindingHistory,
  normalizeGrade,
  validateCoverageLedger,
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

const coverageLedger = (findings = [], overrides = {}) => FINDING_CATEGORIES.map((category) => ({
  category,
  status: findings.some((entry) => entry.category === category) ? 'finding' : 'clear',
  evidence: findings.some((entry) => entry.category === category)
    ? `See ${findings.find((entry) => entry.category === category).id}.`
    : `Reviewed ${category} in the rendered evidence.`,
  ...overrides[category],
}));

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

await check('coverage statuses are stable', () => {
  assert.deepEqual(COVERAGE_STATUSES, ['clear', 'finding', 'not_reviewed']);
});

await check('coverage ledger requires one evidenced row per diagnostic category', () => {
  const findings = [finding()];
  assert.deepEqual(validateCoverageLedger(coverageLedger(findings), findings), []);
  assert.match(validateCoverageLedger(coverageLedger(findings).slice(1), findings)[0], /all eight categories/);
});

await check('coverage ledger rejects findings marked clear', () => {
  const findings = [finding()];
  const ledger = coverageLedger(findings, {
    layout_spacing_hierarchy: { status: 'clear', evidence: 'Incorrectly marked clear.' },
  });
  assert.match(validateCoverageLedger(ledger, findings)[0], /must use status finding/);
});

await check('not reviewed coverage is explicit and does not require a finding', () => {
  const ledger = coverageLedger([], {
    interaction_motion: { status: 'not_reviewed', evidence: 'No motion recording was available.' },
  });
  assert.deepEqual(validateCoverageLedger(ledger, []), []);
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
    coverageLedger: coverageLedger([finding({ severity: 'blocker' })]),
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
    coverageLedger: coverageLedger([finding()]),
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
    coverageLedger: coverageLedger([finding(), finding({ id: 'finding-002', severity: 'minor' })]),
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
    coverageLedger: coverageLedger([finding({ severity: 'minor' })]),
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

await check('workflow sweeps adjacent actions during revision and regrade', async () => {
  const source = await readFile(path.join(root, 'workflows/new-page-component.mjs'), 'utf8');
  const mentions = source.match(/adjacent-action consistency/gi) || [];
  assert.ok(mentions.length >= 2, 'builder revision and independent regrade must both run the check');
  assert.match(source, /read-only, disabled, offline, permission-limited, or destructive/);
  assert.match(source, /cues_affordances/);
});

await check('manual review and state inventory carry the adjacent-action check', async () => {
  const review = await readFile(path.join(root, 'workflows/adversarial-design-review.md'), 'utf8');
  const states = await readFile(path.join(root, 'skills/ux-baseline-check/SKILL.md'), 'utf8');
  assert.match(review, /adjacent-action consistency/i);
  assert.match(review, /cannot return `satisfied`/);
  assert.match(states, /Adjacent-action consistency/);
  assert.match(states, /native `disabled`/);
});

await check('manual review and templates carry complete coverage accounting', async () => {
  const review = await readFile(path.join(root, 'workflows/adversarial-design-review.md'), 'utf8');
  const template = await readFile(path.join(root, 'templates/grader-report-template.md'), 'utf8');
  const reference = await readFile(path.join(root, 'skills/agentic-design-system/references/structured-findings.md'), 'utf8');
  assert.match(review, /clear.*finding.*not reviewed/is);
  assert.match(review, /Do not invent a finding quota/i);
  assert.match(template, /## coverage ledger/);
  assert.match(reference, /all eight diagnostic categories/i);
});

await check('core review carries terminology, pointer gating, modal, and retrigger rules', async () => {
  const skill = await readFile(path.join(root, 'skills/design-review/SKILL.md'), 'utf8');
  const writing = await readFile(path.join(root, 'skills/design-review/references/ux-writing.md'), 'utf8');
  const motion = await readFile(path.join(root, 'skills/design-review/references/motion.md'), 'utf8');
  assert.match(skill, /initial focus, Tab and Shift\+Tab containment/);
  assert.match(writing, /one primary name per concept/i);
  assert.match(motion, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(motion, /twice inside its animation window/i);
});

await check('grader template carries the structured table and blocker rule', async () => {
  const source = await readFile(path.join(root, 'templates/grader-report-template.md'), 'utf8');
  assert.match(source, /## structured findings/);
  assert.match(source, /a blocker cannot return `satisfied`/);
  assert.match(source, /adjacent-action consistency/i);
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
