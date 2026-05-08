# Claude Code

Claude Code reads `CLAUDE.md` or `AGENTS.md` from your project root.

## Copy-paste setup

```bash
cp -r skills/ /path/to/your/project/skills/
cp presets/utilitarian-app.md /path/to/your/project/guidelines.md
```

Then paste this into `CLAUDE.md` or `AGENTS.md`:

```markdown
Before presenting visual/UI work:
1. Read skills/agentic-design-system/SKILL.md.
2. Read guidelines.md, DESIGN.md, or the closest preset.
3. If the project needs alignment, run Project Knowledge Intake and create/update DESIGN.md.
4. For substantial UI work, define outcome/intent first and use a separate grader when available.
5. If a visual reference matters, run Reference Intake before coding.
6. Run design-review, ux-baseline-check, ui-polish-pass.
7. Screenshot when possible and report checks/gaps.
Skip any gate that does not apply.
```

## Default path

Use a preset, prompt normally, and let the core checks run.

## Optional layers

- **Project Knowledge Intake** — use when the project has real constraints, stakeholders, existing tokens, or language the agent needs to learn.
- **Reference Intake** — use when a screenshot/site/CodePen/“make it feel like…” target matters.

## Useful prompt

```text
Build this UI using guidelines.md. Run the core design checks before presenting. If you need project alignment, create/update DESIGN.md. If you use a visual reference, fill the Reference Intake Contract first.
```
