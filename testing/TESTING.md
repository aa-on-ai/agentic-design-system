# testing

how to verify agents actually follow the design system.

## the problem

you can give an agent perfect instructions and it might still skip steps, default to safe, or produce output that technically follows the rules but misses the spirit. "I used your spacing scale" doesn't mean the page looks good.

testing isn't just "did the output pass?" — it's "did the agent engage with the system?"

## approach: prompt-based audits

use a second agent as a reviewer. the builder agent produces output, the reviewer agent evaluates it against the skill chain.

### how it works

**step 1: build.** give an agent a design task with the design system loaded.

```
build a dashboard for monitoring AI agent activity. include: agent list
with status indicators, activity feed, resource usage charts, and a kill
switch for rogue agents.

before presenting, follow the design quality chain:
1. skills/design-review/SKILL.md
2. skills/ux-baseline-check/SKILL.md
3. skills/whimsical-design/SKILL.md
4. skills/web-animation-design/SKILL.md
5. skills/ui-polish-pass/SKILL.md
```

**step 2: review.** give a second agent the output + the skill files and ask it to audit.

```
review this UI against the agentic design system. for each skill, score
pass/partial/fail and explain why.

skills to check:
- design-review: did it follow the pre-flight checklist? any anti-patterns?
- ux-baseline-check: are all states covered? (empty, loading, error, edge cases)
- whimsical-design: does it have personality? would someone screenshot this?
- web-animation-design: are transitions intentional? any jarring state changes?
- ui-polish-pass: spacing, alignment, hierarchy — does it feel finished?

be specific. "looks good" is not a review.
```

**step 3: score.** the reviewer produces a structured assessment:

```
design-review:     PASS — follows spacing scale, no anti-patterns detected
ux-baseline-check: PARTIAL — has loading state, missing empty state for agent list
whimsical-design:  FAIL — sterile dashboard, no personality, wouldn't screenshot
web-animation-design: PARTIAL — hover states exist, no entrance animations
ui-polish-pass:    PASS — alignment is clean, hierarchy reads well

overall: 3/5 skills passed. main gap: personality and motion.
```

### what this catches

