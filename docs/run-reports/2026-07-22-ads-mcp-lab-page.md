# ads-mcp public lab page

## Outcome contract

### Goal

Make the local ADS MCP implementation visible and understandable through one public page that
shows what an agent calls, what the server returns, and where human judgment remains required.

### Success means

- The page uses the existing ADS workshop-paper visual language, typography, color tokens, and
  navigation patterns rather than introducing a second brand system.
- A first-time visitor can identify the `ads_render -> ads_evaluate -> ads_trace` sequence, the
  local stdio boundary, and the `needs_human` checkpoint within three seconds.
- The visible example is backed by a real MCP client run, not invented product telemetry.
- Critical content is server-rendered, semantic, keyboard-readable, and available as a compact
  machine-readable contract at `/mcp/contract.json`.
- Rendered evidence clears serious axe, horizontal-overflow, landmark, CLS, and touch-target gates
  at mobile and desktop widths.

### State inventory

This is a static explanatory page with no remote data dependency or mutation path. Loading, empty,
and error states are not applicable. Native disclosure elements retain usable open and closed
states without client JavaScript. Light and dark themes are both in scope.

### Stop when

Desktop and mobile screenshots, rendered gate evidence, a real MCP sequence receipt, source checks,
and a production URL all exist. Aaron's next decision should be whether to publish the package and
add client-specific install snippets, not whether the MCP is tangible.

## Visual pass rubric

Score each pass from 1-10 on:

- Design quality
- Originality within the existing ADS language
- Craft
- Functionality

Any score below 6 requires another pass.

### Pass 1 — structure

- Design quality: 8
- Originality: 8
- Craft: 7
- Functionality: 7

The page matched the existing ADS paper/workshop language and made the three-step sequence legible
on desktop and mobile. Authoritative capture found four serious color-contrast failures: three
step numbers in the dark run shell and the final-section eyebrow.

### Pass 2 — rendered repair

- Design quality: 8
- Originality: 8
- Craft: 8
- Functionality: 8

The light theme cleared all rendered gates at four breakpoints after the contrast repair. The dark
theme exposed one additional primary-action contrast failure because the shared dark token made the
button foreground and background converge; the module now gives that state an explicit ink-on-paper
pair.

### Pass 3 — final distill and platform check

- Design quality: 9
- Originality: 8
- Craft: 9
- Functionality: 9

Final light and dark captures cleared serious axe, overflow, landmarks, CLS, and touch-target gates
at `390x844`, `768x1024`, `1280x800`, and `1440x1000`. Chromium desktop and an iOS-like touch
environment exercised native disclosures, the theme toggle, the JSON contract, exact tool order,
and horizontal-overflow checks.

Evidence:

- `evidence/mcp-lab-pass-3-light/evidence.json`
- `evidence/mcp-lab-pass-3-dark/evidence.json`
- `evidence/mcp-lab-pass-3/chromium-desktop-1280x800.png`
- `evidence/mcp-lab-pass-3/chromium-ios-like-390x844.png`

## Real MCP run

- Run ID: `run_mrwll3lh_3d44b4578720`
- Client: `@modelcontextprotocol/sdk`
- Tools listed: exactly `ads_render`, `ads_evaluate`, `ads_trace`
- Render: `complete` at `390x844` and `1280x800`
- Render gates: zero serious axe violations, no overflow, no undersized touch targets, zero CLS
- Evaluate: `needs_human`, no blockers
- Trace: `valid`, one decision, no errors
- Resources read: evidence and trace validation

## Failed checks

- The first authoritative capture found four light-theme contrast failures; fixed and cleared.
- The first dark-theme capture found one button contrast failure; fixed and cleared.
- Installing `demos/node_modules` exposed a latent duplicate-React mount failure in the root release
  fixture. `testing/lib/mount.mjs` now aliases React and React DOM to one copy; the complete release
  gate passed afterward.
- Full demos lint still fails on the repository's intentionally broken
  `before/notion-ai-settings` fixture. Scoped lint for `/mcp` and `SiteFooter.tsx` passes.
- Playwright WebKit launched but stalled while creating a page in this local environment. The
  required mobile platform check used a `390x844`, touch-enabled, iPhone-user-agent Chromium context
  and passed; authoritative Chromium capture also passed at the same width.
