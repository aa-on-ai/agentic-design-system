# Agentic Design System

Agentic Design System is a set of installable skills, markdown templates, checks, and examples for coding agents that build UI.

It is for Claude Code, Codex, OpenClaw, Hermes, Cursor, and similar agent shells. The point is simple: before an agent declares a screen done, it should define the user-facing intent, read the project baseline, judge the artifact against a task-specific rubric, attach evidence, and revise when the result misses.

This is repo-local control flow, not a hosted design agent. Some parts are runnable skills and scripts. Some parts are templates the agent fills in. Some parts are dogfooded patterns that make the work inspectable until they become tighter automation.

Status: early public package. The skills and templates are usable now; the grader loop is still workflow-driven, not a hosted service.

## How it works

Intent -> baseline -> rubric -> build with evidence -> grade and revise.

| Step | What ADS gives the agent | Status |
|---|---|---|
| 1. Define intent / outcome | [`templates/outcome-template.md`](./templates/outcome-template.md): user, situation, accomplish, notice, operational state, stop condition | template |
| 2. Capture background / baseline | Project Knowledge Intake, `DESIGN.md`-shaped project identity, presets, references, routes, screenshots, prior decisions | skill + template |
| 3. Write the review lens | [`templates/grader-report-template.md`](./templates/grader-report-template.md): fixed quality rows plus task-specific criteria | template + pattern |
| 4. Build with evidence | Routed skills, deterministic checks, changed files, screenshots or preview, known risks, and run report | skill + script + template |
| 5. Grade and revise | Separate grader context when available, returning `satisfied`, `needs_revision`, `max_iterations`, or `failed` | template + pattern |

That loop is the product. Presets, checks, and archived fixtures are support machinery.

## Workflows

If you just want to *use* ADS, start at [`workflows/create-design-workflow.md`](./workflows/create-design-workflow.md).
It's the default "help me design or review something" entrypoint and routes you into the right
path by intent. Each runbook in [`workflows/`](./workflows/) is decision-shaped — when to use it,
what to read, what to run, what evidence is required, what report to produce, and when to stop.

| Workflow | Use it to |
|---|---|
| [create-design-workflow](./workflows/create-design-workflow.md) | route any design/review task to the right profile (start here) |
| [mobile-review](./workflows/mobile-review.md) | review a mobile/responsive/app/PWA screen (judgment vs defects, two passes) |
| [adversarial-design-review](./workflows/adversarial-design-review.md) | critique finished UI from a context that didn't build it |
| [install-usability-smoke](./workflows/install-usability-smoke.md) | verify ADS installs and the bundled skills/templates are present |
| [readme-docs-critique](./workflows/readme-docs-critique.md) | judge whether the docs let a newcomer onboard |
| [cold-agent-usage-test](./workflows/cold-agent-usage-test.md) | test whether a brand-new agent can use ADS unaided |

## Install

