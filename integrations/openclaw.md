# OpenClaw

OpenClaw agents read workspace instructions and sub-agent handoffs. Put the design system in `AGENTS.md`, then include only the relevant gates in UI handoffs.

## Copy-paste setup

```bash
cp -r skills/ ~/your-workspace/skills/
cp presets/utilitarian-app.md ~/your-workspace/guidelines.md
```

Paste into workspace `AGENTS.md`:

```markdown
For visual/UI work:
1. Use guidelines.md, DESIGN.md, or the closest preset.
2. Run Project Knowledge Intake only when the project needs alignment.
3. Run Reference Intake only when a screenshot/site/CodePen/“feel like this” reference matters.
4. Run design-review, ux-baseline-check, ui-polish-pass.
5. Screenshot when possible and return verification/gaps.
Skip anything that does not apply.
```

## UI sub-agent handoff

```text
Build [screen/component].
Context: use guidelines.md or DESIGN.md.
Gates: core design checks only.
Optional: run Project Intake if context is insufficient. Run Reference Intake only if the provided visual reference changes the direction.
Return: files changed, verification output, screenshot path or why unavailable, unresolved gaps.
```

## Default path

Preset → threaded UI sub-agent → core checks → completion packet.

## Optional layers

- **Project Knowledge Intake** when the sub-agent needs shared product taste or constraints.
- **Reference Intake** when the sub-agent must preserve a specific visual feel.
