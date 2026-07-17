# Codex

The canonical setup contract is [`docs/INSTALL.md`](../docs/INSTALL.md). Codex's installer ID and
project skill directory are release-tested by `testing/install-matrix.sh`.

## Install

Run from the target project:

```bash
npx skills add aa-on-ai/agentic-design-system --agent codex --copy --yes
```

ADS installs under `.agents/skills/`. Add this to the project's `AGENTS.md`:

```markdown
For visual or UI work, load `.agents/skills/agentic-design-system/SKILL.md` first and follow its routing and rendered-verification contract.
```

## Use

```text
Use the agentic-design-system skill for this UI task. Define the outcome, read the project baseline, run the applicable review chain, and return rendered evidence before calling it done.
```

For direction exploration, ask Codex to use `design-variations` before changing production files.

## Verify

```bash
npx skills list --agent codex --json
test -f .agents/skills/agentic-design-system/SKILL.md
```
