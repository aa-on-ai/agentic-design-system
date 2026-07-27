# Homepage install and acceptance close

## Outcome

Rebuilt the homepage close from current `origin/main` at `f7df403`. The stale
`wt/vnext-install-close` branch supplied only the information architecture:
install, status, limits, and FAQ. No stale implementation or compatibility claim
was carried forward.

The new close:

- keeps the existing orange workshop/release-bay world
- leads with the current repo-local skill-pack install
- publishes the accepted MCP host boundary without claiming universal support
- makes Chromium setup, non-local origin configuration, and `needs_human`
  behavior explicit
- answers the four questions most likely to block installation
- leaves the hero and five-stage review narrative unchanged

Review status: **REVIEWABLE**. No deploy or push was performed.

## Acceptance copy

The host ledger reflects the July 27 acceptance work:

- Verified: Codex, OpenClaw, Claude Code
- Limited: Hermes, because fresh-session resource discovery is not verified on
  Hermes 0.19.0
- Untested: Cursor

The installer copy says five **installer targets**, not five fully accepted MCP
hosts. The MCP lane is explicitly optional and host-dependent.

## Implementation

- Added `ReleaseClose.tsx` for the install, host ledger, and operating limits.
- Added `ReleaseFaq.tsx` using native disclosure controls.
- Replaced the compact legacy release CTA in `page.tsx`.
- Extended the existing release-bay CSS instead of introducing a detached SaaS
  card system.
- Added the FAQ disclosure controls to the homepage keyboard hardening matrix.
- Reused the shared install command and focus-ring behavior.

## Rendered evidence

Current production was captured as the baseline at 390x844, 768x900, and
1280x900. The candidate production build was captured at the same light-theme
viewports plus dark-theme 390x844 and 1280x900.

Candidate gates at every captured viewport:

- zero serious or critical axe violations
- zero horizontal overflow
- zero landmark or live-region failures
- zero touch targets below 44x44
- maximum CLS of 0
- DM Sans rendered

Evidence:

- `evidence/install-status-close-baseline/`
- `evidence/install-status-close-candidate-final/`
- `evidence/install-status-close-dark/`

Focused close screenshots:

- `evidence/install-status-close-candidate-final/release-close-desktop.png`
- `evidence/install-status-close-candidate-final/release-close-mobile.png`

The comparison reports 19.420% changed pixels at 1280px, 21.697% at 768px, and
27.075% at 390px. The increased page height and release-bay replacement account
for the delta; the preceding homepage narrative remains visually unchanged.

## Browser and interaction receipt

The optimized production build passed `homepage-hardening.mjs` in Chromium and
WebKit at 390, 768, and 1280px. That matrix covers:

- theme loading and persistence
- reduced motion
- copy feedback
- keyboard reachability and visible focus
- assembly-line travel and station behavior
- CLS and horizontal overflow

The production WebKit iPhone profile also opened the first FAQ with the keyboard,
rendered the answer, exposed a 3px focus outline, produced no page errors, and
kept horizontal overflow at zero.

Chromium overlap regression passed at all 17 tested widths from 267px to 1622px.

## Build and source receipt

- Next production build: pass
- TypeScript: pass
- changed-file ESLint: pass
- hardening script syntax check: pass
- component size: `ReleaseClose.tsx` 110 lines; `ReleaseFaq.tsx` 41 lines;
  `page.tsx` 92 lines

## Failed checks

- The first dev-server hardening pass found missing visible focus on the new
  native FAQ summaries and an incomplete interactive-control selector in the
  test. Both were repaired before the final production-build run.
- WebKit overlap regression still reports Ember painting over the final machine
  at 1074px and 1622px. The same values and geometry fail against the untouched
  public production baseline, so this is a pre-existing animation/test issue,
  not a regression from the new close.
- Repo-wide ESLint remains red on eight pre-existing errors in the unrelated
  `before/notion-ai-settings` fixture. Changed-file ESLint passes.
- Source-only state heuristics flag absent loading, empty, and error copy on
  these static marketing components. Rendered browser gates and the existing
  install-copy error state are the applicable checks here.
- `npm ci` reports ten existing demo dependency advisories. No dependency
  versions changed in this branch.

## Scope

Branch: `agent/install-status-close-v0.2.2`

Worktree: `/Users/moltbot/clawd/worktrees/ads-install-status-close`

Base: `f7df403`

The branch is local only. Merge, push, and deployment remain approval-gated.
