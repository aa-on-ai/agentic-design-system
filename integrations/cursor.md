# Cursor

The canonical setup contract is [`docs/INSTALL.md`](../docs/INSTALL.md). Cursor's installer ID and
project skill directory are release-tested by `testing/install-matrix.sh`.

## Install

Run from the target project:

```bash
npx skills add aa-on-ai/agentic-design-system --agent cursor --copy --yes
```

ADS installs under `.agents/skills/`. Add this to the project's Cursor rules or `AGENTS.md`:

```markdown
For visual or UI work, load `.agents/skills/agentic-design-system/SKILL.md` first and follow its routing and rendered-verification contract.
```

Use Agent mode for the full loop; autocomplete does not run multi-step skill workflows.

## Use

```text
Use the agentic-design-system skill for this UI task. Define the outcome, read the project baseline, run the applicable review chain, and return rendered evidence before calling it done.
```

## Verify

```bash
npx skills list --agent cursor --json
test -f .agents/skills/agentic-design-system/SKILL.md
```
