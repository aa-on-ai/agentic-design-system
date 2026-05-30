// judge-render.mjs — grade a rendered variant from its SCREENSHOTS (not TSX source).
//
// Same 5-dimension rubric as the source judge (judge-prompt.md); only the input modality
// changes — the judge receives PNGs + the rendered-evidence gates instead of code.
//
// If ANTHROPIC_API_KEY is present, it calls the model with image blocks. If not, it returns
// a deterministic STUB receipt that still records exactly which screenshots and gates WOULD
// have been sent — so the fixture path runs offline and the screenshot-wiring stays provable.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = path.join(HERE, '..', 'judge-render-prompt.md');
const DIMENSIONS = ['hierarchy', 'spacing', 'copy', 'productFit', 'screenshotWorthy'];
const MAX_IMAGES = 4; // cap tokens: send the most informative shots, not every breakpoint x state

function pickScreenshots(evidence, outDir) {
  // Prefer the default state across breakpoints, then fill with whatever else rendered.
  const snaps = (evidence.snapshots || []).slice();
  snaps.sort((a, b) => (a.state === 'default' ? -1 : 0) - (b.state === 'default' ? -1 : 0));
  return snaps.slice(0, MAX_IMAGES).map((s) => ({
    label: `${s.state}@${s.breakpoint}`,
    path: path.join(outDir, s.screenshot),
  }));
}

async function toImageBlock(file) {
  const data = await fs.readFile(file);
  return {
    type: 'image',
    source: { type: 'base64', media_type: 'image/png', data: data.toString('base64') },
  };
}

function stripFences(s) {
  return s.replace(/^```[a-zA-Z0-9_-]*\s*/, '').replace(/\s*```$/, '').trim();
}

function validateScores(obj) {
  for (const k of DIMENSIONS) {
    const v = obj[k];
    if (!Number.isInteger(v) || v < 1 || v > 10) {
      throw new Error(`judge score ${k} must be an integer 1-10, got ${v}`);
    }
  }
  return obj;
}

async function callAnthropicWithImages({ apiKey, model, system, contextText, images }) {
  const content = [{ type: 'text', text: contextText }, ...images];
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens: 600, system, messages: [{ role: 'user', content }] }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Anthropic API error (${res.status}): ${body}`);
  const parsed = JSON.parse(body);
  const text = parsed.content?.find((c) => c.type === 'text')?.text?.trim();
  if (!text) throw new Error('Anthropic returned no text content');
  return validateScores(JSON.parse(stripFences(text)));
}

/**
 * @returns receipt object (always includes the screenshots + gates the judge was given).
 */
export async function judgeFromScreenshots({ slug, variant, prompt, evidence, outDir, model }) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const judgeModel = model || process.env.EVAL_JUDGE_MODEL || 'claude-opus-4-8';
  const screenshots = pickScreenshots(evidence, outDir);
  const gates = evidence.gates || {};

  const base = {
    slug,
    variant,
    judgeModel,
    screenshotsSent: screenshots.map((s) => ({ label: s.label, path: s.path })),
    gates,
  };

  if (!apiKey) {
    return {
      ...base,
      judged: false,
      reason: 'no ANTHROPIC_API_KEY — stub judge. Screenshots + gates above are what the real judge would receive.',
      scores: null,
    };
  }

  const system = await fs.readFile(PROMPT_PATH, 'utf8');
  const contextText = [
    `Product prompt: ${prompt}`,
    `Variant: ${variant}`,
    `Rendered-evidence gates: serious/critical axe violations=${gates.seriousAxeViolations}, ` +
      `horizontal overflow at=[${(gates.horizontalOverflowAt || []).join(', ')}], ` +
      `rendered font(s)=${(gates.renderedFonts || []).join(' | ') || 'unknown'}.`,
    `Screenshots follow (labels: ${screenshots.map((s) => s.label).join(', ')}). Score from what you see.`,
  ].join('\n');

  const images = await Promise.all(screenshots.map((s) => toImageBlock(s.path)));
  const scores = await callAnthropicWithImages({ apiKey, model: judgeModel, system, contextText, images });
  return { ...base, judged: true, scores, scoreTotal: DIMENSIONS.reduce((n, k) => n + scores[k], 0) };
}
