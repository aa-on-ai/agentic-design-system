# ADS brand integration

## Outcome

- **Goal:** replace the placeholder `A` and mirror favicon with Aaron's approved circular-arrow
  mark across the public ADS site and the `ads-mcp` release surfaces.
- **Success means:** the approved mark is visible in the site header and footer at desktop and
  mobile, the site advertises the PNG as its browser icon, npm package contents carry the same
  asset, MCP Registry metadata points at the public asset, and the normal ADS release and MCP
  consumer checks still pass.
- **Stop when:** before/after screenshots exist at `390x844` and `1280x800`, deterministic checks
  pass, and an independent reviewer returns a ship/no-ship verdict.

## Reference intake contract

- **Source:** Aaron-approved 1254×1254 generated PNG preserved in the OpenClaw Codex image output.
- **Task:** use the approved mark as the ADS brand identity on existing surfaces.
- **Primary borrowed layer:** exact art style, composition, cream/navy palette, and orange center.
- **Secondary borrowed layers:** circular silhouette and target/loop metaphor.
- **Do not borrow:** no new page chrome, layout, typography, motion, or content changes.
- **Fidelity target:** close mimic. The production asset is a centered square crop and downsample
  of the approved source, not a reinterpretation.
- **Product constraints:** preserve existing wordmark labels, link semantics, 44px touch targets,
  theme behavior, layout geometry, and local-stdio MCP boundary.
- **Success cues:** mark remains recognizable at 32px, uses the same source everywhere, and does
  not move adjacent controls.
- **Failure cues:** placeholder `A` or mirror favicon remains, low-contrast/cropped arrows, layout
  shift, duplicated accessible names, or Registry/package metadata drift.
- **Open questions:** none. Aaron approved the source as final.

## Evidence

- Source crop: the approved 1254×1254 PNG was center-cropped to 860×860, then downsampled to
  512×512 without generative reinterpretation.
- Asset integrity: site and npm copies share SHA-256
  `3c75177accaa3a9c300b09251c6bb2a8141eabab945aba795f46feaea980684d`.
- Browser icon: rendered metadata advertises `/brand/ads-mark.png` as both `icon` and
  `apple-touch-icon`; the local asset returns HTTP 200 as `image/png`.
- Homepage capture, light theme: `390x844` and `1280x800` cleared serious axe, overflow, main
  landmark, live-region, CLS, state-rendering, font, and touch-target gates.
- MCP lab capture, dark theme: `390x844` and `1280x800` cleared the same rendered gates.
- Strict before/after comparison (`--pixel-threshold 0`) kept matching dimensions and localized
  the expected mark-only delta:
  - homepage: 0.386% changed at mobile, 0.138% at desktop
  - MCP lab: 0.159% changed at mobile, 0.069% at desktop
- `npm run build` in `demos`: passed.
- `npm test` in `packages/ads-mcp`: 12/12 passed, including real Chromium URL/TSX capture and a
  compiled stdio MCP client sequence.
- `npm pack --dry-run`: `LICENSE`, `README.md`, `assets/ads-mark.png`, and `server.json` are in the
  tarball.
- `npm run mcp:package-smoke`: clean packed consumer completed
  `ads_render → ads_evaluate → ads_trace` with `complete → needs_human → valid`.
- `mcp-publisher validate`: Registry manifest valid against the live official Registry.
- `npm run release:check`: passed the full ADS release gate.

## Advisory source checks

The source-only anti-pattern, state, and accessibility scripts still emit file-local warnings for
static page/layout fragments because they cannot see CSS modules, shared focus styles, or
route-level composition. Those warnings were investigated rather than treated as authoritative.
The rendered browser receipts above are the release gate and cleared the corresponding semantics,
responsive, focus/touch, and state-rendering checks.

## Independent review

- Verdict: `SATISFIED`, 96/100.
- Scores: Design Quality 34/35, Originality 28/30, Craft 19/20, Functionality 15/15.
- Structured findings: no blockers, majors, or minors.
- Ship recommendation: commit the complete local diff and advance it to Aaron. Keep push, deploy,
  npm publish, and MCP Registry publish as separate approval-bearing actions.
- Publication order: deploy the public mark and verify the Registry icon URL first, publish and
  verify `ads-mcp@0.1.0` second, then publish the Registry entry.
- Residual risks: MCP Registry preview volatility and pre-existing dependency advisories documented
  above.

Two Hermy one-shot attempts stalled before reading the task, including a lean no-config retry, and
were stopped under the two-failure rule. The direct Biff/Opus lane was unavailable because the
correct Mac mini Claude CLI home reports `loggedIn: false`. The final verdict came from a clean,
read-only native Codex grader with no implementation transcript or file-write authority.

No push, deployment, npm publication, or MCP Registry publication has been performed.
