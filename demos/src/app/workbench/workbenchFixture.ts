import { WORKBENCH_SESSION_SCHEMA_ID, type PresetId, type WorkbenchSession } from "./workbenchSession";

export type { PresetId } from "./workbenchSession";
export type IntentId = "explore" | "build" | "review";
export type EvidenceStatus = "observed" | "planned" | "not-run";

export const WORKBENCH_FALLBACK_SESSION = {
  $schema: WORKBENCH_SESSION_SCHEMA_ID,
  schemaVersion: 1,
  kind: "ads.workbench.session",
  inspector: {
    version: "0.1.0",
    mode: "read-only",
    sourceFingerprint: "6eec45c7ecb8776d388063933ff763913f8233ee7b9bb68cdfd67ff236153a5c",
  },
  project: {
    root: "/fixture/agentic-design-system",
    rootLabel: "agentic-design-system",
  },
  intake: {
    status: "needs-human",
    sources: [
      {
        path: "README.md",
        kind: "product-doc",
        contentSha256: "5d32a51a3a5e860ec5d22a55adb3ca264ea6deef540b1aba865b7fa346eb27b4",
        bytes: 13028,
      },
      {
        path: "presets/README.md",
        kind: "design-guidelines",
        contentSha256: "e4e5b6cbcac8180275cc697762d0e933bce0e330271e84e7a5712d530d10672a",
        bytes: 1804,
      },
      {
        path: "demos/src/app/globals.css",
        kind: "design-tokens",
        contentSha256: "260516d9bff51c01b1296081fabc64e76eb9f1139fd9084312c11c13af587fbb",
        bytes: 62141,
      },
      {
        path: "templates/run-report-template.md",
        kind: "prior-decision",
        contentSha256: "32d0213082c1cc6b90171ef927650ea9fe00ada1b3428c722253dba831224bf5",
        bytes: 8661,
      },
    ],
    claims: {
      name: {
        state: "inferred",
        value: "Agentic Design System",
        evidenceQuality: "direct-declaration",
        reasons: [
          {
            code: "readme-project-name",
            statement: "The README directly declares the project name.",
            evidence: [{ source: "README.md", locator: { type: "lines", start: 1, end: 1 } }],
          },
        ],
      },
      description: {
        state: "inferred",
        value: "Repo-local design governance for coding agents, with rendered proof for humans.",
        evidenceQuality: "direct-declaration",
        reasons: [
          {
            code: "readme-product-description",
            statement: "The README defines ADS as repo-local design governance rather than a hosted generator.",
            evidence: [{ source: "README.md", locator: { type: "lines", start: 3, end: 9 } }],
          },
        ],
      },
      audience: {
        state: "inferred",
        value: "Design-minded builders working on real product repositories.",
        evidenceQuality: "single-signal",
        reasons: [
          {
            code: "readme-audience-language",
            statement: "The product and installation language consistently addresses builders using coding agents.",
            evidence: [{ source: "README.md", locator: { type: "file" } }],
          },
        ],
      },
      surface: {
        state: "inferred",
        value: "Public workshop, reusable skills, presets, and evidence contracts.",
        evidenceQuality: "cross-source",
        reasons: [
          {
            code: "repository-surface-signals",
            statement: "The workshop tokens, preset guide, and run-report template describe the current product surface.",
            evidence: [
              { source: "demos/src/app/globals.css", locator: { type: "file" } },
              { source: "presets/README.md", locator: { type: "file" } },
              { source: "templates/run-report-template.md", locator: { type: "file" } },
            ],
          },
        ],
      },
    },
    preset: {
      state: "inferred",
      value: "marketing-editorial",
      evidenceQuality: "cross-source",
      reasons: [
        {
          code: "public-surface-posture",
          statement: "The public workshop explains a product through a visual story.",
          evidence: [
            { source: "README.md", locator: { type: "file" } },
            { source: "presets/README.md", locator: { type: "file" } },
          ],
        },
        {
          code: "existing-visual-language",
          statement: "The existing surface already uses a specific editorial and industrial language.",
          evidence: [{ source: "demos/src/app/globals.css", locator: { type: "file" } }],
        },
      ],
    },
    questions: [
      {
        id: "preset-scope",
        blocks: "preset-recommendation",
        prompt: "Should the preset describe the public ADS project or the utility Workbench shell?",
      },
    ],
    notices: [],
  },
} satisfies WorkbenchSession;

export const FALLBACK_PROJECT_COPY = {
  project: {
    name: "Agentic Design System",
    description: "Repo-local design governance for coding agents, with rendered proof for humans.",
    audience: "Design-minded builders working on real product repositories.",
    surface: "Public workshop, reusable skills, presets, and evidence contracts.",
  },
  recommendation: {
    preset: "marketing-editorial" as PresetId,
    confidence: "High",
    reasons: [
      "The public workshop explains a product through a visual story.",
      "The existing surface already uses a specific editorial and industrial language.",
    ],
    uncertainty:
      "The Workbench itself is utility UI. This preset describes the ADS project being worked on, not the shell you are using.",
  },
};

