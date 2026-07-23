export const MCP_CONTRACT = {
  schemaVersion: 1,
  name: "ads-mcp",
  version: "0.1.0",
  transport: "local stdio",
  sequence: ["ads_render", "ads_evaluate", "ads_trace"],
  tools: [
    {
      name: "ads_render",
      step: "01",
      verb: "See",
      title: "Render the interface",
      description:
        "Capture a local URL or root-confined TSX component in a real browser, then run deterministic UI gates.",
      input: {
        target: { type: "url", url: "http://127.0.0.1:3000/mcp" },
        states: ["default"],
        viewports: [
          { width: 390, height: 844 },
          { width: 1280, height: 800 },
        ],
        waitFor: "main",
      },
      output: {
        status: "complete",
        capturedStates: ["default"],
        viewports: ["390x844", "1280x800"],
        seriousAxeViolations: 0,
        horizontalOverflowAt: [],
        touchTargetsUnder44: [],
      },
    },
    {
      name: "ads_evaluate",
      step: "02",
      verb: "Check",
      title: "Evaluate the evidence",
      description:
        "Normalize browser gates and optional visual comparison into a review packet without pretending deterministic checks are taste.",
      input: {
        runId: "run_mrwll3lh_3d44b4578720",
        rubric: {
          task: "Make the ADS MCP understandable on mobile and desktop",
          criteria: [
            { name: "Design Quality", weight: 35 },
            { name: "Originality", weight: 30 },
            { name: "Craft", weight: 20 },
            { name: "Functionality", weight: 15 },
          ],
        },
      },
      output: {
        status: "needs_human",
        verdict: null,
        scores: null,
        blockers: [],
      },
    },
    {
      name: "ads_trace",
      step: "03",
      verb: "Explain",
      title: "Trace the decisions",
      description:
        "Verify that consequential decisions map to captured skill rules, source constraints, implementation files, and evidence from the same run.",
      input: {
        runId: "run_mrwll3lh_3d44b4578720",
        context: "ADS MCP public lab",
        decisions: ["semantic-contract-surface"],
      },
      output: {
        valid: true,
        errors: [],
        resources: ["trace", "trace-validation"],
      },
    },
  ],
  resources: [
    "ads://runs/{runId}/manifest",
    "ads://runs/{runId}/evidence",
    "ads://runs/{runId}/receipt",
    "ads://runs/{runId}/report",
    "ads://runs/{runId}/trace",
    "ads://runs/{runId}/trace-validation",
    "ads://runs/{runId}/screenshots/{filename}",
  ],
  boundaries: {
    projectRoot: "Explicit --root; reads and writes stay inside it",
    network: "Localhost by default; other HTTP(S) origins require an allow-list",
    judgment: "v0.1 never makes a paid model call and returns needs_human for visual judgment",
    hosting: "Local stdio only; no remote MCP endpoint or hosted control plane",
  },
  source: "https://github.com/aa-on-ai/agentic-design-system/tree/main/packages/ads-mcp",
} as const;

export const FROZEN_RUN = {
  label: "Local MCP verification",
  runId: "run_mrwll3lh_3d44b4578720",
  capturedAt: "2026-07-22",
  client: "@modelcontextprotocol/sdk",
  browser: "Playwright Chromium",
  sequence: [
    { tool: "ads_render", result: "complete", detail: "2 viewports · 0 blocking gates" },
    { tool: "ads_evaluate", result: "needs_human", detail: "deterministic checks passed" },
    { tool: "ads_trace", result: "valid", detail: "decision provenance verified" },
  ],
  resourcesRead: ["evidence", "trace-validation"],
} as const;
