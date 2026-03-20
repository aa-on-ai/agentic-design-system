## Design system

this project uses the [agentic design system](https://github.com/aa-on-ai/agentic-design-system). read `routing/ROUTING.md` for the full decision tree. summary:

### core pack (always active for visual work)
1. `skills/design-review/SKILL.md` — quality gate
2. `skills/ux-baseline-check/SKILL.md` — state completeness
3. `skills/ui-polish-pass/SKILL.md` — final polish

### creative pack (opt-in only — read each skill's trigger rules first)
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

### key rule
if the default aesthetic is product-appropriate, don't fight it. make it excellent, not different.
