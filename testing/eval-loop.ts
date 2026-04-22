import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(__dirname, '..');
const TESTING_DIR = path.join(ROOT, 'testing');
const RESULTS_DIR = path.join(TESTING_DIR, 'results');
const PROMPTS_PATH = path.join(TESTING_DIR, 'prompts.json');
const JUDGE_PROMPT_PATH = path.join(TESTING_DIR, 'judge-prompt.md');
const DEFAULT_GENERATOR = 'gpt-5.4';
const DEFAULT_JUDGE = 'claude-sonnet-4-6';

type PromptDef = {
  slug: string;
  prompt: string;
  type: string;
};

type JudgeScores = {
  hierarchy: number;
  spacing: number;
  copy: number;
  productFit: number;
  screenshotWorthy: number;
};

type AntiPatternResult = {
  warnings: number;
  info: number;
  raw: string;
};

type StateResult = {
  loading: boolean;
  empty: boolean;
  error: boolean;
  raw: string;
};

type AccessibilityResult = {
  warnings: number;
  info: number;
  raw: string;
};

type RuleHit = {
  severity: 'warning' | 'info';
  rule: string;
  count: number;
};

type VariantResult = {
  file: string;
  antiPatterns: AntiPatternResult;
  states: StateResult;
  accessibility: AccessibilityResult;
  responsive: boolean;
  judge: JudgeScores;
  judgeTotal: number;
  penalties: {
    antiPatterns: number;
    missingStates: number;
    accessibility: number;
    responsive: number;
  };
  total: number;
};

type PromptResult = {
  prompt: string;
  slug: string;
  type: string;
  timestamp: string;
  before: VariantResult;
  after: VariantResult;
  delta: number;
  winner: 'before' | 'after' | 'tie';
};

type PromptFailure = {
  prompt: string;
  slug: string;
  type: string;
  timestamp: string;
  error: string;
};

