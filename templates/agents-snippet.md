## Design system

This project uses the [Agentic Design System](https://github.com/aa-on-ai/agentic-design-system). Read `routing/ROUTING.md` for the full decision tree. Summary:

### Project Knowledge Intake

Default: use `DESIGN.md`, `guidelines.md`, or a preset. If no context exists, pick the closest preset and build.

Add Project Knowledge Intake only when the project needs alignment. Inspect docs/components/screenshots/references, ask only the missing blocking questions, and create/update a compact `DESIGN.md`-shaped brief using `templates/project-identity-template.md`.

### Reference Intake Gate

Add Reference Intake only for reference-led work. Before coding, read `skills/visual-reference-calibration/SKILL.md` and fill `templates/reference-intake-contract.md`.

Trigger this when the user provides a screenshot, site, CodePen, Dribbble shot, says “make it feel like…”, the task depends on launch/editorial art direction, or prior output failed because it was generic/sloppy/wrong vibe.

Hard rule: if you cannot state what to borrow, what not to borrow, and the fidelity target, you cannot build. Ask first.

### Core pack (always active for visual work)

1. `skills/design-review/SKILL.md` — quality gate
2. `skills/ux-baseline-check/SKILL.md` — state completeness
3. `skills/ui-polish-pass/SKILL.md` — final polish

### Creative pack (opt-in only — read each skill's trigger rules first)

- `skills/visual-reference-calibration/SKILL.md` — before generation for reference-led work
- `skills/whimsical-design/SKILL.md` — only when user asks for personality/delight or marketing/editorial expression
- `skills/world-build/SKILL.md` — only when user asks for immersion/atmosphere
- `skills/web-animation-design/SKILL.md` — only when task involves animation

### Routing

- No context → use a preset
- Needs shared alignment → Project Knowledge Intake
- Visual reference matters → Reference Intake
- Visual + new → only applicable gates → core pack → report
- Visual + modification → design-review pre-flight; add Reference Intake if the change is reference-led
- Non-visual → skip

### Verification (run before presenting)

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>
```

Fix warnings before presenting. Screenshot the rendered result when possible. For reference-led work, compare the screenshot against the Reference Intake Contract and report any unresolved drift.

### Report

After building, emit a `report.md` per `templates/run-report-template.md` — project/context status, reference contract when applicable, rule hits, rubric scores, verification, screenshots, follow-ups. This is the audit trail, not an optional extra.

### Key rule

If the default aesthetic is product-appropriate, do not fight it. Make it excellent, not different.
