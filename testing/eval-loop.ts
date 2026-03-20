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
const OPENAI_MODEL = 'gpt-5.4';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';

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
  };
}

function readFlagValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function printHelp() {
  console.log(`Usage: npx tsx testing/eval-loop.ts [--dry-run] [--slug <slug>]\n\nOptions:\n  --dry-run     Validate inputs and print what would run without calling APIs\n  --slug        Run only one prompt slug\n  --help, -h    Show this help`);
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

async function callOpenAI({ apiKey, system, user }: { apiKey: string; system?: string; user: string }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
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

async function callAnthropic({ apiKey, system, user }: { apiKey: string; system: string; user: string }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
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

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

async function buildSummary(results: PromptResult[], failures: PromptFailure[]) {
  const summary = {
    timestamp: new Date().toISOString(),
    models: {
      generator: OPENAI_MODEL,
      judge: ANTHROPIC_MODEL,
    },
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
    log(`Loaded judge prompt and core pack bundle.`);
    return;
  }

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
      const beforeTsx = await callOpenAI({
        apiKey: openAiKey,
        user: buildBeforeUserPrompt(promptDef.prompt),
      });

      log(`Generating after for ${promptDef.slug}`);
      const afterTsx = await callOpenAI({
        apiKey: openAiKey,
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

  await buildSummary(successes, failures);
  log(`Done. ${successes.length} succeeded, ${failures.length} failed.`);
}

main().catch((error) => {
  console.error(`[eval-loop] Fatal: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  process.exit(1);
});
