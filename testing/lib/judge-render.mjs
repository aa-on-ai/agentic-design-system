// judge-render.mjs — grade a rendered variant from its SCREENSHOTS (not TSX source).
//
// The judge receives PNGs + rendered-evidence gates instead of code.
//
// Anthropic and OpenAI image judging are supported. Without a matching provider key, the
// receipt remains unresolved and carries the screenshots + gates needed for human review.

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

async function toOpenAIImageBlock(file) {
  const data = await fs.readFile(file);
  return {
    type: 'input_image',
    image_url: `data:image/png;base64,${data.toString('base64')}`,
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

async function callOpenAIWithImages({ apiKey, model, system, contextText, images }) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: system }] },
        { role: 'user', content: [{ type: 'input_text', text: contextText }, ...images] },
      ],
      text: { format: { type: 'text' } },
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`OpenAI API error (${res.status}): ${body}`);
  const parsed = JSON.parse(body);
  const text = parsed.output_text?.trim() || parsed.output?.flatMap((item) => item.content || []).find((item) => item.text)?.text?.trim();
  if (!text) throw new Error('OpenAI returned no text content');
  return validateScores(JSON.parse(stripFences(text)));
}

function isAnthropicModel(model) {
  return /^(claude|anthropic)/i.test(model);
}

function keyForModel(model, apiKeys = {}) {
  return isAnthropicModel(model)
    ? apiKeys.anthropic || process.env.ANTHROPIC_API_KEY?.trim()
    : apiKeys.openai || process.env.OPENAI_API_KEY?.trim();
}

async function callJudge({ model, apiKey, system, contextText, screenshotFiles }) {
  if (isAnthropicModel(model)) {
    const images = await Promise.all(screenshotFiles.map((file) => toImageBlock(file)));
    return callAnthropicWithImages({ apiKey, model, system, contextText, images });
  }
  const images = await Promise.all(screenshotFiles.map((file) => toOpenAIImageBlock(file)));
  return callOpenAIWithImages({ apiKey, model, system, contextText, images });
}

/**
 * @returns receipt object (always includes the screenshots + gates the judge was given).
 */
export async function judgeFromScreenshots({ slug, variant, prompt, evidence, outDir, model, fallbackModel, apiKeys = {} }) {
  const judgeModel = model || process.env.EVAL_JUDGE_MODEL || 'claude-opus-4-8';
  const judgeFallbackModel = fallbackModel || process.env.EVAL_JUDGE_FALLBACK_MODEL?.trim() || null;
  const screenshots = pickScreenshots(evidence, outDir);
  const gates = evidence.gates || {};

  const base = {
    slug,
    variant,
    judgeModel,
    screenshotsSent: screenshots.map((s) => ({ label: s.label, path: s.path })),
    gates,
  };

  const availableModels = [judgeModel, judgeFallbackModel]
    .filter((candidate, index, all) => candidate && all.indexOf(candidate) === index)
    .filter((candidate) => keyForModel(candidate, apiKeys));

  if (availableModels.length === 0) {
    return {
      ...base,
      judged: false,
      reason: 'no judge API key — human review required. Screenshots + gates above are the review packet.',
      scores: null,
    };
  }

  const system = await fs.readFile(PROMPT_PATH, 'utf8');
  const contextText = [
    `Product prompt: ${prompt}`,
    `Variant: ${variant}`,
    `Rendered-evidence gates: serious/critical axe violations=${gates.seriousAxeViolations}, ` +
      `horizontal overflow at=[${(gates.horizontalOverflowAt || []).join(', ')}], ` +
      `touch targets under 44x44=${(gates.touchTargetsUnder44 || []).length}, ` +
      `main-landmark failures=${Array.isArray(gates.landmarkFailures) ? gates.landmarkFailures.length : 'unmeasured'}, ` +
      `live-region failures=${Array.isArray(gates.liveRegionFailures) ? gates.liveRegionFailures.length : 'unmeasured'}, ` +
      `max CLS=${gates.clsAvailable === true ? gates.maxCumulativeLayoutShift : 'unavailable'} ` +
      `(threshold=${gates.clsThreshold ?? 'unknown'}, failures=${Array.isArray(gates.clsFailures) ? gates.clsFailures.length : 'unmeasured'}), ` +
      `distinct states=${Object.entries(gates.stateRendered || {}).map(([state, rendered]) => `${state}=${rendered ? 'yes' : 'NO'}`).join(' ') || 'unknown'}, ` +
      `rendered font(s)=${(gates.renderedFonts || []).join(' | ') || 'unknown'}.`,
    `Screenshots follow (labels: ${screenshots.map((s) => s.label).join(', ')}). Score from what you see.`,
  ].join('\n');

  let primaryFailure = null;
  for (const candidate of availableModels) {
    try {
      const scores = await callJudge({
        model: candidate,
        apiKey: keyForModel(candidate, apiKeys),
        system,
        contextText,
        screenshotFiles: screenshots.map((s) => s.path),
      });
      return {
        ...base,
        judgeModel: candidate,
        fallbackUsed: candidate !== judgeModel,
        primaryFailure,
        judged: true,
        scores,
        scoreTotal: DIMENSIONS.reduce((n, k) => n + scores[k], 0),
      };
    } catch (error) {
      if (!primaryFailure) primaryFailure = error instanceof Error ? error.message : String(error);
    }
  }

  return {
    ...base,
    judged: false,
    scores: null,
    primaryFailure,
    reason: 'independent rendered judge failed; human review required',
  };
}
