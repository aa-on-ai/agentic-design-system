# grader report

Optional artifact for substantial authorized independent review. Label the actual reviewer and evidence; a self-review is not independent, and this format is not required for tiny edits.

---

## header

- **outcome:** path or slug
- **artifact:** route, file path, screenshot set, or preview URL
- **builder:** model / lane
- **grader:** model / lane
- **visual foundation profile:** `utility` / `expressive` with eligibility reason
- **iteration:** current / max
- **timestamp:** ISO 8601
- **verdict:** `satisfied` / `needs_revision` / `max_iterations` / `failed`

## verdict

one paragraph. be direct. say whether the artifact clears the outcome, not whether effort was good.

## Outcome judgment

Review in order. Record the observation and artifact supporting each applicable criterion:

| criterion | outcome | evidence / remaining decision |
|---|---|---|
| Intended product, surface and user task | pass / fail / unverified | |
| Information/action structure and return context | pass / fail / unverified / n/a | |
| Reference fidelity and chosen visual direction | pass / fail / unverified / n/a | |
| Craft and component consistency | pass / fail / unverified | |
| Applicable behavior, states, accessibility and delivery | pass / fail / unverified | |

Name baseline strengths to preserve. Numeric Foundation rubric scores may be included as optional
diagnostics; they cannot clear a failed task, unverified requirement or material finding.

## structured findings

The qualitative outcome verdict governs. Use this table to locate supported failures; `rubric row`
may name a task-specific criterion such as product fit or IA, without numeric scoring. Use an empty
table when there are no supported findings; do not manufacture criticism.

| id | category | severity | rubric row | state @ breakpoint | target / region | observation | evidence |
|---|---|---|---|---|---|---|---|
| finding-001 | layout_spacing_hierarchy / polish_consistency / typography / originality / color_contrast / interaction_motion / cues_affordances / brand_fit_tone | minor / major / blocker | Design Quality / Originality / Craft / Functionality / task-specific | default @ 390x844 | element + optional normalized x/y/w/h | one falsifiable failure statement | screenshot path + supporting fact |

- `minor`: localized friction or finish issue that does not block the outcome
- `major`: material quality failure that should be repaired before sharing or shipping
- `blocker`: the artifact cannot satisfy the intended outcome or core task while this remains
- a blocker cannot return `satisfied`
- subjective findings do not become deterministic hard gates without a rendered measurement

## coverage ledger

account for every ADS diagnostic category. `clear` means reviewed with no finding, `finding` means
one or more findings exist in that category, and `not reviewed` means the available artifact could
not support a judgment. every row needs evidence. there is no minimum finding count.

| category | status | evidence |
|---|---|---|
| layout_spacing_hierarchy | clear / finding / not reviewed | screenshot, measurement, or reason not reviewed |
| polish_consistency | clear / finding / not reviewed |  |
| typography | clear / finding / not reviewed |  |
| originality | clear / finding / not reviewed |  |
| color_contrast | clear / finding / not reviewed |  |
| interaction_motion | clear / finding / not reviewed |  |
| cues_affordances | clear / finding / not reviewed |  |
| brand_fit_tone | clear / finding / not reviewed |  |

## hard stops reviewed

- the selected profile was locked before generation and meets its eligibility rule
- every confirmed visual-foundation `never` rule is resolved
- vague intent words like "delight", "empower", or "confidence" fail unless tied to observable UI evidence
- adjacent-action consistency: status and instructional copy agree with every visible nearby
  primary, secondary, toolbar, and inline action in each state and breakpoint; a contradictory
  enabled-looking action is a major `cues_affordances` finding and prevents `satisfied`

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
| modal contract | pass / fail / not verified / n/a | initial focus, Tab/Shift+Tab containment, Escape, focus return, inert background |
| pointer-gated hover motion | pass / fail / not reviewed / n/a | motion-bearing hover rules use fine-pointer capability gates |
| motion retrigger | pass / fail / not reviewed / n/a | second trigger inside the animation window retargets or deliberately debounces |

## event

write one event line for the outcome log.

```text
grader_finished | timestamp | verdict=<satisfied|needs_revision|max_iterations|failed> | note
```
