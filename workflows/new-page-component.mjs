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
//     DOM, real horizontal-overflow, semantic landmarks/live regions, CLS, and whether
//     the state actually rendered). None can be passed by a comment in source.
//
// args: {
//   outcome: string,        // user-facing outcome (who/accomplish/notice/states)
//   task?: string,          // alias for outcome when routing (used if outcome absent)
//   devUrl?: string,        // running route to capture, e.g. "http://localhost:3000/orders"
//   artifactPath?: string,  // OR: build a self-contained HTML file here and capture file:// (no dev server)
//   targetFile?: string,    // path the builder should write/edit (defaults to artifactPath or app/page.tsx)
//   states?: string[],      // states the route exposes via #state= (default below)
//   breakpoints?: string,   // comma-separated WxH viewports to gate at (default below); threaded into capture AND gates
//   route?: boolean,        // opt-in: run a dynamic Route phase that derives packs/breakpoints/rubric from the task
//   maxIterations?: number, // revise budget (default 3)
//   captureScript?: string, // path to capture.mjs (default: repo-root-relative); override for absolute runs
//   outDir?: string,        // evidence output root (default: "evidence")
//   reportPath?: string,    // run-report output path (default: "RUN-REPORT.md", relative to cwd)
// }
//
// One of devUrl or artifactPath is required — both gate on RENDERED output, never source.

export const meta = {
  name: 'ads-new-page-component',
  description: 'ADS new page/component: build, render-capture, gate, independently grade, revise, report',
  phases: [
    { title: 'Route' },
    { title: 'Build' },
    { title: 'Capture' },
    { title: 'Grade' },
    { title: 'Report' },
  ],
};

let a = args || {};
if (typeof a === 'string') {
  try { a = JSON.parse(a); } catch { a = {}; } // args can arrive JSON-encoded depending on the caller
}
const OUTCOME = a.outcome || a.task || 'unspecified outcome';
const DEV_URL = a.devUrl;
const ARTIFACT = a.artifactPath;
const TARGET = a.targetFile || ARTIFACT || 'app/page.tsx';
const STATES = a.states && a.states.length ? a.states : ['default', 'empty', 'loading', 'error'];
const MAX_ITERS = a.maxIterations || 3;
const ROUTE = a.route === true;
const CAPTURE_SCRIPT = a.captureScript || 'skills/design-review/scripts/capture.mjs';
const OUT_ROOT = a.outDir || 'evidence';
const REPORT_PATH = a.reportPath || 'RUN-REPORT.md';
const DEFAULT_BREAKPOINTS = '390x844,768x1024,1280x800';

if (!DEV_URL && !ARTIFACT) {
  throw new Error('args.devUrl or args.artifactPath is required — the workflow gates on RENDERED output, not source.');
}

// devUrl gates a running route; artifactPath builds a self-contained file and gates file:// (no dev server).
const ARTIFACT_MODE = !DEV_URL && !!ARTIFACT;
const CAPTURE_URL = DEV_URL || `file://${ARTIFACT}`;

