// new-page-component.mjs — ADS "new page/component" profile, compiled to a workflow.
//
// This is the spine made executable. An agent states a design OUTCOME; ADS compiles
// it into: build -> render-capture -> deterministic gates -> INDEPENDENT grader ->
// revise -> run-report. Run it with the Workflow tool (or adapt as a recipe).
//
// Why this is the proof, not just routing prose:
//   - The grader runs as a SEPARATE agent() and judges the SCREENSHOTS captured by
//     capture.mjs — not the .tsx source. "Separate-context grading" stops being a TODO.
//   - The hard gates are plain JS computed from rendered evidence.json (axe on the live
//     DOM, real horizontal-overflow, did the state actually render). None can be passed
//     by a comment in source — which is exactly the receipts hole this closes.
//
// args: {
//   outcome: string,        // user-facing outcome (who/accomplish/notice/states)
//   devUrl: string,         // running route to capture, e.g. "http://localhost:3000/orders"
//   targetFile: string,     // path the builder should write/edit
//   states?: string[],      // states the route exposes via #state= (default below)
//   maxIterations?: number, // revise budget (default 3)
// }

export const meta = {
  name: 'ads-new-page-component',
  description: 'ADS new page/component: build, render-capture, gate, independently grade, revise, report',
  phases: [
    { title: 'Build' },
    { title: 'Capture' },
    { title: 'Grade' },
    { title: 'Report' },
  ],
};

const a = args || {};
const OUTCOME = a.outcome || 'unspecified outcome';
const DEV_URL = a.devUrl;
const TARGET = a.targetFile || 'app/page.tsx';
const STATES = a.states && a.states.length ? a.states : ['default', 'empty', 'loading', 'error'];
const MAX_ITERS = a.maxIterations || 3;

if (!DEV_URL) {
  throw new Error('args.devUrl is required — the workflow gates on the RENDERED route, not source.');
}

const CAPTURE_SCHEMA = {
  type: 'object',
  required: ['evidencePath', 'seriousAxeViolations', 'horizontalOverflowAt', 'stateRendered', 'screenshots', 'renderedFonts'],
  properties: {
    evidencePath: { type: 'string', description: 'absolute path to evidence.json written by capture.mjs' },
    seriousAxeViolations: { type: 'number' },
    horizontalOverflowAt: { type: 'array', items: { type: 'string' } },
    stateRendered: { type: 'object', description: 'map of state -> boolean (did it render non-trivial content)' },
    screenshots: { type: 'array', items: { type: 'string' }, description: 'absolute paths to the captured PNGs' },
    renderedFonts: { type: 'array', items: { type: 'string' } },
  },
};

const GRADE_SCHEMA = {
  type: 'object',
  required: ['verdict', 'scores', 'failingRows', 'nextRevisionPrompt'],
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
    failingRows: { type: 'array', items: { type: 'string' } },
    nextRevisionPrompt: { type: 'string', description: 'bounded, testable instruction for the builder; empty if satisfied' },
  },
};

const history = [];
let iteration = 0;
let lastGrade = null;