function log(message: string) {
  console.log(`[eval-loop] ${message}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    help: args.includes('--help') || args.includes('-h'),
    slug: readFlagValue(args, '--slug'),
    generator: readFlagValue(args, '--generator') ?? process.env.EVAL_GENERATOR_MODEL ?? DEFAULT_GENERATOR,
    judge: readFlagValue(args, '--judge') ?? process.env.EVAL_JUDGE_MODEL ?? DEFAULT_JUDGE,
  };
}

function readFlagValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function printHelp() {
  console.log(`Usage: npx tsx testing/eval-loop.ts [options]\n\nOptions:\n  --dry-run             Validate inputs and print what would run without calling APIs\n  --slug <slug>         Run only one prompt slug\n  --generator <model>   Override the generator model (default: ${DEFAULT_GENERATOR}, or $EVAL_GENERATOR_MODEL). OpenAI and Anthropic models supported.\n  --judge <model>       Override the judge model (default: ${DEFAULT_JUDGE}, or $EVAL_JUDGE_MODEL)\n  --help, -h            Show this help`);
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}

async function readTextIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function loadEnvKey(envName: string, fallbackFile: string): Promise<string> {
  const fromEnv = process.env[envName]?.trim();
  if (fromEnv) return fromEnv;

  // Try credentials file first
  const expanded = expandHome(fallbackFile);
  const contents = await readTextIfExists(expanded);
  if (contents) {
    const line = contents
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith(`${envName}=`));
    if (line) {
      const value = line.slice(line.indexOf('=') + 1).trim().replace(/^['"]|['"]$/g, '');
      if (value && !value.startsWith('[')) return value;
    }
  }

  // Try OpenClaw config as fallback
  const clawConfig = await readTextIfExists(expandHome('~/.openclaw/openclaw.json'));
  if (clawConfig) {
    try {
      const config = JSON.parse(clawConfig);
      const providers = config?.models?.providers;
      if (envName === 'OPENAI_API_KEY') {
        const key = providers?.openai?.apiKey || providers?.['openai-codex']?.apiKey;
        if (key) return key;
      }
      if (envName === 'ANTHROPIC_API_KEY') {
        const key = providers?.anthropic?.apiKey;
        if (key) return key;
      }
    } catch { /* ignore parse errors */ }
  }

  throw new Error(`Missing ${envName}. Set it in the environment, create ${expanded}, or configure in ~/.openclaw/openclaw.json`);
}

function expandHome(filePath: string) {
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

async function loadCorePackPrompt(): Promise<string> {
  const designSkillPath = path.join(ROOT, 'skills', 'design-review', 'SKILL.md');
  const referencesDir = path.join(ROOT, 'skills', 'design-review', 'references');
  const uxSkillPath = path.join(ROOT, 'skills', 'ux-baseline-check', 'SKILL.md');
  const polishSkillPath = path.join(ROOT, 'skills', 'ui-polish-pass', 'SKILL.md');
  const routingPath = path.join(ROOT, 'routing', 'ROUTING.md');

  const referenceEntries = (await fs.readdir(referencesDir))
    .filter((file) => file.endsWith('.md'))
    .sort();

  const sections: string[] = [];

  sections.push('Follow the core pack chain exactly: pattern benchmarking -> design-review -> ux-baseline-check -> ui-polish-pass.');
  sections.push('Build a single React + Tailwind CSS page component. Use the `"use client"` directive and export default.');
  sections.push('Return TSX only. No markdown fences.');

  sections.push(`\n## routing/ROUTING.md\n${await fs.readFile(routingPath, 'utf8')}`);
  sections.push(`\n## skills/design-review/SKILL.md\n${await fs.readFile(designSkillPath, 'utf8')}`);

  for (const file of referenceEntries) {
    const fullPath = path.join(referencesDir, file);
    sections.push(`\n## skills/design-review/references/${file}\n${await fs.readFile(fullPath, 'utf8')}`);
  }

  sections.push(`\n## skills/ux-baseline-check/SKILL.md\n${await fs.readFile(uxSkillPath, 'utf8')}`);
  sections.push(`\n## skills/ui-polish-pass/SKILL.md\n${await fs.readFile(polishSkillPath, 'utf8')}`);

  return sections.join('\n\n');
}

function buildBeforeUserPrompt(prompt: string) {
  return `${prompt}\n\nbuild a single React + Tailwind CSS page component. export default. use client directive. return TSX only.`;
}

function buildAfterUserPrompt(prompt: string) {
  return `${prompt}\n\nFollow the core pack chain from the system prompt. Build a single React + Tailwind CSS page component with a default export and a use client directive. Include intentional hierarchy, specific copy, responsive behavior, and clear loading, empty, and error states when applicable. Return TSX only.`;
}

async function callOpenAI({ apiKey, model, system, user }: { apiKey: string; model: string; system?: string; user: string }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        ...(system ? [{ role: 'system', content: [{ type: 'input_text', text: system }] }] : []),
        { role: 'user', content: [{ type: 'input_text', text: user }] },
      ],
      text: { format: { type: 'text' } },
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`OpenAI API error (${response.status}): ${body}`);
  }

  const parsed = JSON.parse(body) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };

  // Try output_text first (newer format), then nested output[0].content[0].text
  let output = parsed.output_text?.trim();
  if (!output && parsed.output) {
    output = parsed.output[0]?.content?.[0]?.text?.trim();
  }
  if (!output) {
    throw new Error('OpenAI API returned no output text');
  }

  return stripCodeFences(output);
}

