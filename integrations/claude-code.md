# Claude Code

The canonical setup contract is [`docs/INSTALL.md`](../docs/INSTALL.md). Claude Code's installer ID
and project skill directory are release-tested by `testing/install-matrix.sh`.

## Install

Run from the target project:

```bash
npx skills add aa-on-ai/agentic-design-system --agent claude-code --copy --yes
```

ADS installs under `.claude/skills/`. Add this to `CLAUDE.md` or `AGENTS.md`:

```markdown
For visual or UI work, load `.claude/skills/agentic-design-system/SKILL.md` first and follow its routing and rendered-verification contract.
```

## Use

```text
Use the agentic-design-system skill for this UI task. Define the outcome, read the project baseline, run the applicable review chain, and return rendered evidence before calling it done.
```

Creative and reference skills remain opt-in. The orchestrator decides which gates apply.

## Verify

```bash
npx skills list --agent claude-code --json
test -f .claude/skills/agentic-design-system/SKILL.md
```
