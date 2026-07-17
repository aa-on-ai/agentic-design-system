# Phase 6 prospective dogfood run

## Outcome

Added a public `/trace` page that turns the preserved loop-demo provenance into a human-reviewable decision chain. The first true prospective manifest was captured before implementation.

## Verification

- Targeted ESLint: passed.
- Next.js production build: passed; `/trace` is server-rendered on demand.
- Homepage regression after adding the footer link: passed.
- Rendered light viewports: 390×844, 768×1024, and 1280×800.
- Rendered dark viewports: 390×844 and 1280×800.
- Serious or critical axe violations: 0.
- Horizontal overflow: 0 viewports.
- Interactive targets below 44×44px: 0.
- Landmarks: main, navigation, header, and footer present at every viewport.
- Visual review: passed across light and dark captures after focused contrast repairs.

## State inventory

The page is a static evidence document with no asynchronous data or mutations. Loading, empty, error, disabled, and mutation states are not applicable; the default document is complete.

## Failed checks

- Full-repository ESLint remains blocked by pre-existing `react-hooks/static-components` errors in `demos/src/app/before/notion-ai-settings/page.tsx`. The changed files pass targeted ESLint.
- Initial light and dark captures exposed contrast gaps at theme boundaries. The final captures clear them at every tested width.

## Unresolved risks

- This branch is preview-ready but has not been pushed, deployed, or checked against production hosting.

<!-- ads-decision-provenance:start -->
## decision provenance

- **manifest:** `docs/phase6-dogfood/skill-manifest.json` (sha256 `b67c4bcd604e…`)
- **scope:** Prospective ADS v1.2.0 run. The manifest was captured before implementation; the decisions below survived the final rendered review.
- **capture status:** 9 observed, 0 declared
- **deterministic overhead:** 11.912ms total (8.477ms capture + 3.435ms verify), budget 250ms per operation
- **external work added:** 0 model calls, 0 browser calls, 0 network calls

| decision | artifact | governing skill + excerpt | source constraint | evidence | review |
|---|---|---|---|---|---|
| The new trace surface reuses the site's typography, tokens, theme control, wordmark, footer, and workshop-paper visual language so it reads as ADS product UI. | [Shared ADS tokens and page chrome](../../demos/src/app/trace/trace.module.css) | design-review · `546806cbfb`<br>- Follow the project's existing components, tokens, and patterns before inventing anything. | - Use the existing ADS visual language and site chrome; this is part of the product, not a synthetic fixture. | [desktop screenshot](evidence/default-1280x800.png), [rendered gate receipt](evidence/evidence.json) | verified |
| Decision receipts collapse into a single vertical reading spine on small screens instead of compressing the desktop composition. | [Mobile receipt chain](../../demos/src/app/trace/trace.module.css) | design-review · `089d06a936`<br>- Small screens need prioritization, not a desktop layout compressed until it cries. | - Use one focused reading spine on small screens rather than compressing a dashboard or table. | [mobile screenshot](evidence/default-390x844.png), [rendered overflow and target gates](evidence/evidence.json) | verified |
| The trace is a server-rendered article with landmarks, ordered decisions, headed receipts, and real evidence links that remain understandable without styling. | [Trace document landmarks and evidence links](../../demos/src/app/trace/page.tsx) | agent-friendly-design · `4d03ef0149`<br>ARIA supplements semantic HTML — it doesn't replace it. use it when native elements can't express the interaction. | - Keep the page server-rendered and semantic, with real links to the preserved artifacts. | [rendered landmark and axe gates](evidence/evidence.json), [tablet screenshot](evidence/default-768x1024.png) | verified |
| The preserved Phase 5 rows are labeled reviewed and paired with a visible caveat that they are historical mapping, not prospective proof. | [Historical mapping caveat and reviewed badges](../../demos/src/app/trace/page.tsx) | design-review · `546806cbfb`<br>- [ ] Does it meet the brief, not an adjacent brief? | - Present the preserved loop demo as historical evidence with `reviewed` status, never as prospective proof. | [desktop screenshot](evidence/default-1280x800.png), [mobile screenshot](evidence/default-390x844.png) | verified |

> `observed` means the file was explicitly recorded as loaded before the build. `declared` means selected but not proven loaded, and cannot support a `verified` decision.
<!-- ads-decision-provenance:end -->
