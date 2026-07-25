# ads-mcp

![Agentic Design System logo](./assets/ads-mark.png)

Local MCP adapter for Agentic Design System. It turns ADS rendering, deterministic gates,
evaluation receipts, and decision provenance into a stable three-tool sequence for coding agents.

## Run from npm

Point the server at the project whose UI you want ADS to inspect:

```bash
npx --yes ads-mcp@0.2.0 --root /absolute/path/to/project
```

The package installs its own Chromium runtime. If installation ran with
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`, install the browser once:

```bash
npx --package playwright-chromium playwright install chromium
```

## Build from source

From the ADS repository:

```bash
npm --prefix packages/ads-mcp install
npm --prefix packages/ads-mcp run build
node packages/ads-mcp/dist/cli.js --root /absolute/path/to/project
```

Optional server flags:

- `--runs-dir <relative-path>` changes the run directory under the project root. The default is
  `.ads/runs`.
- `--allow-origin <origin>` allows one non-local HTTP(S) origin. Repeat the flag for additional
  origins.
- `--timeout-ms <number>` changes the per-tool timeout. The default is 30 seconds.
- `--judge-command`, `--judge-provider`, and `--judge-model` configure an explicit visual-judge
  adapter. `--judge-arg` is repeatable.
- `--swiftui-command` configures a SwiftUI snapshot adapter. `--swiftui-arg` and
  `--swiftui-detector` are repeatable; `--swiftui-renderer` labels the renderer in run manifests.

## Client configuration

Use the published package as a local stdio server. Replace the project path:

```json
{
  "mcpServers": {
    "ads": {
      "command": "npx",
      "args": [
        "--yes",
        "ads-mcp@0.2.0",
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

Registry name: `io.github.aa-on-ai/agentic-design-system`.

## Tools

### `ads_render`

Render an allowed URL, root-confined TSX component, or startup-configured SwiftUI target. The tool
captures requested states and viewports, runs the applicable platform gates, and returns
`ads://runs/...` resources.

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

SwiftUI uses the same public tool through an external snapshot adapter:

```json
{
  "target": {
    "type": "swiftui",
    "projectPath": "Orders.xcodeproj",
    "scheme": "Orders",
    "sourcePath": "Orders/ContentView.swift",
    "configuration": "Debug",
    "device": "iPhone 16 Pro"
  },
  "states": ["default", "loading", "empty", "error"],
  "viewports": [{ "width": 393, "height": 852 }]
}
```

### `ads_evaluate`

Normalize a rendered run and optionally compare it with another run. The default
`judge.mode: "none"` remains model-free and returns `needs_human` when deterministic gates pass.
`judge.mode: "configured"` invokes the visual-judge adapter selected at server startup and returns
a typed verdict, rubric scores, findings, and next revision prompt.

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
  },
  "judge": { "mode": "configured" }
}
```

The server validates exact rubric score keys, ADS finding categories, severities, evidence links,
normalized screenshot regions, and verdict consistency before accepting the result. Missing,
timed-out, or inconsistent judge output returns `blocked`, never a pass.

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
- External adapters run as fixed argv processes without a shell. Executables must be absolute
  paths and stdout is bounded.
- A model call requires both startup configuration and per-evaluation
  `judge.mode: "configured"`; provider, model, and call count are written to the receipt.

## Verify

```bash
npm test
```

The suite covers the real stdio initialization flow, a complete MCP client sequence, Chromium URL
and TSX component capture, command-adapter JSON exchange, configured visual verdicts, SwiftUI
snapshot evidence, rendered comparisons, resource reads, repeated stage receipts, timeout and
incomplete-evidence behavior, path traversal, symlink escape, origin denial, and trace failures.

## v0.2 limits

- Local stdio only. No remote HTTP, OAuth, hosted service, or MCP App UI.
- The core package does not bundle provider SDKs, select a model, or ship a universal Xcode
  snapshot harness. Operators supply explicit command adapters for their environment.
- SwiftUI evidence depends on the configured adapter's build, state injection, and detector
  capabilities.
- The default path remains deterministic and returns `needs_human`; automated judgment is
  deliberately opt-in.

See the [canonical API contract](https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/ads-mcp-api-contract.md)
and [command adapter protocol](https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/ads-mcp-command-adapters.md)
for the complete interfaces.