while (iteration < MAX_ITERS) {
  iteration += 1;
  phase('Build');

  const buildInstruction = iteration === 1
    ? `Build to this outcome and write the result to ${TARGET}.\n\nOUTCOME:\n${OUTCOME}\n\n` +
      `Read skills/agentic-design-system/SKILL.md and run the core pack. The route must expose these states ` +
      `via the URL hash (#state=<name>) so they can be captured: ${STATES.join(', ')}. Return a one-line summary.`
    : `Revise ${TARGET}. The independent grader returned needs_revision.\n\n` +
      `EXACT REVISION INSTRUCTION:\n${lastGrade.nextRevisionPrompt}\n\nReturn a one-line summary of what you changed.`;

  await agent(buildInstruction, { label: `build:iter${iteration}`, phase: 'Build' });

  // --- Capture: render the live route and produce non-gameable evidence ---
  phase('Capture');
  const capture = await agent(
    `Run the ADS render-capture primitive against the live route, then report the facts.\n\n` +
      `Command:\n  node skills/design-review/scripts/capture.mjs "${DEV_URL}" ` +
      `--states ${STATES.join(',')} --out evidence/iter${iteration}\n\n` +
      `If playwright is not installed, install it first: npm i -D playwright @axe-core/playwright && npx playwright install chromium.\n` +
      `Then read evidence/iter${iteration}/evidence.json and return the gate facts and the absolute screenshot paths.`,
    { label: `capture:iter${iteration}`, phase: 'Capture', schema: CAPTURE_SCHEMA },
  );

  // --- Deterministic gates: plain JS over rendered evidence. Blocking. ---
  const missingStates = Object.entries(capture.stateRendered)
    .filter(([, rendered]) => !rendered)
    .map(([s]) => s);
  const hardGate = {
    axe: capture.seriousAxeViolations === 0,
    overflow: capture.horizontalOverflowAt.length === 0,
    states: missingStates.length === 0,
  };
  const gatePass = hardGate.axe && hardGate.overflow && hardGate.states;
  log(
    `iter${iteration} gates: axe=${hardGate.axe ? 'pass' : `FAIL(${capture.seriousAxeViolations})`}, ` +
      `overflow=${hardGate.overflow ? 'pass' : `FAIL(${capture.horizontalOverflowAt.join(',')})`}, ` +
      `states=${hardGate.states ? 'pass' : `FAIL(missing ${missingStates.join(',')})`}`,
  );

  // --- Independent grader: a SEPARATE agent that judges the SCREENSHOTS, not source ---
  phase('Grade');
  const grade = await agent(
    `You are an independent design grader. You did NOT build this. Judge ONLY the rendered screenshots.\n\n` +
      `OUTCOME the build must satisfy:\n${OUTCOME}\n\n` +
      `Read each screenshot image and score the ADS rubric (1-10): Design Quality (35%), Originality (30%), ` +
      `Craft (20%), Functionality (15%). Screenshots:\n${capture.screenshots.map((s) => `  - ${s}`).join('\n')}\n\n` +
      `Rendered font(s) actually used: ${capture.renderedFonts.join(', ') || 'unknown'}.\n` +
      `Deterministic gate result this iteration: ${gatePass ? 'PASS' : 'FAIL'} ` +
      `(axe serious=${capture.seriousAxeViolations}, overflow=[${capture.horizontalOverflowAt.join(',')}], missing states=[${missingStates.join(',')}]).\n\n` +
      `Rule: if the deterministic gate FAILED, you cannot return "satisfied". If Design Quality or Originality < 6, ` +
      `return needs_revision with a bounded, testable nextRevisionPrompt. Be direct; judge the artifact, not effort.`,
    { label: `grade:iter${iteration}`, phase: 'Grade', schema: GRADE_SCHEMA, agentType: 'Explore' },
  );

  lastGrade = grade;
  history.push({ iteration, gatePass, hardGate, capture, grade });

  if (gatePass && grade.verdict === 'satisfied') break;
  if (grade.verdict === 'failed') break;
}

// --- Report: emit the run-report artifact from collected evidence ---
phase('Report');
const final = history[history.length - 1];
const verdict = !final
  ? 'failed'
  : final.gatePass && final.grade.verdict === 'satisfied'
    ? 'satisfied'
    : iteration >= MAX_ITERS
      ? 'max_iterations'
      : final.grade.verdict;

const report = await agent(
  `Write a run report to RUN-REPORT.md using templates/run-report-template.md as the shape.\n\n` +
    `Verdict: ${verdict}. Iterations: ${iteration}/${MAX_ITERS}. Outcome: ${OUTCOME}.\n` +
    `Per-iteration evidence (gates computed from rendered DOM, grader judged screenshots):\n` +
    JSON.stringify(history.map((h) => ({
      iteration: h.iteration,
      gatePass: h.gatePass,
      hardGate: h.hardGate,
      seriousAxe: h.capture.seriousAxeViolations,
      overflow: h.capture.horizontalOverflowAt,
      stateRendered: h.capture.stateRendered,
      renderedFonts: h.capture.renderedFonts,
      graderVerdict: h.grade.verdict,
      scores: h.grade.scores,
      failingRows: h.grade.failingRows,
    })), null, 2) +
    `\n\nMake clear in the report which evidence is RENDERED (authoritative: axe, overflow, state-render, fonts, ` +
    `grader-on-screenshots) vs SOURCE heuristic (the python greps). Return the path written.`,
  { label: 'run-report', phase: 'Report' },
);

return { verdict, iterations: iteration, report, history };
