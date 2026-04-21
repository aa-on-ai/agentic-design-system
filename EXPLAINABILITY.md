# explainability

why every run should leave an audit trail, and what that trail looks like.

## the problem

the design system already produces a number. `testing/results/summary.json` says the loop lifts output from 16 to 40.3 on the included prompts. that is a scoreboard. it does not explain:

- which rules fired
- which rubric dimensions shifted
- what the judge actually said
- what a human reviewer should double-check
- what to feed back into the system next time

"the score went up" is not a governance signal. "the before variant missed loading, empty, and error states, used zinc-800 in 61 places, and the judge marked productFit down because the header copy read as generic weather-app filler" is a governance signal.

## the artifact

every run — benchmark or production build — should emit a `report.md` with four sections:

### 1. header

- prompt
- models used (generator, judge)
- timestamp
- final score + delta vs. baseline

### 2. rules fired

from the three verification scripts in `skills/design-review/scripts/`:

- `anti-pattern-check.py` — default palettes, placeholder text, generic button labels, `transition: all` usage, etc.
- `state-check.py` — loading, empty, error presence
- `accessibility-check.py` — semantic HTML, aria, alt text, heading hierarchy

each rule hit is surfaced by name, severity, and count. this is the deterministic floor.

### 3. rubric scores

the 5 judge dimensions from `testing/judge-prompt.md` (hierarchy, spacing, copy, productFit, screenshotWorthy) plus the 4-weight rubric from `skills/agentic-design-system/SKILL.md` (Design Quality 35%, Originality 30%, Craft 20%, Functionality 15%). each dimension shows before/after and a one-line judge comment where available.

### 4. follow-ups

what a human should look at:

- any dimension that dropped
- rule hits that repeat across runs (candidates for `references/anti-patterns.md`)
- rubric buckets under 6 on Design Quality or Originality (per SKILL.md, those are don't-ship thresholds)
- anything the identity file (`guidelines.md`) should learn

## why this is the differentiator

other tools in this space ship critics, slash commands, or rewrites. none of them ship a readable audit trail that compounds. the trail is what turns "the agent ran some checks" into "this build can be reviewed, challenged, and fed back into the system."

- buyers of governance products need legibility. a JSON blob is not legibility.
- the compounding story in `PHILOSOPHY.md` requires an artifact to compound on. the report is that artifact.
- the same template works at eval time (benchmark) and at build time (agent in a user's repo), which is why `templates/run-report-template.md` exists.

## how it's wired

- `testing/eval-loop.ts` writes `testing/results/<slug>/report.md` on every run alongside `scores.json`.
- user-space agents emit the same shape after every build, guided by `templates/run-report-template.md`.
- `templates/agents-snippet.md` tells the agent to produce a report before presenting work.
- `ci/design-eval.py` remains the fast deterministic gate; the report is the longer narrative companion.

## what the report is not

- not a replacement for human review
- not a ship/no-ship decision — SKILL.md's "below 6 on Design Quality, don't present" is the threshold, and that's a rubric call, not a rule-hit call
- not a full transcript of the agent's thinking — it's the post-mortem, not the session log
