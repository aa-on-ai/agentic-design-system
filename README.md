# Agentic Design System

Your agent writes code. Without a design system, it writes UI that looks like every other AI-built UI: card grids, dark gradients, cramped spacing, missing error states, and references translated into the wrong thing.

Agentic Design System is the loop your agent runs on UI work: start with a preset, add project knowledge when the team needs alignment, add reference intake when a visual target matters, critique, fix, screenshot, emit a report, then present. Install one skill pack and skip whatever does not apply.

Works with Claude Code, Cursor, Codex CLI, OpenClaw, Hermes-style agent shells, and any tool that reads the [Agent Skills](https://agentskills.io) spec.

## Quick install

```bash
npx skills add aa-on-ai/agentic-design-system
```

Default path:

1. Paste [`templates/agents-snippet.md`](./templates/agents-snippet.md) into the agent instruction file for your tool.
2. Copy a [preset](./presets/) as `guidelines.md` if you have no project context.
3. Prompt normally.

Optional layers:

- Add **Project Knowledge Intake** when the project needs shared context or stakeholder alignment.
- Add **Reference Intake** when a screenshot/site/CodePen/“make it feel like…” target matters.
- Skip both for straightforward UI work.

## Integration paths

| Tool | Put the instructions here | Notes |
|---|---|---|
| [Claude Code](./integrations/claude-code.md) | `CLAUDE.md` or `AGENTS.md` | Paste snippet, add preset, prompt normally. |
| [Hermes](./integrations/hermes.md) | Agent instructions + readable skills path | Point at skills, paste snippet, add gates only when needed. |
| [OpenClaw](./integrations/openclaw.md) | Workspace `AGENTS.md` + sub-agent handoffs | Paste snippet; include relevant gates in UI sub-agent handoffs. |
| [Cursor](./integrations/cursor.md) | `.cursorrules` or `.cursor/rules` | Works best in Composer/agent mode. |
| [Codex CLI](./integrations/codex.md) | `AGENTS.md` or `codex.md` | Large context helps with full-chain review and reference comparisons. |

## Pick your setup

Three opinionated starting points. Copy the right one into your project and the agent knows what “good” looks like for your kind of work.

| Preset | For | Skips |
|---|---|---|
| [**Utilitarian app**](./presets/utilitarian-app.md) | Admin tools, internal dashboards, forms | Decoration, animation theater |
| [**Dense dashboard**](./presets/dense-dashboard.md) | Analytics, data tables, monitoring | Gradients, marketing flourish |
| [**Marketing editorial**](./presets/marketing-editorial.md) | Landing pages, launches, content sites | Utilitarian minimalism |

No preset fits and the project has real constraints? Run Project Knowledge Intake. The agent gathers existing docs/components/references, asks only the missing questions, then fills the [project identity template](./templates/project-identity-template.md) as a `DESIGN.md`-shaped brief.

## The gates

### Project Knowledge Intake

Optional. Use it before visual work when context is thin and the project needs alignment.

- Reads docs, specs, routes, components, tokens, screenshots, and prior decisions.
- Captures audience, domain nouns, visual posture, constraints, accessibility floor, and anti-goals.
- Asks only the missing blocking questions.
- Emits or updates `DESIGN.md` so downstream skills build against the same taste model.

### Reference Intake Gate

Optional. Use it before generation when a reference matters: screenshot, site, CodePen, Dribbble shot, “make it feel like…”, launch/editorial art direction, or a prior miss where the output was generic/sloppy/wrong vibe.

Use [`templates/reference-intake-contract.md`](./templates/reference-intake-contract.md). The agent must state:

- Source/reference
- Primary borrowed layer: structure, scale, motion, mood, typography, art style, surface, or interaction model
- Secondary borrowed layers
- What not to borrow
- Fidelity target: close mimic, same spirit, or loose cue
- Product constraints
- Success cues, failure cues, and open questions

Hard rule: if the agent cannot state what to borrow, what not to borrow, and the fidelity target, it cannot build.

## What it actually does

On every UI task, your agent runs only the gates that apply:

1. **Preset** if you have no project context.
2. **Project Knowledge Intake** when context is incomplete or alignment matters.
3. **Reference Intake Gate** when a visual/art-direction reference matters.
4. **Design Review** to catch anti-patterns, weak hierarchy, and product-fit misses.
5. **UX Baseline Check** to verify loading, empty, error, and edge states.
6. **UI Polish Pass** to tighten spacing, alignment, typography, focus, and responsive details.
7. **Run Report** with checks, rubric scores, files changed, screenshots, known risks, and unresolved drift.

Creative skills — whimsical-design, world-build, web-animation-design — are opt-in when the task actually calls for them. [Routing](./routing/ROUTING.md) decides which fire.

## Does it actually work?

One model, same prompt, with vs. without the loop.

**[Canopy](./examples/case-studies/canopy.md)** — agent-built landing page. **23 anti-patterns → 0.** State coverage 0/3 → 3/3. Rubric 16 → 40 (out of 50).

**[Pawprint](./examples/case-studies/pawprint.md)** — agent-built dashboard. **61 → 0.** 0/3 → 3/3 states. Rubric 15 → 41.

**[Notion AI Settings](./examples/case-studies/notion-ai-settings.md)** — agent-built settings surface. **123 → 0.** 0/3 → 3/3 states. Rubric 17 → 40.

| Prompt | Without | With | Delta |
|---|---:|---:|---:|
| Canopy (landing) | 16 | 40 | +24 |
| Pawprint (dashboard) | 15 | 41 | +26 |
| Notion AI (settings) | 17 | 40 | +23 |
| **Average** | **16** | **40.3** | **+24.3** |

Scored 0–50 across hierarchy, spacing, copy, product-fit, and screenshot-worthiness. Judged by Claude Sonnet on rendered output. [Reproduce it →](./testing/)

## Why this works

Agents are bad at spontaneously avoiding design anti-patterns. They are much better at finding those problems when given explicit criteria after the fact.

The loop exploits that asymmetry, but starts with context. Ingest or interview first, build against a project identity, calibrate visual references before code, then run structured critique with checks the agent could not reliably hold in mind during generation.

The `report.md` is the difference between “my agent got better” and “here is exactly what it fixed.”

## Manual install

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git

# Global, if your agent reads shared skills
cp -r agentic-design-system/skills ~/.claude/skills/

# Or project-level
cp -r agentic-design-system/skills your-project/skills/
```

## What is in the box

| | |
|---|---|
| **Core skills** | [design-review](./skills/design-review/), [ux-baseline-check](./skills/ux-baseline-check/), [ui-polish-pass](./skills/ui-polish-pass/) |
| **Reference gate** | [visual-reference-calibration](./skills/visual-reference-calibration/) + [reference intake contract](./templates/reference-intake-contract.md) |
| **Creative skills** | [whimsical-design](./skills/whimsical-design/), [world-build](./skills/world-build/), [web-animation-design](./skills/web-animation-design/) |
| **Agent-friendly design** | Semantic HTML, ARIA, structured data, llms.txt, MCP patterns |
| **Verification scripts** | Anti-pattern / state / accessibility checks, Python stdlib only |
| **Presets** | 3 opinionated starters + [portable JSON](./schemas/preset.schema.json) + [identity template](./templates/project-identity-template.md) |
| **Explainability** | [`report.md`](./templates/run-report-template.md) per run, [model](./EXPLAINABILITY.md), [examples](./examples/run-reports/) |
| **Case studies** | [Canopy](./examples/case-studies/canopy.md) · [Pawprint](./examples/case-studies/pawprint.md) · [Notion AI Settings](./examples/case-studies/notion-ai-settings.md) |
| **Integrations** | [Claude Code](./integrations/claude-code.md), [Hermes](./integrations/hermes.md), [OpenClaw](./integrations/openclaw.md), [Cursor](./integrations/cursor.md), [Codex CLI](./integrations/codex.md) |

## Limitations

- Creative passes can over-steer utilitarian UI. That is why they are opt-in.
- Depends on agents actually following skill instructions. Works best with frontier models.
- Code-only review catches a lot. Screenshot-based review catches more.
- Raises the floor and makes misses inspectable. It does not replace taste or product judgment.
- Verification scripts catch structural issues, not aesthetic ones. Reference Intake and screenshot review are the craft layer.

## How is this different from Impeccable?

[Impeccable](https://impeccable.style) is a quality gate with slash commands for polish. This adds the full evaluation loop: project knowledge intake, reference calibration, structured critique passes, state coverage, creative direction routing, verification scripts, and a report.

## Related

- [react-grab](https://github.com/aidenybai/react-grab) — point an agent at exact components to fix
- [Impeccable](https://impeccable.style) — ergonomic slash-command polish
- [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) — micro-detail heuristics
- [userinterface.wiki](https://www.userinterface.wiki/) — UX theory and pattern reasoning

## Further reading

- [PHILOSOPHY.md](./PHILOSOPHY.md) — design philosophy behind the system
- [PHASE-2.md](./PHASE-2.md) — the control plane: presets, explainability, identity
- [EXPLAINABILITY.md](./EXPLAINABILITY.md) — how `report.md` is generated and why it exists

## Contributing

If you find a recurring anti-pattern, a better routing rule, or a skill that should exist, open a PR.

## License

MIT
