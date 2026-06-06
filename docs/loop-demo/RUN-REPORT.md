# run report

## header

- **intent/outcome:** Build an Orders list screen for an internal admin tool, with default, loading, empty, and error states. Utilitarian aesthetic, core pack only.
- **slug:** orders-list-admin-2026-06-05
- **file(s):** Orders list screen (admin tool) — see build artifact
- **builder model/tool:** Claude Code
- **grader model/tool:** separate grader agent (judged screenshots)
- **timestamp:** 2026-06-05
- **verdict:** `failed` (iterations 2/3; touch-target hard gate never cleared)

## project knowledge intake

- **context status:** skipped — task was self-contained (utilitarian admin tool, core pack only)
- **sources inspected:** n/a for this report (orchestrated run)
- **questions asked:** 0 — task brief was self-contained
- **identity artifact:** utilitarian aesthetic (utilitarian-app posture)
- **handoff summary:** internal admin tool; domain nouns = orders, status, date range; visual posture utilitarian/dense; constraint = core pack only; anti-goal = decorative/marketing styling

## reference intake (if applicable)

n/a — no visual reference supplied.

## rendered evidence (authoritative — gate on this)

This is the non-gameable tier: axe ran on the real DOM, overflow is measured, "rendered" means the state actually produced content, fonts are computed, and the grader judged screenshots.

### iteration 1 (RENDERED, authoritative)

| signal | result | gate |
|---|---|---|
| serious/critical axe violations | 12 | **FAIL** (> 0) |
| horizontal overflow | none measured | pass |
| states rendered | default=yes, loading=yes, empty=yes, error=yes | pass |
| rendered font(s) | `-apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | pass (no agent-default Inter rendered) |
| touch targets < 44px | 102 controls | **FAIL** |
| grader verdict (on screenshots) | needs_revision | — |
| grader scores | design 7 / originality 6 / craft 5 / functionality 7 | — |

Gate pass: **false.** Authoritative failing rows (rendered + grader):
- Touch targets undersized at mobile: `button.btn` (362x35), `input#search` (198x36), `select#f-status` (111x35), `select#f-range` (118x35), nav links (50-67px wide)
- 12 axe serious accessibility violations
- Mobile default state shows table truncation / text overflow in DATE column

### iteration 2 (RENDERED, authoritative)

| signal | result | gate |
|---|---|---|
| serious/critical axe violations | 0 | pass |
| horizontal overflow | none measured | pass |
| states rendered | default=yes, loading=yes, empty=yes, error=yes | pass |
| rendered font(s) | `-apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | pass (no agent-default Inter rendered) |
| touch targets < 44px | 68 controls | **FAIL** |
| grader verdict (on screenshots) | failed | — |
| grader scores | design 7.5 / originality 5.5 / craft 7 / functionality 6 | — |

Gate pass: **false.** Authoritative failing rows (rendered + grader):
- State toggle buttons (Default, Loading, Empty, Error): 99x36, 64x25, 67x25, 58x25 — below 44x44
- Filter selects `#f-status`, `#f-range`: 111x35, 118x35 — below 44x44
- Search input: 438x36 — insufficient height
- Order ID links: 50-67px wide, ~25px tall — below 44x44
- Email links: 50-67px wide, ~25px tall — below 44x44
- **Deterministic gate final result: FAIL** (68 controls < 44px)

> Axe regressions were fully resolved between iterations (12 → 0 serious). The touch-target hard gate was reduced (102 → 68 undersized controls) but never cleared, so the verdict cannot be `satisfied`.

## rules fired (source heuristics — pre-flight, gameable)

These would grep the `.tsx` source and can pass on a comment. **No SOURCE heuristic (python grep) results were supplied for this run** — the orchestrator reported only the RENDERED tier above. The tables below are left as the expected shape; do not treat them as sign-off, and note that they are advisory even when present.

### anti-pattern-check.py

| severity | rule | count |
|---|---|---|
| — | not run / not reported | — |

### state-check.py

| state | present (source heuristic) |
|---|---|
| loading | not reported (rendered: yes) |
| empty | not reported (rendered: yes) |
| error | not reported (rendered: yes) |

> State presence is confirmed by the RENDERED tier (all four states produced content in both iterations), which supersedes the source grep.

### accessibility-check.py

| severity | rule | count |
|---|---|---|
| — | not run / not reported | — |

> Authoritative accessibility signal is the RENDERED axe run (0 serious in iteration 2), not this grep.

## mobile review (if applicable)

The failures are concentrated at the mobile/responsive viewport (touch targets, DATE column truncation), so the defect table below applies.

### design forks & opinions (ranked by user impact — judgments, not defects)

| fork | call / opinion | impact | tradeoff + signal |
|---|---|---|---|
| control density on mobile | utilitarian dense layout kept desktop-sized controls at mobile width | high | dense is on-brief for an admin tool, but it collided with the 44px touch-target gate |

### platform defects (objective — severity-tiered)

| severity | issue | file:line | fix |
|---|---|---|---|
| P0 | 68 interactive controls below 44x44 at mobile (state toggles, filter selects, search height, Order ID + email links) | rendered (source line n/a) | raise min height/width to 44px or expand tap area via padding/`::before` hit-slop; convert tiny text links to full-size row affordances |
| P1 (iter 1, fixed iter 2) | 12 serious axe violations | rendered | resolved between iterations (0 in iter 2) |
| P1 (iter 1) | DATE column truncation / text overflow in mobile default state | rendered | reflow table to stacked cards or allow date wrap at narrow widths |

## grader summary

| dimension | result | note |
|---|---|---|
| intent alignment | pass | Orders list with all four required states present (rendered) |
| baseline fit | pass | utilitarian posture; system font stack rendered, no Inter default |
| task-specific rubric | fail | touch-target hard gate failed both iterations (102, then 68 controls < 44px) |
| required states covered | pass | default/loading/empty/error all rendered in both iterations |
| evidence attached | pass | rendered axe/overflow/state/font + grader-on-screenshots both iterations |

## what changed vs. baseline

Between iteration 1 and 2 the build cleared the accessibility regression entirely (12 serious axe violations → 0) and reduced undersized touch targets from 102 to 68 controls; all four states rendered in both passes and the system font stack rendered correctly (no agent-default Inter). Craft improved on the grader (5 → 7) and design quality ticked up (7 → 7.5), but functionality dropped (7 → 6) and originality slipped (6 → 5.5), and the grader verdict moved from `needs_revision` to `failed`. The blocking issue is unchanged in kind: the 44px touch-target hard gate was never satisfied, so the deterministic gate result is FAIL and the verdict cannot be `satisfied`. This is a real, mixed result — accessibility was fixed, but the size/tap-target rework was incomplete.

## follow-ups

1. **Touch targets (P0, blocker):** bring all 68 remaining controls to >= 44x44 (or expand hit area) before another grader pass — this is the single gate keeping the verdict at `failed`.
2. **DATE column overflow:** confirm the iter-1 mobile truncation is actually resolved in the rendered iter-2 capture (overflow measured none, but grader flagged it earlier).
3. **Recurring 44px misses on dense admin UIs** are a candidate note for `skills/design-review/references/anti-patterns.md` (utilitarian density vs. touch-target floor).
4. **Source heuristics were not reported** — wire anti-pattern/state/accessibility greps into the run so the pre-flight tier is visible, even though the rendered tier remains authoritative.