async function callAnthropic({ apiKey, model, system, user }: { apiKey: string; model: string; system: string; user: string }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Anthropic API error (${response.status}): ${body}`);
  }

  const parsed = JSON.parse(body) as { content?: Array<{ type: string; text?: string }> };
  const text = parsed.content?.find((item) => item.type === 'text')?.text?.trim();
  if (!text) {
    throw new Error('Anthropic API returned no text content');
  }

  return stripCodeFences(text);
}

function isAnthropicModel(model: string) {
  return /^(claude|anthropic)/i.test(model);
}

async function generateTsx(args: {
  model: string;
  openAiKey: string;
  anthropicKey: string;
  user: string;
  system?: string;
}) {
  if (isAnthropicModel(args.model)) {
    return callAnthropic({
      apiKey: args.anthropicKey,
      model: args.model,
      system:
        args.system ??
        'You are an expert React + Tailwind UI generator. Return only valid TSX code with a default export and no markdown fences.',
      user: args.user,
    });
  }

  return callOpenAI({
    apiKey: args.openAiKey,
    model: args.model,
    system: args.system,
    user: args.user,
  });
}

function stripCodeFences(value: string) {
  return value
    .replace(/^```[a-zA-Z0-9_-]*\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
}

async function runAntiPatternCheck(filePath: string): Promise<AntiPatternResult> {
  const scriptPath = path.join(ROOT, 'skills', 'design-review', 'scripts', 'anti-pattern-check.py');
  try {
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath, filePath], { cwd: ROOT });
    const raw = [stdout, stderr].filter(Boolean).join('\n').trim();
    return {
      ...parseAntiPatternOutput(raw),
      raw,
    };
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; message: string };
    const raw = [execError.stdout, execError.stderr, execError.message].filter(Boolean).join('\n').trim();
    return {
      ...parseAntiPatternOutput(raw),
      raw,
    };
  }
}

function parseAntiPatternOutput(raw: string) {
  const summaryMatch = raw.match(/Summary:\s*(\d+)\s+warnings,\s*(\d+)\s+info/i);
  if (!summaryMatch) {
    throw new Error(`Could not parse anti-pattern output:\n${raw}`);
  }
  return {
    warnings: Number(summaryMatch[1]),
    info: Number(summaryMatch[2]),
  };
}

async function runStateCheck(filePath: string): Promise<StateResult> {
  const scriptPath = path.join(ROOT, 'skills', 'design-review', 'scripts', 'state-check.py');
  try {
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath, filePath], { cwd: ROOT });
    const raw = [stdout, stderr].filter(Boolean).join('\n').trim();
    return { ...parseStateOutput(raw), raw };
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; message: string };
    const raw = [execError.stdout, execError.stderr, execError.message].filter(Boolean).join('\n').trim();
    return { ...parseStateOutput(raw), raw };
  }
}

function parseStateOutput(raw: string) {
  return {
    loading: /✓\s+loading/i.test(raw),
    empty: /✓\s+empty/i.test(raw),
    error: /✓\s+error/i.test(raw),
  };
}

async function runAccessibilityCheck(filePath: string): Promise<AccessibilityResult> {
  const scriptPath = path.join(ROOT, 'skills', 'design-review', 'scripts', 'accessibility-check.py');
  try {
    const { stdout, stderr } = await execFileAsync('python3', [scriptPath, filePath], { cwd: ROOT });
    const raw = [stdout, stderr].filter(Boolean).join('\n').trim();
    return { ...parseAntiPatternOutput(raw), raw };
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; message: string };
    const raw = [execError.stdout, execError.stderr, execError.message].filter(Boolean).join('\n').trim();
    return { ...parseAntiPatternOutput(raw), raw };
  }
}

async function detectResponsive(filePath: string) {
  const content = await fs.readFile(filePath, 'utf8');
  return /(?:^|\W)(?:sm:|md:|lg:|xl:|2xl:)/.test(content);
}

function judgeTotal(scores: JudgeScores) {
  return scores.hierarchy + scores.spacing + scores.copy + scores.productFit + scores.screenshotWorthy;
}

function missingStateCount(states: StateResult) {
  return Number(!states.loading) + Number(!states.empty) + Number(!states.error);
}

