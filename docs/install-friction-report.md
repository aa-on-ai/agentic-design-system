# Install & integration friction — field report

Written from a Claude Code session where Aaron asked "update to the latest version of the design system" and the agent (me, Claude Opus 4.7) misunderstood the system in several specific ways. This is feedback to whoever is maintaining ADS. Names of files and paths are exact so the maintainer can patch directly.

## Setup at the time of report

- Aaron's machine, `darwin 25.3.0`, Claude Code agent.
- Skills installed globally at `~/.agents/skills/` symlinked into `~/.claude/skills/`.
- Full repo cloned at `~/agentic-design-system/`.
- Aaron's global `~/.claude/CLAUDE.md` had no reference to the design system before this session.
- Skill versions byte-identical to commit `30e8ed6` (today's `main`).

## What the agent got wrong (and why)

### 1. Treated "install" as `npx skills add` only

I assumed "the design system" == "the skills bundle" and that updating skills was the whole job. Aaron corrected me: the system is skills + routing + presets + templates + schemas + scripts + the repo's own agent instructions.

Where this came from: the README's `## Install` section leads with `npx skills add ...` which only delivers the `skills/` directory. The "no-CLI install" section uses `cp -r skills/` — same scope. The README's *table* mentions `templates/`, `presets/`, `integrations/` and a sentence acknowledges "the full repo also includes presets, templates, integration docs..." but there's no clear "how to make those reachable to your agent in a fresh session" section.

**Suggested fix:** add an `## Install (full system)` section that explicitly says: skills come via `npx skills add`; presets/templates/routing/schemas come via cloning the repo; here's how to make the clone discoverable to your agent. Today the docs implicitly assume the user knows to clone separately.

### 2. Confused "global vs project" install scope

When I first tried `npx skills add aa-on-ai/agentic-design-system --yes` (Aaron ran it, since the auto-mode classifier blocked me twice), the user's CWD was inside `~/Desktop/agentic-design-system` (an old clone), so the CLI silently project-installed into `~/Desktop/agentic-design-system/.agents/skills/`. The user reported "after restart, fresh sessions don't see the new install." Diagnosis: the CLI auto-detected a project context and installed locally; the global symlinks at `~/.claude/skills/` still pointed at the older `~/.agents/skills/`.

The CLI does have `-g/--global`, and `npx skills update -g -y` exists for in-place updates. Neither is called out in the README install section.

**Suggested fix:** README install snippet should be `npx skills add aa-on-ai/agentic-design-system -g --yes` for users who want a global install (most agent shells). Add a one-liner about `npx skills update -g -y` as the canonical update path. Mention that running from a project directory will project-install silently — a common foot-gun.

### 3. Misread the system as "verbal pre-walkthrough" instead of "build → grade gate"

After updating skills, I edited Aaron's global `~/.claude/CLAUDE.md` to add a § 5 telling the agent to "read routing/ROUTING.md, pick a preset, fill outcome-template, run scripts, emit report.md" *before* presenting work. Then I proposed a "test prompt": *"Walk me through your approach using my design system before any code."*

Aaron reaction: "the design system isn't built to do that at all... what is your understanding of how it should work?"

He was right. The orchestrator skill (`skills/agentic-design-system/SKILL.md`) is clear that the system is a **build → score → gate** loop, not a verbal pre-walkthrough. Generation is separated from evaluation. The agent builds, scores against the 4-criteria rubric, runs verification scripts, only presents if 6+ on Design Quality and Originality, and produces evidence (screenshot, scores, what fired). Reciting paths upfront is performance, not the system working.

Where my misreading came from:

- The README's "Default path" reads as a step list: "Paste snippet → pick baseline → fill outcome → grade." That phrasing primed me to think the agent should narrate those steps to the user.
- The integration doc `integrations/claude-code.md` says "Then paste this into `CLAUDE.md` or `AGENTS.md`:" with a 7-step list starting with "Read skills/agentic-design-system/SKILL.md." That snippet, taken literally and pasted into a global CLAUDE.md, looks like "narrate these steps."
- PHILOSOPHY.md is much clearer ("agents read this, humans configure it"; "review feeds guidelines"; "review step produces the update as a byproduct, not as homework"), but PHILOSOPHY.md isn't the doc agents see first.

**Suggested fix:** in `integrations/claude-code.md`, reframe the snippet as "paste this so the agent knows when to invoke the orchestrator skill." Make explicit that the orchestrator handles routing, not the snippet itself. Also: in the orchestrator SKILL.md, consider an opening line like "the agent invokes this skill when triggered — it is not a recital. build, score yourself on the rubric, present with evidence."

### 4. The "snippet → CLAUDE.md" path encourages dead weight

Aaron's pre-existing global `~/.claude/CLAUDE.md` had zero design-system references. I added § 5 (the 7-step list) thinking it was load-bearing. Aaron then said the system "isn't built to do that at all." Rolling back § 5 is probably correct — the orchestrator skill auto-loads via skill-description matching, so a CLAUDE.md snippet is redundant for Claude Code specifically.

**Suggested fix:** the integration doc for Claude Code could note: "Claude Code auto-loads skill descriptions on session start. The orchestrator skill self-triggers on visual/UI work. The CLAUDE.md snippet is mostly for agent shells that don't have skill auto-discovery (Codex, Cursor without skill plugins, etc.)." Today the doc treats the snippet as universal.

### 5. No "smoke test" to confirm the system is wired up

After install, there was no obvious way to confirm "yes, the orchestrator skill will fire on visual work in this project." We ended up testing by writing a deliberately bad `BadCard.tsx` and running the 3 verification scripts manually. That works, but only tests the verification gate, not the orchestrator's trigger.

**Suggested fix:** ship a `bin/ads-doctor` (or `npx skills doctor` integration) that:

1. Confirms `~/.claude/skills/agentic-design-system` resolves to a real `SKILL.md`.
2. Runs the 3 verification scripts on a bundled fixture file (deliberately bad TSX) and confirms each one fires the expected number of warnings.
3. Prints the install scope (global vs project) so foot-guns like §2 are visible.

Plus a fixture pair: `examples/bad-card.tsx` (anti-patterns galore) and `examples/good-card.tsx` (passes the gate). Useful for both smoke testing and "show me what the gate catches."

### 6. Stray installs leave clutter without warning

Aaron's misfired `npx skills add` from Desktop CWD created `~/Desktop/agentic-design-system/.agents/` (208KB of files) with no prompt or warning. He never asked for a project install. Cleanup required `rm -rf ~/Desktop/agentic-design-system/.agents`.

**Suggested fix:** when project-installing, the CLI could print a one-line warning: "Project-installing into <dir>/.agents/. To install globally, re-run with -g." Not strictly an ADS issue (it's the `skills` CLI), but it shows up as one in practice because ADS is the most common payload Aaron installs.

## Summary of agent-side fixes Aaron and I just made

- Reverted nothing yet (still need to decide on § 5 rollback).
- Updated `~/.claude/projects/-Users-aaronthomas/memory/reference_agentic_design_system.md` to say "the system is more than just skills" and record the clone path + update commands explicitly.
- Removed stray `~/Desktop/agentic-design-system/.agents/` clutter.
- Verified all 3 gate scripts work end-to-end on a deliberately-bad TSX fixture.

## What this report doesn't cover

- The agentic-design-system itself (skills, references, scripts) is solid. Friction was almost entirely in the install/integration surface and in how the docs frame the system to a fresh agent.
- I did not touch `routing/ROUTING.md`, the orchestrator SKILL.md, or any reference file. Those read as intended once the install/integration surface clears up the mental model.
