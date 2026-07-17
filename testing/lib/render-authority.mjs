// Rendered evidence is the authority boundary for the ADS eval loop.
// Source checks remain useful diagnostics, but they never turn a rendered failure into a pass.

const DIMENSIONS = ['hierarchy', 'spacing', 'copy', 'productFit', 'screenshotWorthy'];

function validScores(scores) {
  return !!scores && DIMENSIONS.every((key) => Number.isInteger(scores[key]) && scores[key] >= 1 && scores[key] <= 10);
}

function scoreTotal(scores) {
  return DIMENSIONS.reduce((total, key) => total + scores[key], 0);
}

export function assessRenderedVariant(receipt, { requiredStates = ['default'] } = {}) {
  if (!receipt) {
    return {
      status: 'blocked',
      failureKind: 'render-failure',
      blockingReasons: ['missing render receipt'],
      judgeResolved: false,
      scoreTotal: null,
    };
  }

  if (receipt.skipped) {
    return {
      status: 'blocked',
      failureKind: 'render-failure',
      blockingReasons: [`${receipt.stage || 'render'}: ${receipt.reason || 'variant skipped'}`],
      judgeResolved: false,
      scoreTotal: null,
    };
  }

  const gates = receipt.gates || {};
  const blockingReasons = [];
  const seriousAxe = Number(gates.seriousAxeViolations || 0);
  const overflowAt = Array.isArray(gates.horizontalOverflowAt) ? gates.horizontalOverflowAt : [];
  const smallTargets = Array.isArray(gates.touchTargetsUnder44) ? gates.touchTargetsUnder44 : [];
  const renderedStates = gates.stateRendered || {};
  const missingStates = requiredStates.filter((state) => renderedStates[state] !== true);
  const screenshots = Array.isArray(receipt.judge?.screenshotsSent) ? receipt.judge.screenshotsSent : [];

  if (gates.axeAvailable !== true) blockingReasons.push('axe was unavailable during capture');
  if (seriousAxe > 0) blockingReasons.push(`${seriousAxe} serious/critical axe violation(s)`);
  if (overflowAt.length > 0) blockingReasons.push(`horizontal overflow at ${overflowAt.join(', ')}`);
  if (smallTargets.length > 0) blockingReasons.push(`${smallTargets.length} touch target(s) under 44x44`);
  if (missingStates.length > 0) blockingReasons.push(`states not distinctly rendered: ${missingStates.join(', ')}`);
  if (screenshots.length === 0) blockingReasons.push('no screenshots reached the independent grader packet');

  const scores = receipt.judge?.scores;
  const judgeResolved = receipt.judge?.judged === true && validScores(scores);
  const resolvedScore = judgeResolved ? scoreTotal(scores) : null;

  if (blockingReasons.length > 0) {
    return {
      status: 'blocked',
      failureKind: 'gate-failure',
      blockingReasons,
      judgeResolved,
      scoreTotal: resolvedScore,
    };
  }

  if (!judgeResolved) {
    return {
      status: 'needs-human',
      failureKind: 'judge-unresolved',
      blockingReasons: [receipt.judge?.reason || 'rendered judge did not return valid scores'],
      judgeResolved: false,
      scoreTotal: null,
    };
  }

  return {
    status: 'pass',
    failureKind: null,
    blockingReasons: [],
    judgeResolved: true,
    scoreTotal: resolvedScore,
  };
}

export function compareRenderedVariants({ before, after, requiredStates = ['default'], sourceAdvisory = null }) {
  const beforeAssessment = assessRenderedVariant(before, { requiredStates });
  const afterAssessment = assessRenderedVariant(after, { requiredStates });
  const base = {
    authority: 'rendered-browser-evidence',
    sourceAdvisory,
    sourceAdvisoryAffectsVerdict: false,
    requiredStates,
    before: beforeAssessment,
    after: afterAssessment,
  };

  if (beforeAssessment.failureKind === 'render-failure' || afterAssessment.failureKind === 'render-failure') {
    return {
      ...base,
      status: 'blocked',
      winner: null,
      delta: null,
      reason: 'the rendered comparison is incomplete',
    };
  }

  if (afterAssessment.status === 'blocked') {
    return {
      ...base,
      status: 'blocked',
      winner: null,
      delta: null,
      reason: 'the candidate failed authoritative rendered gates',
    };
  }

  if (beforeAssessment.status === 'needs-human' || afterAssessment.status === 'needs-human') {
    return {
      ...base,
      status: 'needs-human',
      winner: null,
      delta: null,
      reason: 'rendered evidence exists, but the independent grader is unresolved',
    };
  }

  if (beforeAssessment.status === 'blocked' && afterAssessment.status === 'pass') {
    return {
      ...base,
      status: 'pass',
      winner: 'after',
      delta: null,
      reason: 'the candidate passes rendered gates that the baseline failed',
    };
  }

  const delta = afterAssessment.scoreTotal - beforeAssessment.scoreTotal;
  return {
    ...base,
    status: 'pass',
    winner: delta === 0 ? 'tie' : delta > 0 ? 'after' : 'before',
    delta,
    reason: 'both variants passed rendered gates; the independent rendered judge decides the comparison',
  };
}
