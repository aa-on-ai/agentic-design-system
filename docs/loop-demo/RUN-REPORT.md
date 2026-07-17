# run report

## header

- **intent/outcome:** Build an Orders list screen for an internal admin tool, with default, loading, empty, and error states. Utilitarian aesthetic, core pack only.
- **slug:** ads-npc-green-orders-2026-06-05
- **file(s):** `/tmp/ads-npc-green/orders.html`
- **builder model/tool:** Claude Code (agentic-design-system, core pack)
- **grader model/tool:** grader judged on rendered screenshots; deterministic gates computed from rendered DOM
- **timestamp:** 2026-06-05
- **verdict:** `satisfied` (iteration 3 of 4)

## project knowledge intake

- **context status:** skipped — task was self-contained (internal admin Orders list, utilitarian posture stated in the outcome)
- **sources inspected:** outcome description; core pack rules (design-review, ux-baseline-check, ui-polish-pass)
- **questions asked:** 0 — the outcome defined audience (internal admin), screen (Orders list), required states (default/loading/empty/error), and aesthetic (utilitarian)
- **identity artifact:** utilitarian-app preset (baseline)
- **handoff summary:** internal admin tool; domain nouns = orders, status, date range; visual posture = utilitarian/dense; constraints = core pack only; anti-goals = decorative/marketing flourish

## reference intake (if applicable)

- n/a — no visual reference supplied; utilitarian preset used as baseline.

<!-- ads-decision-provenance:start -->
## decision provenance

- **manifest:** `docs/loop-demo/skill-manifest.json` (sha256 `2cfeb1319526…`)
- **scope:** Prospective Phase 5 provenance review over a preserved 2026-06-05 artifact. This verifies the current rule, source, artifact, and evidence mapping; it does not prove the original builder loaded these exact hashes.
- **capture status:** 4 observed, 0 declared
- **deterministic overhead:** 8.182ms total (6.492ms capture + 1.69ms verify), budget 250ms per operation
- **external work added:** 0 model calls, 0 browser calls, 0 network calls

| decision | artifact | governing skill + excerpt | source constraint | evidence | review |
|---|---|---|---|---|---|
| The Orders screen includes default, loading, empty, and error states instead of treating the happy path as the whole product. | [Orders screen state model](iter3/default-1280x800.png) | ux-baseline-check · `0cd0438dee`<br>Every screen ships with ALL states covered. No exceptions. This is the minimum bar. | Task: an "Orders" admin screen with default/loading/empty/error states, gated at 390 / 768 / 1280px. | [rendered state gate](iter3/evidence.json), [desktop screenshot](iter3/default-1280x800.png) | reviewed |
| Interactive controls were enlarged until every measured mobile target cleared the 44px gate. | [Mobile Orders controls](iter3/default-390x844.png) | design-review · `e2b379b311`<br>- **touch targets** — ≥ 44×44 (iOS) / 48×48 (Android) with a visible hit area; enough spacing between adjacent targets to avoid mis-taps. | - touch targets and responsive behavior handled cleanly | [rendered touch-target gate](iter3/evidence.json), [mobile screenshot](iter3/default-390x844.png) | reviewed |
| The final screen uses spacing and typography for hierarchy instead of decorative color noise. | [Desktop Orders hierarchy](iter3/default-1280x800.png) | design-review · `546806cbfb`<br>- [ ] Typography check — is hierarchy clear without leaning on color? | - hierarchy through spacing and type before color | [final desktop screenshot](iter3/default-1280x800.png), [final rendered gates](iter3/evidence.json) | reviewed |

> `observed` means the file was explicitly recorded as loaded before the provenance review. Because the artifact predates Phase 5, these rows remain `reviewed`; prospective runs can reach `verified` from a true pre-build manifest.
<!-- ads-decision-provenance:end -->

## rendered evidence (authoritative — gate on this)

This is the non-gameable tier. The gates below were **computed from the rendered DOM** (axe ran on the real DOM, overflow and touch targets measured at render), and the grader judged the **rendered screenshots**. This is the tier the verdict gates on.

### final state (iteration 3 — verdict `satisfied`)

