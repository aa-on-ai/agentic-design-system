# Hermes

Hermes setup is simple: make the skills readable, paste the routing snippet, then add only the gates the task needs.

## Copy-paste setup

```bash
cp -r skills/ /path/to/your/project/skills/
cp presets/utilitarian-app.md /path/to/your/project/guidelines.md
```

Paste into the Hermes agent instructions:

```markdown
For visual/UI work:
1. Read skills/agentic-design-system/SKILL.md.
2. Use guidelines.md, DESIGN.md, or the closest preset.
3. Run Project Knowledge Intake only when the project needs alignment.
4. For substantial UI work, define outcome/intent first and return a grader report when a separate grader lane is available.
5. Run Reference Intake only when a screenshot/site/CodePen/“feel like this” reference matters.
6. Run design-review, ux-baseline-check, ui-polish-pass.
7. Return verification, screenshot status, and unresolved gaps.
Skip anything that does not apply.
```

## Default path

Preset → build → core checks → report.

## Optional layers

- **Project Knowledge Intake** when Hermes needs to learn product nouns, tokens, constraints, or stakeholder taste.
- **Reference Intake** when the work depends on a visual reference.

## Useful prompt

```text
Build the launch page using guidelines.md. This is reference-led: borrow the art-as-environment mood from [reference], do not copy its navigation or fake app chrome. Fill the Reference Intake Contract before coding.
```
