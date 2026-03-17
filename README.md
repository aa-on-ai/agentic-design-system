# agentic design system

a design system for AI agents that build UI.

not a component library. not a Figma kit. a set of skills, references, and routing logic that agents load into context so they produce professional, intentional work instead of the default AI slop.

## the problem

agents default to the median of their training data. safe layouts, familiar patterns, blue buttons in a grid. technically correct, visually forgettable. the output isn't broken — it's just boring. and boring compounds until everything looks the same.

more rules don't fix this. agents are already constrained by what they've seen. tighter boxes reinforce the center of the distribution.

## the fix

constraint + permission. a non-negotiable floor so nothing ships broken, and explicit encouragement to push beyond safe.

the system works in three layers:

**non-negotiable** — tokens, spacing, type, accessibility, brand. agents follow the system or fail the quality gate.

**guided** — layout patterns, component usage, hierarchy. the system has opinions but agents can propose alternatives. this layer grows over time as decisions compound.

**open** — visual direction, interaction ideas, creative solutions. agents riff, diverge, compete. multiple directions at once. the ceiling is high on purpose.

read [PHILOSOPHY.md](./PHILOSOPHY.md) for the full thinking.

## see it in action

before = agent output without any design system. after = same prompt with the agentic design system loaded.

| demo | type | before | after |
|------|------|--------|-------|
| Moltbook Admin | dashboard | [before](https://agentic-design-system.vercel.app/before/moltbook-admin) | [after](https://agentic-design-system.vercel.app/after/moltbook-admin) |
| Model Tuning Console | form / wizard | [before](https://agentic-design-system.vercel.app/before/model-tuning) | [after](https://agentic-design-system.vercel.app/after/model-tuning) |
| The Compliance Dispatch | editorial | [before](https://agentic-design-system.vercel.app/before/compliance-dispatch) | [after](https://agentic-design-system.vercel.app/after/compliance-dispatch) |

three different UI types, three different company aesthetics (Meta, Anthropic, OpenAI), same design system.

## what's in the box

### skills

drop these into your agent's context. each one is a self-contained skill file with clear triggers and instructions.

| skill | what it does | when to use |
|-------|-------------|-------------|
| [design-review](./skills/design-review/) | quality gate with pre-flight checklist + 11 reference files (typography, color, spacing, motion, layout, alignment, responsive, ux-writing, mock-data, anti-patterns, inspiration) | before presenting any visual work |
| [ux-baseline-check](./skills/ux-baseline-check/) | state inventory — happy path, empty, loading, error, edge cases | before shipping any screen |
| [ui-polish-pass](./skills/ui-polish-pass/) | sequential visual polish — spacing, alignment, hierarchy | final step before presenting |
| [whimsical-design](./skills/whimsical-design/) | pushes past sterile toward personality and delight | any user-facing work that should feel alive |
| [web-animation-design](./skills/web-animation-design/) | easing, springs, timing, transitions, accessibility | anything that moves |
| [world-build](./skills/world-build/) | creative direction for immersive sites that feel like places | landing pages, portfolios, launches, game UI |
| [agent-friendly-design](./skills/agent-friendly-design/) | make your site consumable and interactable by AI agents — semantic HTML, ARIA, structured data, llms.txt, MCP, API-first patterns | any web project shipping to production |

### routing

not every task needs every skill. the [routing doc](./routing/ROUTING.md) tells agents when to apply the full chain, when to do a light review, and when to skip entirely. includes a decision tree, token budget guidance, the divergent exploration pattern, and the agent-friendly pass for sites that need to serve AI consumers.

### templates

- [agents-snippet.md](./templates/agents-snippet.md) — copy-paste block for your AGENTS.md, .cursorrules, or codex instructions
- [brand-guidelines-template.md](./templates/brand-guidelines-template.md) — blank template for your project's design tokens, patterns, and learnings

## try it in 60 seconds

**claude code:**
```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git
cd your-project
cp -r ../agentic-design-system/skills ./skills
```

then prompt:
```
build me a dashboard that shows agent uptime and status.
use the design skills in /skills for quality — read the routing
doc first to know which skills to apply.
```

that's it. the agent reads the skills, follows the routing chain, and builds something better than it would have without them.

**cursor:**
```bash
cp -r agentic-design-system/skills .cursor/skills
```
add to `.cursorrules`: "read and follow the design skills in .cursor/skills/ for all visual work."

**codex cli:**
```bash
cp -r agentic-design-system/skills .codex/skills
```

## use cases

**"I need to oneshot a dashboard for a client demo"**
point the agent at the full skill chain. it reads design-review for quality, ux-baseline-check for states (loading, empty, error), and whimsical-design to push past generic. your first pass comes back with proper hierarchy, real-feeling mock data, and personality.

**"my agent keeps building dark mode card grids"**
that's the #1 agent cliche. the anti-patterns reference file explicitly calls this out, plus 30+ other defaults agents reach for. drop the skills in and the agent learns what NOT to do.

**"I want to polish an existing page before presenting"**
run just the ui-polish-pass skill. it does 6 sequential passes: spacing, alignment, typography, color, motion, then final review. tell the agent: "run a polish pass on this page using the ui-polish-pass skill."

**"client has brand guidelines, how do I make the agent follow them?"**
fill in the [brand guidelines template](./templates/brand-guidelines-template.md) with your project's colors, fonts, spacing, and patterns. the agent loads this alongside the skills and stays on-brand while still getting the quality floor.

**"I built something and it looks AI-generated"**
run design-review (catches structural problems) then whimsical-design (adds personality). the combination flags what makes it feel generic and pushes toward something with warmth and intention.

**"I'm building a landing page that should feel immersive"**
use the world-build skill first — it sets creative direction (atmosphere, sensory palette, narrative arc) before the quality chain runs. think: sites that feel like places, not pages.

**"I want my site to work well for AI agents visiting it"**
the agent-friendly-design skill covers semantic HTML, ARIA, structured data, llms.txt, and API-first patterns. run it alongside the visual chain — a page can be beautiful for humans and parseable for agents.

## full setup

1. copy the `skills/` folder into your project
2. paste the [agents snippet](./templates/agents-snippet.md) into your agent's instruction file (AGENTS.md, .cursorrules, codex instructions, etc.)
3. fill in the [brand guidelines template](./templates/brand-guidelines-template.md) with your project's tokens and patterns
4. agents will automatically route through the appropriate skill chain based on the task

the system is designed to be loaded by agents, not memorized by humans.

## divergent exploration

one of the core workflow patterns: instead of asking an agent to build one thing, have it explore multiple directions with a version selector so you can compare and pick.

```
"this layout could go a few directions — want me to explore
2-3 options or should I pick one?"
```

different agents can work on different directions simultaneously. the builder picks a winner or hybridizes. then the quality chain runs on the chosen direction.

use this for layout decisions and visual direction. not for button colors.

## compounding

the system learns from every build. after each session:

- new anti-patterns get added to the reference files
- project-specific decisions go in your guidelines
- animation patterns that worked get documented

the review step produces the update as a byproduct, not as homework. day 1, the human answers a lot of steering questions. month 3, the guidelines handle most of it.

## how is this different from Impeccable?

[Impeccable](https://impeccable.style) is a great quality gate — 17 slash commands like `/audit`, `/polish`, `/bolder` that catch problems and add polish. if you want one skill that does design review, it's solid.

we go wider and deeper: 7 skills with routing logic that tells agents WHEN to apply WHAT. a context pass that grounds builds in the actual company being referenced. a workflow layer (divergent exploration, pattern benchmarking, compounding). creative direction skills (whimsical-design, world-build) that push past safe. verification scripts that catch anti-patterns programmatically. and an agent-friendly-design skill for building sites that agents themselves can consume.

Impeccable raises the craft ceiling. we raise the floor AND add the workflow. they're complementary — use both if you want.

## pairs well with

- [react-grab](https://github.com/aidenybai/react-grab) — hover over any element in your browser, press Cmd+C, get the file name + component + HTML. paste into your agent for precise "fix this" workflows. our system tells agents how to build good UI; react-grab lets you point at what still needs work.
- [Impeccable](https://impeccable.style) — slash commands for design polish (/audit, /polish, /bolder). good quality gate. we go deeper on workflow, routing, and creative direction, but their commands are a nice ergonomic layer.
- [make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) — micro-detail skill (concentric border radius, tabular numbers, text wrapping). we've absorbed most of these into our reference files, but the original is worth reading.

## works with

- [Claude Code](./integrations/) / Anthropic agents
- [Cursor](./integrations/) / AI-assisted editors
- [Codex CLI](./integrations/) / OpenAI agents
- [OpenClaw](./integrations/) / multi-agent orchestration
- anything that loads markdown files into agent context

## philosophy

> design systems aren't for designers anymore. they're for agents. and the agents that use them will build things the ones without them can't.

the full philosophy: [PHILOSOPHY.md](./PHILOSOPHY.md)

## contributing

this is a living system. if you find patterns that work, anti-patterns that keep recurring, or better ways to route — open a PR.

## license

MIT