function computeTotal(args: {
  judge: JudgeScores;
  antiPatterns: AntiPatternResult;
  states: StateResult;
  accessibility: AccessibilityResult;
  responsive: boolean;
}) {
  const antiPatternPenalty = -(args.antiPatterns.warnings * 2 + args.antiPatterns.info);
  const missingStatesPenalty = -(missingStateCount(args.states) * 3);
  const accessibilityPenalty = -(args.accessibility.warnings * 2 + args.accessibility.info);
  const responsivePenalty = args.responsive ? 0 : -5;
  const judgeScore = judgeTotal(args.judge);

  return {
    judgeTotal: judgeScore,
    penalties: {
      antiPatterns: antiPatternPenalty,
      missingStates: missingStatesPenalty,
      accessibility: accessibilityPenalty,
      responsive: responsivePenalty,
    },
    total: judgeScore + antiPatternPenalty + missingStatesPenalty + accessibilityPenalty + responsivePenalty,
  };
}

function parseJudgeScores(raw: string): { before: JudgeScores; after: JudgeScores } {
  const parsed = JSON.parse(stripCodeFences(raw)) as { before: JudgeScores; after: JudgeScores };
  validateJudgeScores(parsed.before, 'before');
  validateJudgeScores(parsed.after, 'after');
  return parsed;
}

function validateJudgeScores(scores: JudgeScores, label: string) {
  const keys: Array<keyof JudgeScores> = ['hierarchy', 'spacing', 'copy', 'productFit', 'screenshotWorthy'];
  for (const key of keys) {
    const value = scores[key];
    if (!Number.isInteger(value) || value < 1 || value > 10) {
      throw new Error(`Judge score ${label}.${key} must be an integer 1-10, got ${value}`);
    }
  }
}

async function evaluateVariant(filePath: string, judge: JudgeScores): Promise<VariantResult> {
  const [antiPatterns, states, accessibility, responsive] = await Promise.all([
    runAntiPatternCheck(filePath),
    runStateCheck(filePath),
    runAccessibilityCheck(filePath),
    detectResponsive(filePath),
  ]);

  const totals = computeTotal({ judge, antiPatterns, states, accessibility, responsive });

  return {
    file: path.relative(ROOT, filePath),
    antiPatterns,
    states,
    accessibility,
    responsive,
    judge,
    judgeTotal: totals.judgeTotal,
    penalties: totals.penalties,
    total: totals.total,
  };
}

async function writeJson(filePath: string, value: unknown) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function writeText(filePath: string, value: string) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function formatVerdict(result: PromptResult): string {
  const delta = result.delta;
  if (result.winner === 'after' && delta >= 20) return 'after — strong lift';
  if (result.winner === 'after') return 'after — modest lift';
  if (result.winner === 'tie') return 'tie — no meaningful delta';
  return 'before — loop did not help, investigate';
}

