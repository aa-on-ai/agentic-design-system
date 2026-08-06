# ads-mcp API contract (v0.3)

## Decision

Ship `ads-mcp` as a package inside the Agentic Design System repository at
`packages/ads-mcp`, with an independently runnable `ads-mcp` binary.

- Transport: local stdio first.
- SDK: split `@modelcontextprotocol/server` and `@modelcontextprotocol/client` v2 packages.
- Compatibility: one `serveStdio` binary supports legacy `initialize` and modern
  `server/discover` clients negotiating MCP `2026-07-28`.
- Runtime: plain TypeScript and filesystem-backed, session-independent run state. No agent graph,
  queue, or database.
- Project boundary: the server starts with one explicit `--root` directory and never reads or
  writes outside it.
- Evidence boundary: generated files live under `<root>/.ads/runs/<runId>/`.

This keeps the first release useful to coding agents working in a local repository and reuses the
existing ADS render, evaluation, and decision-provenance machinery instead of duplicating it.

## Server command

```bash
npx ads-mcp --root /absolute/path/to/project
```

Optional server flags:

- `--runs-dir <relative-path>`: defaults to `.ads/runs` and must resolve under `--root`.
- `--allow-origin <origin>`: repeatable allow-list for non-local URLs. Localhost is allowed by
  default; other origins are denied unless explicitly listed.
- `--timeout-ms <number>`: default tool timeout, capped by the server.
- `--judge-command <absolute-path>`, `--judge-provider <name>`, and `--judge-model <name>`:
  configure one visual-judge command adapter and immutable receipt metadata.
- `--judge-arg <value>`: repeatable fixed argument passed to the visual-judge executable.
- `--swiftui-command <absolute-path>`: configure one SwiftUI snapshot command adapter.
- `--swiftui-arg <value>`: repeatable fixed argument passed to the SwiftUI executable.
- `--swiftui-renderer <name>` and repeatable `--swiftui-detector <name>`: attributable
  platform receipts written to the run manifest.

The server instructions always begin with:

```text
ads_render -> ads_evaluate
```

`ads_trace` is conditional. The client reads the render manifest first and calls trace only when
the run captured at least one observed skill file, source file, and artifact file. Trace inputs use
the exact root-relative manifest paths and exact file excerpts. Prompt labels, URLs, and invented
paths are never provenance.

## Tool 1: `ads_render`

Render a real URL, isolated TSX component, or configured SwiftUI target into inspectable evidence.

### Input

```json
{
  "target": {
    "type": "url",
    "url": "http://127.0.0.1:3000/orders"
  },
  "states": ["default", "loading", "empty", "error"],
  "viewports": [
    { "width": 390, "height": 844 },
    { "width": 1280, "height": 800 }
  ],
  "waitFor": "main",
  "settleMs": 450,
  "maxCls": 0.1,
  "provenance": {
    "observedSkillFiles": ["skills/design-review/SKILL.md"],
    "declaredSkillFiles": [],
    "sourceFiles": ["brief.md"],
    "artifactFiles": ["src/Orders.tsx"],
    "adsRelease": "v1.3.1"
  }
}
```

`target` is a discriminated union:

- `{ "type": "url", "url": "http://..." }`
- `{ "type": "component", "path": "src/Orders.tsx", "exportName": "default" }`
- `{ "type": "swiftui", "projectPath": "Orders.xcodeproj", "scheme": "Orders", "sourcePath": "Orders/ContentView.swift", "configuration": "Debug", "device": "iPhone 16 Pro" }`

All component, SwiftUI, and provenance paths must resolve under the configured project root.
Component targets and optional SwiftUI source paths are captured as artifact files automatically;
URL targets declare implementation files that later decisions may trace through
`provenance.artifactFiles`. URL targets must use HTTP(S) and pass the server origin policy.
SwiftUI targets require a startup-configured adapter and preserve a blocked run when it is missing.
`file:`, arbitrary shell commands, and unrestricted output paths are not accepted.

### Structured output

```json
{
  "schemaVersion": 1,
  "runId": "run_...",
  "status": "complete",
  "target": { "type": "url", "url": "http://127.0.0.1:3000/orders" },
  "capturedStates": ["default", "loading", "empty", "error"],
  "viewports": ["390x844", "1280x800"],
  "gates": {
    "seriousAxeViolations": 0,
    "horizontalOverflowAt": [],
    "touchTargetsUnder48": [],
    "maxCumulativeLayoutShift": 0,
    "stateRendered": {
      "default": true,
      "loading": true,
      "empty": true,
      "error": true
    }
  },
  "artifacts": {
    "evidence": "ads://runs/run_.../evidence",
    "screenshots": ["ads://runs/run_.../screenshots/default-390x844.png"],
    "manifest": "ads://runs/run_.../manifest"
  }
}
```

