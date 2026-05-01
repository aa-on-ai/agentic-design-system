# run report

the artifact every agent emits after a build. the eval loop emits the same shape for benchmark runs. humans read this instead of (or before) the raw JSON.

copy this file into the project root as a template for the agent, or rely on the eval loop to generate it automatically at `testing/results/<slug>/report.md`.

---

## header

- **prompt:** one-line task description
- **slug:** short stable id (e.g. `canopy`, `pawprint`, `auth-flow-2026-04-21`)
- **file(s):** path(s) to the TSX produced
- **generator model:** e.g. `gpt-5.4`
- **judge model:** e.g. `claude-sonnet-4-6`
- **timestamp:** ISO 8601
- **score:** judge total / 50 (before → after if comparing)
- **verdict:** `ship` / `iterate` / `pivot` / `rebuild`

## project knowledge intake

record this before rule results when the task needed project context.

- **context status:** existing brief used / intake updated brief / skipped because task was self-contained
- **sources inspected:** docs, components, screenshots, references, prior decisions
- **questions asked:** count + exact questions, or `0 — files answered the brief`
- **identity artifact:** path to `DESIGN.md`, `guidelines.md`, preset, or project identity brief
- **handoff summary:** audience, domain nouns, visual posture, constraints, anti-goals

## reference intake (if applicable)

record this before rule results when the task used a screenshot, site, CodePen, “make it feel like…” reference, or needed launch/editorial art direction.

- **contract artifact:** path to `templates/reference-intake-contract.md`, copied contract, or `n/a`
- **source/reference:** URL, screenshot path, file, or description
- **primary borrowed layer:** structure / scale / motion / mood / typography / art style / surface / interaction model
- **secondary borrowed layers:** list, or `none`
- **do not borrow:** incidental chrome/content/structure that must stay out
- **fidelity target:** close mimic / same spirit / loose cue
- **comparison result:** screenshot path + 2–4 bullets on where the result matched the contract
- **unresolved drift:** what still differs from the reference and whether that is acceptable, needs follow-up, or needs Aaron's decision

## rules fired

surface every rule hit from the three deterministic scripts. count, severity, rule name, one-line description.

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

## rubric

two scoring frames. judge dimensions and the weighted 4-criterion rubric from `skills/agentic-design-system/SKILL.md`.

### judge dimensions (1–10)

| dimension | score | note |
|---|---:|---|
| hierarchy |  |  |
| spacing |  |  |
| copy |  |  |
| productFit |  |  |
| screenshotWorthy |  |  |

### weighted rubric (1–10, weights from SKILL.md)

| criterion | weight | score | note |
|---|---:|---:|---|
| Design Quality | 35% |  |  |
| Originality | 30% |  |  |
| Craft | 20% |  |  |
| Functionality | 15% |  |  |

**verdict rule:** if Design Quality or Originality is below 6, verdict is `iterate` or `pivot`, never `ship`.

## penalties (if applicable)

the eval loop's deterministic penalty schedule — keep this section when the report is part of a before/after benchmark; drop it for single-build reports.

| category | amount |
|---|---:|
| anti-pattern warnings | -2 each |
| anti-pattern info | -1 each |
| missing states | -3 each |
| accessibility warnings | -2 each |
| accessibility info | -1 each |
| no responsive breakpoints | -5 |

## what changed vs. baseline

only for benchmark runs. prose, 3–5 sentences. cite specific rule hits or rubric deltas. no cheerleading — if the delta is small or mixed, say so.

## follow-ups

1. rule hits that repeat across runs → candidates for `skills/design-review/references/anti-patterns.md`
2. rubric buckets under 6 → `iterate` or `pivot` before presenting
3. decisions worth preserving → propose diff to `guidelines.md`
4. anything a human should double-check that a script cannot

keep follow-ups to ≤5 items. if you need more, the build probably needs another pass before a report is useful.
