# Hermes

The canonical setup contract is [`docs/INSTALL.md`](../docs/INSTALL.md). The two CLIs use different
names: `hermes-agent` is the skills CLI installer ID, while `hermes` is the native Hermes
executable used to trust a project and verify runtime discovery.

## Install

Run from the target project:

```bash
npx skills add aa-on-ai/agentic-design-system --agent hermes-agent --copy --yes
hermes skills trust
```

Hermes discovers repo-local skills only inside a Git checkout whose root is trusted. Run both
commands from the consumer repository. `hermes skills trust` records the resolved Git root in the
active Hermes profile; review the checkout before trusting it. ADS installs under
`.hermes/skills/`. Add this to the project's Hermes instructions:

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
git rev-parse --show-toplevel
hermes skills list
node .hermes/skills/agentic-design-system/scripts/run-capture.mjs --check
```

`npx skills list` proves that the installer copied the files. `hermes skills list` proves that the
native Hermes runtime can discover them; its output must include `agentic-design-system` and
`ember`. Start a new Hermes session from inside the trusted repository after installing or changing
skills because the project root and skill index are fixed when a session starts.