`status` is `complete` or `blocked`. A capture failure, missing requested state, serious rendered
gate failure, invalid path, denied origin, browser timeout, or explicit skip can never return
`complete`.

## Tool 2: `ads_evaluate`

Evaluate one rendered run, optionally compare it with another, and produce a normalized ADS review
packet.

### Input

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
  "judge": {
    "mode": "configured"
  }
}
```

`judge.mode` defaults to `none`, which runs deterministic rendered gates and returns
`needs_human` when visual judgment remains unresolved. `configured` invokes the visual-judge
executable selected at server startup. The adapter may use credentials already present in its
environment, but the server never selects a provider or model. Both startup configuration and
per-call `judge.mode: "configured"` are required before a model call can occur.

### Structured output

```json
{
  "schemaVersion": 1,
  "runId": "run_...",
  "status": "complete",
  "verdict": "needs_revision",
  "scores": {
    "Design Quality": 7,
    "Originality": 6,
    "Craft": 8,
    "Functionality": 8
  },
  "findings": [
    {
      "category": "cues_affordances",
      "severity": "major",
      "rubricRow": "Functionality",
      "state": "readonly",
      "breakpoint": "390x844",
      "artifact": "ads://runs/run_.../screenshots/readonly-390x844.png",
      "target": { "description": "Primary action row" },
      "observation": "An enabled action contradicts the read-only state.",
      "evidence": ["ads://runs/run_.../screenshots/readonly-390x844.png"]
    }
  ],
  "gates": {},
  "comparison": null,
  "nextRevisionPrompt": "Disable the contradictory action in the read-only state, then re-render.",
  "artifacts": {
    "receipt": "ads://runs/run_.../receipt",
    "report": "ads://runs/run_.../report"
  }
}
```

`status` is `complete`, `blocked`, or `needs_human`. `verdict` is `satisfied`, `needs_revision`,
`failed`, or `null` when judgment is unresolved. Findings use ADS's existing stable categories,
severity levels, breakpoint/state fields, evidence references, and normalized regions. Missing or
incomparable evidence is reported explicitly and cannot be treated as a pass. The server validates
rubric score keys, ranges, finding references, normalized regions, and verdict consistency before
accepting adapter output.

The command adapter protocol is defined separately in
[`ads-mcp-command-adapters.md`](./ads-mcp-command-adapters.md).

## Tool 3: `ads_trace`

Verify that consequential decisions map to skill rules, source constraints, artifacts, and rendered
evidence captured in the same run.

The tool applies only to runs with the three required provenance categories. URL-only inspection
without captured provenance stops after `ads_evaluate`. If trace is called anyway, the server
returns one actionable `trace not applicable` error and does not resolve the supplied paths.

### Input

```json
{
  "runId": "run_...",
  "context": "Orders responsive repair",
  "decisions": [
    {
      "id": "mobile-primary-action",
      "decision": "Keep the primary action reachable on mobile.",
      "artifact": {
        "path": "src/Orders.tsx",
        "location": "Primary action row"
      },
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

The client supplies human-readable excerpts; the server resolves manifest IDs and computes hashes.
It rejects files not captured in the run, changed hashes, invented excerpts, missing artifacts, and
verified decisions without evidence.

### Structured output

```json
{
  "schemaVersion": 1,
  "runId": "run_...",
  "valid": true,
  "errors": [],
  "manifestSha256": "...",
  "artifacts": {
    "trace": "ads://runs/run_.../trace",
    "validation": "ads://runs/run_.../trace-validation"
  }
}
```

## Resources

Tools return short text summaries, typed `structuredContent`, and MCP `resource_link` items for
large artifacts. The server exposes read-only resources under:

```text
ui://ads/review
ads://runs/{runId}/manifest
ads://runs/{runId}/evidence
ads://runs/{runId}/receipt
ads://runs/{runId}/report
ads://runs/{runId}/trace
ads://runs/{runId}/trace-validation
ads://runs/{runId}/screenshots/{filename}
```

The resource layer allow-lists known run artifacts. It does not become a general filesystem server.
`ui://ads/review` is a self-contained `text/html;profile=mcp-app` resource linked from each tool
through `_meta.ui.resourceUri`; hosts without MCP Apps support continue to use the same text,
structured content, and run resources.

## Extensions

- MCP Apps: advertise `io.modelcontextprotocol/ui` with
  `mimeTypes: ["text/html;profile=mcp-app"]`. The app uses the stable `2026-01-26`
  `ui/initialize` lifecycle, host theme/style context, size notifications, server tool/resource
  proxy calls, and teardown.
- MCP Tasks: do not advertise `io.modelcontextprotocol/tasks`. Current operations are bounded and
  synchronous. Adopt Tasks only when ADS has a concrete long-running operation plus verified
  TypeScript SDK and host support; never reuse the deprecated `2025-11-25` core task API.
- Authorization: local stdio adds no authentication layer. A future remote transport must implement
  the MCP `2026-07-28` OAuth/OIDC requirements before enablement.
- Persistence: local filesystem runs are recoverable across fresh MCP connections and server
  instances on the same root. Remote or replicated operation requires a shared durable store and
  concurrency controls.

## Run state and operational controls

The filesystem is the state machine:

```text
created -> rendered -> evaluated -> traced
           |             |           |
         blocked       blocked     invalid
```

- One immutable `run.json` records timestamps, project root hash, ADS version, server version, tool
  inputs after secret redaction, durations, and terminal status.
- Each run writes to a temporary directory and atomically renames on completion so interrupted work
  cannot masquerade as a complete receipt.
- Tool handlers accept cancellation and enforce timeouts. Child browser/model processes are killed
  on cancellation.
- Run IDs are generated by the server. Repeating a tool creates a new run or stage receipt instead
  of overwriting prior evidence.
- Run IDs are durable application handles, never MCP session identifiers.
- Concurrent runs use separate directories; the server caps web browser concurrency at one.
- Logs go to stderr so stdio protocol output remains clean.

## Security boundary

- No arbitrary command execution tool.
- No path traversal outside the configured root.
- No `file:` URL rendering.
- Localhost-only URL rendering by default; other origins require an explicit startup allow-list.
- No environment dump, secret persistence, or credentials in receipts.
- Model judging is opt-in, records the model used, and fails honestly when credentials are absent.
- Command adapters use fixed argv execution without a shell, require canonical absolute
  executables, cap stdout, and are killed on cancellation.
- Remote Streamable HTTP is out of scope for v0.3 because it requires authentication, stronger SSRF
  controls, and sandboxing.

## Verification contract

The v0.3 source release is done when:

1. Legacy `initialize` and modern `server/discover` both expose exactly these three tools with
   stable schemas.
2. Each tool passes success, invalid-input, timeout, cancellation, and incomplete-evidence tests.
3. A provenance-backed fixture completes `ads_render -> ads_evaluate -> ads_trace` and all returned
   resource links resolve.
4. Path traversal, denied origins, missing browsers, missing states, invalid judge output, and
   missing adapters fail explicitly.
5. A URL-only run without provenance returns one actionable trace-not-applicable error without
   attempting to resolve caller-invented paths.
6. The advertised MCP App resource completes the `2026-01-26` host handshake, renders tool output,
   passes semantic/accessibility checks, and advances to evaluation through `tools/call`.
7. MCP Inspector can invoke every tool and inspect every resource.
8. One real client completes the applicable full sequence from a packed, clean consumer install.
9. A run created through one client/server pair can be evaluated and traced through a fresh pair.
10. README includes install, client configuration, example calls, output receipts, extension
    decisions, and limitations.

## Explicitly out of scope for v0.3

- Remote hosting, OAuth, multi-tenant state, queues, databases, resumable HTTP sessions, MCP Tasks,
  automatic deployment, or autonomous revision loops. Public package and Registry distribution do
  not change the local stdio runtime boundary.
- A new render or grading engine. The MCP package adapts the existing ADS implementation.
- Silent model selection or hidden paid calls.
- Bundled provider SDKs or a universal SwiftUI/Xcode snapshot harness. Platform- and
  provider-specific behavior remains behind explicit command adapters.

## Adapter architecture

- The public three-tool sequence stays stable while platform adapters sit behind `ads_render`.
- Record `platform`, `renderer`, and `detectors` in every run manifest so adapter evidence remains
  attributable without changing the evaluation or trace protocols.
- SwiftUI is the first non-web adapter. It accepts Xcode Preview, snapshot-test, or simulator
  outputs as rendered evidence and can ingest SwiftLint, SwiftSyntax, asset-catalog, and
  touch-target detector receipts.
- Every requested SwiftUI state and viewport pair must have one root-level PNG. Adapter
  availability, build success, declared detector availability, and detector failure arrays are
  hard gates.
- Preserve the distinction between product context and visual-system context. Accept a
  `PRODUCT.md` plus `DESIGN.md` pair when projects use it, while keeping ADS's existing project
  identity intake compatible for projects that do not.

## Release boundary

The v0.3 implementation keeps the v0.1 three-tool contract and local stdio boundary. npm
publication, MCP Registry validation, and public-site claims remain separate release actions after
source verification.
