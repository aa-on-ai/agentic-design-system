# ads-mcp API contract (proposed v0.1)

## Decision

Ship `ads-mcp` as a package inside the Agentic Design System repository at
`packages/ads-mcp`, with an independently runnable `ads-mcp` binary.

- Transport: local stdio first.
- SDK: pin the stable `@modelcontextprotocol/sdk` v1 line. The v2 SDK is still pre-alpha.
- Runtime: plain TypeScript and filesystem-backed run state. No agent graph, queue, or database.
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

The server exposes instructions describing the expected sequence:

```text
ads_render -> ads_evaluate -> ads_trace
```

## Tool 1: `ads_render`

Render a real URL or isolated TSX component into inspectable evidence.

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

All component and provenance paths must resolve under the configured project root. Component
targets are captured as artifact files automatically; URL targets declare the implementation files
that later decisions may trace through `provenance.artifactFiles`. URL targets must use HTTP(S) and
pass the server origin policy. `file:`, arbitrary shell commands, and unrestricted output paths are
not accepted.

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
    "touchTargetsUnder44": [],
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
    "mode": "none"
  }
}
```

`judge.mode` defaults to `none`, which runs deterministic rendered gates and returns
`needs_human` when visual judgment remains unresolved. A later explicit `configured` mode may use a
credential already present in the environment; it must name the model, record the provider/model in
the receipt, and never silently fall back to a paid call.

### Structured output

```json
{
  "schemaVersion": 1,
  "runId": "run_...",
  "status": "needs_human",
  "verdict": null,
  "scores": null,
  "findings": [],
  "gates": {},
  "comparison": null,
  "nextRevisionPrompt": "",
  "artifacts": {
    "receipt": "ads://runs/run_.../receipt",
    "report": "ads://runs/run_.../report"
  }
}
```

`status` is `complete`, `blocked`, or `needs_human`. `verdict` is `satisfied`, `needs_revision`,
`failed`, or `null` when judgment is unresolved. Findings use ADS's existing stable categories,
severity levels, breakpoint/state fields, evidence references, and normalized regions. Missing or
incomparable evidence is reported explicitly and cannot be treated as a pass.

## Tool 3: `ads_trace`

Verify that consequential decisions map to skill rules, source constraints, artifacts, and rendered
evidence captured in the same run.

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
ads://runs/{runId}/manifest
ads://runs/{runId}/evidence
ads://runs/{runId}/receipt
ads://runs/{runId}/report
ads://runs/{runId}/trace
ads://runs/{runId}/trace-validation
ads://runs/{runId}/screenshots/{filename}
```

The resource layer allow-lists known run artifacts. It does not become a general filesystem server.

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
- Concurrent runs use separate directories; the v0.1 server caps browser concurrency at one.
- Logs go to stderr so stdio protocol output remains clean.

## Security boundary

- No arbitrary command execution tool.
- No path traversal outside the configured root.
- No `file:` URL rendering.
- Localhost-only URL rendering by default; other origins require an explicit startup allow-list.
- No environment dump, secret persistence, or credentials in receipts.
- Model judging is opt-in, records the model used, and fails honestly when credentials are absent.
- Remote Streamable HTTP is out of scope for v0.1 because it requires authentication, stronger SSRF
  controls, and sandboxing.

## Verification contract

The first release is done when:

1. MCP initialize and `tools/list` expose exactly these three tools with stable schemas.
2. Each tool passes success, invalid-input, timeout, cancellation, and incomplete-evidence tests.
3. A fixture completes `ads_render -> ads_evaluate -> ads_trace` and all returned resource links
   resolve.
4. Path traversal, denied origins, missing browsers, missing states, and missing judge credentials
   fail explicitly.
5. MCP Inspector can invoke every tool and inspect every resource.
6. One real client completes the full sequence from a clean project checkout.
7. README includes install, client configuration, example calls, output receipts, and limitations.

## Explicitly out of scope for v0.1

- Remote hosting, OAuth, multi-tenant state, queues, databases, resumable HTTP sessions, an MCP App
  UI, automatic deployment, or autonomous revision loops. Public package and Registry distribution
  do not change the local stdio runtime boundary.
- A new render or grading engine. The MCP package adapts the existing ADS implementation.
- Silent model selection or hidden paid calls.

## Post-v0.1 adapter backlog

- Keep the public three-tool sequence stable while adding platform adapters behind `ads_render`.
- Record `platform`, `renderer`, and `detectors` in every run manifest so adapter evidence remains
  attributable without changing the evaluation or trace protocols.
- Explore SwiftUI as the first non-web adapter. Use Xcode Previews or snapshot outputs as rendered
  evidence and ingest SwiftLint, SwiftSyntax, and asset-catalog checks as platform detector receipts.
  `impeccable-swift` is a useful reference implementation, not a v0.1 dependency.
- Preserve the distinction between product context and visual-system context. Accept a
  `PRODUCT.md` plus `DESIGN.md` pair when projects use it, while keeping ADS's existing project
  identity intake compatible for projects that do not.

## Approval

Approve the three tool contracts, local stdio boundary, and same-repository package location before
implementation. After approval, implementation should stay inside this contract unless a source
constraint proves it cannot.
