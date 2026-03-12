# codex cli

how to wire the agentic design system into OpenAI's Codex CLI.

## setup

Codex CLI reads `AGENTS.md` (or `codex.md`) from your project root for system instructions.

### 1. copy skills into your project

```bash
cp -r skills/ /path/to/your/project/skills/
```

### 2. add to AGENTS.md

paste the contents of `templates/agents-snippet.md` into your `AGENTS.md`.

minimal version:

```markdown
## Design Quality Chain

Before presenting any visual/UI work, run the appropriate skill chain:

- **New visual work** → read and follow in order:
  1. skills/design-review/SKILL.md
  2. skills/ux-baseline-check/SKILL.md
  3. skills/whimsical-design/SKILL.md
  4. skills/web-animation-design/SKILL.md
  5. skills/ui-polish-pass/SKILL.md

- **Modifying existing UI** → read skills/design-review/SKILL.md (pre-flight only)
- **Non-visual work** → skip

Reference files: skills/design-review/references/ (load only what's relevant)
```

### 3. add brand guidelines

copy `templates/brand-guidelines-template.md` as `guidelines.md` in your project root.

## codex-specific notes

### context window

Codex CLI (GPT-5.3/5.4) has a large context window (~1M tokens). you can be generous with skill loading — it can handle the full chain without truncation issues.

this is an advantage over smaller-context tools. lean into it:
- load all relevant reference files when doing a full quality pass
- include detailed examples in your guidelines.md
- the PRACTICAL-TIPS.md supplement for animations is worth loading

### autonomous vs interactive

- **autonomous mode** — Codex runs without check-ins. the design system is critical here because there's no human steering mid-task. the quality chain is the safety net.
- **interactive mode** — Codex asks questions along the way. use this for divergent exploration: "explore 3 directions and ask me which to pursue before refining."

### multi-agent with codex

if you're running multiple Codex instances (e.g., via OpenClaw or custom orchestration):

```
agent 1: "build layout option A — minimal, lots of whitespace, content-first"
agent 2: "build layout option B — dense, sidebar nav, power-user oriented"
agent 3: "build layout option C — progressive disclosure, starts simple, reveals depth"
```

each agent loads the same design system. the quality floor is consistent. the creative direction diverges. human picks the winner.

## divergent exploration

```
this page could go several directions. build 3 distinct layout approaches
with a version selector component at the top of the page. make them genuinely
different — not variations on a theme. I'll pick one to refine.
```

## tips

- **prompt specificity is the biggest quality multiplier.** 3x detail = dramatically better output. include exact text, exact spacing values, what NOT to do, and why previous versions failed.
- **Codex in autonomous mode will rewrite files.** scope your prompts: "modify only [these files], do not touch [these files]."
- **compound after sessions.** Codex is especially prone to visual anti-patterns (emoji instead of icons, colored circles, Bootstrap-style cards). add these to anti-patterns.md when you catch them.