| signal | result | gate |
|---|---|---|
| serious/critical axe violations | 0 | pass (fail if > 0) |
| horizontal overflow | none | pass (fail if any) |
| states rendered | default=yes, loading=yes, empty=yes, error=yes | pass (fail if any required state did not render) |
| touch targets < 44px (mobile) | 0 | pass |
| rendered font(s) | `-apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | pass — system stack, not a flagged agent default (Inter) |
| grader verdict (on screenshots) | `satisfied` | pass |
| grader scores | design 8, originality 7, craft 8, functionality 9 | pass |
| screenshots | `evidence/iter3/{default,loading,empty,error}-{1280x800,768x1024,390x844}.png` | attached |

### rendered-gate trajectory across iterations

| iter | gate pass | axe serious | overflow | states (d/l/e/err) | touch <44px | grader | scores (DQ/Orig/Craft/Func) |
|---|---|---|---|---|---|---|---|
| 1 | fail | 12 | none | yes/yes/yes/yes | 114 | needs_revision | 6 / 6 / 5 / 3 |
| 2 | fail | 12 | none | yes/yes/yes/yes | 12 | needs_revision | 6 / 5 / 6 / 6 |
| 3 | **pass** | 0 | none | yes/yes/yes/yes | 0 | **satisfied** | 8 / 7 / 8 / 9 |

Screenshots per iteration: `evidence/iter{1,2,3}/{default,loading,empty,error}-{1280x800,768x1024,390x844}.png`

> All four required states rendered content in every iteration, so the state gate was never the blocker. The two failing gates were **axe serious violations** and **mobile touch targets < 44px**, both cleared at iteration 3.

## rules fired (source heuristics — pre-flight, gameable)

These would grep the source (`orders.html`) and can pass on a comment, so they are **advisory only** and did not drive the verdict. No separate source-heuristic (python grep) pass was recorded in the evidence for this run; the deterministic gates above were computed from the **rendered DOM**, not from source greps. The tables below reflect what the rendered checks confirm, marked as the authoritative substitute rather than source greps.

### anti-pattern-check.py (source grep — not run this pass)

| severity | rule | count |
|---|---|---|
| — | not run as a source-grep pass; superseded by rendered axe/overflow/touch-target gates | n/a |

### state-check.py (source grep — superseded by rendered state-render)

| state | present (rendered, authoritative) |
|---|---|
| loading | yes |
| empty | yes |
| error | yes |

### accessibility-check.py (source grep — superseded by rendered axe)

| severity | rule | count |
|---|---|---|
| serious (rendered axe, final) | serious/critical violations | 0 |

## mobile review (if applicable)

Mobile was a gating dimension — touch targets were measured at 390x844.

### platform defects (objective — measured at mobile, now resolved)

| severity | issue | iter found | fix / resolution |
|---|---|---|---|
| P1 | Touch targets < 44px: `button.btn` (66x35, 89x35), links (~57x25–46x25), input (201x36), select (113x38) | iter 1 (114 under-44 targets) | resized interactive controls; reduced to 12 by iter 2, to 0 by iter 3 |
| P1 | Search input (201x42), Status dropdown (443x42), Date-range dropdown (795x42) under 44px height | iter 2 (12 under-44 targets) | control heights raised to >=44px; 0 under-44 targets at iter 3 |
| P1 | 12 serious axe violations (likely contrast / ARIA / semantic labeling) | iter 1-2 | resolved; 0 serious axe at iter 3 |
| P2 | Error-state details on light pink background — verify WCAG AA contrast | iter 2 (grader note) | contrast adjusted; grader cleared at iter 3 (0 axe serious) |

## grader summary

Grader judged the rendered screenshots; final verdict `satisfied`.

| dimension | result | note |
|---|---|---|
| intent alignment | pass | Orders list for internal admin, utilitarian — grader design 8 / functionality 9 at iter 3 |
| baseline fit | pass | utilitarian-app posture; no decorative drift |
| task-specific rubric | pass | all four required states (default/loading/empty/error) rendered content every iteration |
| required states covered | pass | rendered state-check: default/loading/empty/error all yes |
| evidence attached | pass | 12 screenshots/iteration across 3 viewports; `evidence/iter3/*` for final |

## what changed vs. baseline

The build reached `satisfied` in 3 of an allowed 4 iterations. The state model was correct from iteration 1 — all four states rendered content throughout — so iteration was driven entirely by accessibility and mobile ergonomics, not by missing functionality. Iteration 1 had 114 sub-44px touch targets and 12 serious axe violations; iteration 2 cut touch-target failures to 12 but still carried all 12 axe violations and a flagged low-contrast error panel; iteration 3 cleared both gates (0 axe serious, 0 sub-44px targets) and the grader's scores rose across every dimension (functionality 3 -> 9, craft 5 -> 8, design 6 -> 8). Originality stayed modest (5-7): the grader twice noted a standard admin table with conventional patterns, which is acceptable given the utilitarian, core-pack-only brief.

## follow-ups

1. Repeated rule hit across iter 1-2: mobile touch targets < 44px on inputs/selects/buttons — candidate for an explicit minimum-control-height entry in `skills/design-review/references/anti-patterns.md`.
2. Repeated rule hit: 12 serious axe violations held steady from iter 1 to iter 2 (touch-target fixes did not address them) — worth a pre-flight axe pass before the touch-target pass on future utilitarian tables.
3. Error-state contrast (light pink panel) needed a grader flag to surface — consider a contrast check on status/error surfaces in the baseline.
4. No source-heuristic (python grep) pass was recorded this run; verdict rests entirely on rendered evidence. A human may want to confirm a source pass is wired into the loop, or accept rendered-only gating as policy for static HTML deliverables.
