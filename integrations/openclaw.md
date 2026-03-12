# openclaw

how to wire the agentic design system into OpenClaw multi-agent setups.

## setup

OpenClaw agents read from AGENTS.md and can load skills dynamically. the design system integrates at the orchestration layer — the main agent routes design tasks through the skill chain automatically.

### 1. copy skills into your workspace

```bash
cp -r skills/ ~/your-workspace/skills/
```

### 2. add to AGENTS.md

paste the contents of `templates/agents-snippet.md` into your workspace's `AGENTS.md`. this tells the orchestrating agent when and how to apply the design chain.

### 3. add brand guidelines

copy `templates/brand-guidelines-template.md` as `guidelines.md` in your workspace.

## openclaw-specific patterns

### orchestrator + sub-agent routing

the main agent (orchestrator) decides which chain to apply and includes the instructions in sub-agent prompts:

```
# spawning a sub-agent for UI work
sessions_spawn({
  task: "Build the settings page. Before presenting, read and follow:
    1. skills/design-review/SKILL.md
    2. skills/ux-baseline-check/SKILL.md
    3. skills/whimsical-design/SKILL.md
    4. skills/web-animation-design/SKILL.md
    5. skills/ui-polish-pass/SKILL.md
    Also read guidelines.md for project tokens and patterns.",
  model: "openai/gpt-5.4",
  thread: true
})
```

for review-only tasks:

```
sessions_spawn({
  task: "Update the header spacing on the dashboard.
    Before presenting, run skills/design-review/SKILL.md pre-flight checklist.",
  model: "openai/gpt-5.3-codex-spark",
  thread: true
})
```

### model routing for design tasks

different models suit different design work:

| task | model | why |
|------|-------|-----|
| new pages, complex layouts | GPT-5.4 / Claude Opus | needs strong visual reasoning |
| modifications, polish | Spark / Sonnet | fast, follows instructions well |
| creative direction, world-build | Claude Opus | needs taste and judgment |
| animation implementation | GPT-5.4 / Spark | needs code accuracy |
| review and QA | any | the skill files do the heavy lifting |

### divergent exploration with multiple agents

this is where OpenClaw shines. spawn parallel sub-agents with different creative briefs:

```
# agent 1: minimal approach
sessions_spawn({
  task: "Build settings page — minimal, generous whitespace, content-first.
    Include version selector at top labeled 'Version A: Minimal'.
    Follow the full design chain in skills/.",
  model: "openai/gpt-5.4",
  thread: true
})

# agent 2: power-user approach
sessions_spawn({
  task: "Build settings page — dense, sidebar nav, power-user oriented.
    Include version selector at top labeled 'Version B: Power User'.
    Follow the full design chain in skills/.",
  model: "openai/gpt-5.4",
  thread: true
})

# agent 3: progressive disclosure
sessions_spawn({
  task: "Build settings page — progressive disclosure, simple start, reveals depth.
    Include version selector at top labeled 'Version C: Progressive'.
    Follow the full design chain in skills/.",
  model: "anthropic/claude-sonnet-4-6",
  thread: true
})
```

each agent runs the same quality chain independently. the floor is consistent. the directions diverge. human picks.

### compounding in multi-agent setups

after a build session, the orchestrator (or a dedicated review agent) should:

1. compare what each sub-agent produced
2. note which patterns worked and which didn't
3. update `skills/design-review/references/anti-patterns.md` with new failures
4. update `guidelines.md` with project-specific decisions
5. log the session outcome in your memory/daily files

this can be automated — the orchestrator reads sub-agent output, extracts learnings, and updates the relevant files. the system literally gets smarter after every build.

### skill loading as openclaw skills

if you're using OpenClaw's native skill system, each skill folder is already compatible. the SKILL.md format with YAML frontmatter works out of the box — agents will auto-trigger on matching descriptions.

## tips

- **thread all sub-agents** (`thread: true`) so design work doesn't clutter the main channel
- **review sub-agent output before delivering** — the quality chain helps but isn't perfect
- **prompt specificity compounds** — include exact specs, prior feedback, and what NOT to do in every sub-agent prompt
- **world-build skill is orchestrator-level** — run it yourself (main agent) to set creative direction before spawning builders
