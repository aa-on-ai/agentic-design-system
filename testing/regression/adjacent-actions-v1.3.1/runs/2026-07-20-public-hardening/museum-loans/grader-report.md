# grader report

> Candidate rerun note, 2026-07-20: this prior independent grade is retained because the fresh
> candidate matrix is 8/8 perceptually identical to the frozen evidence. The candidate verifier
> separately re-executes the native adjacent-action checks.

## header

- **outcome:** `museum-loans/outcome.md`
- **artifact:** `museum-loans/iteration-2/evidence/` (8 rendered screenshots plus `evidence.json`)
- **builder:** Codex implementation / isolated clean-room repair
- **grader:** independent ADS grader / high-judgment, same context as iteration 1
- **iteration:** 2 / 2
- **timestamp:** 2026-07-19T01:17:18-07:00
- **verdict:** `satisfied`

## run receipt

```yaml
GBRAIN_CHECK: exact_page channels/agentic-design found; inherited parent receipt
SOURCE_TRUTH:
  benchmark_contract: ../../BENCHMARK-CONTRACT.md
  case_outcome: ../outcome.md
  prior_grade: ../iteration-1/grade.json
  prior_grader_report: ../iteration-1/grader-report.md
  ads_release_sha: f7d9037012f4c730150b37fbcf86b510aedd6ecb
TASK_SCOPE: screenshot-only regrade of the one allowed Museum finding-001 repair
OVERREACH_BOUNDARY: no implementation source, other case, prior benchmark, archived score, deploy, or public write inspected or changed
RUN_ARTIFACT: iteration-2/evidence/evidence.json and all 8 iteration-2 PNGs
SCORER_RESULT: satisfied; weightedScore=8.15
STOP_CONDITION: done_verified
ROUTE_USED: independent ADS grader / high-judgment
GIT_EVIDENCE: no git changes; no tracked diff, index change, commit, branch, push, deploy, or external mutation
```

## verdict

The repaired artifact clears the Museum-loans outcome. `finding-001` is closed: the first 844px
of `error-390x844.png` states that approval permission is required, explains that only a senior
registrar can approve, shows `Approve transfer` visibly disabled, and keeps `Download condition
report` visibly enabled and actionable. The helper text explicitly preserves report access. The
mobile error state is now immediately distinct from default, while the object, condition concern,
and custody spine remain available below. Desktop and default behavior remain intact, every
rendered hard gate passes, and the full adjacent-action sweep contains no contradiction or
over-disabling.

## rubric scores

| criterion | weight | score | verdict | note |
|---|---:|---:|---|---|
| Design Quality | 35% | 8 | pass | The repair creates a clear mobile decision-first hierarchy without weakening the restrained museum-record composition. |
| Originality | 30% | 8 | pass | Object, condition, custody, and conservator language remain specific and deliberately composed rather than dashboard-generic. |
| Craft | 20% | 8 | pass | The compact alert, paired 64px actions, helper copy, responsive continuation, typography, and spacing are clean; rendered accessibility and stability gates pass. |
| Functionality | 15% | 9 | pass | A first-time registrar can immediately identify the block, its cause, and the preserved evidence action; default and desktop workflows remain usable. |
| Intent alignment | pass/fail |  | pass | Accomplish, notice, and operational safety now support one another at both breakpoints. |
| Required states covered | pass/fail/n/a |  | pass | Default, loading, empty, and error render at both 390x844 and 1280x800. |
| Accessibility | pass/fail |  | pass | Axe is available with zero serious/critical violations; main and required live regions pass; no touch target is under 44px. |
| Evidence attached | pass/fail |  | pass | All 8 iteration-2 PNGs and `evidence.json` are present and independently inspected. |

Weighted score: **8.15 / 10** (`8×0.35 + 8×0.30 + 8×0.20 + 9×0.15`).

## prior finding closure

| prior finding | status | repair evidence | closure judgment |
|---|---|---|---|
| finding-001 | closed | `evidence/error-390x844.png`, initial 844px | The initial mobile viewport contains the permission alert, senior-registrar explanation, disabled approval button, enabled report-download button, and preserving helper copy. It is visibly distinct from `evidence/default-390x844.png`. |

## structured findings

| id | category | severity | rubric row | state @ breakpoint | target / region | observation | evidence |
|---|---|---|---|---|---|---|---|

## hard stops reviewed

- Rendered hard gates pass for all 8 screenshots: Axe serious/critical findings are zero,
  horizontal overflow and landmark/live-region failures are absent, touch targets under 44px are
  absent, CLS is available with maximum 0, and every requested state is confirmed.
- In error at 390x844, the state contract is visible before object detail. Permission is missing;
  senior-registrar approval is required; approval is disabled; the condition report remains
  available through an enabled-looking action and explicit helper copy.
- In error at 1280x800, the alert, hold status, disabled approval, enabled report download, and
  helper text remain aligned. The desktop record/decision composition remains coherent.
- In default at both breakpoints, `Approve transfer` and `Download condition report` remain visibly
  active; the builder's native-state receipt reports both enabled. In error at both breakpoints,
  the same receipt reports native disabled approval and native enabled report download, and its
  interaction probe successfully downloads the report without JavaScript errors.
- Loading presents no premature action and retains polite status/live semantics. Empty presents
  only the enabled `Open active loan` recovery action. No adjacent control contradicts its state.

## missing criteria

none

## next revision prompt

none

## human decision needed

none

## verification reviewed

| check | status | note |
|---|---|---|
| anti-pattern-check.py | fail | Builder-reported unchanged advisory `No responsive breakpoints` false positive; authoritative rendered evidence passes responsive gates. |
| state-check.py | pass | Builder-reported pass; rendered evidence independently confirms all four states at both breakpoints. |
| accessibility-check.py | pass | Builder-reported pass; rendered Axe, landmark, live-region, touch-target, and CLS evidence independently pass. |
| build/typecheck | not run | Not part of this screenshot-only grader pass; implementation source was not inspected. |
| screenshots / preview | pass | 8/8 iteration-2 PNGs opened with the image viewer at original detail; `evidence.json` gates reviewed. |

## event

```text
grader_finished | 2026-07-19T01:17:18-07:00 | verdict=satisfied | finding-001 closed; mobile permission decision is immediate and adjacent actions remain semantically correct
```
