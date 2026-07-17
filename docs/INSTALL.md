# Install ADS

Install Agentic Design System from the project where your coding agent will use it. The release
contains ten skills. Installation does not edit your project instructions.

## Requirements

- Node.js with `npx`
- A project directory where the agent can read local skills

## Choose your agent

Run exactly one command:

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

`--copy` gives the project a self-contained install instead of links back to an installer cache.
The command also creates `skills-lock.json`; commit it when you want reproducible team installs.

## Verify

Use the same installer ID you chose above:

```bash
npx skills list --agent codex --json
```

The result should contain these ten skills:

- `agentic-design-system`
- `design-review`
- `ux-baseline-check`
- `ui-polish-pass`
- `agent-friendly-design`
- `visual-reference-calibration`
- `design-variations`
- `whimsical-design`
- `world-build`
- `web-animation-design`

For a direct filesystem check, confirm `agentic-design-system/SKILL.md` exists under the agent's
skill directory listed above.

## Activate ADS

For a single task, tell the agent:

```text
Use the agentic-design-system skill for this UI task. Define the outcome, read the project baseline, run the applicable review chain, and return rendered evidence before calling it done.
```

For an always-on project setup, add this line to the instruction file your agent reads:

```markdown
For visual or UI work, load the installed `agentic-design-system` skill first and follow its routing and rendered-verification contract.
```

Agent-specific instruction locations and examples live in [`integrations/`](../integrations/).

## Install an exact checkout

Use a local checkout when testing an unmerged branch:

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git
cd agentic-design-system
npx skills add . --agent codex --copy --yes
```

Replace `codex` with the target installer ID. The repository's release gate exercises this local
path in five clean temporary projects.

## Update

Rerun the same `npx skills add` command. Review and commit the resulting `skills-lock.json` change
with the installed skill changes.

## No-CLI install

Clone ADS, then copy the contents of `skills/` into your agent's project skill directory:

```bash
git clone https://github.com/aa-on-ai/agentic-design-system.git
cp -R agentic-design-system/skills/. /path/to/project/<agent-skill-directory>/
```

Use `.claude/skills/`, `.agents/skills/`, `skills/`, or `.hermes/skills/` from the matrix above.
Verify all ten skill directories and `agentic-design-system/SKILL.md` before relying on the install.
