# agentic design system — agent instructions

## skills

this repo contains 7 design skills split into two packs:

**core pack** (always active for visual work):
- `skills/design-review/` — quality gate with verification scripts and 11 reference files
- `skills/ux-baseline-check/` — state completeness (loading, empty, error)
- `skills/ui-polish-pass/` — final visual polish pass
- `skills/agent-friendly-design/` — make sites work for AI consumers

**creative pack** (opt-in only — read each skill's trigger rules before using):
- `skills/whimsical-design/` — personality and delight
- `skills/world-build/` — immersive atmosphere
- `skills/web-animation-design/` — motion and interaction feel

## routing

read `routing/ROUTING.md` before starting any visual task. it tells you:
- when to use core pack only (default for most work)
- when to add creative pack skills (only when triggered)
- when to skip entirely (non-visual work)

## verification

after building, run:
```bash
python3 skills/design-review/scripts/anti-pattern-check.py <your-file.tsx>
python3 skills/design-review/scripts/state-check.py <your-file.tsx>
```
fix warnings before presenting work.

## key rules
- core pack is always-on for visual work. you don't need permission to use it.
- creative pack skills self-gate. read their trigger rules and skip if they don't apply.
- if the default aesthetic is product-appropriate, don't fight it. make it excellent, not different.
