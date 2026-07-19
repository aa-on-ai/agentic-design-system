import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { suite, suiteRoot } from './lib.mjs';

const args = process.argv.slice(2);
const candidateIndex = args.indexOf('--candidate');
const mode = candidateIndex === -1 ? 'baseline' : 'candidate';
const packetRoot =
  mode === 'baseline'
    ? path.join(suiteRoot, 'baseline')
    : path.resolve(process.cwd(), args[candidateIndex + 1] || '');

assert.ok(fs.existsSync(packetRoot), `${mode} packet missing: ${packetRoot}`);

function readJson(file) {
  assert.ok(fs.existsSync(file), `missing file: ${file}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function verifyBaselineLock() {
  const lockPath = path.join(suiteRoot, 'baseline.sha256');
  const entries = fs
    .readFileSync(lockPath, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([a-f0-9]{64})  (.+)$/);
      assert.ok(match, `invalid checksum entry: ${line}`);
      return { expected: match[1], relativePath: match[2] };
    });

  assert.ok(entries.length >= 72, 'baseline checksum lock is unexpectedly small');
  for (const entry of entries) {
    const file = path.resolve(suiteRoot, entry.relativePath);
    assert.ok(fs.existsSync(file), `locked file missing: ${entry.relativePath}`);
    assert.equal(sha256(file), entry.expected, `baseline mutated: ${entry.relativePath}`);
  }
  return entries.length;
}

function score(scores, camel, title) {
  return scores[camel] ?? scores[title];
}

function verifyEvidence(testCase, caseRoot) {
  const renderedRoot = path.join(caseRoot, 'rendered');
  const evidence = readJson(path.join(renderedRoot, 'evidence.json'));
  assert.deepEqual(evidence.capturedStates, suite.states, `${testCase.slug}: state matrix changed`);
  assert.deepEqual(
    evidence.breakpoints,
    suite.breakpoints.map(({ name }) => name),
    `${testCase.slug}: breakpoint matrix changed`,
  );
  assert.equal(
    evidence.snapshots.length,
    suite.acceptance.requiredScreenshotsPerCase,
    `${testCase.slug}: screenshot count changed`,
  );
  for (const snapshot of evidence.snapshots) {
    assert.ok(
      fs.existsSync(path.join(renderedRoot, snapshot.screenshot)),
      `${testCase.slug}: screenshot missing: ${snapshot.screenshot}`,
    );
  }

  if (evidence.gates) {
    const gates = evidence.gates;
    assert.equal(gates.axeAvailable, true, `${testCase.slug}: axe unavailable`);
    assert.equal(gates.seriousAxeViolations, 0, `${testCase.slug}: serious axe violation`);
    assert.deepEqual(gates.horizontalOverflowAt, [], `${testCase.slug}: horizontal overflow`);
    assert.deepEqual(gates.landmarkFailures, [], `${testCase.slug}: main landmark failure`);
    assert.deepEqual(gates.liveRegionFailures, [], `${testCase.slug}: live-region failure`);
    assert.deepEqual(gates.touchTargetsUnder44, [], `${testCase.slug}: undersized touch target`);
    assert.equal(gates.clsAvailable, true, `${testCase.slug}: CLS unavailable`);
    assert.deepEqual(gates.clsFailures, [], `${testCase.slug}: CLS failure`);
    for (const state of suite.states) {
      assert.equal(gates.stateRendered[state], true, `${testCase.slug}: ${state} did not render`);
    }
    return evidence;
  }

  assert.equal(evidence.axeAvailable, true, `${testCase.slug}: axe unavailable`);
  for (const snapshot of evidence.snapshots) {
    const at = `${snapshot.state}@${snapshot.breakpoint}`;
    assert.equal(snapshot.horizontalOverflow, false, `${testCase.slug} ${at}: horizontal overflow`);
    assert.equal(snapshot.axe.seriousOrCritical, 0, `${testCase.slug} ${at}: serious axe violation`);
    assert.equal(snapshot.landmarks.main, true, `${testCase.slug} ${at}: main landmark missing`);
    assert.deepEqual(snapshot.smallTouchTargets, [], `${testCase.slug} ${at}: undersized touch target`);
    assert.equal(snapshot.cumulativeLayoutShift.supported, true, `${testCase.slug} ${at}: CLS unavailable`);
    assert.equal(snapshot.statusRegion, true, `${testCase.slug} ${at}: status region missing`);
    if (snapshot.state === 'error') {
      assert.equal(snapshot.alertRegion, true, `${testCase.slug} ${at}: alert region missing`);
    }
  }
  for (const breakpoint of suite.breakpoints) {
    const signatures = evidence.snapshots
      .filter((snapshot) => snapshot.breakpoint === breakpoint.name)
      .map((snapshot) => snapshot.renderSignature);
    assert.equal(new Set(signatures).size, suite.states.length, `${testCase.slug}: states are not distinct`);
  }
  return evidence;
}

function verifyGrade(testCase, caseRoot) {
  const grade = readJson(path.join(caseRoot, 'grade.json'));
  const scores = {
    designQuality: score(grade.scores, 'designQuality', 'Design Quality'),
    originality: score(grade.scores, 'originality', 'Originality'),
    craft: score(grade.scores, 'craft', 'Craft'),
    functionality: score(grade.scores, 'functionality', 'Functionality'),
  };
  for (const [criterion, value] of Object.entries(scores)) {
    assert.ok(value >= 1 && value <= 10, `${testCase.slug}: ${criterion} is outside 1-10`);
  }
  const weightedScore = Number(
    (
      scores.designQuality * suite.weights.designQuality +
      scores.originality * suite.weights.originality +
      scores.craft * suite.weights.craft +
      scores.functionality * suite.weights.functionality
    ).toFixed(2),
  );
  assert.equal(weightedScore, grade.weightedScore, `${testCase.slug}: weighted score mismatch`);
  assert.equal(grade.verdict, suite.acceptance.verdict, `${testCase.slug}: verdict is not satisfied`);
  assert.ok(
    scores.designQuality >= suite.acceptance.minimumDesignQuality,
    `${testCase.slug}: Design Quality below threshold`,
  );
  assert.ok(
    scores.originality >= suite.acceptance.minimumOriginality,
    `${testCase.slug}: Originality below threshold`,
  );
  const material = (grade.findings || []).filter(({ severity }) =>
    ['major', 'blocker'].includes(severity),
  );
  assert.equal(material.length, 0, `${testCase.slug}: unresolved material finding`);
  return { weightedScore, verdict: grade.verdict, scores };
}

function visibleActionFacts(label) {
  return [...document.querySelectorAll('button, a[href], [role="button"]')]
    .filter((element) => {
      const name = element.getAttribute('aria-label') || element.textContent?.trim() || '';
      return name === label;
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        label,
        tag: element.tagName.toLowerCase(),
        disabled: element instanceof HTMLButtonElement ? element.disabled : false,
        ariaDisabled: element.getAttribute('aria-disabled'),
        href: element instanceof HTMLAnchorElement ? element.getAttribute('href') : null,
        visible:
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          Number.parseFloat(style.opacity || '1') > 0,
      };
    })
    .filter(({ visible }) => visible);
}

function assertInteractive(action, context) {
  assert.ok(['button', 'a'].includes(action.tag), `${context}: action is not a native control`);
  assert.equal(action.disabled, false, `${context}: action is disabled`);
  assert.notEqual(action.ariaDisabled, 'true', `${context}: aria-disabled is true`);
  if (action.tag === 'a') assert.ok(action.href, `${context}: link has no href`);
}

async function selectorFacts(page, selector) {
  return page.locator(selector).evaluateAll((elements) =>
    elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          label: element.getAttribute('aria-label') || element.textContent?.trim() || '',
          tag: element.tagName.toLowerCase(),
          disabled: element instanceof HTMLButtonElement ? element.disabled : false,
          ariaDisabled: element.getAttribute('aria-disabled'),
          href: element instanceof HTMLAnchorElement ? element.getAttribute('href') : null,
          visible:
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            Number.parseFloat(style.opacity || '1') > 0,
        };
      })
      .filter(({ visible }) => visible),
  );
}

async function verifyActions() {
  const browser = await chromium.launch({ headless: true });
  const checks = [];
  try {
    for (const testCase of suite.cases) {
      const artifact = pathToFileURL(path.join(packetRoot, testCase.slug, 'artifact/index.html')).href;
      for (const breakpoint of suite.breakpoints) {
        const page = await browser.newPage({ viewport: breakpoint });
        for (const state of ['default', 'error']) {
          await page.goto(`${artifact}#state=${state}`);
          let restricted;
          let preserved;

          if (testCase.actionCheck.mode === 'selectors') {
            await page.locator(testCase.actionCheck.restrictedSelector).first().waitFor({ state: 'attached' });
            const restrictedFacts = await selectorFacts(page, testCase.actionCheck.restrictedSelector);
            assert.equal(restrictedFacts.length, 1, `${testCase.slug} ${state}@${breakpoint.name}: restricted action count`);
            [restricted] = restrictedFacts;
            if (state === 'error' || testCase.actionCheck.preservedDefault === 'required') {
              const preservedFacts = await selectorFacts(page, testCase.actionCheck.preservedSelector);
              assert.equal(preservedFacts.length, 1, `${testCase.slug} ${state}@${breakpoint.name}: preserved action count`);
              [preserved] = preservedFacts;
            }
          } else {
            await page.waitForFunction(
              ({ restrictedLabel, preservedLabel }) => {
                const labels = [...document.querySelectorAll('button, a[href], [role="button"]')].map(
                  (element) => element.getAttribute('aria-label') || element.textContent?.trim() || '',
                );
                return labels.includes(restrictedLabel) && labels.includes(preservedLabel);
              },
              { restrictedLabel: testCase.restrictedAction, preservedLabel: testCase.preservedAction },
            );
            const restrictedFacts = await page.evaluate(visibleActionFacts, testCase.restrictedAction);
            const preservedFacts = await page.evaluate(visibleActionFacts, testCase.preservedAction);
            assert.equal(restrictedFacts.length, 1, `${testCase.slug} ${state}@${breakpoint.name}: restricted action count`);
            assert.equal(preservedFacts.length, 1, `${testCase.slug} ${state}@${breakpoint.name}: preserved action count`);
            [restricted] = restrictedFacts;
            [preserved] = preservedFacts;
          }

          if (state === 'error') {
            assert.equal(restricted.tag, 'button', `${testCase.slug} error@${breakpoint.name}: restricted action is not a button`);
            assert.equal(restricted.disabled, true, `${testCase.slug} error@${breakpoint.name}: restricted action is enabled`);
          } else {
            assertInteractive(restricted, `${testCase.slug} default@${breakpoint.name}`);
          }
          if (preserved) assertInteractive(preserved, `${testCase.slug} ${state}@${breakpoint.name}`);
          checks.push({
            slug: testCase.slug,
            breakpoint: breakpoint.name,
            state,
            restrictedDisabled: restricted.disabled,
            preservedEnabled: preserved ? !preserved.disabled && preserved.ariaDisabled !== 'true' : null,
          });
        }
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  return checks;
}

