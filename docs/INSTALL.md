# Install Agentic Design System

ADS is a skill pack your coding agent reads from your project. The release contains eleven skills,
including Ember, the evidence-reading voice used by default for substantial design handoffs.
Installing the skills does not edit your project instructions or install browser dependencies.

## Quick start

These steps use Claude Code. For Codex, Cursor, OpenClaw or Hermes, swap the `--agent` value and
skill folder using [Choose your agent](#choose-your-agent).

1. **Install** from your project folder (needs Node.js 22 or newer with `npx`):

   ```bash
   npx skills add aa-on-ai/agentic-design-system --agent claude-code --copy --yes
   ```

2. **Check it worked.** This should list eleven skills:

   ```bash
   npx skills list --agent claude-code --json
   ```

   The installer's summary may print an `.agents/skills/` path before it finishes. For Claude Code
   the files land in `.claude/skills/`.

3. **Set up screenshots once per project.** ADS proves its work with real browser captures, which
   need Playwright and Chromium:

   ```bash
   node .claude/skills/design-review/scripts/setup-capture.mjs --check
   ```

   If it reports something missing, run the same command without `--check`. It adds `playwright`
   and `@axe-core/playwright` as dev dependencies and downloads Chromium (about 700 MB). Captures
   are written to `evidence/`; add that folder to `.gitignore` unless you want to keep them.

4. **Start a new Claude Code session** so it picks up the skills, then ask for one real change.
   Say who the screen is for:

   ```text
   Use the agentic-design-system skill. Our account settings page is for small-business owners
   who need to update billing and add teammates without calling support. Make saving and
   validation clear for them. Keep our components and visual identity, and show me the working
   result on desktop and mobile.
   ```

## Before you install (for reviewers)

Skills are instructions plus supporting files, not a sandbox or a guarantee of safe execution. If
you review tools before adopting them, read the [orchestrator](../skills/agentic-design-system/SKILL.md)
and the specialist instructions relevant to your task, and follow their linked scripts and references.

- Review [what runs and what it changes](../skills/agentic-design-system/references/trust-and-customization.md#execution-inventory), including optional telemetry and browser interactions.
- Check [documented influences and attribution](influences.md). Conceptual inspiration is not the same as copied source.
- Try a scratch project first. To test an unmerged branch or pinned revision, use the [exact-checkout route](#install-an-exact-checkout). A branch alone does not isolate dependency installs, browser actions, or external services. Use local fixtures/test accounts.
- Set your [project taste and overrides](../skills/agentic-design-system/references/trust-and-customization.md#customize-the-design-direction) when you want ADS to follow house rules. Existing components and tokens remain the starting point either way.
- Inspect the resulting file and dependency diff before adopting it. Installation does not authorize deployment, external writes, or paid model calls.

A useful review-only request:

```text
Inspect this ADS checkout before installing it. Read the relevant SKILL.md files and linked
scripts. Summarize commands, file writes, network access, documented credits, and conflicts
with our design system. Do not install packages or change files yet.
```

## Requirements

- Node.js 22 or newer with `npx`
- A project directory where the agent can read local skills
- Python 3 only when using the optional source-check scripts
- For Hermes project discovery, a Git checkout and the native `hermes` executable

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

### Activate a Hermes project install

The skills CLI installer ID and the Hermes executable have different names. Use `hermes-agent`
with `npx skills`, as shown above, then use the native `hermes` CLI to trust the consumer Git
checkout:

```bash
git rev-parse --show-toplevel
hermes skills trust
hermes skills list
```

Hermes intentionally ignores `.hermes/skills/` and `.agents/skills/` in untrusted repositories.
It resolves the project from the nearest `.git` ancestor, so a plain directory with copied skill
files is not a discoverable Hermes project. `hermes skills trust` writes the resolved repository
root to the active Hermes profile after you have reviewed the checkout. The final listing must
include `agentic-design-system` and `ember`.

Start a new Hermes session from inside that trusted repository. Hermes fixes the working project
and skill index at session start, so installing or trusting skills does not retrofit an already
running session.

## Verify the files

Use the installer ID you chose above. Each command should list eleven skills:

```bash
npx skills list --agent claude-code --json
npx skills list --agent codex --json
npx skills list --agent cursor --json
npx skills list --agent openclaw --json
npx skills list --agent hermes-agent --json
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

File verification proves the skill payload is installed; it does not prove native runtime
discovery or that a browser can launch. Agent-specific checks live in [`integrations/`](../integrations/).

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
rendered capture. A no-CLI Hermes copy still requires a Git checkout, `hermes skills trust`, and a
fresh session from inside the repository.

## For maintainers

The release matrix executes the agent-specific file verification commands in
[`integrations/`](../integrations/) for all five targets. When Hermes is installed locally, run
`npm run install:hermes-discovery` to exercise its trust gate and native skill listing in an
isolated temporary profile.
