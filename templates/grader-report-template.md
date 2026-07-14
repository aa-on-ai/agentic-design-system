# grader report

the artifact emitted by a separate grader pass. the builder should not self-clear final quality on non-trivial UI work.

---

## header

- **outcome:** path or slug
- **artifact:** route, file path, screenshot set, or preview URL
- **builder:** model / lane
- **grader:** model / lane
- **iteration:** current / max
- **timestamp:** ISO 8601
- **verdict:** `satisfied` / `needs_revision` / `max_iterations` / `failed`

## verdict

one paragraph. be direct. say whether the artifact clears the outcome, not whether effort was good.

## rubric scores

| criterion | weight | score | verdict | note |
|---|---:|---:|---|---|
| Design Quality | 35% |  | pass / fail |  |
| Originality | 30% |  | pass / fail |  |
| Craft | 20% |  | pass / fail |  |
| Functionality | 15% |  | pass / fail |  |
| Intent alignment | pass/fail |  | pass / fail | accomplish/notice/feel are visible in the artifact and support each other |
| Required states covered | pass/fail/n/a |  | pass / fail / n/a | loading, empty, error, focus, and mobile states are covered or explicitly not applicable |
| Accessibility | pass/fail |  | pass / fail |  |
| Evidence attached | pass/fail |  | pass / fail | screenshots or preview link for visible changes; diff for code changes |

## iteration comparison

required for iteration 2 and later. on the first iteration, set the previous artifact to `n/a`
and comparison rows to `n/a - no previous artifact`.

- **previous artifact / iteration:** path or screenshot set + iteration number
- **current artifact / iteration:** path or screenshot set + iteration number

| criterion | previous | current | comparison | evidence |
|---|---:|---:|---|---|
| Design Quality |  |  | better / same / worse / n/a | screenshot-specific delta |
| Originality |  |  | better / same / worse / n/a | screenshot-specific delta |
| Craft |  |  | better / same / worse / n/a | screenshot-specific delta |
| Functionality |  |  | better / same / worse / n/a | screenshot-specific delta |
| Intent alignment |  |  | better / same / worse / n/a | observable outcome delta |
| (task-specific criterion) |  |  | better / same / worse / n/a | evidence |

### hard-gate regressions

| hard gate | previous | current | regressed? | evidence |
|---|---|---|---|---|
| accessibility | pass / fail / n/a | pass / fail / n/a | yes / no / n/a | axe rule id or receipt |
| interaction | pass / fail / n/a | pass / fail / n/a | yes / no / n/a | touch target, focus, or keyboard receipt |
| required states | pass / fail / n/a | pass / fail / n/a | yes / no / n/a | rendered state receipt |
| horizontal overflow | pass / fail / n/a | pass / fail / n/a | yes / no / n/a | state@breakpoint |

- **next bounded change:** one testable revision, or `none - satisfied`

## hard stops reviewed

- vague intent words like "delight", "empower", or "confidence" fail unless tied to observable UI evidence
- `satisfied` is impossible if a previously passing accessibility, interaction, required-state,
  or horizontal-overflow hard gate regressed in the current iteration

## missing criteria

list only blockers or material gaps. if none, write `none`.

1.

## next revision prompt

if verdict is `needs_revision`, provide the exact next prompt for the builder. keep it bounded and testable.

```text

```

## human decision needed

list judgment calls the grader cannot resolve. if none, write `none`.

1.

## verification reviewed

| check | status | note |
|---|---|---|
| anti-pattern-check.py | pass / fail / not run |  |
| state-check.py | pass / fail / not run |  |
| accessibility-check.py | pass / fail / not run |  |
| build/typecheck | pass / fail / not run |  |
| screenshots / preview | pass / fail / not available |  |

## event

write one event line for the outcome log.

```text
grader_finished | timestamp | verdict=<satisfied|needs_revision|max_iterations|failed> | note
```