function verifyPacketShape() {
  const directories = fs
    .readdirSync(packetRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => name)
    .sort();
  const expected = suite.cases.map(({ slug }) => slug).sort();
  assert.deepEqual(directories, expected, `${mode}: case membership changed`);

  if (mode === 'candidate') {
    const run = readJson(path.join(packetRoot, 'run.json'));
    assert.equal(run.schemaVersion, 1, 'candidate run schema mismatch');
    assert.equal(run.suiteId, suite.suiteId, 'candidate suite mismatch');
    assert.equal(run.baselineRelease?.sha, suite.baselineRelease.sha, 'candidate baseline mismatch');
    assert.match(run.behaviorDigest || '', /^[a-f0-9]{64}$/, 'candidate behavior digest missing');
    assert.deepEqual(
      run.cases.map(({ slug }) => slug),
      suite.cases.map(({ slug }) => slug),
      'candidate provenance case order changed',
    );
    for (const caseReceipt of run.cases) {
      assert.ok(caseReceipt.builderContext, `${caseReceipt.slug}: builder context receipt missing`);
      assert.ok(caseReceipt.graderContext, `${caseReceipt.slug}: grader context receipt missing`);
      assert.notEqual(
        caseReceipt.builderContext,
        caseReceipt.graderContext,
        `${caseReceipt.slug}: builder and grader contexts must be independent`,
      );
    }
  }
}

