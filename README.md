# agentic design system

a design system for AI agents that build UI.

not a component library. not a Figma kit. a set of skills, references, and routing logic that agents load into context so they stop producing default AI-looking interfaces.

if your agent keeps shipping safe card grids, vague hierarchy, missing states, and generic polish, this is for that.

## does it actually work?

we built an eval loop and tested it. same model (GPT-5.4), same prompt, one run without skills, one with core pack.

| prompt | before | after | delta |
|---|---:|---:|---:|
| canopy (landing) | 16 | 40 | +24 |
| pawprint (dashboard) | 15 | 41 | +26 |
| notion-ai (settings) | 17 | 40 | +23 |
| **average** | **16** | **40** | **+24.3** |

scores come from verification scripts + Claude Sonnet as a neutral judge.

what improved: anti-pattern warnings dropped from 4 avg to 0.33. state coverage went from 0/3 to 3/3. judge scores improved across hierarchy, spacing, copy, product-fit, and screenshot-worthiness.

what we learned the hard way: we originally ran all 7 skills on a weather app and the output was *worse*. the creative pack fought the product-appropriate dark/glassy aesthetic. so we split into core + creative packs, re-ran with core only, and got the results above.

run it yourself: `npx tsx testing/eval-loop.ts` (needs OpenAI + Anthropic API keys).

## install

### one command (recommended)

```bash
npx skills add aa-on-ai/agentic-design-system
```

works with Claude Code, Cursor, Codex, and anything that follows the [Agent Skills](https://agentskills.io) spec.

### global install (personal use)

install once, available in every project:

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git
cp -r agentic-design-system/skills ~/.claude/skills/
```

### project-level (teams)

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git
cp -r agentic-design-system/skills your-project/skills/
```

then paste [`templates/agents-snippet.md`](./templates/agents-snippet.md) into your agent's instruction file:
- Claude Code: `AGENTS.md` or `CLAUDE.md`
- Cursor: `.cursorrules`
- Codex CLI: `.codex/instructions`
- OpenClaw: `AGENTS.md`

### after install

just prompt normally:

```
build me a dashboard that shows agent uptime and status.
```

the skills route themselves based on the task. no special invocation needed.

## two packs

**core pack** (always active for visual work):
- design-review, ux-baseline-check, ui-polish-pass, agent-friendly-design

**creative pack** (opt-in only, each skill self-gates):
- whimsical-design, world-build, web-animation-design

we split them after finding that auto-applying creative skills to everything made some outputs worse. core pack raises the floor. creative pack changes the direction. only add creative when different is what the product actually needs.

## what's in the box

### core pack

| skill | what it does |
|---|---|
| [design-review](./skills/design-review/) | quality gate with checklist, 11 reference files, and 3 verification scripts |
| [ux-baseline-check](./skills/ux-baseline-check/) | checks loading, empty, error, and edge-case states |
| [ui-polish-pass](./skills/ui-polish-pass/) | tightens spacing, alignment, hierarchy, and visual finish |
| [agent-friendly-design](./skills/agent-friendly-design/) | semantic HTML, ARIA, structured data, llms.txt, MCP |

### creative pack

| skill | what it does | triggers |
|---|---|---|
| [whimsical-design](./skills/whimsical-design/) | personality and delight | user asks for personality, marketing/editorial work |
| [world-build](./skills/world-build/) | immersive atmosphere | user says "world-build this", portfolios, launches |
| [web-animation-design](./skills/web-animation-design/) | easing, springs, interaction feel | user asks about animation or motion |

### routing

[`routing/ROUTING.md`](./routing/ROUTING.md) tells agents when to run the full chain, when to do a lighter pass, and when to skip entirely.

### templates

- [`agents-snippet.md`](./templates/agents-snippet.md) — paste into your agent's instruction file
- [`brand-guidelines-template.md`](./templates/brand-guidelines-template.md) — fill in with your project's tokens and patterns

## use cases

**"I need a decent first-pass dashboard fast"**
load the core pack and let the agent build. you get better hierarchy, better defaults, and complete states instead of a hollow mock.

**"my agent keeps making dark card-grid SaaS UI"**
the anti-patterns reference calls out common agent cliches directly, so the model has something better to reach for.

**"I want to polish a page before showing it to someone"**
run `ui-polish-pass` on an existing page for spacing, alignment, hierarchy, and finish.

**"we have brand guidelines and want the agent to follow them"**
fill in the brand template and load it with the skills. the system gets a quality floor without drifting off-brand.

**"I want a site that works for humans and agents"**
`agent-friendly-design` covers semantic structure, accessibility, structured data, and AI-readable surfaces.

## how is this different from Impeccable?

[Impeccable](https://impeccable.style) is a good quality gate with slash commands for polish.

we go broader: quality gate + state checklist + polish pass + creative direction + routing logic + agent-friendly patterns + verification scripts. they're complementary — use both if you want.

## pairs well with

- [react-grab](https://github.com/aidenybai/react-grab) — point an agent at exact components to fix
- [Impeccable](https://impeccable.style) — ergonomic slash-command polish on top of this system
- [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) — micro-detail heuristics (concentric radius, tabular nums, text wrapping)
- [userinterface.wiki](https://www.userinterface.wiki/) — UX theory and pattern reasoning

## works with

- [Claude Code](./integrations/) / Anthropic agents
- [Cursor](./integrations/) / AI-assisted editors
- [Codex CLI](./integrations/) / OpenAI agents
- [OpenClaw](./integrations/) / multi-agent orchestration
- anything that loads markdown files into agent context

## philosophy

read [PHILOSOPHY.md](./PHILOSOPHY.md) for the full thinking behind the system.

## contributing

if you find a recurring anti-pattern, a better routing rule, or a skill that should exist, open a PR.

## license

MIT
