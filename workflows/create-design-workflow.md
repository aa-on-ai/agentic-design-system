# create design workflow — ADS entrypoint

**Start here when the task is "help me design or review some UI."** This is the default path:
it routes you into the right ADS profile or workflow based on intent, so you don't have to read
the whole repo first.

If you are a cold agent: read `AGENTS.md` and `routing/ROUTING.md` (repo-root paths) once, then
use the table below. ROUTING.md is the decision logic; the files in this directory are runnable
wrappers around it.

## Route by intent

| You want to… | Go to | Profile it runs |
|---|---|---|
| Build a new page / component | `workflows/new-page-component.mjs` — runnable route → build → capture → independent-grade → structured findings → revise (Claude Code Workflow tool). Optional dynamic Route phase; gates on responsive breakpoints **and** touch-target size; runs against a live `devUrl` **or** a self-contained `artifactPath` (no dev server). Or `routing/ROUTING.md` → **Core chain** + **Outcome + Grader loop** by hand | core pack + capture + grader |
| Explore options before choosing a direction | `skills/design-variations/SKILL.md` → build one disposable browser artifact → choose or blend → promote only the winner | divergence before core pack |
| Review existing UI before merge | [`adversarial-design-review.md`](./adversarial-design-review.md) | separate-context critique |
| Review a mobile / responsive / app / PWA screen | [`mobile-review.md`](./mobile-review.md) | two-pass mobile review |
| Add or review motion / animation | `routing/ROUTING.md` → **motion vocabulary pass**; deep work → `web-animation-design` | motion vocabulary |
| Check that ADS itself installs and is usable | [`install-usability-smoke.md`](./install-usability-smoke.md) | package smoke |
| Critique the README / docs for onboarding | [`readme-docs-critique.md`](./readme-docs-critique.md) | docs critique |
| Test whether a cold agent can use ADS | [`cold-agent-usage-test.md`](./cold-agent-usage-test.md) | usability eval |
| Explain why consequential UI decisions exist | [`decision-provenance.md`](./decision-provenance.md) — substantial work only; capture once before build, verify once at report time | lightweight provenance |

If two rows apply (e.g. a new mobile component), run the build path first, then the review
workflow as a separate pass — never let the builder self-clear its own review.

## The shared runbook shape

Every workflow in this directory is decision-shaped and answers the same seven questions, in order:

1. **When to use** — the trigger.
2. **Read first** — the canonical docs/skills/references (linked, not duplicated).
3. **Run** — commands/checks, if any.
4. **Evidence required** — what receipts must exist before a verdict.
5. **Output** — the report or artifact to produce.
6. **Blocked when** — conditions where you stop and surface the blocker instead of guessing.
7. **Stop when** — the done condition. Do not invent confidence past it.

## The thesis these workflows preserve

- **Evidence over assertion.** A verdict needs receipts (screenshots, check output, a report), not "looks good."
- **Separate the builder from the judge.** Critique runs in a context that did not build the thing.
- **Scores decide; findings diagnose.** Keep the four-score verdict layer, then point each failure to a category, severity, rendered location, and evidence artifact.
- **Name the uncertainty.** Opinions stay labeled as opinions; objective defects stay labeled as defects; blockers get surfaced, not smoothed over.

## What ships where

`npx skills add` installs the `skills/` tree, so installed agents get:

- the verification scripts — `capture.mjs`, the three source checks, and the lightweight decision-trace script
- the reference docs — `references/mobile.md`, `references/motion.md`, `references/structured-findings.md`, etc.
- bundled copies of these runbooks at `skills/agentic-design-system/workflows/` (kept byte-identical to the top-level `workflows/` by the install smoke's drift guard)

A full repo clone additionally has top-level `workflows/`, `testing/`, and `ci/`. One exception: `workflows/new-page-component.mjs` is a
**Claude Code Workflow-tool** script — it needs that runtime — so treat it as repo /
Claude-Code-only, not portable across agent shells (which is why it is not bundled here).
