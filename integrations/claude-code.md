# claude code

how to wire the agentic design system into Claude Code projects.

## setup

Claude Code reads `CLAUDE.md` (or `AGENTS.md`) from your project root. this is where the design system hooks in.

### 1. copy skills into your project

```bash
# from the agentic-design-system repo
cp -r skills/ /path/to/your/project/skills/
```

or keep them in a shared location and reference by path.

### 2. add to CLAUDE.md

paste the contents of `templates/agents-snippet.md` into your project's `CLAUDE.md`. it wires up the routing logic and tells Claude Code when to load which skills.

minimal version:

```markdown
## Design Quality Chain

Before presenting any visual/UI work, run the appropriate skill chain:

- **New visual work** → read and follow these in order:
  1. skills/design-review/SKILL.md
  2. skills/ux-baseline-check/SKILL.md
  3. skills/whimsical-design/SKILL.md
  4. skills/web-animation-design/SKILL.md
  5. skills/ui-polish-pass/SKILL.md

- **Modifying existing UI** → read and follow:
  1. skills/design-review/SKILL.md (pre-flight checklist only)

- **Non-visual work** → skip the design chain

Reference files are in skills/design-review/references/ — load only what's relevant.
```

### 3. add brand guidelines

copy `templates/brand-guidelines-template.md` to your project root as `guidelines.md`. fill in your design tokens, component patterns, and anti-patterns.

Claude Code will reference this alongside the skills.

## how it works in practice

when you ask Claude Code to build UI, it will:

1. check the routing logic (new vs modified vs non-visual)
2. load the appropriate skills
3. reference your guidelines.md for project-specific tokens
4. run the quality chain before presenting work
5. after the session, note what worked/didn't for compounding

## divergent exploration

ask Claude Code to explore multiple directions:

```
build this dashboard layout. try 2-3 different approaches —
add a version selector at the top so I can compare them.
pick distinct directions, not minor variations.
```

Claude Code will build each version and let you navigate between them.

## tips

- **be specific in prompts.** "build a table" gets median output. "build a table with sticky headers, row hover states, empty state with illustration, loading skeleton" gets professional output.
- **reference the skills explicitly** if Claude Code doesn't pick them up automatically: "before you present this, run through skills/design-review/SKILL.md"
- **compound after sessions.** if Claude Code made a mistake that the quality gate should catch, add it to `skills/design-review/references/anti-patterns.md`
