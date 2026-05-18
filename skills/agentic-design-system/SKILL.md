---
name: agentic-design-system
description: >
  Router for AI agents doing visual, frontend, UI, component, page, layout,
  styling, or design work. ADS means define intent, gather context, build,
  grade against a custom rubric, revise, and report evidence.
---

# Agentic Design System

Use ADS before visual work. Route narrowly, define the outcome when the work
has meaningful visual risk, and report evidence. Do not load every skill by
default.

For visual work, the core quality path is the default. Creative, production,
and motion skills are additive layers, not replacements.

## When To Use

- New or changed UI, frontend, component, page, layout, styling, motion, or visual system work.
- Design QA, screenshot review, demo polish, responsive fixes, or public surface changes.
- Any task where the user asks for ADS, a rubric, a grader, or evidence.

## When Not To Use

- Backend, scripts, data, config, docs, or research with no visual artifact.
- Copy-only edits unless they affect UI hierarchy, UX writing, or presentation.
- Mechanical dependency or formatting work.

## Project Context

If DESIGN.md exists at the repo root, or the orchestrator passes one in, read
it before building. It is the normative design handoff.

- YAML frontmatter tokens win over prose on direct conflicts.
- Prose explains judgment, anti-goals, and edge cases.
- Preserve unknown sections without error.

The DESIGN.md-shaped template lives at templates/project-identity-template.md.

## Routing

Start with the smallest branch that matches, then add any extra layers that
also apply:

- Non-visual task: skip ADS.
- Existing UI modification: read design-review.
- New page, component, or flow: read design-review, ux-baseline-check, and ui-polish-pass.
- Production surface: add agent-friendly-design.
- Animation, motion, or interaction feel: add web-animation-design.
- Personality, delight, or brand expression: add whimsical-design.
- Immersion, atmosphere, or world feel: add world-build.

Creative skills are opt-in. If the product should be quiet and utilitarian,
make the default excellent instead of making it different.

## Outcome And Grader Loop

Define an outcome before building when the task is:

- a new page, component, flow, public/demo surface, or broad responsive/layout change
- a creative-pack task
- touching two or more visual files
- explicitly asking for ADS, a rubric, a grader, or the loop

Use templates/outcome-template.md when available. The split is:

- builder makes the artifact
- grader evaluates in a separate context when available
- builder revises from grader feedback
- human approves final taste-sensitive calls
- if no separate grader is available, write grader: none and grader none reason

Use templates/grader-report-template.md for grader output and
templates/run-report-template.md for the final receipt. Longer rubric guidance
lives in references/rubric-and-loop.md.

## Required Checks

Before presenting visual work:

- Render it and inspect the target viewport.
- Compare against the reference or existing product pattern.
- Run the relevant design-review scripts when available.
- State what changed, what was checked, and any remaining uncertainty.

If Design Quality or Originality would score below 6/10, revise before presenting.

## References

- references/rubric-and-loop.md - detailed rubric, loop events, iteration rules
- templates/outcome-template.md - outcome definition
- templates/grader-report-template.md - separate grader response
- templates/run-report-template.md - evidence receipt
- routing/ROUTING.md - install/package routing details
