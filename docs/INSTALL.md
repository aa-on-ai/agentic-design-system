# Install Agentic Design System

Install ADS from the consumer project where your coding agent will use it. The release contains
eleven skills, including Ember, the evidence-reading voice used by default for substantial design
handoffs. Skill installation does not edit project instructions or install browser dependencies.

## Requirements

- Node.js 20 or newer with `npx`
- A project directory where the agent can read local skills
- Python 3 only when using the optional source-check scripts

## Choose your agent

Run exactly one command from the consumer project:

```bash
# Claude Code -> .claude/skills/
npx skills add aa-on-ai/agentic-design-system --agent claude-code --copy --yes

# Codex -> .agents/skills/
npx skills add aa-on-ai/agentic-design-system --agent codex --copy --yes

# Cursor -> .agents/skills/
npx skills add aa-on-ai/agentic-design-system --agent cursor --copy --yes

# OpenClaw -> skills/
npx skills add aa-on-ai/agentic-design-system --agent openclaw --copy --yes

# Hermes -> .hermes/skills/
npx skills add aa-on-ai/agentic-design-system --agent hermes-agent --copy --yes
```

`--copy` creates a self-contained project install rather than links to an installer cache. The
command also creates `skills-lock.json`; commit it when you want reproducible team installs.

## Verify the files

Use the installer ID you chose above:

```bash
npx skills list --agent codex --json
```

The result should contain these eleven skills:

- `agentic-design-system`
- `ember`
- `design-review`
- `ux-baseline-check`
- `ui-polish-pass`
- `agent-friendly-design`
- `visual-reference-calibration`
- `design-variations`
- `whimsical-design`
- `world-build`
- `web-animation-design`

For a direct filesystem check, confirm `agentic-design-system/SKILL.md`, `ember/SKILL.md`,
`ember/references/ember-contract.md`, and `ember/references/first-use.md` exist under the agent's
skill directory. Keep all eleven sibling skill directories together because Ember uses the ADS
orchestrator and Foundation contract.

The release matrix executes the agent-specific verification commands in [`integrations/`](../integrations/)
for all five targets. File verification proves the skill payload is installed; it does not prove
that a browser can launch.

## Prepare rendered review once per consumer project

Rendered capture requires Playwright, `@axe-core/playwright`, and a Chromium browser in the
consumer project. Check readiness from the consumer project root using the path for your agent:

```bash
# Codex or Cursor
node .agents/skills/design-review/scripts/setup-capture.mjs --check

# Claude Code
node .claude/skills/design-review/scripts/setup-capture.mjs --check

# OpenClaw
node skills/design-review/scripts/setup-capture.mjs --check

# Hermes
node .hermes/skills/design-review/scripts/setup-capture.mjs --check
```

If the check reports a missing dependency or browser binary, run the same command without
`--check`. It runs `npm install -D playwright @axe-core/playwright` in the consumer project and
downloads Chromium. Review those project dependency changes before committing them.

After setup, run the readiness check again. A successful check launches and closes Chromium; it is
stronger than `agentic-design-system/scripts/run-capture.mjs --check`, which verifies only that the
capture file is present.

WebKit is not installed by the setup helper. Projects that require WebKit verification can add it
explicitly with `npx playwright install webkit` and then run their WebKit checks.

## Activate ADS

For one task, tell the agent:

```text
Use the agentic-design-system skill for this interface task. Preserve the current product and chosen direction, follow understand → choose → work → prove → decide, and return task-relevant rendered evidence. For a substantial handoff, include Ember's review of that evidence.
```

For an always-on project setup, add this line to the instruction file your agent reads:

```markdown
For visual or frontend work, use the installed `agentic-design-system/SKILL.md` as the single execution entrypoint. For substantial design handoffs, use Ember to read the evidence already collected and present the review.
```

Agent-specific instruction locations and examples live in [`integrations/`](../integrations/).

## Ask Ember to review existing evidence

```text
Use Ember to review <page address or evidence packet directory>. If the page has no current evidence, use the Agentic Design System loop to collect it first. Return the scoped verdict, receipts, remaining gaps, and the next action. This request is review-only.
```

Ember reads the packet and its screenshots, then returns `ready`, `needs repair`, or `blocked`.
It does not run another agent or imply permission to repair. Missing required evidence is a block,
not a clean verdict.

## Install an exact checkout

Use this route to test an unmerged branch or a pinned revision. Keep the ADS source checkout
separate from the consumer project so installation cannot overwrite source skill directories:

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git /path/to/agentic-design-system
git -C /path/to/agentic-design-system switch <branch-name>
git -C /path/to/agentic-design-system rev-parse HEAD

cd /path/to/consumer-project
npx skills add /path/to/agentic-design-system --agent codex --copy --yes
npx skills list --agent codex --json
```

Replace `<branch-name>`, the checkout path, and `codex` with the intended revision and target ID.
Record the printed SHA with test evidence so the installed candidate can be tied to its source.

## Update

Rerun the same `npx skills add` command from the consumer project. Review and commit the resulting
`skills-lock.json` and installed skill changes together.

## No-CLI install

Clone and select the intended revision, then copy from that checkout into the consumer project:

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git /path/to/agentic-design-system
git -C /path/to/agentic-design-system switch <branch-name>
cp -R /path/to/agentic-design-system/skills/. /path/to/consumer-project/<agent-skill-directory>/
```

Use `.claude/skills/`, `.agents/skills/`, `skills/`, or `.hermes/skills/` from the matrix above.
Verify all eleven skill directories, Ember's references, and the browser runtime before relying on
rendered capture.
