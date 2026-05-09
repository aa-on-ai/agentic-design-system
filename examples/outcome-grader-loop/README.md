# outcome + grader loop

this is the thin v1 pattern for adopting outcome-based agent improvement.

it borrows the useful control shape from managed agent outcome loops without requiring a new orchestration engine:

```text
outcome_defined -> builder_started -> artifact_created -> grader_started -> needs_revision -> revision_started -> satisfied
```

## files

- `templates/outcome-template.md` defines what done means before work starts.
- `templates/grader-report-template.md` defines the separate evaluator response.
- `templates/run-report-template.md` records the completed loop beside the normal design report.

## example event trail

```text
outcome_defined | 2026-05-06T20:00:00-07:00 | improve billing settings page until demo-ready
builder_started | 2026-05-06T20:01:00-07:00 | builder read DESIGN.md and core pack
artifact_created | 2026-05-06T20:12:00-07:00 | preview and report emitted
grader_started | 2026-05-06T20:13:00-07:00 | separate grader reviewed screenshots and scripts
needs_revision | 2026-05-06T20:17:00-07:00 | Originality=5; mobile empty state weak
revision_started | 2026-05-06T20:18:00-07:00 | bounded revision prompt returned to builder
artifact_created | 2026-05-06T20:25:00-07:00 | revised preview and report emitted
grader_started | 2026-05-06T20:26:00-07:00 | grader reviewed iteration 2
satisfied | 2026-05-06T20:29:00-07:00 | clears rubric, no blockers
```

## v1 rule

docs/templates first. do not build a daemon around this until the manual loop proves useful across real runs.

If the grader cannot clear the work within the outcome's stated revision limit, record `escalate` and ask for human direction.
