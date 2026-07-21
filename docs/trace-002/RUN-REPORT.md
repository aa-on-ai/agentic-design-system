# Trace 002 run report

## Decision

- **decision needed:** approve a GitHub push and preview deployment, or hold locally
- **default:** publish the proof slice without touching the homepage hero or assembly line
- **local route:** `http://127.0.0.1:3013/trace/002`
- **branch:** `agent/trace-002-current-proof`
- **base:** `ec27c2da6c0b245698cee5403e200ab97728eac9`

## Outcome

Trace 002 turns the frozen Pawprint v1.3.1 adjacent-action repair into a public-ready proof page. It
renders from the real suite, grade, rerun metadata, and screenshots. `/trace/002/trace.json` exposes
the same claim as machine-readable JSON. Trace 001 remains intact at `/trace`, and the homepage
footer now points to the current trace.

## Verification

- `npm run build` in `demos/`: passed; `/trace/002` and `/trace/002/trace.json` compiled.
- Scoped ESLint on `src/app/trace/002` and `SiteFooter.tsx`: passed.
- `npm run trace-002:smoke`: passed release, repair semantics, 8/8 evidence, rerun lock, and route checks.
- `npm run regression:frozen`: passed 5/5 cases, 40 screenshots, and 20/20 native action checks.
- ADS rendered capture, light: passed at 375×812, 390×844, 768×1024, and 1280×800.
- ADS rendered capture, dark: passed at 390×844 and 1280×800.
- Rendered gates: zero serious/critical axe violations, no overflow, no missing main landmark, no
  live-region failure, zero targets under 44×44px, and max CLS 0.00000.
- iPhone 13 emulation: passed touch/mobile layout, theme-toggle interaction, image loading, trace JSON,
  overflow, target size, and console-error checks against the production build.
- Homepage regression: passed typography, footer, Ember rail, artifact legibility, mobile pacing,
  release bay, and proof-label checks after the footer link change.
- Homepage hardening: passed Chromium and WebKit at 390, 768, and 1280 widths, including reduced
  motion, theme persistence, keyboard focus, copy feedback, and Ember motion/occlusion.
- Homepage runtime medians: mobile LCP 2344ms, CLS 0, INP 64ms; desktop LCP 104ms, CLS 0, INP 56ms.
- Independent vision grade: `satisfied`; 9 design quality, 8 originality, 9 craft, 9 functionality;
  no major or blocker findings.

## Evidence

- Light captures: `docs/trace-002/evidence/`
- Dark captures: `docs/trace-002/evidence-dark/`
- iPhone-like interaction receipt: `docs/trace-002/evidence-mobile/receipt.json`
- Homepage runtime receipt: `docs/trace-002/homepage-runtime.json`
- Independent grader: `docs/trace-002/GRADER-REPORT.md`
- Outcome contract: `docs/trace-002/OUTCOME.md`

## Failed checks

- Full-repo `npm run lint` remains red in the pre-existing
  `demos/src/app/before/notion-ai-settings/page.tsx` fixture because it declares `Toggle` during
  render. The changed-file lint passes.
- Source heuristics report missing empty states and responsive code when run per leaf component. This
  is a static, build-time evidence article; loading and error boundaries are implemented, empty is
  not an applicable runtime state, responsive rules live in the CSS module, and rendered gates pass.
- Playwright WebKit launched but stalled creating a page in the installed browser revision. The
  required mobile gate was completed with iPhone 13 emulation using touch and a mobile Safari user
  agent. Chromium rendered authority also passed at 375 and 390 widths.

## Stop

`needs_aaron_approval`. Local implementation and verification are complete. Push, PR, preview, and
deployment are external writes and have not been performed.
