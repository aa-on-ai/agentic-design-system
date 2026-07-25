# ads-mcp command adapter protocol (v0.2)

`ads-mcp` keeps provider SDKs and platform-specific build systems outside the core package. Visual
judges and SwiftUI snapshot renderers connect through explicit startup-configured executables.

Both adapters:

- receive one JSON document on stdin;
- return one JSON document on stdout;
- run through `execFile`-style argv execution, never a shell;
- inherit the caller environment so the adapter can use credentials already configured by its
  operator;
- are cancelled and killed with the MCP tool timeout;
- may return at most 1 MiB on stdout;
- must be configured with an absolute executable path.

The server never selects a judge or incurs a model call silently. A visual judge requires both
startup configuration and `judge.mode: "configured"` on `ads_evaluate`.

## Visual judge adapter

Start the server with an explicit executable and receipt metadata:

```bash
ads-mcp \
  --root /absolute/project \
  --judge-command /absolute/bin/ads-visual-judge \
  --judge-provider openai \
  --judge-model gpt-5.4
```

Use `--judge-arg <value>` repeatedly when the executable needs fixed startup arguments. Provider and
model values are written into the immutable evaluation receipt. The adapter cannot override them.

### stdin

```json
{
  "schemaVersion": 1,
  "runId": "run_...",
  "target": {
    "type": "url",
    "url": "http://127.0.0.1:3000/orders"
  },
  "rubric": {
    "task": "Make the orders workflow understandable",
    "criteria": [
      { "name": "Design Quality", "weight": 35 },
      { "name": "Originality", "weight": 30 },
      { "name": "Craft", "weight": 20 },
      { "name": "Functionality", "weight": 15 }
    ]
  },
  "gates": {},
  "comparison": null,
  "screenshots": [
    {
      "state": "default",
      "breakpoint": "390x844",
      "artifact": "ads://runs/run_.../screenshots/default-390x844.png",
      "path": "/absolute/project/.ads/runs/run_.../evidence/default-390x844.png"
    }
  ]
}
```

Screenshot paths are read-only inputs inside the current run. Findings must cite the supplied
`ads://` artifact values, not arbitrary files or invented resources.

### stdout

```json
{
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
      "target": {
        "description": "Primary action row",
        "normalizedBox": {
          "x": 0.08,
          "y": 0.78,
          "width": 0.84,
          "height": 0.12
        }
      },
      "observation": "An enabled action contradicts the read-only state.",
      "evidence": [
        "ads://runs/run_.../screenshots/readonly-390x844.png"
      ]
    }
  ],
  "nextRevisionPrompt": "Disable the contradictory action in the read-only state, then re-render."
}
```

Validation rules:

- score keys must match the requested rubric criteria exactly;
- every score must be between 0 and 10;
- findings use ADS's stable categories and severity levels;
- rubric rows, artifacts, and evidence links must come from the request;
- each finding's state and breakpoint must match its screenshot artifact;
- normalized boxes must stay within the screenshot;
- `satisfied` cannot coexist with blocker findings or a major contradictory-action finding;
- `needs_revision` and `failed` require a concrete `nextRevisionPrompt`.

Invalid, missing, timed-out, or semantically inconsistent results return a preserved `blocked`
evaluation. They never fall back to a pass.

## SwiftUI renderer adapter

Start the server with an explicit snapshot executable:

```bash
ads-mcp \
  --root /absolute/project \
  --swiftui-command /absolute/bin/ads-swiftui-snapshot \
  --swiftui-renderer xcode-preview \
  --swiftui-detector swiftlint \
  --swiftui-detector swiftsyntax \
  --swiftui-detector asset-catalog
```

Use `--swiftui-arg <value>` repeatedly for fixed executable arguments. Detector names are recorded in
the run manifest. If a named built-in detector is declared, its availability and failure arrays
become hard rendered gates.

### `ads_render` target

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
  "viewports": [
    { "width": 393, "height": 852 }
  ]
}
```

`projectPath` may be a root-confined Xcode project or workspace directory. `sourcePath`, when
present, must be a root-confined file and is hashed into the artifact manifest.

### stdin

The command receives the target plus canonical absolute project/source paths, requested states and
viewports, the caller-owned output directory, and the timeout:

```json
{
  "schemaVersion": 1,
  "root": "/absolute/project",
  "target": {
    "type": "swiftui",
    "projectPath": "/absolute/project/Orders.xcodeproj",
    "scheme": "Orders",
    "sourcePath": "/absolute/project/Orders/ContentView.swift",
    "configuration": "Debug",
    "device": "iPhone 16 Pro"
  },
  "states": ["default", "loading"],
  "viewports": [
    { "width": 393, "height": 852 }
  ],
  "settleMs": 450,
  "outDir": "/absolute/project/.ads/runs/.tmp-run_.../evidence",
  "timeoutMs": 30000
}
```

The adapter may use Xcode Previews, a snapshot-test host, or a simulator launch. It must write PNG
files and `evidence.json` into `outDir`, then return:

```json
{ "status": "complete" }
```

Minimum `evidence.json`:

```json
{
  "capturedStates": ["default", "loading"],
  "breakpoints": ["393x852"],
  "snapshots": [
    {
      "state": "default",
      "breakpoint": "393x852",
      "screenshot": "default-393x852.png"
    },
    {
      "state": "loading",
      "breakpoint": "393x852",
      "screenshot": "loading-393x852.png"
    }
  ],
  "gates": {
    "adapterAvailable": true,
    "buildSucceeded": true,
    "stateRendered": {
      "default": true,
      "loading": true
    },
    "swiftLintAvailable": true,
    "swiftLintErrors": [],
    "swiftSyntaxAvailable": true,
    "swiftSyntaxErrors": [],
    "assetCatalogAvailable": true,
    "assetCatalogErrors": []
  }
}
```

Every requested state and viewport pair needs one root-level PNG with a safe filename. Missing
snapshots, failed builds, unavailable declared detectors, and non-empty detector failure arrays
produce a preserved `blocked` run.