const CAPTURE_SCHEMA = {
  type: 'object',
  required: [
    'evidencePath',
    'seriousAxeViolations',
    'horizontalOverflowAt',
    'landmarkFailures',
    'liveRegionFailures',
    'stateRendered',
    'touchTargetsUnder44',
    'clsAvailable',
    'clsThreshold',
    'maxCumulativeLayoutShift',
    'clsFailures',
    'screenshots',
    'renderedFonts',
  ],
  properties: {
    evidencePath: { type: 'string', description: 'absolute path to evidence.json written by capture.mjs' },
    seriousAxeViolations: { type: 'number' },
    horizontalOverflowAt: { type: 'array', items: { type: 'string' } },
    landmarkFailures: {
      type: 'array',
      description: 'rendered snapshots missing the required main landmark',
      items: { type: 'object' },
    },
    liveRegionFailures: {
      type: 'array',
      description: 'loading/error snapshots missing their required live-region semantics',
      items: { type: 'object' },
    },
    stateRendered: { type: 'object', description: 'map of state -> boolean (did it render non-trivial content)' },
    touchTargetsUnder44: {
      type: 'array',
      description: 'from evidence.json gates.touchTargetsUnder44 — interactive controls smaller than 44x44',
      items: {
        type: 'object',
        required: ['selector', 'size'],
        properties: {
          selector: { type: 'string' },
          size: { type: 'string' },
          state: { type: 'string' },
          breakpoint: { type: 'string' },
        },
      },
    },
    screenshots: { type: 'array', items: { type: 'string' }, description: 'absolute paths to the captured PNGs' },
    renderedFonts: { type: 'array', items: { type: 'string' } },
    clsAvailable: { type: 'boolean' },
    clsThreshold: { type: 'number' },
    maxCumulativeLayoutShift: { type: 'number' },
    clsFailures: {
      type: 'array',
      description: 'state/breakpoint samples whose CLS exceeded clsThreshold',
      items: { type: 'object' },
    },
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

// --- Route (opt-in): derive packs/breakpoints/rubric from the task before building ---
const PLAN_SCHEMA = {
  type: 'object',
  required: ['packs', 'breakpoints', 'rubric'],
  properties: {
    packs: { type: 'array', items: { type: 'string' } },
    breakpoints: { type: 'string', description: 'comma-separated WxH; MUST include a mobile <=414w so responsive is tested' },
    rubric: { type: 'array', items: { type: 'string' }, description: '3-6 task-specific criteria the grader judges against' },
  },
};

let BREAKPOINTS = (a.breakpoints && a.breakpoints.trim()) || DEFAULT_BREAKPOINTS;
let routedRubric = null;
if (ROUTE) {
  phase('Route');
  const plan = await agent(
    `You are the ADS router. Read routing/ROUTING.md.\n\nTASK / OUTCOME:\n${OUTCOME}\n\n` +
      `Return: which packs apply; the comma-separated breakpoints to gate at (include at least one mobile <=414w, ` +
      `e.g. "${DEFAULT_BREAKPOINTS}"); and a 3-6 item task-specific rubric the grader will judge the RENDERED result against. ` +
      `Gates must be checkable from rendered evidence (serious axe, all states render, no horizontal overflow, ` +
      `main/live-region semantics, CLS within budget).`,
    { label: 'route', phase: 'Route', schema: PLAN_SCHEMA, agentType: 'Explore' },
  );
  if (plan.breakpoints && plan.breakpoints.trim()) BREAKPOINTS = plan.breakpoints.trim();
  routedRubric = plan.rubric;
  log(`routed: packs=[${plan.packs.join(', ')}] breakpoints=${BREAKPOINTS} rubric=${plan.rubric.length}`);
}

const history = [];
let iteration = 0;
let lastGrade = null;

while (iteration < MAX_ITERS) {
  iteration += 1;
  phase('Build');

  const responsiveNote =
    `It must not horizontally overflow at any breakpoint down to 390px (box-sizing:border-box, max-width:100%, ` +
    `wrap or scroll wide tables). If a scroll container is used, it MUST be keyboard-accessible (tabindex="0" + aria-label) ` +
    `to avoid the axe "scrollable-region-focusable" violation. Target breakpoints: ${BREAKPOINTS}.`;
  const firstBuild = ARTIFACT_MODE
    ? `Build to this outcome as a SINGLE self-contained HTML file written to ${ARTIFACT} (create the dir if needed).\n\n` +
      `OUTCOME:\n${OUTCOME}\n\nRead testing/fixtures/states-demo.html to copy its mechanism for toggling states via the ` +
      `URL hash (#state=<name>); your file MUST expose these states the same way: ${STATES.join(', ')}, each rendering ` +
      `distinct content. ${responsiveNote} Write the file with the Write tool and return its absolute path.`
    : `Build to this outcome and write the result to ${TARGET}.\n\nOUTCOME:\n${OUTCOME}\n\n` +
      `Read skills/agentic-design-system/SKILL.md and run the core pack. The route must expose these states ` +
      `via the URL hash (#state=<name>) so they can be captured: ${STATES.join(', ')}. ${responsiveNote} Return a one-line summary.`;
  const buildInstruction = iteration === 1
    ? firstBuild
    : `Revise ${ARTIFACT_MODE ? ARTIFACT : TARGET}. The independent grader returned needs_revision.\n\n` +
      `EXACT REVISION INSTRUCTION:\n${lastGrade.nextRevisionPrompt}\n\n` +
      `Do NOT introduce any new axe violations, and fix the specific rendered-evidence failure cited. ` +
      `If touch targets are cited: give EVERY interactive control a >=44px target in every state — buttons/inputs/selects via min-height + padding, ` +
      `and inline text links via display:inline-block with padding (or min-height/min-width) so the clickable box clears 44px. Don't miss row links. ` +
      `Return a one-line summary of what you changed.`;

  await agent(buildInstruction, { label: `build:iter${iteration}`, phase: 'Build' });

  // --- Capture: render the live route and produce non-gameable evidence ---
  phase('Capture');
  const capture = await agent(
    `Run the ADS render-capture primitive against the rendered output, then report the facts.\n\n` +
      `Command:\n  node ${CAPTURE_SCRIPT} "${CAPTURE_URL}" ` +
      `--states ${STATES.join(',')} --breakpoints ${BREAKPOINTS} --out ${OUT_ROOT}/iter${iteration}\n\n` +
      `If playwright is not installed, install it first: npm i -D playwright @axe-core/playwright && npx playwright install chromium.\n` +
      `Then read ${OUT_ROOT}/iter${iteration}/evidence.json and return the gate facts and the absolute screenshot paths. ` +
      `Do not summarize or invent results — run the command and report what evidence.json actually contains.`,
    { label: `capture:iter${iteration}`, phase: 'Capture', schema: CAPTURE_SCHEMA },
  );

  // --- Deterministic gates: plain JS over rendered evidence. Blocking. ---
  const missingStates = Object.entries(capture.stateRendered)
    .filter(([, rendered]) => !rendered)
    .map(([s]) => s);
  const smallTargets = capture.touchTargetsUnder44 || [];
  const landmarkFailures = capture.landmarkFailures || [];
  const liveRegionFailures = capture.liveRegionFailures || [];
  const clsFailures = capture.clsFailures || [];
  const smallTargetSummary = [...new Set(smallTargets.map((t) => `${t.selector} (${t.size})`))].slice(0, 8).join(', ');
  const hardGate = {
    axe: capture.seriousAxeViolations === 0,
    overflow: capture.horizontalOverflowAt.length === 0,
    landmarks: landmarkFailures.length === 0,
    liveRegions: liveRegionFailures.length === 0,
    states: missingStates.length === 0,
    touchTargets: smallTargets.length === 0,
    cls: capture.clsAvailable === true && clsFailures.length === 0,
  };
  const gatePass = Object.values(hardGate).every(Boolean);
  log(
    `iter${iteration} gates: axe=${hardGate.axe ? 'pass' : `FAIL(${capture.seriousAxeViolations})`}, ` +
      `overflow=${hardGate.overflow ? 'pass' : `FAIL(${capture.horizontalOverflowAt.join(',')})`}, ` +
      `landmarks=${hardGate.landmarks ? 'pass' : `FAIL(${landmarkFailures.length})`}, ` +
      `liveRegions=${hardGate.liveRegions ? 'pass' : `FAIL(${liveRegionFailures.length})`}, ` +
      `states=${hardGate.states ? 'pass' : `FAIL(missing ${missingStates.join(',')})`}, ` +
      `touchTargets=${hardGate.touchTargets ? 'pass' : `FAIL(${smallTargets.length}: ${smallTargetSummary})`}, ` +
      `cls=${hardGate.cls ? `pass(${capture.maxCumulativeLayoutShift})` : `FAIL(max=${capture.maxCumulativeLayoutShift}, unavailable=${!capture.clsAvailable}, samples=${clsFailures.length})`}`,
  );

  // --- Independent grader: a SEPARATE agent that judges the SCREENSHOTS, not source ---
  phase('Grade');
  const grade = await agent(
    `You are an independent design grader. You did NOT build this. Judge ONLY the rendered screenshots.\n\n` +
      `OUTCOME the build must satisfy:\n${OUTCOME}\n\n` +
      `Read each screenshot image and score the ADS rubric (1-10): Design Quality (35%), Originality (30%), ` +
      `Craft (20%), Functionality (15%). Screenshots (captured at ${BREAKPOINTS}):\n${capture.screenshots.map((s) => `  - ${s}`).join('\n')}\n\n` +
      (routedRubric ? `Task-specific criteria to also weigh:\n${routedRubric.map((r) => `  - ${r}`).join('\n')}\n\n` : '') +
      `Rendered font(s) actually used: ${capture.renderedFonts.join(', ') || 'unknown'}.\n` +
      `Deterministic gate result this iteration: ${gatePass ? 'PASS' : 'FAIL'} ` +
      `(axe serious=${capture.seriousAxeViolations}, overflow=[${capture.horizontalOverflowAt.join(',')}], missing states=[${missingStates.join(',')}], ` +
      `touch targets <44px=${smallTargets.length}${smallTargets.length ? ` [${smallTargetSummary}]` : ''}, ` +
      `landmark failures=${landmarkFailures.length}, live-region failures=${liveRegionFailures.length}, ` +
      `max CLS=${capture.maxCumulativeLayoutShift}/${capture.clsThreshold}, CLS failures=${clsFailures.length}).\n\n` +
      `Rule: if the deterministic gate FAILED, you cannot return "satisfied". If touch targets failed, the nextRevisionPrompt MUST ` +
      `instruct enlarging the listed interactive controls (links, buttons, inputs, selects) to a minimum 44x44px target at mobile ` +
      `(e.g. padding or min-height/min-width), without breaking layout. ` +
      `If landmark, live-region, or CLS gates failed, the nextRevisionPrompt MUST cite the failing state/breakpoint and required repair. ` +
      `Prefer needs_revision over failed while the failing gates are mechanically fixable (touch-target sizing, semantics, CLS, axe issues, overflow) ` +
      `and revise iterations remain — reserve "failed" for a genuinely wrong direction, not a fixable defect. ` +
      `If Design Quality or Originality < 6, ` +
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
  `Write a run report to ${REPORT_PATH} using templates/run-report-template.md as the shape.\n\n` +
    `Verdict: ${verdict}. Iterations: ${iteration}/${MAX_ITERS}. Outcome: ${OUTCOME}.\n` +
    `Per-iteration evidence (gates computed from rendered DOM, grader judged screenshots):\n` +
    JSON.stringify(history.map((h) => ({
      iteration: h.iteration,
      gatePass: h.gatePass,
      hardGate: h.hardGate,
      seriousAxe: h.capture.seriousAxeViolations,
      overflow: h.capture.horizontalOverflowAt,
      landmarkFailures: h.capture.landmarkFailures,
      liveRegionFailures: h.capture.liveRegionFailures,
      stateRendered: h.capture.stateRendered,
      touchTargetsUnder44: (h.capture.touchTargetsUnder44 || []).length,
      clsAvailable: h.capture.clsAvailable,
      clsThreshold: h.capture.clsThreshold,
      maxCumulativeLayoutShift: h.capture.maxCumulativeLayoutShift,
      clsFailures: h.capture.clsFailures,
      renderedFonts: h.capture.renderedFonts,
      graderVerdict: h.grade.verdict,
      scores: h.grade.scores,
      failingRows: h.grade.failingRows,
    })), null, 2) +
    `\n\nMake clear in the report which evidence is RENDERED (authoritative: axe, overflow, landmarks/live regions, CLS, state-render, fonts, ` +
    `grader-on-screenshots) vs SOURCE heuristic (the python greps). Return the path written.`,
  { label: 'run-report', phase: 'Report' },
);

return { verdict, iterations: iteration, report, history };
