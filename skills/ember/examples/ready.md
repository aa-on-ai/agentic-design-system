# Ember reads: phase6-dogfood /trace

Verdict: **ready**

## Ticket
- Packet: `docs/phase6-dogfood/evidence` (light) and `docs/phase6-dogfood/evidence-dark` (dark)
- Surface: `http://127.0.0.1:3217/trace` (light) and `http://127.0.0.1:3217/trace?theme=dark`
  (dark), the public `/trace` decision-provenance page, as captured for the Phase 6 prospective run
  (manifest `docs/phase6-dogfood/skill-manifest.json`)
- Profile: expressive, not recorded; assumed because this is an editorial page on the public
  site. The packet carries no `evidenceFormat`, `visualFoundation`, or `modalInteractions` field,
  so it was captured before the Foundation v2 evidence format.
- Required states and breakpoints: `default` only, at 390x844, 768x1024, 1280x800 light and
  390x844, 1280x800 dark. `docs/phase6-dogfood/OUTCOME.md` "State inventory" says the page is a
  static server-rendered document and loading, empty, error, disabled, and mutation states do not
  apply.
- Read: `docs/phase6-dogfood/evidence/evidence.json`, `docs/phase6-dogfood/evidence-dark/evidence.json`,
  `docs/phase6-dogfood/OUTCOME.md`, `docs/phase6-dogfood/RUN-REPORT.md`,
  `docs/phase6-dogfood/skill-manifest.json`, `contracts/visual-foundation.v2.json`,
  `demos/src/app/trace/page.tsx` (current source, for the caps question only), five screenshots
- Missing: none. Every screenshot named in both `evidence.json` files is on disk.

## Receipts
| state @ breakpoint | axe s/c | overflow | targets <44 | landmarks present | live region / expected | CLS | screenshot | seen |
|---|---:|---|---:|---|---|---:|---|---|
| default @ 390x844 (light) | 0 | none | 0 | main, nav, header, footer | status present | not measured | `evidence/default-390x844.png` | single reading spine, receipt cards stacked, no clipped edge |
| default @ 768x1024 (light) | 0 | none | 0 | main, nav, header, footer | status present | not measured | `evidence/default-768x1024.png` | same spine with wider cards |
| default @ 1280x800 (light) | 0 | none | 0 | main, nav, header, footer | status present | not measured | `evidence/default-1280x800.png` | hero with preserved-run card, four-receipt band, three numbered decisions each with rule, constraint, evidence cards, orange close, footer |
| default @ 390x844 (dark) | 0 | none | 0 | main, nav, header, footer | status present | not measured | `evidence-dark/default-390x844.png` | same structure on the dark theme |
| default @ 1280x800 (dark) | 0 | none | 0 | main, nav, header, footer | status present | not measured | `evidence-dark/default-1280x800.png` | same structure on the dark theme |

## Verdict
Ready. The only required state renders at every required width in both themes with zero serious
or critical axe findings, zero horizontal overflow, zero targets under 44px, and all four landmarks
present, per `gates` in both `evidence.json` files. The screenshots agree with the rows. The
verdict applies to this capture of the Phase 6 run, not to today's `main`.

## Why
- Zero serious or critical axe findings at all five snapshots, per `evidence.json` `gates.seriousAxeViolations` = 0 in both packets.
- No overflow at any width, per `gates.horizontalOverflowAt` = [] in both packets.
- No target under 44px, per `gates.touchTargetsUnder44` = [] in both packets.
- Landmarks main, nav, header, footer all true and a status region present at every snapshot, per each snapshot's `landmarks` and `statusRegion`.
- Rendered font is DM Sans, the site's own family, per `gates.renderedFonts`.
- Only `default` is required, per the state inventory in `OUTCOME.md`; `gates.stateRendered.default` = true.
- No dialog is declared and the packet has no `modalInteractions` field, so no modal receipt is required.

## Next
Watch three things. The tablet width was captured in light only, so a dark 768x1024 capture is
missing if dark tablet matters. This capture format has no CLS field, so layout stability is not
measured. `RUN-REPORT.md` says the branch had not been pushed or deployed when captured, so the
production route needs its own capture before this verdict travels.

## For a human
- The packet has no `visualFoundation` field, so Foundation v2 never rules were not machine-checked.
  The screenshots and `renderedTextSample` show uppercase eyebrow labels ("DECISION PROVENANCE /
  TRACE 001", "RULE", "EVIDENCE"). That is a candidate for `forced-uppercase` or
  `authored-all-caps`. Ember cannot confirm either from this packet: `forced-uppercase` is measured
  on rendered `text-transform`, which this capture did not record, and `authored-all-caps` is a
  human-review rule. The current `demos/src/app/trace/page.tsx` authors those labels in sentence
  case, so the candidate belongs to the captured version. Confirm whether this run is judged
  against Foundation v2 at all, and if so whether the caps were CSS-forced or authored.
- Profile was assumed, not locked. If this page is utility, the serif display type needs a brief.
