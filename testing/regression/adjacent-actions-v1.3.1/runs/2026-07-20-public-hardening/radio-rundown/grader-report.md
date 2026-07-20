# grader report

> Candidate rerun note, 2026-07-20: this prior independent grade is retained because the fresh
> candidate matrix is 8/8 perceptually identical to the frozen evidence. The candidate verifier
> separately re-executes the native adjacent-action checks.

## header

- **outcome:** `radio-rundown/outcome.md`
- **artifact:** `radio-rundown/iteration-1/evidence/` (eight rendered screenshots plus `evidence.json`)
- **builder:** Codex implementation / isolated clean-room builder
- **grader:** independent ADS grader / high-judgment
- **iteration:** 1 / 2
- **timestamp:** `2026-07-19T01:10:51-07:00`
- **verdict:** `satisfied`

## verdict

The rendered artifact clears the Radio rundown outcome and the ADS v1.3.1 release gate. A first-time producer can identify the playout-owned lock, see that segment order cannot be changed, and see that host coordination remains available. Default preserves both actions, while error disables only `Move segment` and keeps `Call host` visually actionable; the banner, helper copy, button treatment, and interaction receipt agree at both breakpoints. All four states are distinct and composed on mobile and desktop, the evidence passes every rendered hard gate, and no blocker or major finding remains.

## rubric scores

Weighted score: **8.15 / 10**

| criterion | weight | score | verdict | note |
|---|---:|---:|---|---|
| Design Quality | 35% | 8 | pass | The warm broadcast-sheet frame, navy live board, restrained state colors, and single rundown spine form a coherent operational hierarchy. |
| Originality | 30% | 8 | pass | Timing, line connection, playout authority, segment statuses, and editorial typography are specific to live community radio rather than a generic card dashboard. |
| Craft | 20% | 8 | pass | Type, rules, spacing, state colors, timeline markers, wrapping, and responsive reflow remain consistent across all eight screenshots without clipping or overflow. |
| Functionality | 15% | 9 | pass | On-air, next, timing risk, lock scope, blocked mutation, and preserved human coordination are immediately legible; action priority remains unambiguous. |
| Intent alignment | pass/fail | pass | pass | Accomplish, notice, and operational feel are all visible and mutually reinforcing. |
| Required states covered | pass/fail/n/a | pass | pass | Default, loading, empty, and error render at 390x844 and 1280x800 with meaningful differentiation. |
| Accessibility | pass/fail | pass | pass | `evidence.json` reports zero serious/critical axe violations, present main and required live regions, and no touch targets under 44px. |
| Evidence attached | pass/fail | pass | pass | Eight of eight required screenshots and the rendered evidence manifest were reviewed. |

## structured findings

No minor, major, or blocker finding was supported by the rendered evidence.

| id | category | severity | rubric row | state @ breakpoint | target / region | observation | evidence |
|---|---|---|---|---|---|---|---|

## hard stops reviewed

- **Intent specificity:** pass. The UI names schedule authority, the prohibited reordering action, the preserved host-contact action, current timing, and the 19:30 handoff.
- **Adjacent-action consistency in default:** pass at 390x844 and 1280x800. `Move segment` and `Call host` are both visibly actionable; the supplied interaction receipt confirms both are native enabled buttons and both click paths produce live feedback.
- **Adjacent-action consistency in error:** pass at 390x844 and 1280x800. `Move segment` is visibly muted and struck, and the supplied interaction receipt confirms native disabled semantics. `Call host` retains strong emphasis and the receipt confirms it remains native enabled and clickable. The alert and helper text explicitly describe both sides of the boundary.
- **Rendered hard gates:** pass. All requested states rendered; serious accessibility violations, horizontal overflow, landmark failures, live-region failures, undersized touch targets, and CLS failures are all zero. CLS is available at all eight state/breakpoint combinations with a maximum of 0.

## missing criteria

none

## next revision prompt

none; the artifact is satisfied at iteration 1.

## human decision needed

none

## verification reviewed

| check | status | note |
|---|---|---|
| anti-pattern-check.py | pass | Builder receipt reports only the checker’s plain-CSS breakpoint false positive; both rendered breakpoints show responsive reflow with no overflow or clipping. |
| state-check.py | pass | Builder receipt reports loading, empty, and error source signals; screenshots independently confirm all four requested rendered states. |
| accessibility-check.py | pass | Builder receipt reports zero warnings; rendered axe and semantic gates also pass. |
| build/typecheck | not run | Screenshot-only grade; no implementation source was inspected or executed. |
| screenshots / preview | pass | All 8/8 PNGs were inspected at original resolution, covering four states at both fixed breakpoints. |

## event

```text
grader_finished | 2026-07-19T01:10:51-07:00 | verdict=satisfied | Radio rundown clears ADS v1.3.1 with weighted score 8.15 and no findings.
```
