#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { runRenderBatch } from './render-eval.mjs';
import { assessRenderedVariant, compareRenderedVariants } from './lib/render-authority.mjs';

const execFileAsync = promisify(execFile);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const REQUIRED_STATES = ['default', 'loading', 'empty', 'error'];
const checks = [];

function ok(name, condition, detail = '') {
  checks.push({ name, pass: !!condition, detail });
}

async function sourceAdvisory(file) {
  const scripts = path.join(ROOT, 'skills', 'design-review', 'scripts');
  const outputs = {};
  for (const script of ['anti-pattern-check.py', 'state-check.py', 'accessibility-check.py']) {
    try {
      const { stdout, stderr } = await execFileAsync('python3', [path.join(scripts, script), file], { cwd: ROOT });
      outputs[script] = [stdout, stderr].filter(Boolean).join('\n');
    } catch (error) {
      outputs[script] = [error.stdout, error.stderr].filter(Boolean).join('\n');
    }
  }
  const source = await fs.readFile(path.join(ROOT, file), 'utf8');
  return {
    passed:
      /Summary:\s*0 warnings,\s*0 info/i.test(outputs['anti-pattern-check.py']) &&
      /PASS — all states present/i.test(outputs['state-check.py']) &&
      /Summary:\s*0 warnings,\s*0 info/i.test(outputs['accessibility-check.py']) &&
      /(?:^|\W)(?:sm:|md:|lg:|xl:|2xl:)/.test(source),
    outputs,
  };
}

function deterministicJudge({ slug, variant, evidence, outDir, model }) {
  const scores = variant === 'after'
    ? { hierarchy: 10, spacing: 10, copy: 10, productFit: 10, screenshotWorthy: 10 }
    : { hierarchy: 5, spacing: 5, copy: 5, productFit: 5, screenshotWorthy: 5 };
  return {
    slug,
    variant,
    judgeModel: model,
    judged: true,
    scores,
    scoreTotal: Object.values(scores).reduce((sum, value) => sum + value, 0),
    screenshotsSent: (evidence.snapshots || []).map((snapshot) => ({
      label: `${snapshot.state}@${snapshot.breakpoint}`,
      path: path.join(outDir, snapshot.screenshot),
    })),
    gates: evidence.gates,
  };
}

async function main() {
  const afterFile = 'testing/fixtures/variant-source-pass-render-fail.tsx';
  const advisory = await sourceAdvisory(afterFile);
  const gamedStatesAdvisory = await sourceAdvisory('testing/fixtures/variant-source-gamed-states.tsx');
  const outcome = await runRenderBatch({
    slug: 'authority-fixture',
    prompt: 'prove rendered evidence overrides source-only success',
    variants: [
      { name: 'before', src: 'testing/fixtures/variant-clean.tsx', states: REQUIRED_STATES.join(',') },
      { name: 'after', src: afterFile, states: REQUIRED_STATES.join(',') },
      { name: 'gamed-states', src: 'testing/fixtures/variant-source-gamed-states.tsx', states: REQUIRED_STATES.join(',') },
      { name: 'broken', src: 'testing/fixtures/variant-broken.tsx', states: 'default' },
    ],
    judgeModel: 'fixture-independent-judge',
    judgeVariant: deterministicJudge,
  });

  const before = outcome.results.find((result) => result.name === 'before');
  const after = outcome.results.find((result) => result.name === 'after');
  const broken = outcome.results.find((result) => result.name === 'broken');
  const gamedStates = outcome.results.find((result) => result.name === 'gamed-states');
  const comparison = compareRenderedVariants({
    before,
    after,
    requiredStates: REQUIRED_STATES,
    sourceAdvisory: advisory,
  });
  const beforeAssessment = assessRenderedVariant(before, { requiredStates: REQUIRED_STATES });
  const afterAssessment = assessRenderedVariant(after, { requiredStates: REQUIRED_STATES });
  const brokenAssessment = assessRenderedVariant(broken);
  const gamedStatesAssessment = assessRenderedVariant(gamedStates, { requiredStates: REQUIRED_STATES });
  const unresolvedAfter = {
    ...before,
    name: 'unresolved-after',
    judge: { ...before.judge, judged: false, scores: null, reason: 'fixture judge unavailable' },
  };
  const unresolvedComparison = compareRenderedVariants({
    before,
    after: unresolvedAfter,
    requiredStates: REQUIRED_STATES,
  });

  ok('fixture passes every source-only advisory check', advisory.passed, JSON.stringify(advisory.outputs));
  ok('clean baseline passes rendered authority', beforeAssessment.status === 'pass', JSON.stringify(beforeAssessment));
  ok('candidate rendered all requested states distinctly', REQUIRED_STATES.every((state) => after.gates?.stateRendered?.[state]), JSON.stringify(after.gates?.stateRendered));
  ok('candidate received a deliberately winning 50/50 judge score', after.judge?.scoreTotal === 50, `score=${after.judge?.scoreTotal}`);
  ok('browser caught the source-invisible overflow', (after.gates?.horizontalOverflowAt || []).length > 0, JSON.stringify(after.gates?.horizontalOverflowAt));
  ok('rendered failure blocks the candidate', afterAssessment.status === 'blocked', JSON.stringify(afterAssessment));
  ok('source-only success cannot bypass rendered failure', comparison.status === 'blocked' && comparison.winner === null, JSON.stringify(comparison));
  ok('comparison records source advisories as non-authoritative', comparison.sourceAdvisoryAffectsVerdict === false);
  ok('state-gamed fixture also passes source-only checks', gamedStatesAdvisory.passed, JSON.stringify(gamedStatesAdvisory.outputs));
  ok('repeating default does not satisfy requested states',
    gamedStates?.gates?.stateRendered?.default === true &&
      ['loading', 'empty', 'error'].every((state) => gamedStates?.gates?.stateRendered?.[state] === false),
    JSON.stringify(gamedStates?.gates?.stateRendered));
  ok('source-gamed states are blocked by rendered authority',
    gamedStatesAssessment.status === 'blocked' && gamedStatesAssessment.blockingReasons.some((reason) => /states not distinctly rendered/.test(reason)),
    JSON.stringify(gamedStatesAssessment));
  ok('unresolved screenshot judge escalates to human review',
    unresolvedComparison.status === 'needs-human' && unresolvedComparison.winner === null,
    JSON.stringify(unresolvedComparison));
  ok('bundle failure creates an explicit skip', broken?.skipped === true && broken?.stage === 'bundle', JSON.stringify(broken));
  ok('bundle skip is an authoritative render failure', brokenAssessment.failureKind === 'render-failure', JSON.stringify(brokenAssessment));
  ok('skip packet contains the broken variant', outcome.skips.some((skip) => skip.name === 'broken'), JSON.stringify(outcome.skips));

  const passed = checks.filter((check) => check.pass).length;
  console.log('[eval-loop-render-smoke] results:');
  for (const check of checks) {
    console.log(`  ${check.pass ? 'PASS' : 'FAIL'}  ${check.name}${check.detail ? `  (${check.detail})` : ''}`);
  }
  console.log(`\n[eval-loop-render-smoke] ${passed}/${checks.length} checks passed`);
  process.exit(passed === checks.length ? 0 : 1);
}

main().catch((error) => {
  console.error(`[eval-loop-render-smoke] fatal: ${error?.stack || error}`);
  process.exit(1);
});
