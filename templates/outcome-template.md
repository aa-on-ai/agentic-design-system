# outcome

Optional expanded brief for substantial work. Reuse the existing task brief when it already answers the job, exact surface, preserve-list, reference, output and success criterion. Tiny edits do not need this document.

---

## header

- **task:** one-line user request
- **slug:** short stable id
- **artifact:** requested output format and exact existing route, component, document or file
- **preserve:** controls, content, tokens and behavior that must survive
- **delivery:** usable review destination and separately authorized release scope, if any
- **owner agent:** builder model / lane
- **grader agent:** separate model / lane, if available
- **visual foundation profile:** `utility` / `expressive` with eligibility reason
- **created:** ISO 8601
- **max iterations:** shared ADS budget: one pass plus one repair, unless the user supplied another total
- **status:** `defined` / `building` / `grading` / `needs_revision` / `satisfied` / `max_iterations` / `failed`

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

## Acceptance

Use the ADS judgment order. Record task-specific evidence, not a required weighted score:

1. Right product, exact surface and successful user task.
2. Understandable information/action order and preserved reading/navigation context.
3. Agreed reference property and fidelity, or the established product direction.
4. Coherent craft and component mechanics.
5. Applicable states, accessibility, target browser/viewport behavior and usable delivery.

Use the locked utility/expressive Foundation profile. Numeric rubric scores, if useful, remain
diagnostic and cannot offset a failed task, missing evidence or an unresolved material finding.

## Hard stops

- Wrong surface/task, confirmed Foundation `never` violation, or missing required behavior prevents a satisfied verdict.
- Investigate source warnings against actual behavior; heuristics do not establish or clear a defect.
- Unavailable required evidence stays unverified, not passed.
- Vague intent words need observable meaning in the product, not merely a claim in the report.
- At the shared budget boundary preserve the candidate and exact unresolved decision; do not automatically rebuild or add another loop.

## iteration budget

This is the shared host budget, not an additional allowance. An explicitly authorized task budget supersedes these defaults. Self-scores are diagnostic; independent or human judgment governs quality claims.

| work type | default max | stop rule |
|---|---:|---|
| bug fix / narrow visual fix | 2 | if still failing, reset diagnosis |
| normal UI/page/component | 2 | one pass plus one repair; preserve unresolved findings |
| creative/reference-heavy work | 2 | same task budget; no automatic aesthetic pivot |

## grader instructions

Use a separate critic only when authorized, available and meaningful for the task. Otherwise label
self-review honestly and retain any required human judgment. A critic reads:

1. this outcome
2. the artifact/report/screenshots
3. relevant `DESIGN.md` or project identity
4. verification output

the grader does not rewrite code. it returns `templates/grader-report-template.md` in a repo clone
or `<orchestrator-skill>/templates/grader-report-template.md` from an installed pack.

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
human_approved | timestamp | note
```