export const PRESETS: Array<{ id: PresetId; label: string; note: string }> = [
  {
    id: "marketing-editorial",
    label: "Marketing and editorial",
    note: "Narrative hierarchy for public-facing work.",
  },
  {
    id: "utilitarian-app",
    label: "Utilitarian app",
    note: "Calm flows where task clarity leads.",
  },
  {
    id: "dense-dashboard",
    label: "Dense dashboard",
    note: "Compact comparison of many signals.",
  },
];

export const STARTING_POINT_PROFILES: Record<PresetId, {
  summary: string;
  principles: [string, string, string];
}> = {
  "marketing-editorial": {
    summary: "A type-led public product with deliberate narrative pacing and a clear visual point of view.",
    principles: [
      "Lead with narrative hierarchy and strong typography.",
      "Use pacing and composition before adding interface chrome.",
      "Keep the public product expressive and the workflow clear.",
    ],
  },
  "utilitarian-app": {
    summary: "A calm product workflow that prioritizes task completion, plain language, and predictable interaction.",
    principles: [
      "Make the current task and next action unmistakable.",
      "Use familiar controls and whitespace-led grouping.",
      "Keep evidence close without turning the flow into a dashboard.",
    ],
  },
  "dense-dashboard": {
    summary: "A comparison-rich product surface designed to hold many simultaneous signals without losing hierarchy.",
    principles: [
      "Prioritize scanability across related evidence.",
      "Use compact, repeatable structures for comparison.",
      "Preserve clear responsive collapse decisions.",
    ],
  },
};

export const PRESET_EXPLANATIONS: Record<PresetId, { reasons: string[]; nuance: string }> = {
  "marketing-editorial": {
    reasons: FALLBACK_PROJECT_COPY.recommendation.reasons,
    nuance: FALLBACK_PROJECT_COPY.recommendation.uncertainty,
  },
  "utilitarian-app": {
    reasons: [
      "The task is a focused product workflow where clarity should lead.",
      "The shell should stay calm while evidence and the next action remain explicit.",
    ],
    nuance: "This correction treats Workbench as the product surface rather than the public ADS workshop.",
  },
  "dense-dashboard": {
    reasons: [
      "The task depends on comparing many signals without losing context.",
      "Evidence density and responsive collapse decisions matter more than narrative pacing.",
    ],
    nuance: "This correction only fits when the Workbench becomes comparison-heavy. The current journey is intentionally simpler.",
  },
};

export const INTENTS: Array<{
  id: IntentId;
  label: string;
  description: string;
  route: string;
}> = [
  {
    id: "explore",
    label: "Explore options",
    description: "Compare a few disposable directions before production work begins.",
    route: "Browser exploration with matched content and viewports",
  },
  {
    id: "build",
    label: "Build a direction",
    description: "Turn an approved direction into the real product stack and verify it.",
    route: "Production implementation with the full quality gate",
  },
  {
    id: "review",
    label: "Review existing interface",
    description: "Inspect a working surface, name concrete failures, and return a verdict.",
    route: "Rendered review with evidence and one bounded repair pass",
  },
];

export const REPORTS: Record<IntentId, {
  verdict: string;
  recommendation: string;
  tradeoff: string;
  nextAction: string;
  evidence: Array<{ label: string; value: string; detail: string; status: EvidenceStatus }>;
}> = {
  explore: {
    verdict: "Ready to explore",
    recommendation: "Compare two workshop directions before touching production code.",
    tradeoff: "A short exploration round costs time now but keeps unselected structure disposable.",
    nextAction: "Create the matched desktop and mobile comparison artifact.",
    evidence: [
      { label: "Context", value: "4 sources observed", detail: "Project identity is specific enough to frame the options.", status: "observed" },
      { label: "Invariant", value: "Planned", detail: "Content, state, and target viewports will stay fixed.", status: "planned" },
      { label: "Checks", value: "Not run", detail: "No generator or browser run has started in this mock report.", status: "not-run" },
    ],
  },
  build: {
    verdict: "Ready to build",
    recommendation: "Implement the approved direction in the existing product stack.",
    tradeoff: "Production fidelity increases confidence but removes the speed of a disposable sketch.",
    nextAction: "Write the scoped handoff and run the full rendered gate.",
    evidence: [
      { label: "Context", value: "Session sources observed", detail: "The project posture is grounded in the loaded intake.", status: "observed" },
      { label: "Target", value: "Planned", detail: "The production target would be named in the real handoff.", status: "planned" },
      { label: "Checks", value: "Not run", detail: "No production mutation or rendered gate has started in this mock report.", status: "not-run" },
    ],
  },
  review: {
    verdict: "Ready to review",
    recommendation: "Review the existing product surface at desktop and mobile before proposing a repair.",
    tradeoff: "A rendered review may recommend no change when the evidence is already strong.",
    nextAction: "Capture the live states and return a grounded verdict with failed checks.",
    evidence: [
      { label: "Context", value: "4 sources observed", detail: "The review knows what the product is trying to communicate.", status: "observed" },
      { label: "Viewports", value: "Planned", detail: "Desktop at 1440 and iOS-like mobile at 375 are both required.", status: "planned" },
      { label: "Checks", value: "Not run", detail: "Rendered inspection has not begun in this mock report.", status: "not-run" },
    ],
  },
};
