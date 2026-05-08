## Design system

this project uses the [agentic design system](https://github.com/aa-on-ai/agentic-design-system). read `routing/ROUTING.md` for the full decision tree. summary:

### core pack (always active for visual work)
0. `skills/agentic-design-system/SKILL.md` — routing and outcome/grader loop
1. `skills/design-review/SKILL.md` — quality gate
2. `skills/ux-baseline-check/SKILL.md` — state completeness
3. `skills/ui-polish-pass/SKILL.md` — final polish

### outcome + grader loop

For substantial UI work, define intent/outcome before building and grade the result after evidence is attached. Use `templates/outcome-template.md` and `templates/grader-report-template.md`. If this was installed as a skill pack and root templates are not present, use the bundled copies under `skills/agentic-design-system/templates/`.

### creative pack (opt-in only — read each skill's trigger rules first)
- `skills/visual-reference-calibration/SKILL.md` — before generation for reference-led work
- `skills/whimsical-design/SKILL.md` — only when user asks for personality/delight
- `skills/world-build/SKILL.md` — only when user asks for immersion/atmosphere
- `skills/web-animation-design/SKILL.md` — only when task involves animation

### routing
- visual + new → core pack (add creative only if triggered)
- visual + modification → design-review only
- non-visual → skip

### verification (run before presenting)
```bash
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>
```
fix warnings before presenting.

### identity + report
- read `guidelines.md` before building. if it doesn't exist, start from `templates/project-identity-template.md` (or a `presets/` starting point) and propose a draft.
- after building, emit a `report.md` per `templates/run-report-template.md` — rule hits, rubric scores, follow-ups. this is the audit trail, not an optional extra.

### key rule
if the default aesthetic is product-appropriate, don't fight it. make it excellent, not different.
