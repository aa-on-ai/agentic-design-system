# Hermes

The canonical setup contract is [`docs/INSTALL.md`](../docs/INSTALL.md). The skills CLI calls Hermes
`hermes-agent`; using `hermes` is invalid.

## Install

Run from the target project:

```bash
npx skills add aa-on-ai/agentic-design-system --agent hermes-agent --copy --yes
```

ADS installs under `.hermes/skills/`. Add this to the project's Hermes instructions:

```markdown
For visual or UI work, load `.hermes/skills/agentic-design-system/SKILL.md` first and follow its routing and rendered-verification contract.
```

## Use

```text
Use the agentic-design-system skill for this UI task. Define the outcome, read the project baseline, run the applicable review chain, and return rendered evidence before calling it done.
```

## Verify

```bash
npx skills list --agent hermes-agent --json
test -f .hermes/skills/agentic-design-system/SKILL.md
```
