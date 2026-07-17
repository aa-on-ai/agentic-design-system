# Agentic Design System

Design governance for coding agents that build UI.

[See the live workshop](https://agentic-design-system.vercel.app) · [Read the design philosophy](./PHILOSOPHY.md)

Coding agents can produce a screen quickly. Agentic Design System gives them a repeatable way to decide what the screen is for, load the right product context, review the rendered result, attach evidence, and revise before calling it done.

ADS is a repo-local skill pack. It is not a hosted design agent or a UI generator.

## Install

From the project where your coding agent works:

```bash
npx skills add aa-on-ai/agentic-design-system --yes
```

Verify what was installed:

```bash
npx skills list
```

The installer currently adds ten skills under `.agents/skills/`. It does not create or replace your project’s `AGENTS.md`, `CLAUDE.md`, or other instruction file.

For one task, tell your agent:

```text
Use the agentic-design-system skill for this UI task. Define the outcome, read the project baseline, run the applicable review chain, and return rendered evidence before calling it done.
```

For an always-on project setup, add this to the instruction file your agent reads:

```markdown
For visual or UI work, read `.agents/skills/agentic-design-system/SKILL.md` first and follow its routing and verification contract.
```

The fuller [`templates/agents-snippet.md`](./templates/agents-snippet.md) is useful when you clone the repository and keep the complete `skills/`, `workflows/`, and `templates/` tree in your project.

### Install an exact checkout

Use this when you are reviewing a branch or local change:

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git
cd agentic-design-system
npx skills add . --yes
```

If `npx skills` is unavailable in your agent shell, use the [manual integration guide](#agent-integrations).

## The loop

```text
intent → baseline → rubric → build → rendered evidence → review → revise or release
```

| Stage | What the agent must establish |
|---|---|
| Intent | The user, situation, desired outcome, and stop condition |
| Baseline | Existing product rules, components, tokens, screenshots, and prior decisions |
| Rubric | Fixed quality gates plus criteria specific to this task |
| Evidence | Rendered states and breakpoints, accessibility, overflow, touch targets, and screenshots |
| Review | A verdict that can send the artifact back for revision |

The report is part of the product. “Looks good” is not evidence.

## What installs

### Orchestrator

- [`agentic-design-system`](./skills/agentic-design-system) routes the task, defines the outcome, and orders the gates.

### Core pack

- [`design-review`](./skills/design-review) checks hierarchy, product fit, anti-patterns, accessibility, and rendered quality.
- [`ux-baseline-check`](./skills/ux-baseline-check) checks loading, empty, error, interaction, responsive, and edge states.
- [`ui-polish-pass`](./skills/ui-polish-pass) finishes spacing, alignment, typography, and interaction details.

### Production and reference gates

- [`agent-friendly-design`](./skills/agent-friendly-design) covers semantic structure and machine-readable state for public products.
- [`visual-reference-calibration`](./skills/visual-reference-calibration) defines what to borrow from a screenshot, site, or visual reference before code is written.

### Creative pack

- [`design-variations`](./skills/design-variations) creates 3–5 structurally distinct directions in one disposable browser artifact before production implementation.
- [`whimsical-design`](./skills/whimsical-design) is opt-in for personality, delight, and expressive marketing work.
- [`world-build`](./skills/world-build) is opt-in for immersion and atmosphere.
- [`web-animation-design`](./skills/web-animation-design) is opt-in for motion and interaction feel.

Creative skills are not a default styling layer. Their trigger rules decide when they belong.

## Start a task

Use [`workflows/create-design-workflow.md`](./workflows/create-design-workflow.md) as the entrypoint.

| Need | Workflow |
|---|---|
| Route a design or review task | [`create-design-workflow`](./workflows/create-design-workflow.md) |
| Review mobile or responsive UI | [`mobile-review`](./workflows/mobile-review.md) |
| Critique finished UI from a separate context | [`adversarial-design-review`](./workflows/adversarial-design-review.md) |
| Check package installation | [`install-usability-smoke`](./workflows/install-usability-smoke.md) |
| Critique onboarding docs | [`readme-docs-critique`](./workflows/readme-docs-critique.md) |
| Test whether a cold agent can use ADS | [`cold-agent-usage-test`](./workflows/cold-agent-usage-test.md) |

A source checkout includes the full template set under [`templates/`](./templates/). The installed orchestrator bundles the five runtime templates it references: outcome, project identity, reference intake, grader report, and run report. The most useful starting artifacts are:

- [`outcome-template.md`](./templates/outcome-template.md)
- [`project-identity-template.md`](./templates/project-identity-template.md)
- [`reference-intake-contract.md`](./templates/reference-intake-contract.md)
- [`grader-report-template.md`](./templates/grader-report-template.md)
- [`run-report-template.md`](./templates/run-report-template.md)

## Rendered verification

Source checks are an inexpensive pre-flight. Rendered evidence is the real gate.

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>

node skills/design-review/scripts/capture.mjs "<running-route-url>" \
  --states default,loading,empty,error \
  --out evidence/<task>
```

For a meaningful modification, capture the baseline and candidate with the same states and breakpoints, then compare them:

```bash
node skills/design-review/scripts/compare.mjs \
  evidence/<task>-baseline \
  evidence/<task>-candidate
```

The comparison records what changed. It does not decide whether the change was good.

## Worked example

[`docs/loop-demo/`](./docs/loop-demo/) preserves a real three-pass run on an Orders screen at 390, 768, and 1280px.

- Iteration 1: 12 axe violations and 114 undersized touch targets
- Iteration 2: 12 undersized touch targets remained
- Iteration 3: zero axe violations and zero undersized touch targets

Only then did the grader return `satisfied`.

## Agent integrations

- [Claude Code](./integrations/claude-code.md)
- [Codex CLI](./integrations/codex.md)
- [Cursor](./integrations/cursor.md)
- [OpenClaw](./integrations/openclaw.md)
- [Hermes](./integrations/hermes.md)

## Repository map

```text
skills/        installable agent skills and rendered checks
workflows/     task entrypoints and review runbooks
templates/     outcome, project identity, reference, grader, and report shapes
presets/       starter baselines for common product types
testing/       package and evidence-loop smoke tests
demos/         the public workshop site and worked UI examples
docs/          influences, current audits, and archived provenance
```

Historical eval fixtures are intentionally kept under [`docs/archive/`](./docs/archive/) instead of mixed into the current product path.

## Verify a source checkout

```bash
testing/install-smoke.sh
npm run compare:smoke
npm run render-eval:smoke
npm run eval-loop:render-smoke
```

To exercise the public GitHub shorthand rather than the local checkout:

```bash
testing/install-smoke.sh aa-on-ai/agentic-design-system
```

## Status and limits

ADS is an early public package. The skills, templates, runbooks, and rendered checks are usable now. The grader loop is workflow-driven, not a hosted service.

- Agents still need real product context and human judgment.
- Structural checks cannot decide whether a visual direction is tasteful.
- Separate grader context is recommended when the host supports it.
- Creative passes can over-steer utility UI, so they stay opt-in.

## Influences

- [Intent Engineering](https://github.com/kylezantos/intent-engineering)
- [Anthropic Managed Agents: Define outcomes](https://platform.claude.com/docs/en/managed-agents/define-outcomes)
- [Agentic Rubrics as Contextual Verifiers for SWE Agents](https://huggingface.co/papers/2601.04171)
- [Karpathy autoresearch](https://github.com/karpathy/autoresearch)
- [DESIGN.md](https://github.com/google-labs-code/design.md)
- [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better)

See [`docs/influences.md`](./docs/influences.md) for what ADS borrows from each source.

## Contributing

If you find a recurring anti-pattern, a better routing rule, or a missing verification step, open an issue or pull request.

## License

[MIT](./LICENSE)
