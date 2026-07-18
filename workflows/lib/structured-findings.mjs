export const FINDING_CATEGORIES = Object.freeze([
  'layout_spacing_hierarchy',
  'polish_consistency',
  'typography',
  'originality',
  'color_contrast',
  'interaction_motion',
  'cues_affordances',
  'brand_fit_tone',
]);

export const FINDING_SEVERITIES = Object.freeze(['minor', 'major', 'blocker']);

const REQUIRED_FINDING_FIELDS = Object.freeze([
  'id',
  'category',
  'severity',
  'rubricRow',
  'state',
  'breakpoint',
  'artifact',
  'target',
  'observation',
  'evidence',
]);

const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const STRUCTURED_FINDING_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [...REQUIRED_FINDING_FIELDS],
  properties: {
    id: { type: 'string', minLength: 1 },
    category: { enum: [...FINDING_CATEGORIES] },
    severity: { enum: [...FINDING_SEVERITIES] },
    rubricRow: {
      type: 'string',
      minLength: 1,
      description: 'Design Quality, Originality, Craft, Functionality, or a task-specific criterion',
    },
    state: { type: 'string', minLength: 1 },
    breakpoint: { type: 'string', minLength: 1 },
    artifact: { type: 'string', minLength: 1 },
    target: { type: 'string', minLength: 1 },
    region: {
      type: 'object',
      additionalProperties: false,
      required: ['x', 'y', 'width', 'height'],
      properties: {
        x: { type: 'number', minimum: 0, maximum: 1 },
        y: { type: 'number', minimum: 0, maximum: 1 },
        width: { type: 'number', exclusiveMinimum: 0, maximum: 1 },
        height: { type: 'number', exclusiveMinimum: 0, maximum: 1 },
      },
    },
    observation: { type: 'string', minLength: 1 },
    evidence: { type: 'string', minLength: 1 },
  },
};

export const GRADE_SCHEMA = {
  type: 'object',
  required: ['verdict', 'scores', 'findings', 'nextRevisionPrompt'],
  properties: {
    verdict: { enum: ['satisfied', 'needs_revision', 'failed'] },
    scores: {
      type: 'object',
      required: ['designQuality', 'originality', 'craft', 'functionality'],
      properties: {
        designQuality: { type: 'number' },
        originality: { type: 'number' },
        craft: { type: 'number' },
        functionality: { type: 'number' },
      },
    },
    findings: {
      type: 'array',
      maxItems: 20,
      items: STRUCTURED_FINDING_SCHEMA,
      description: 'evidence-linked visual findings; empty only when the grader found no material or minor issues',
    },
    failingRows: {
      type: 'array',
      items: { type: 'string' },
      description: 'compatibility field; the workflow derives and overwrites this from major/blocker findings',
    },
    nextRevisionPrompt: {
      type: 'string',
      description: 'bounded, testable instruction for the builder; empty if satisfied',
    },
  },
};

export function validateStructuredFinding(finding, index = 0) {
  const label = `findings[${index}]`;
  const errors = [];
  if (!finding || typeof finding !== 'object' || Array.isArray(finding)) {
    return [`${label} must be an object`];
  }

  for (const field of REQUIRED_FINDING_FIELDS) {
    if (!nonEmptyString(finding[field])) errors.push(`${label}.${field} must be a non-empty string`);
  }
  if (!FINDING_CATEGORIES.includes(finding.category)) {
    errors.push(`${label}.category is unsupported: ${finding.category}`);
  }
  if (!FINDING_SEVERITIES.includes(finding.severity)) {
    errors.push(`${label}.severity is unsupported: ${finding.severity}`);
  }

  if (finding.region !== undefined) {
    const region = finding.region;
    if (!region || typeof region !== 'object' || Array.isArray(region)) {
      errors.push(`${label}.region must be an object when present`);
    } else {
      for (const field of ['x', 'y', 'width', 'height']) {
        const value = region[field];
        if (!Number.isFinite(value)) {
          errors.push(`${label}.region.${field} must be a finite number`);
          continue;
        }
        if (value < 0 || value > 1 || ((field === 'width' || field === 'height') && value === 0)) {
          errors.push(`${label}.region.${field} must be normalized from 0 to 1${field === 'width' || field === 'height' ? ' and greater than 0' : ''}`);
        }
      }
    }
  }

  return errors;
}

