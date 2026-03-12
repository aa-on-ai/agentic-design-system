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

## what's in the box

### skills

drop these into your agent's context. each one is a self-contained skill file with clear triggers and instructions.

| skill | what it does | when to use |
|-------|-------------|-------------|
| [design-review](./skills/design-review/) | quality gate with pre-flight checklist + 5 reference files (typography, color, spacing, motion, anti-patterns) | before presenting any visual work |
| [ux-baseline-check](./skills/ux-baseline-check/) | state inventory — happy path, empty, loading, error, edge cases | before shipping any screen |
| [ui-polish-pass](./skills/ui-polish-pass/) | sequential visual polish — spacing, alignment, hierarchy | final step before presenting |
| [whimsical-design](./skills/whimsical-design/) | pushes past sterile toward personality and delight | any user-facing work that should feel alive |
| [web-animation-design](./skills/web-animation-design/) | easing, springs, timing, transitions, accessibility | anything that moves |
| [world-build](./skills/world-build/) | creative direction for immersive sites that feel like places | landing pages, portfolios, launches, game UI |

### routing

not every task needs every skill. the [routing doc](./routing/ROUTING.md) tells agents when to apply the full chain, when to do a light review, and when to skip entirely. includes a decision tree, token budget guidance, and the divergent exploration pattern.

### templates

- [agents-snippet.md](./templates/agents-snippet.md) — copy-paste block for your AGENTS.md, .cursorrules, or codex instructions
- [brand-guidelines-template.md](./templates/brand-guidelines-template.md) — blank template for your project's design tokens, patterns, and learnings

## quick start

1. copy the `skills/` folder into your project
2. paste the [agents snippet](./templates/agents-snippet.md) into your agent's instruction file (AGENTS.md, .cursorrules, codex instructions, etc.)
3. fill in the [brand guidelines template](./templates/brand-guidelines-template.md) with your project's tokens and patterns
4. agents will automatically route through the appropriate skill chain based on the task

that's it. the system is designed to be loaded by agents, not memorized by humans.

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