Most exact path from the version you are reviewing:

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git
cd agentic-design-system
npx skills add . --yes
```

If you trust the repository default branch and want the shorthand:

```bash
npx skills add aa-on-ai/agentic-design-system --yes
```

Both paths assume a skills-compatible CLI. If your agent tool does not support `npx skills`, use the no-CLI install below and copy the repo's `skills/` directory into the location your agent reads. The full repo also includes presets, templates, integration docs, smoke tests, and archived early eval fixtures for reference.

Default path for a project:

1. Paste [`templates/agents-snippet.md`](./templates/agents-snippet.md) into the agent instruction file for your tool.
2. Pick or create a baseline for the project.
3. For substantial UI work, start from [`templates/outcome-template.md`](./templates/outcome-template.md) and grade with [`templates/grader-report-template.md`](./templates/grader-report-template.md).
4. Prompt normally, then require the report/evidence before accepting the work.

Day one file to paste: [`templates/agents-snippet.md`](./templates/agents-snippet.md).

## Choose a baseline

The agent needs something to judge against. Use the lightest baseline that fits the task.

| Baseline | Use when | Artifact |
|---|---|---|
| Existing project context | The repo already has design docs, components, tokens, screenshots, or prior decisions | Agent reads the source files directly |
| Project Knowledge Intake | The project needs shared taste/context before UI work | [`templates/project-identity-template.md`](./templates/project-identity-template.md) or `DESIGN.md` |
| Reference Intake | A screenshot, site, CodePen, "make it feel like...", or prior miss matters | [`templates/reference-intake-contract.md`](./templates/reference-intake-contract.md) |

No project context yet? See [`presets/`](./presets/) for utilitarian, dashboard, or editorial starters. Replace them with real project context as soon as you have it.

## Integration paths

First-class docs:

| Tool | Put the instructions here | Notes |
|---|---|---|
| [Claude Code](./integrations/claude-code.md) | `CLAUDE.md` or `AGENTS.md` | Paste the snippet, add a baseline, prompt normally. |
| [Codex CLI](./integrations/codex.md) | `AGENTS.md` or `codex.md` | Large context helps with full-chain review and reference comparisons. |
| [Cursor](./integrations/cursor.md) | Rules or agent instructions | Keep the skills readable and paste the snippet. |

Local/experimental docs also exist for [`OpenClaw`](./integrations/openclaw.md) and [`Hermes`](./integrations/hermes.md). They follow the same snippet/gate pattern, but they depend more on the local agent runtime.

## What is still a pattern

- Custom rubric generation is template-driven. The agent fills in task-specific criteria from the outcome and baseline.
- A separate grader is recommended when the host workflow supports it. ADS does not yet run a hosted grader service.
- Screenshot review depends on the project and agent environment. The templates require evidence; the runner is still your toolchain.
- The system raises the floor and makes misses inspectable. It does not replace taste or product judgment.

## Why this works

Agents are better at checking UI against explicit criteria than spontaneously holding every design constraint in mind while generating. ADS exploits that asymmetry, but starts with context instead of generic polish.

Define intent, gather the baseline, calibrate references when needed, build with routed skills, attach evidence, then grade the result. The report is the difference between "my agent got better" and "here is what changed, what passed, and what still needs human judgment."

## No-CLI install

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git

# Global, if your agent reads shared skills
cp -r agentic-design-system/skills ~/.claude/skills/

# Or project-level
cp -r agentic-design-system/skills your-project/skills/
```

## Verify the package

```bash
testing/install-smoke.sh
```

The smoke test installs from the local repo into a temporary project and verifies all 9 skills plus the bundled outcome/grader templates are present. Success ends with `install smoke passed: 9 skills and bundled outcome/grader templates`.

## Limitations

- Depends on agents actually following skill instructions. Works best with frontier models.
- Verification scripts catch structural issues, not aesthetic ones. Reference Intake and screenshot review are the craft layer.
- Creative passes can over-steer utilitarian UI. That is why they are opt-in.
- Separate grader context is a workflow recommendation, not a hosted service.
- Custom rubric generation is not fully automated yet.

## Influences and prior art

- [Intent Engineering](https://github.com/kylezantos/intent-engineering) - intent before output: user, situation, accomplish, notice, operational state
- [Anthropic Managed Agents: Define outcomes](https://platform.claude.com/docs/en/managed-agents/define-outcomes) - outcome, rubric, separate grader, iteration loop
- [Agentic Rubrics as Contextual Verifiers for SWE Agents](https://huggingface.co/papers/2601.04171) - repository-grounded rubrics and verifier signals for agent patches
- [Karpathy autoresearch](https://github.com/karpathy/autoresearch) - fixed runtime, single editable target, metric, experiment log, and repeated agent loop; this is the closest reference for how ADS defines its loop structure
- [DESIGN.md](https://github.com/google-labs-code/design.md) - structured project identity for agents
- [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) - micro-detail heuristics

## Further reading

- [PHILOSOPHY.md](./PHILOSOPHY.md) - design philosophy behind the system
- [docs/influences.md](./docs/influences.md) - what ADS borrows from each source and what it does not copy
- [docs/archive/](./docs/archive/) - pre-spine eval fixtures and earlier control-plane notes, kept for provenance

## Contributing

If you find a recurring anti-pattern, a better routing rule, or a skill that should exist, open a PR.

## License

[MIT](./LICENSE)
