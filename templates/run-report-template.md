# run report

optional evidence artifact for substantial UI work. use this when a build needs inspectable receipts beyond the grader report: changed files, checks, screenshots, risks, and what still needs human judgment.

copy this file into the project root as a template for the agent. small edits usually only need the grader report; larger page or component work benefits from this fuller receipt.

---

## header

- **intent/outcome:** path to the outcome artifact, or one-line task description for small work
- **slug:** short stable id (e.g. `auth-flow-2026-04-21`)
- **file(s):** path(s) changed
- **builder model/tool:** e.g. `gpt-5.4`, Claude Code, Codex CLI
- **grader model/tool:** e.g. separate agent context, human review, `n/a`
- **timestamp:** ISO 8601
- **verdict:** `satisfied` / `needs_revision` / `max_iterations` / `failed`

## project knowledge intake

record this before rule results when the task needed project context.

- **context status:** existing brief used / intake updated brief / skipped because task was self-contained
- **sources inspected:** docs, components, screenshots, references, prior decisions
- **questions asked:** count + exact questions, or `0 - files answered the brief`
- **identity artifact:** path to `DESIGN.md`, `guidelines.md`, preset, or project identity brief
- **handoff summary:** audience, domain nouns, visual posture, constraints, anti-goals

## reference intake (if applicable)

record this before rule results when the task used a screenshot, site, CodePen, "make it feel like..." reference, or needed launch/editorial art direction.

- **contract artifact:** path to `templates/reference-intake-contract.md`, copied contract, or `n/a`
- **source/reference:** URL, screenshot path, file, or description
- **primary borrowed layer:** structure / scale / motion / mood / typography / art style / surface / interaction model
- **secondary borrowed layers:** list, or `none`
- **do not borrow:** incidental chrome/content/structure that must stay out
- **fidelity target:** close mimic / same spirit / loose cue
- **comparison result:** screenshot path + 2-4 bullets on where the result matched the contract
- **unresolved drift:** what still differs from the reference and whether that is acceptable, needs follow-up, or needs Aaron's decision

## rendered evidence (authoritative — gate on this)

from `capture.mjs` against the live route. this is the non-gameable tier: axe ran on the
real DOM, overflow is measured, "rendered" means the state actually produced content.

| signal | result | gate |
|---|---|---|
| serious/critical axe violations | (n) | fail if > 0 |
| horizontal overflow | (none / state@WxH) | fail if any |
| states rendered | loading=?, empty=?, error=? | fail if any required state did not render |
| rendered font(s) | (computed font-family) | flag if a known agent default (Inter) actually renders |
| screenshots | (paths) | required for verdict |

> if no rendered evidence is attached, the verdict cannot be `satisfied`. source heuristics below are pre-flight only.

## rules fired (source heuristics — pre-flight, gameable)

these grep the `.tsx` source and can pass on a comment. treat as advisory, not sign-off.
count, severity, rule name, one-line description.

### anti-pattern-check.py

| severity | rule | count |
|---|---|---|
| warning | (name) | 0 |
| info | (name) | 0 |

### state-check.py

| state | present |
|---|---|
| loading | yes / no |
| empty | yes / no |
| error | yes / no |

### accessibility-check.py

| severity | rule | count |
|---|---|---|
| warning | (name) | 0 |
| info | (name) | 0 |

## grader summary

summarize the outcome/grader result. include task-specific criteria when the outcome defines them.

| dimension | result | note |
|---|---|---|
| intent alignment | pass / fail |  |
| baseline fit | pass / fail |  |
| task-specific rubric | pass / fail |  |
| required states covered | pass / fail / n/a |  |
| evidence attached | pass / fail |  |

## what changed vs. baseline

prose, 3-5 sentences. cite specific visual, copy, state, accessibility, or interaction changes. no cheerleading. if the delta is small or mixed, say so.

## follow-ups

1. rule hits that repeat across runs -> candidates for `skills/design-review/references/anti-patterns.md`
2. failed grader rows -> `needs_revision` before presenting
3. decisions worth preserving -> propose diff to `guidelines.md`
4. anything a human should double-check that a script cannot

keep follow-ups to 5 items or fewer. if you need more, the build probably needs another pass before a report is useful.