function parseRuleHits(raw: string): RuleHit[] {
  const hits: RuleHit[] = [];
  const regex = /(^|\n)\s*(⚠️|ℹ️)\s+([^\n(]+?)(?:\s+\(×(\d+)\))?\s*(?=\n|$)/g;
  let match: RegExpExecArray | null = regex.exec(raw);
  while (match) {
    hits.push({
      severity: match[2] === '⚠️' ? 'warning' : 'info',
      rule: match[3].trim(),
      count: Number(match[4] ?? 1),
    });
    match = regex.exec(raw);
  }
  return hits;
}

function renderRuleHitRows(raw: string): string[] {
  const hits = parseRuleHits(raw);
  if (hits.length === 0) {
    return ['| warning | none | 0 |', '| info | none | 0 |'];
  }
  return hits.map((hit) => `| ${hit.severity} | ${hit.rule} | ${hit.count} |`);
}

function renderJudgeTable(result: PromptResult): string {
  const rows: Array<[keyof JudgeScores, string]> = [
    ['hierarchy', 'hierarchy'],
    ['spacing', 'spacing'],
    ['copy', 'copy'],
    ['productFit', 'productFit'],
    ['screenshotWorthy', 'screenshotWorthy'],
  ];
  const lines = [
    '| dimension | before | after | delta |',
    '|---|---:|---:|---:|',
    ...rows.map(([key, label]) => {
      const b = result.before.judge[key];
      const a = result.after.judge[key];
      const d = a - b;
      const sign = d > 0 ? `+${d}` : `${d}`;
      return `| ${label} | ${b} | ${a} | ${sign} |`;
    }),
    `| **judge total** | **${result.before.judgeTotal}** | **${result.after.judgeTotal}** | **${signed(result.after.judgeTotal - result.before.judgeTotal)}** |`,
  ];
  return lines.join('\n');
}

function renderPenaltyTable(result: PromptResult): string {
  return [
    '| category | before | after |',
    '|---|---:|---:|',
    `| anti-pattern | ${result.before.penalties.antiPatterns} | ${result.after.penalties.antiPatterns} |`,
    `| missing states | ${result.before.penalties.missingStates} | ${result.after.penalties.missingStates} |`,
    `| accessibility | ${result.before.penalties.accessibility} | ${result.after.penalties.accessibility} |`,
    `| responsive | ${result.before.penalties.responsive} | ${result.after.penalties.responsive} |`,
  ].join('\n');
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function buildReportMarkdown(result: PromptResult, models: { generator: string; judge: string }): string {
  const totalDelta = signed(result.delta);
  const beforeMissingStates = missingStateCount(result.before.states);
  const afterMissingStates = missingStateCount(result.after.states);
  const stateCoverageBefore = `${3 - beforeMissingStates}/3`;
  const stateCoverageAfter = `${3 - afterMissingStates}/3`;
  const judgeDelta = result.after.judgeTotal - result.before.judgeTotal;
  const strongestJudgeLift = (['hierarchy', 'spacing', 'copy', 'productFit', 'screenshotWorthy'] as Array<keyof JudgeScores>)
    .map((key) => ({ key, delta: result.after.judge[key] - result.before.judge[key] }))
    .sort((a, b) => b.delta - a.delta)[0];
  const qualitativeNoteA = result.after.antiPatterns.warnings === 0 && result.after.antiPatterns.info === 0
    ? 'after variant is rule-clean on anti-pattern checks.'
    : `after variant still has ${result.after.antiPatterns.warnings} warning(s) and ${result.after.antiPatterns.info} info hit(s).`;
  const qualitativeNoteB = `state coverage moved ${stateCoverageBefore} -> ${stateCoverageAfter}; judge total moved ${result.before.judgeTotal} -> ${result.after.judgeTotal} (${signed(judgeDelta)}).`;
  const qualitativeNoteC = strongestJudgeLift.delta > 0
    ? `largest judge lift: ${strongestJudgeLift.key} (${signed(strongestJudgeLift.delta)}).`
    : 'judge dimensions were flat or lower; inspect qualitative fit.';
  return [
    `# run report — ${result.slug}`,
    '',
    `**prompt:** ${result.prompt}`,
    `**type:** ${result.type}`,
    `**generator model:** ${models.generator}`,
    `**judge model:** ${models.judge}`,
    `**timestamp:** ${result.timestamp}`,
    `**score:** ${result.before.total} → ${result.after.total} (${totalDelta})`,
    `**verdict:** ${formatVerdict(result)}`,
    '',
    '## files',
    '',
    `- before: \`${result.before.file}\``,
    `- after: \`${result.after.file}\``,
    '',
    '## rules fired',
    '',
    '### before',
    '',
    `- anti-pattern summary: ${result.before.antiPatterns.warnings} warnings, ${result.before.antiPatterns.info} info`,
    '',
    '#### anti-pattern-check.py',
    '',
    '| severity | rule | count |',
    '|---|---|---:|',
    ...renderRuleHitRows(result.before.antiPatterns.raw),
    '',
    '#### state-check.py',
    '',
    '| state | present |',
    '|---|---|',
    `| loading | ${result.before.states.loading ? 'yes' : 'no'} |`,
    `| empty | ${result.before.states.empty ? 'yes' : 'no'} |`,
    `| error | ${result.before.states.error ? 'yes' : 'no'} |`,
    '',
    '#### accessibility-check.py',
    '',
    '| severity | rule | count |',
    '|---|---|---:|',
    ...renderRuleHitRows(result.before.accessibility.raw),
    '',
    `- state coverage: ${stateCoverageBefore}`,
    `- responsive breakpoints: ${result.before.responsive ? 'yes' : 'no'}`,
    '',
    '### after',
    '',
    `- anti-pattern summary: ${result.after.antiPatterns.warnings} warnings, ${result.after.antiPatterns.info} info`,
    '',
    '#### anti-pattern-check.py',
    '',
    '| severity | rule | count |',
    '|---|---|---:|',
    ...renderRuleHitRows(result.after.antiPatterns.raw),
    '',
    '#### state-check.py',
    '',
    '| state | present |',
    '|---|---|',
    `| loading | ${result.after.states.loading ? 'yes' : 'no'} |`,
    `| empty | ${result.after.states.empty ? 'yes' : 'no'} |`,
    `| error | ${result.after.states.error ? 'yes' : 'no'} |`,
    '',
    '#### accessibility-check.py',
    '',
    '| severity | rule | count |',
    '|---|---|---:|',
    ...renderRuleHitRows(result.after.accessibility.raw),
    '',
    `- state coverage: ${stateCoverageAfter}`,
    `- responsive breakpoints: ${result.after.responsive ? 'yes' : 'no'}`,
    '',
    '## judge scores (1–10 each)',
    '',
    renderJudgeTable(result),
    '',
    '## penalties',
    '',
    renderPenaltyTable(result),
    '',
    '## qualitative notes',
    '',
    `- ${qualitativeNoteA}`,
    `- ${qualitativeNoteB}`,
    `- ${qualitativeNoteC}`,
    '',
    '## follow-ups',
    '',
    '1. anti-pattern hits present on the after variant → candidates for `skills/design-review/references/anti-patterns.md`',
    '2. judge dimensions under 7 on after → iterate before shipping',
    '3. rubric weights from `skills/agentic-design-system/SKILL.md` (Design Quality 35%, Originality 30%, Craft 20%, Functionality 15%) are not automatically scored here — apply manually before verdict',
    '',
    '## raw',
    '',
    'see `scores.json` in this directory for the full structured output.',
  ].join('\n');
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

async function buildSummary(
  results: PromptResult[],
  failures: PromptFailure[],
  models: { generator: string; judge: string },
) {
  const summary = {
    timestamp: new Date().toISOString(),
    models,
    totals: {
      promptsAttempted: results.length + failures.length,
      promptsSucceeded: results.length,
      promptsFailed: failures.length,
    },
    averages: {
      beforeTotal: average(results.map((result) => result.before.total)),
      afterTotal: average(results.map((result) => result.after.total)),
      delta: average(results.map((result) => result.delta)),
      beforeJudgeTotal: average(results.map((result) => result.before.judgeTotal)),
      afterJudgeTotal: average(results.map((result) => result.after.judgeTotal)),
      beforeWarnings: average(results.map((result) => result.before.antiPatterns.warnings)),
      afterWarnings: average(results.map((result) => result.after.antiPatterns.warnings)),
      beforeInfo: average(results.map((result) => result.before.antiPatterns.info)),
      afterInfo: average(results.map((result) => result.after.antiPatterns.info)),
    },
    results,
    failures,
  };

  await writeJson(path.join(RESULTS_DIR, 'summary.json'), summary);
  await writeText(path.join(RESULTS_DIR, 'report.md'), buildBatchReportMarkdown(summary));
}

function buildBatchReportMarkdown(summary: {
  timestamp: string;
  models: { generator: string; judge: string };
  totals: { promptsAttempted: number; promptsSucceeded: number; promptsFailed: number };
  averages: {
    beforeTotal: number;
    afterTotal: number;
    delta: number;
    beforeJudgeTotal: number;
    afterJudgeTotal: number;
    beforeWarnings: number;
    afterWarnings: number;
    beforeInfo: number;
    afterInfo: number;
  };
  results: PromptResult[];
  failures: PromptFailure[];
}) {
  return [
    '# run report — batch summary',
    '',
    `**timestamp:** ${summary.timestamp}`,
    `**generator model:** ${summary.models.generator}`,
    `**judge model:** ${summary.models.judge}`,
    `**prompts:** ${summary.totals.promptsSucceeded}/${summary.totals.promptsAttempted} succeeded`,
    '',
    '## score summary',
    '',
    `- total score average: ${summary.averages.beforeTotal} -> ${summary.averages.afterTotal} (${signed(summary.averages.delta)})`,
    `- judge total average: ${summary.averages.beforeJudgeTotal} -> ${summary.averages.afterJudgeTotal} (${signed(summary.averages.afterJudgeTotal - summary.averages.beforeJudgeTotal)})`,
    `- anti-pattern warnings average: ${summary.averages.beforeWarnings} -> ${summary.averages.afterWarnings}`,
    `- anti-pattern info average: ${summary.averages.beforeInfo} -> ${summary.averages.afterInfo}`,
    '',
    '## prompt results',
    '',
    '| slug | type | before | after | delta | rule hits before -> after | states before -> after |',
    '|---|---|---:|---:|---:|---|---|',
    ...summary.results.map((result) => {
      const beforeRuleHits = result.before.antiPatterns.warnings + result.before.antiPatterns.info + result.before.accessibility.warnings + result.before.accessibility.info;
      const afterRuleHits = result.after.antiPatterns.warnings + result.after.antiPatterns.info + result.after.accessibility.warnings + result.after.accessibility.info;
      const beforeStates = `${3 - missingStateCount(result.before.states)}/3`;
      const afterStates = `${3 - missingStateCount(result.after.states)}/3`;
      return `| ${result.slug} | ${result.type} | ${result.before.total} | ${result.after.total} | ${signed(result.delta)} | ${beforeRuleHits} -> ${afterRuleHits} | ${beforeStates} -> ${afterStates} |`;
    }),
    '',
    '## qualitative notes',
    '',
    `- ${summary.results.filter((result) => result.winner === 'after').length}/${summary.results.length} prompts improved after the core-pack loop.`,
    `- ${summary.results.filter((result) => missingStateCount(result.after.states) === 0).length}/${summary.results.length} after variants reached full loading/empty/error coverage.`,
    ...(
      summary.failures.length > 0
        ? [`- ${summary.failures.length} prompt(s) failed. See failure table below.`]
        : ['- no failed prompts in this batch.']
    ),
    '',
    ...(summary.failures.length > 0
      ? [
          '## failures',
          '',
          '| slug | type | error |',
          '|---|---|---|',
          ...summary.failures.map((failure) => `| ${failure.slug} | ${failure.type} | ${failure.error.split('\n')[0]} |`),
          '',
        ]
      : []),
    '## per-prompt reports',
    '',
    'see `testing/results/<slug>/report.md` for rule-level tables and detailed notes.',
  ].join('\n');
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    printHelp();
    return;
  }

  await ensureDir(RESULTS_DIR);

  const prompts = await readJsonFile<PromptDef[]>(PROMPTS_PATH);
  const filteredPrompts = args.slug ? prompts.filter((item) => item.slug === args.slug) : prompts;
  if (args.slug && filteredPrompts.length === 0) {
    throw new Error(`No prompt found for slug: ${args.slug}`);
  }

  const judgeSystemPrompt = await fs.readFile(JUDGE_PROMPT_PATH, 'utf8');
  const corePackPrompt = await loadCorePackPrompt();

  if (args.dryRun) {
    log(`Dry run. Would evaluate ${filteredPrompts.length} prompt(s): ${filteredPrompts.map((item) => item.slug).join(', ')}`);
    log(`Generator model: ${args.generator}`);
    log(`Judge model: ${args.judge}`);
    log(`Loaded judge prompt and core pack bundle.`);
    return;
  }

  log(`Generator model: ${args.generator}`);
  log(`Judge model: ${args.judge}`);

  const openAiKey = await loadEnvKey('OPENAI_API_KEY', '~/.clawdbot/credentials/openai.env');
  const anthropicKey = await loadEnvKey('ANTHROPIC_API_KEY', '~/.clawdbot/credentials/anthropic.env');

  const successes: PromptResult[] = [];
  const failures: PromptFailure[] = [];

  for (const promptDef of filteredPrompts) {
    const startedAt = new Date().toISOString();
    const resultDir = path.join(RESULTS_DIR, promptDef.slug);
    await ensureDir(resultDir);

    try {
      log(`Generating before for ${promptDef.slug}`);
      const beforeTsx = await generateTsx({
        openAiKey,
        anthropicKey,
        model: args.generator,
        user: buildBeforeUserPrompt(promptDef.prompt),
      });

      log(`Generating after for ${promptDef.slug}`);
      const afterTsx = await generateTsx({
        openAiKey,
        anthropicKey,
        model: args.generator,
        system: corePackPrompt,
        user: buildAfterUserPrompt(promptDef.prompt),
      });

      const beforePath = path.join(resultDir, 'before.tsx');
      const afterPath = path.join(resultDir, 'after.tsx');
      await Promise.all([
        fs.writeFile(beforePath, `${beforeTsx.trim()}\n`, 'utf8'),
        fs.writeFile(afterPath, `${afterTsx.trim()}\n`, 'utf8'),
      ]);

      log(`Judging ${promptDef.slug}`);
      const judgeRaw = await callAnthropic({
        apiKey: anthropicKey,
        model: args.judge,
        system: judgeSystemPrompt,
        user: [
          `Prompt: ${promptDef.prompt}`,
          '',
          '## before.tsx',
          '```tsx',
          beforeTsx,
          '```',
          '',
          '## after.tsx',
          '```tsx',
          afterTsx,
          '```',
        ].join('\n'),
      });
      const judge = parseJudgeScores(judgeRaw);

      log(`Running programmatic evals for ${promptDef.slug}`);
      const before = await evaluateVariant(beforePath, judge.before);
      const after = await evaluateVariant(afterPath, judge.after);

      const result: PromptResult = {
        prompt: promptDef.prompt,
        slug: promptDef.slug,
        type: promptDef.type,
        timestamp: startedAt,
        before,
        after,
        delta: after.total - before.total,
        winner: after.total === before.total ? 'tie' : after.total > before.total ? 'after' : 'before',
      };

      await writeJson(path.join(resultDir, 'scores.json'), result);
      await writeText(
        path.join(resultDir, 'report.md'),
        buildReportMarkdown(result, { generator: args.generator, judge: args.judge }),
      );
      successes.push(result);
      log(`Completed ${promptDef.slug}: ${result.winner} (${result.before.total} -> ${result.after.total})`);
    } catch (error) {
      const failure: PromptFailure = {
        prompt: promptDef.prompt,
        slug: promptDef.slug,
        type: promptDef.type,
        timestamp: startedAt,
        error: error instanceof Error ? error.stack || error.message : String(error),
      };
      failures.push(failure);
      await writeJson(path.join(resultDir, 'scores.json'), failure);
      log(`Failed ${promptDef.slug}: ${failure.error.split('\n')[0]}`);
    }
  }

  await buildSummary(successes, failures, { generator: args.generator, judge: args.judge });
  log(`Done. ${successes.length} succeeded, ${failures.length} failed.`);
}

main().catch((error) => {
  console.error(`[eval-loop] Fatal: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  process.exit(1);
});