function verifyCaseFiles(testCase, caseRoot) {
  for (const relativePath of [
    'artifact/index.html',
    'outcome.md',
    'grade.json',
    'builder-report.md',
    'grader-report.md',
    'rendered/evidence.json',
  ]) {
    assert.ok(fs.existsSync(path.join(caseRoot, relativePath)), `${testCase.slug}: ${relativePath} missing`);
  }
  if (mode === 'candidate') {
    const baselineOutcome = fs.readFileSync(path.join(suiteRoot, 'baseline', testCase.slug, 'outcome.md'));
    const candidateOutcome = fs.readFileSync(path.join(caseRoot, 'outcome.md'));
    assert.deepEqual(candidateOutcome, baselineOutcome, `${testCase.slug}: outcome contract changed`);
  }
}

if (mode === 'baseline') verifyBaselineLock();
verifyPacketShape();

const cases = [];
let screenshotCount = 0;
for (const testCase of suite.cases) {
  const caseRoot = path.join(packetRoot, testCase.slug);
  verifyCaseFiles(testCase, caseRoot);
  const grade = verifyGrade(testCase, caseRoot);
  const evidence = verifyEvidence(testCase, caseRoot);
  screenshotCount += evidence.snapshots.length;
  cases.push({
    slug: testCase.slug,
    verdict: grade.verdict,
    weightedScore: grade.weightedScore,
    baselineWeightedScore: testCase.baselineWeightedScore,
    scoreDelta: Number((grade.weightedScore - testCase.baselineWeightedScore).toFixed(2)),
  });
}

const weightedMean = Number(
  (cases.reduce((total, testCase) => total + testCase.weightedScore, 0) / cases.length).toFixed(3),
);
if (mode === 'baseline') {
  assert.equal(weightedMean, suite.expectedBaseline.weightedMean, 'baseline weighted mean changed');
  assert.equal(screenshotCount, suite.expectedBaseline.screenshotCount, 'baseline screenshot count changed');
}
const actionChecks = await verifyActions();
assert.equal(actionChecks.length, suite.expectedBaseline.actionChecks, 'action-check matrix changed');

console.log(
  JSON.stringify(
    {
      passed: true,
      mode,
      suiteId: suite.suiteId,
      packetRoot,
      baselineRelease: suite.baselineRelease,
      cases,
      weightedMean,
      screenshotCount,
      actionChecks: { passed: true, count: actionChecks.length, checks: actionChecks },
    },
    null,
    2,
  ),
);
