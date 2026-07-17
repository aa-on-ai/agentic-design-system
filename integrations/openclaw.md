# OpenClaw

The canonical setup contract is [`docs/INSTALL.md`](../docs/INSTALL.md). OpenClaw's installer ID
and workspace skill directory are release-tested by `testing/install-matrix.sh`.

## Install

Run from the target workspace:

```bash
npx skills add aa-on-ai/agentic-design-system --agent openclaw --copy --yes
```

ADS installs under `skills/`. Add this to the workspace `AGENTS.md`:

```markdown
For visual or UI work, load `skills/agentic-design-system/SKILL.md` first and follow its routing and rendered-verification contract.
```

## Handoffs

When delegating UI work, pass the outcome, project baseline, applicable gates, and required evidence.
The final owner still verifies screenshots and test receipts before reporting completion.

## Verify

```bash
npx skills list --agent openclaw --json
test -f skills/agentic-design-system/SKILL.md
```
