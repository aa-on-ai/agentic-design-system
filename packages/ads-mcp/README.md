# ads-mcp

Local MCP adapter for Agentic Design System. It turns ADS rendering, deterministic gates,
evaluation receipts, and decision provenance into a stable three-tool sequence for coding agents.

## Build and run

From the ADS repository:

```bash
npm --prefix packages/ads-mcp install
npm --prefix packages/ads-mcp run build
npx playwright install chromium
node packages/ads-mcp/dist/cli.js --root /absolute/path/to/project
```

The published-package command will be:

```bash
npx ads-mcp --root /absolute/path/to/project
```

Optional server flags:

- `--runs-dir <relative-path>` changes the run directory under the project root. The default is
  `.ads/runs`.
- `--allow-origin <origin>` allows one non-local HTTP(S) origin. Repeat the flag for additional
  origins.
- `--timeout-ms <number>` changes the per-tool timeout. The default is 30 seconds.

## Client configuration

Use the built binary as a local stdio server. Replace both absolute paths:

```json
{
  "mcpServers": {
    "ads": {
      "command": "node",
      "args": [
        "/absolute/path/to/agentic-design-system/packages/ads-mcp/dist/cli.js",
        "--root",
        "/absolute/path/to/project"
      ]
    }
  }
}
```

The server initialization instructions tell clients to use this sequence:

```text
ads_render -> ads_evaluate -> ads_trace
```

## Tools

### `ads_render`

Render an allowed URL or root-confined TSX component. The tool captures requested states and
viewports, runs the existing ADS rendered gates, and returns `ads://runs/...` resources.

```json
{
  "target": { "type": "url", "url": "http://127.0.0.1:3000/orders" },
  "states": ["default", "loading", "empty", "error"],
  "viewports": [{ "width": 390, "height": 844 }, { "width": 1280, "height": 800 }],
  "waitFor": "main",
  "provenance": {
    "observedSkillFiles": ["skills/design-review/SKILL.md"],
    "sourceFiles": ["brief.md"],
    "artifactFiles": ["src/Orders.tsx"]
  }
}
```

A render is `complete` only when axe, overflow, landmarks and live regions, requested states, CLS,
and touch-target gates have usable passing evidence. Missing browser dependencies, timeouts, and
gate failures return a preserved `blocked` run instead of a false success.

### `ads_evaluate`

Normalize a rendered run and optionally compare it with another run. In v0.1, `judge.mode` is
`none`; visual judgment therefore returns `needs_human` even when deterministic gates pass.

```json
{
  "runId": "run_...",
  "compareToRunId": "run_optional_baseline",
  "rubric": {
    "task": "Make the orders workflow understandable on mobile and desktop",
    "criteria": [
      { "name": "Design Quality", "weight": 35 },
      { "name": "Originality", "weight": 30 },
      { "name": "Craft", "weight": 20 },
      { "name": "Functionality", "weight": 15 }
    ]
  }
}
```

### `ads_trace`

Verify final decisions against files hashed during render. Rule files must have been recorded as
observed, source and artifact files must be present and unchanged, excerpts must be exact, and all
evidence URIs must resolve inside the same run.

```json
{
  "runId": "run_...",
  "context": "Orders responsive repair",
  "decisions": [
    {
      "id": "mobile-primary-action",
      "decision": "Keep the primary action reachable on mobile.",
      "artifact": { "path": "src/Orders.tsx", "location": "Primary action row" },
      "rule": {
        "path": "skills/design-review/SKILL.md",
        "excerpt": "All consequential controls need a visible, reachable interaction target."
      },
      "sourceConstraint": {
        "path": "brief.md",
        "excerpt": "The primary action must remain reachable on mobile."
      },
      "evidence": ["ads://runs/run_.../evidence"]
    }
  ]
}
```

## Artifacts and security

Run artifacts live under `<root>/.ads/runs/<runId>/`. Tools return short structured results and
read-only resource links for manifests, rendered evidence, screenshots, evaluation receipts,
reports, traces, and trace validation.

- No arbitrary command tool or caller-selected output path.
- Project file reads and run writes stay under `--root`, including symlink checks.
- URL inputs must use HTTP(S). Localhost is allowed by default; other origins need startup
  allow-listing.
- URL credentials are rejected and common secret query parameters are redacted from receipts.
- Paid model calls are not implemented in v0.1.

## Verify

```bash
npm test
```

The suite covers the real stdio initialization flow, a complete MCP client sequence, Chromium URL
and TSX component capture, rendered comparisons, resource reads, repeated stage receipts, timeout
and incomplete-evidence behavior, path traversal, symlink escape, origin denial, and trace failure
cases.

## v0.1 limits

- Local stdio only. No remote HTTP, OAuth, hosted service, or MCP App UI.
- Web rendering only. SwiftUI and other platform adapters are post-v0.1 work.
- Human visual judgment remains required.
- The package is not yet published to npm or the MCP Registry.

See `../../docs/ads-mcp-api-contract.md` in the source repository for the canonical contract.
