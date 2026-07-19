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

## structured findings

the four weighted scores remain the verdict layer. use this table to say exactly what failed,
where it failed, and which rendered artifact proves it. use an empty table only when the grader
found no minor or material issues.

| id | category | severity | rubric row | state @ breakpoint | target / region | observation | evidence |
|---|---|---|---|---|---|---|---|
| finding-001 | layout_spacing_hierarchy / polish_consistency / typography / originality / color_contrast / interaction_motion / cues_affordances / brand_fit_tone | minor / major / blocker | Design Quality / Originality / Craft / Functionality / task-specific | default @ 390x844 | element + optional normalized x/y/w/h | one falsifiable failure statement | screenshot path + supporting fact |

- `minor`: localized friction or finish issue that does not block the outcome
- `major`: material quality failure that should be repaired before sharing or shipping
- `blocker`: the artifact cannot satisfy the intended outcome or core task while this remains
- a blocker cannot return `satisfied`
- subjective findings do not become deterministic hard gates without a rendered measurement

## hard stops reviewed

- vague intent words like "delight", "empower", or "confidence" fail unless tied to observable UI evidence

## missing criteria

list only blocker or major finding ids. this is the compatibility summary derived from the
structured table. if none, write `none`.

1.

## next revision prompt

if verdict is `needs_revision`, provide the exact next prompt for the builder. keep it bounded and
testable, and include every blocker and major finding id that must be repaired.

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
