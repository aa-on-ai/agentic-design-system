# Grader report

## Header

- **outcome:** `greenhouse-irrigation/outcome.md`
- **artifact:** `greenhouse-irrigation/iteration-1/evidence/` (8 rendered screenshots plus `evidence.json`)
- **builder:** Codex implementation / default tier
- **grader:** independent ADS grader / high-judgment tier
- **iteration:** 1 / 2
- **timestamp:** 2026-07-19T01:02:55-07:00
- **verdict:** `satisfied`

## Verdict

`satisfied`. The rendered artifact clears the Glasshouse outcome and the locked benchmark contract. A first-time operator can identify that B2 propagation was below target, understand that telemetry loss puts schedule editing into safe mode, and see that calling Maya Chen remains available. The adjacent-action sweep passes at both breakpoints: `Adjust schedule` and `Call grower` are visibly available in `default`; in `error`, the schedule control is visibly disabled while the grower action remains clearly actionable, with surrounding copy that states the same contract. No blocker or major finding remains.

## Rubric scores

| criterion | weight | score | verdict | note |
|---|---:|---:|---|---|
| Design Quality | 35% | 8 | pass | The earthy greenhouse palette, expressive editorial type, calm information spine, and restrained surfaces form a coherent operational identity across all states and widths. |
| Originality | 30% | 8 | pass | The run-first composition, domain language, crop-zone readings, custom status treatment, and non-grid hierarchy are specific to glasshouse irrigation rather than a generic dashboard skin. |
| Craft | 20% | 9 | pass | Typography, spacing, alignment, warning treatment, responsive reflow, state-specific hierarchy, and control contrast are consistently resolved; rendered gates report no overflow, small targets, serious axe findings, or CLS failures. |
| Functionality | 15% | 9 | pass | The next run, exception, zone order, restriction, reason, and still-valid contact path are understandable without guessing. Required controls remain usable in `default`, and their `error` treatment is unambiguous. |
| Intent alignment | pass/fail | — | pass | Accomplish, notice, and operational feel support one another: the operator sees the run and moisture exception first, then gets an explicit action contract for normal and safe-mode operation. |
| Required states covered | pass/fail/n/a | — | pass | `default`, `loading`, `empty`, and `error` are visibly distinct at 390×844 and 1280×800. |
| Accessibility | pass/fail | — | pass | `evidence.json` reports axe available, zero serious/critical violations, main landmarks present, required live regions present, no targets under 44px, and no overflow or CLS failure. |
| Evidence attached | pass/fail | — | pass | Eight screenshots and one rendered-evidence packet were reviewed. |

**Weighted score:** `8.35 / 10` (`8×0.35 + 8×0.30 + 9×0.20 + 9×0.15`).

## Structured findings

| id | category | severity | rubric row | state @ breakpoint | target / region | observation | evidence |
|---|---|---|---|---|---|---|---|

No minor, major, or blocker finding was identified in the frozen rendered evidence.

## Hard stops reviewed

- **Intent observability:** pass. B2, its 24% reading against a 28–32% target, the upcoming run, telemetry status, safe-mode consequence, and next available action are explicit in the screenshots.
- **Adjacent-action consistency:** pass. In `default` at 390×844 and 1280×800, both `Adjust schedule` and `Call grower` look enabled and the copy says the plan is editable. In `error` at both widths, `Adjust schedule` is visibly muted while `Call grower` retains enabled styling; the alert, action-card copy, and helper text all agree that editing is blocked but calling still works. The native-semantics receipt confirms a disabled button and enabled `tel:` link in `error`, with both enabled in `default`.
- **Simpler-and-dumber check:** pass. A first-time operator can say what is wrong (GH-02 telemetry is offline; B2 was below target), what cannot be changed (the schedule), and what remains possible (call the on-duty grower).

## Missing criteria

none

## Next revision prompt

Not applicable; verdict is `satisfied` and no blocker or major finding requires a revision.

## Human decision needed

none

## Verification reviewed

| check | status | note |
|---|---|---|
| anti-pattern-check.py | pass | Builder receipt records one advisory false positive for CSS media queries; rendered 390px evidence is the authority and passes responsive gates. |
| state-check.py | pass | Builder receipt reports loading, empty, and error state source signals. |
| accessibility-check.py | pass | Builder receipt reports zero warnings and zero info findings. |
| build/typecheck | not run | Static single-file artifact; the grader was restricted to screenshot evidence and did not inspect implementation source. |
| screenshots / preview | pass | 8/8 PNGs inspected at original resolution; every requested state and breakpoint is present. |

Rendered hard-gate verification from `evidence.json`: axe available; zero serious/critical violations; no horizontal overflow; no main-landmark failures; no live-region failures; no touch targets under 44px; CLS available for all eight captures with maximum `0`; no CLS failures; all requested states confirmed rendered.

## Event

```text
grader_finished | 2026-07-19T01:02:55-07:00 | verdict=satisfied | Glasshouse passes the v1.3.1 adjacent-action contract at both breakpoints with no material findings
```
