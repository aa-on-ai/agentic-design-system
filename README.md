# agentic design system

your agent writes code. it writes UI that looks like every other AI-built UI — card grids, dark gradients, cramped spacing, missing error states.

this is a loop your agent runs on every UI task: critique, fix, emit a report, then present. install one pack of skills, and your agent becomes its own design reviewer.

works with Claude Code, Cursor, Codex CLI, OpenClaw, and any tool that reads the [Agent Skills](https://agentskills.io) spec.

## pick your setup

three opinionated starting points. copy the right one into your project and the agent knows what "good" looks like for your kind of work.

| preset | for | skips |
|---|---|---|
| [**utilitarian app**](./presets/utilitarian-app.md) | admin tools, internal dashboards, forms | decoration, animation theater |
| [**dense dashboard**](./presets/dense-dashboard.md) | analytics, data tables, monitoring | gradients, marketing flourish |
| [**marketing editorial**](./presets/marketing-editorial.md) | landing pages, launches, content sites | utilitarian minimalism |

no preset fits? the [project identity template](./templates/project-identity-template.md) is a 5-section form that defines your `DESIGN.md` from scratch in ten minutes.

## what it actually does

on every UI task, your agent runs three passes before presenting:

- **design-review** catches anti-patterns, flags bad hierarchy, tests product-fit
- **ux-baseline-check** makes sure loading, empty, error, and edge states exist (they usually don't)
- **ui-polish-pass** tightens spacing and alignment as the final step

three more skills (whimsical-design, world-build, web-animation-design) are opt-in when the task actually calls for them. [routing](./routing/ROUTING.md) decides which fire.

every run emits a [`report.md`](./templates/run-report-template.md) — rule hits, rubric scores, what got fixed, what's still your call. you know why it looks the way it does.

## how this composes

think of the system as one installable control plane with 8 skills doing different jobs in the loop:

- **agentic-design-system** is the orchestrator. it tells the agent which skills exist, when to route into them, and how to leave behind a readable artifact instead of a mysterious "trust me."
- **design-review** is the hard quality gate. it catches hierarchy, spacing, product-fit, and anti-pattern issues before the agent gets to call the work done.
- **ux-baseline-check** forces boring-but-critical completeness: loading, empty, error, and edge states.
- **ui-polish-pass** is the final tightening pass once the structural issues are solved.
- **agent-friendly-design** keeps the output legible to agents and machines too: semantic HTML, ARIA, structured data, llms.txt, and MCP-aware patterns.
- **whimsical-design** is optional personality. it only fires when the brief actually benefits from delight instead of getting noisier.
- **world-build** is optional atmosphere. it is for narrative environments and stronger visual framing, not default product chrome.
- **web-animation-design** is optional motion direction. it handles when movement clarifies hierarchy or feel instead of becoming theater.

that stack is the governance loop. the core skills raise the floor, the creative skills only enter when routing says they should, and the report explains what fired, what changed, and what still belongs to human judgment. phase 2 is basically making that loop visible enough that you can configure it, inspect it, and trust it without reading the whole repo first.

for first-time setup, start with a preset plus [`project-identity-template.md`](./templates/project-identity-template.md). [`brand-guidelines-template.md`](./templates/brand-guidelines-template.md) stays around as a deprecated bridge for older integrations, but the project identity template is the current path.

## does it actually work

one model, same prompt, with vs without the loop.

**[canopy](./examples/case-studies/canopy.md)** — agent-built landing page. **23 anti-patterns → 0.** state coverage 0/3 → 3/3. rubric 16 → 40 (out of 50).

**[pawprint](./examples/case-studies/pawprint.md)** — agent-built dashboard. **61 → 0.** 0/3 → 3/3 states. rubric 15 → 41.

**[notion-ai-settings](./examples/case-studies/notion-ai-settings.md)** — agent-built settings surface. **123 → 0.** 0/3 → 3/3 states. rubric 17 → 40.

| prompt | without | with | delta |
|---|---:|---:|---:|
| canopy (landing) | 16 | 40 | +24 |
| pawprint (dashboard) | 15 | 41 | +26 |
| notion-ai (settings) | 17 | 40 | +23 |
| **average** | **16** | **40.3** | **+24.3** |

scored 0–50 across hierarchy, spacing, copy, product-fit, and screenshot-worthiness. judged by Claude Sonnet on rendered output. [reproduce it →](./testing/)

## why this works

agents are bad at *spontaneously* avoiding design anti-patterns. they're surprisingly good at *finding* them when given explicit criteria after the fact.

the loop exploits that asymmetry. build first, then run structured critique with checklists the agent couldn't hold in mind during generation. [karpathy's auto-research pattern](https://x.com/karpathy/status/1886192184808149383), applied to UI.

but a loop without a readable artifact is just a score. the `report.md` is the difference between "my agent got better" and "here is exactly what it fixed."

## install

```bash
npx skills add aa-on-ai/agentic-design-system
```

then:

1. paste [`templates/agents-snippet.md`](./templates/agents-snippet.md) into your agent's instruction file (AGENTS.md, .cursorrules, .codex/instructions, etc.)
2. copy your chosen [preset](./presets/) into the project as `guidelines.md`
3. prompt normally — skills route themselves based on the task

<details>
<summary>manual install</summary>

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git

# global (every project)
cp -r agentic-design-system/skills ~/.claude/skills/

# or project-level
cp -r agentic-design-system/skills your-project/skills/
```

</details>

## what's in the box

| | |
|---|---|
| **core skills** | [design-review](./skills/design-review/), [ux-baseline-check](./skills/ux-baseline-check/), [ui-polish-pass](./skills/ui-polish-pass/) |
| **creative skills** | [whimsical-design](./skills/whimsical-design/), [world-build](./skills/world-build/), [web-animation-design](./skills/web-animation-design/) |
| **agent-friendly-design** | semantic HTML, ARIA, structured data, llms.txt, MCP patterns |
| **verification scripts** | anti-pattern / state / accessibility (Python, stdlib only) |
| **presets** | 3 opinionated starters + [portable JSON](./schemas/preset.schema.json) + [identity template](./templates/project-identity-template.md) |
| **explainability** | [`report.md`](./templates/run-report-template.md) per run, [model](./EXPLAINABILITY.md), [examples](./examples/run-reports/) |
| **case studies** | [canopy](./examples/case-studies/canopy.md) · [pawprint](./examples/case-studies/pawprint.md) · [notion-ai-settings](./examples/case-studies/notion-ai-settings.md) |
| **integrations** | [Claude Code, Cursor, Codex CLI, OpenClaw](./integrations/) |

## limitations

- creative passes can over-steer utilitarian UI — that's why they're opt-in
- depends on agents actually following skill instructions (works best with frontier models)
- code-only review catches a lot; screenshot-based review catches more (contrast, truncation, visual weight)
- raises the floor, not the ceiling — doesn't replace taste or product judgment
- verification scripts catch structural issues, not aesthetic ones

## how is this different from Impeccable?

[Impeccable](https://impeccable.style) is a quality gate with slash commands for polish. this adds the full evaluation loop: structured critique passes, state coverage, creative direction routing, and verification scripts. use both if you want.

## related

- [react-grab](https://github.com/aidenybai/react-grab) — point an agent at exact components to fix
- [Impeccable](https://impeccable.style) — ergonomic slash-command polish
- [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) — micro-detail heuristics
- [userinterface.wiki](https://www.userinterface.wiki/) — UX theory and pattern reasoning

## further reading

- [PHILOSOPHY.md](./PHILOSOPHY.md) — design philosophy behind the system
- [PHASE-2.md](./PHASE-2.md) — the control plane: presets, explainability, identity
- [EXPLAINABILITY.md](./EXPLAINABILITY.md) — how `report.md` is generated and why it exists

## contributing

if you find a recurring anti-pattern, a better routing rule, or a skill that should exist, open a PR.

## license

MIT
