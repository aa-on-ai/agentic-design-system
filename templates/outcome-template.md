# outcome

define this before the agent starts building. outcome is the work contract: what artifact is being produced, how it will be judged, when the loop stops, and when a human needs to step in.

---

## header

- **task:** one-line user request
- **slug:** short stable id
- **artifact:** route, component, file path, screenshot set, or prototype URL
- **owner agent:** builder model / lane
- **grader agent:** separate model / lane, or `none`
- **grader none reason:** required if no separate grader is used
- **created:** ISO 8601
- **revision limit:** explicit number or `human decides`
- **status:** `defined` / `building` / `grading` / `needs_revision` / `satisfied` / `escalate`

## when to use this

create an outcome for UI work when any of these are true:

- user explicitly asks to use ADS / the loop / a rubric / a grader
- new page, new component, new flow, or public/demo surface
- broad layout, responsive, visual-system, or creative-direction change
- the change touches two or more visual files
- the creative pack fires

skip the outcome for tiny copy fixes, mechanical one-file bug fixes, and non-visual work. still emit a normal `report.md` when code changes.

## intent

define the user-facing intent before defining done.

- **user / situation:** who this is for and what just happened
- **accomplish:** what the user needs to do, decide, understand, or trust
- **notice:** what the UI must make obvious first
- **feel / operational state:** the state the UI should create, such as confident enough to decide, calm enough to inspect, oriented enough to compare, or safe enough to edit
- **alignment check:** does what they notice create the right operational state, and does that state support what they need to accomplish?

## outcome

what does done mean?

example:

> improve `/settings/billing` until it is demo-ready: clear hierarchy, complete loading/empty/error states, no obvious AI-default styling, accessible controls, and screenshot evidence at desktop and mobile.

## artifact contract

| item | required |
|---|---|
| changed files listed | yes / no |
| screenshots or preview link | yes / no |
| deterministic checks | yes / no |
| run report | yes / no |
| grader report | yes / no |

## rubric

score 1-10 unless a criterion is pass/fail.

| criterion | weight | pass condition |
|---|---:|---|
| Design Quality | 35% | coherent visual system; hierarchy, layout, color, and spacing feel intentional |
| Originality | 30% | avoids obvious AI defaults; shows product-specific choices |
| Craft | 20% | spacing, typography, contrast, hover/focus, responsive behavior are competent |
| Functionality | 15% | primary task and state transitions are understandable |
| State coverage | pass/fail | loading, empty, and error states exist or are explicitly not applicable |
| Accessibility | pass/fail | semantic structure, focus paths, labels, alt text, and contrast clear the scripts/review |
| Evidence | pass/fail | report, screenshots/preview, and verification commands are present |

## hard stops

- Design Quality below 6 -> `needs_revision`
- Originality below 6 on creative or marketing work -> `needs_revision` or `pivot`
- missing required state with no stated reason -> `needs_revision`
- accessibility warning left unresolved -> `needs_revision` unless human accepts it
- vague intent words like "delight", "empower", or "confidence" fail unless tied to observable UI evidence
- revision limit reached -> `escalate`; do not keep patching

## grader instructions

the grader should be a separate context from the builder for outcome work. if no separate grader is available, set `grader agent: none`, write the reason, and make that visible in the run report.

the grader reads:

1. this outcome
2. the artifact/report/screenshots
3. relevant `DESIGN.md` or project identity
4. verification output

the grader does not rewrite code. it returns `templates/grader-report-template.md`.

## event log

append one line per loop event.

```text
outcome_defined | timestamp | note
builder_started | timestamp | note
artifact_created | timestamp | note
grader_started | timestamp | note
needs_revision | timestamp | note
revision_started | timestamp | note
satisfied | timestamp | note
escalate | timestamp | note
human_approved | timestamp | note
```