- agents that skip skill steps entirely
- agents that technically follow rules but produce median output
- missing states (the #1 thing agents skip)
- lack of personality (agents default to corporate SaaS)
- motion gaps (static interfaces that should feel alive)

### what this doesn't catch

- whether the output is actually *good* (taste is still human)
- whether the creative direction fits the project (that's what guidelines.md is for)
- whether the agent explored alternatives when it should have (behavioral, not output)

## running audits

### manual (recommended to start)

1. build something with the system
2. paste the output into a fresh agent session with the review prompt above
3. read the assessment, update anti-patterns and guidelines based on findings

### automated (when you're ready)

wire the audit into your CI or build pipeline:

1. agent builds UI → commits to branch
2. review agent loads the branch + skill files
3. review agent produces structured assessment
4. if any skill scores FAIL → flag for human review before merge

this works especially well in multi-agent setups (OpenClaw, custom orchestration) where the orchestrator can spawn a review agent automatically after a build agent completes.

### example audit prompts

save these and reuse them:

**quick audit** (2 min, covers basics):
```
review this against skills/design-review/SKILL.md and
skills/ux-baseline-check/SKILL.md. pass/fail each with one-line reasons.
```

**full audit** (5 min, comprehensive):
```
review this against all 5 skills in the agentic design system.
for each: pass/partial/fail with specific evidence.
note any anti-patterns from skills/design-review/references/anti-patterns.md.
```

**creative audit** (for landing pages, immersive sites):
```
review this against skills/whimsical-design/SKILL.md and
skills/world-build/SKILL.md. does this feel like a place or a page?
would someone share this? what's missing?
```

## compounding from audits

every audit should produce at least one update:

- new anti-pattern discovered → add to `skills/design-review/references/anti-patterns.md`
- missing state that keeps recurring → add to `skills/ux-baseline-check/SKILL.md` checklist
- animation pattern that works well → add to `skills/web-animation-design/PRACTICAL-TIPS.md`
- project-specific learning → add to your `guidelines.md`

the audit isn't just QA. it's the mechanism that makes the system smarter.

## eval loop: automated before vs after benchmark

for repo-level proof, use `testing/eval-loop.ts`.

### what it does

for each prompt in `testing/prompts.json`, the script:

1. generates a **before** page with plain prompting only
2. generates an **after** page with the full core pack inlined at runtime:
   - `skills/design-review/SKILL.md`
   - every file in `skills/design-review/references/`
   - `skills/ux-baseline-check/SKILL.md`
   - `skills/ui-polish-pass/SKILL.md`
   - `routing/ROUTING.md`
3. saves both TSX files to `testing/results/<slug>/`
4. runs the existing python checkers:
   - `anti-pattern-check.py`
   - `state-check.py`
5. checks for responsive breakpoints directly from the TSX source
6. sends both files to an Anthropic judge model for 5 design scores
7. computes totals using `testing/eval-spec.md`
8. writes per-prompt `scores.json` and a global `testing/results/summary.json`

### run it

```bash
npx tsx testing/eval-loop.ts
```

optional helpers:

```bash
# validate files and prompt loading without hitting APIs
npx tsx testing/eval-loop.ts --dry-run

# run one case only
npx tsx testing/eval-loop.ts --slug canopy
```

### env vars

the script looks for these first:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

if they are not set, it falls back to:

- `~/.clawdbot/credentials/openai.env`
- `~/.clawdbot/credentials/anthropic.env`

### outputs

```
testing/results/
  summary.json
  canopy/
    before.tsx
    after.tsx
    scores.json
  pawprint/
    before.tsx
    after.tsx
    scores.json
  notion-ai-settings/
    before.tsx
    after.tsx
    scores.json
```

### scoring

totals combine:

- judge scores (5 dimensions, 1-10 each)
- anti-pattern penalties (`-2` per warning, `-1` per info)
- missing state penalties (`-3` each)
- responsive penalty (`-5` if no breakpoints are detected)

this loop is meant to answer a simple question: does the same model produce measurably better output when the design system is loaded?

---

## roadmap: behavioral testing with clawbotomy

the audit approach above tests *output* — did the agent produce good work?

the next layer tests *behavior* — did the agent actually engage with the system, or did it fake compliance?

### what behavioral testing looks like

[clawbotomy](https://clawbotomy.com) is a behavioral QA framework for AI agents. it tests how agents make decisions, not just what they produce.

applied to the design system, behavioral tests would check:

**did the agent actually read the skills?**
- give it a task that requires a specific skill reference
- check if the output reflects knowledge from the skill file vs general training data
- agents that "already know design" often skip reading and produce generic output

**did the agent push past safe?**
- give it explicit permission to be creative
- measure whether the output diverges from median or stays in the comfort zone
- agents with "psychological safety" should produce bolder work

**did the agent ask when it should have?**
- give it an ambiguous task where the right move is to ask for direction
- check if it asked or just picked the safest option
- token-aware exploration means knowing when to branch vs commit

**did the agent compound?**
- give it feedback on round 1
- check if round 2 reflects the feedback or repeats the same patterns
- compounding agents learn; non-compounding agents just retry

### why this matters

output testing tells you if the work is good *this time*. behavioral testing tells you if the agent will reliably produce good work *every time*. it's the difference between QA and trust.

the design system raises the floor. behavioral testing verifies the floor actually holds.

### status

clawbotomy integration is on the roadmap. the prompt-based audit approach works now and catches most issues. behavioral testing is the next evolution — for teams that want to verify their agents are genuinely following the system, not just producing output that happens to pass.

more at [clawbotomy.com](https://clawbotomy.com).
