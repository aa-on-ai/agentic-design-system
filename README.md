# agentic design system

a governance layer for agent-generated interfaces. rubric, verifier, audit trail, and compounding identity file — plugs into whatever generator your agent already uses.

## what this is (and isn't)

this isn't another UI generator. it's the layer that sits on top of one.

- **rubric.** a weighted 4-criterion rubric the agent grades itself against before presenting work ([`skills/agentic-design-system/SKILL.md`](./skills/agentic-design-system/SKILL.md)).
- **verifier.** three deterministic scripts — anti-pattern, state completeness, accessibility — that catch the floor issues rubrics miss ([`skills/design-review/scripts/`](./skills/design-review/scripts/)).
- **audit trail.** every run emits a human-readable `report.md` with rule hits, rubric scores, and follow-ups ([`EXPLAINABILITY.md`](./EXPLAINABILITY.md)).
- **identity file.** an opinionated, fillable project brief the agent reads before building and writes to after ([`templates/project-identity-template.md`](./templates/project-identity-template.md), starting points in [`presets/`](./presets/)).

works with Claude Code, Cursor, Codex CLI, OpenClaw — anything that reads the [Agent Skills](https://agentskills.io) spec.

## why

agents are bad at *spontaneously* avoiding design anti-patterns — card grids, dark gradients, missing error states, cramped spacing. but they're surprisingly good at *finding* those problems when given explicit criteria after the fact.

this system exploits that gap. build first, then run structured critique passes with checklists the agent couldn't hold in mind during generation. each pass encodes specific review criteria, and the agent reruns them until the output clears the bar. this is the [karpathy auto-research](https://x.com/karpathy/status/1886192184808149383) evaluation pattern applied to design: LLMs grading LLM output against criteria, not freeform self-reflection.

but a loop without a readable artifact is just a score. the governance layer is what makes the loop's work legible and compoundable — see [`EXPLAINABILITY.md`](./EXPLAINABILITY.md).

## how the loop runs

three evaluation passes, each with its own criteria:

| pass | what it checks | when it runs |
|---|---|---|
| **design-review** | anti-patterns, hierarchy, spacing, product-fit ([11 reference files](./skills/design-review/references/)) | always, for any visual work |
| **ux-baseline-check** | loading, empty, error, edge-case states | always, for any visual work |
| **ui-polish-pass** | spacing tightness, alignment, visual finish | always, as the final step |

these three are the core pack. they run automatically on any visual task.

three more skills exist for creative direction — personality, atmosphere, animation. they're opt-in and only activate when the prompt calls for them. see [routing](./routing/ROUTING.md) for the full decision logic.

### in practice

1. install the skills (see below)
2. paste the [agent snippet](./templates/agents-snippet.md) into your instruction file
3. copy [`templates/project-identity-template.md`](./templates/project-identity-template.md) into your project as `guidelines.md` and fill it in — start from a [preset](./presets/) if close enough
4. prompt normally: "build me a dashboard showing agent uptime"
5. agent builds the first pass
6. design-review runs → catches anti-patterns, flags missing hierarchy
7. ux-baseline-check runs → flags missing loading/error states
8. ui-polish-pass runs → tightens spacing, alignment, finish
9. agent fixes what the passes caught, emits a `report.md` ([template](./templates/run-report-template.md)), then presents

no special syntax. the skills route themselves based on the task.

## evidence

same model (GPT-5.4), same prompt, one run without skills, one with the core pack.

| prompt | without | with | delta |
|---|---:|---:|---:|
| canopy (landing page) | 16 | 40 | +24 |
| pawprint (dashboard) | 15 | 41 | +26 |
| notion-ai (settings) | 17 | 40 | +23 |
| **average** | **16** | **40.3** | **+24.3** |

scores are 0-50 across 5 dimensions (hierarchy, spacing, copy, product-fit, screenshot-worthiness), judged by Claude Sonnet on the rendered output. anti-pattern warnings dropped 4 → 0.33 on average. state coverage went 0/3 → 3/3.

**case studies with rule hits, rubric deltas, and narrative:** [`examples/case-studies/`](./examples/case-studies/). every case lists what the loop actually caught, not just the summary number.

run the benchmark yourself:

```bash
npx tsx testing/eval-loop.ts                                 # 6 prompts, default models
npx tsx testing/eval-loop.ts --dry-run                       # verify without API calls
npx tsx testing/eval-loop.ts --slug canopy                   # single prompt
npx tsx testing/eval-loop.ts --generator claude-sonnet-4-6   # swap the generator model
```

needs OpenAI + Anthropic API keys (env vars or credentials file — see [`testing/TESTING.md`](./testing/TESTING.md)). every run writes `scores.json` and a human-readable `report.md` per prompt, plus a `summary.json` across the set.

we found that running every skill on every task can make output worse — creative passes fought product-appropriate aesthetics on a weather app. so the system splits core review from opt-in creative direction. routing matters.

## install

```bash
npx skills add aa-on-ai/agentic-design-system
```

works with Claude Code, Cursor, Codex CLI, OpenClaw, and anything that follows the [Agent Skills](https://agentskills.io) spec.

this installs: 7 skill folders (markdown criteria + reference docs), routing logic, verification scripts (Python, stdlib only), and templates.

<details>
<summary>manual install</summary>

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git

# global (available in every project)
cp -r agentic-design-system/skills ~/.claude/skills/

# or project-level
cp -r agentic-design-system/skills your-project/skills/
```

then paste [`templates/agents-snippet.md`](./templates/agents-snippet.md) into your agent's instruction file (AGENTS.md, .cursorrules, .codex/instructions, etc).

</details>

## what's included

| type | contents |
|---|---|
| **core skills** | [design-review](./skills/design-review/), [ux-baseline-check](./skills/ux-baseline-check/), [ui-polish-pass](./skills/ui-polish-pass/) |
| **creative skills** | [whimsical-design](./skills/whimsical-design/), [world-build](./skills/world-build/), [web-animation-design](./skills/web-animation-design/) |
| **agent-friendly-design** | semantic HTML, ARIA, structured data, llms.txt, MCP patterns |
| **verification scripts** | [anti-pattern, state, accessibility checks](./skills/design-review/scripts/) (Python, stdlib only) |
| **identity + presets** | [project-identity template](./templates/project-identity-template.md), [presets](./presets/) for editorial/SaaS/utility |
| **run reports** | [`EXPLAINABILITY.md`](./EXPLAINABILITY.md) + [run-report template](./templates/run-report-template.md) — audit trail per build |
| **evidence** | [case studies](./examples/case-studies/) with rule hits, rubric scores, narrative |
| **integration guides** | [Claude Code, Cursor, Codex CLI, OpenClaw](./integrations/) |
| **phase 2 direction** | [control plane spec](./PHASE-2.md), [explainability model](./EXPLAINABILITY.md), [example run reports](./examples/run-reports/), [preset schema](./schemas/preset.schema.json) |

## limitations

- creative passes can over-steer utilitarian UI — that's why they're opt-in, not default
- depends on the agent actually following skill instructions (works best with frontier models)
- code-only review catches a lot, but screenshot-based review catches more (contrast, truncation, visual weight)
- does not replace human taste or product judgment — it raises the floor, not the ceiling
- verification scripts catch structural issues, not aesthetic ones

## how is this different from Impeccable?

[Impeccable](https://impeccable.style) is a quality gate with slash commands for polish. this system adds the full evaluation loop: multiple structured critique passes, state coverage checking, creative direction routing, and verification scripts. use both if you want.

## related tools

- [react-grab](https://github.com/aidenybai/react-grab) — point an agent at exact components to fix
- [Impeccable](https://impeccable.style) — ergonomic slash-command polish
- [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) — micro-detail heuristics
- [userinterface.wiki](https://www.userinterface.wiki/) — UX theory and pattern reasoning

the design philosophy behind the system is in [PHILOSOPHY.md](./PHILOSOPHY.md).

the next layer of the product is documented in [PHASE-2.md](./PHASE-2.md): make the invisible visible through presets, explainability, project identity, and shareable configs.

if you want the docs-first version of that today, start with [presets/](./presets/), the [project identity template](./templates/project-identity-template.md), the [run report template](./templates/run-report-template.md), and the [example run reports](./examples/run-reports/).

## contributing

if you find a recurring anti-pattern, a better routing rule, or a skill that should exist, open a PR.

## license

MIT