const materialFindings = (findings) => findings.filter(({ severity }) => severity !== 'minor');

const findingRow = (finding) =>
  `${finding.severity}:${finding.category}:${finding.state}@${finding.breakpoint}:${finding.target} — ${finding.observation}`;

const findingRepair = (finding) =>
  `- ${finding.id} (${finding.severity}, ${finding.state}@${finding.breakpoint}): ${finding.target} — ${finding.observation} Evidence: ${finding.artifact}; ${finding.evidence}`;

export function normalizeGrade(rawGrade) {
  if (!rawGrade || typeof rawGrade !== 'object' || Array.isArray(rawGrade)) {
    throw new Error('structured findings validation failed: grade must be an object');
  }
  if (!Array.isArray(rawGrade.findings)) {
    throw new Error('structured findings validation failed: findings must be an array');
  }

  const errors = rawGrade.findings.flatMap((finding, index) => validateStructuredFinding(finding, index));
  if (errors.length) {
    throw new Error(`structured findings validation failed: ${errors.join('; ')}`);
  }

  const findings = rawGrade.findings.map((finding) => ({ ...finding }));
  const actionable = materialFindings(findings);
  let verdict = rawGrade.verdict;
  let nextRevisionPrompt = typeof rawGrade.nextRevisionPrompt === 'string'
    ? rawGrade.nextRevisionPrompt.trim()
    : '';

  if (actionable.length && verdict === 'satisfied') verdict = 'needs_revision';
  if (verdict === 'needs_revision' && actionable.length) {
    const repairPacket = `Required finding repairs:\n${actionable.map(findingRepair).join('\n')}`;
    nextRevisionPrompt = nextRevisionPrompt
      ? `${nextRevisionPrompt}\n\n${repairPacket}`
      : repairPacket;
  }

  return {
    ...rawGrade,
    verdict,
    findings,
    failingRows: actionable.map(findingRow),
    nextRevisionPrompt,
  };
}

export function aggregateFindingHistory(history) {
  const byCategory = Object.fromEntries(FINDING_CATEGORIES.map((category) => [category, 0]));
  const bySeverity = Object.fromEntries(FINDING_SEVERITIES.map((severity) => [severity, 0]));
  const categorySeverity = Object.fromEntries(FINDING_CATEGORIES.map((category) => [
    category,
    Object.fromEntries(FINDING_SEVERITIES.map((severity) => [severity, 0])),
  ]));
  const occurrences = new Map();

  for (const entry of history) {
    for (const finding of entry.findings || []) {
      byCategory[finding.category] += 1;
      bySeverity[finding.severity] += 1;
      categorySeverity[finding.category][finding.severity] += 1;
      const key = [finding.category, finding.target, finding.state, finding.breakpoint].join('|');
      const current = occurrences.get(key) || {
        key,
        category: finding.category,
        target: finding.target,
        state: finding.state,
        breakpoint: finding.breakpoint,
        count: 0,
        iterations: [],
        evidence: [],
      };
      current.count += 1;
      if (!current.iterations.includes(entry.iteration)) current.iterations.push(entry.iteration);
      current.evidence.push({ iteration: entry.iteration, artifact: finding.artifact, evidence: finding.evidence });
      occurrences.set(key, current);
    }
  }

  return {
    total: Object.values(bySeverity).reduce((sum, count) => sum + count, 0),
    byCategory,
    bySeverity,
    categorySeverity,
    repeated: [...occurrences.values()].filter(({ iterations }) => iterations.length > 1),
  };
}
