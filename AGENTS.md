# agentic design system — agent instructions

## start here

for any "help me design or review some UI" task, start at
[`workflows/create-design-workflow.md`](workflows/create-design-workflow.md). it routes you into
the right profile or workflow by intent. the runbooks in [`workflows/`](workflows/) are runnable
wrappers around the routing logic below.

## skills

this repo contains 10 design skills: one orchestrator plus core, reference, production, and creative packs.

**orchestrator** (read first for visual work):
- `skills/agentic-design-system/` — routing, gate order, verification expectations

**core pack** (always active for visual work):
- `skills/design-review/` — quality gate with verification scripts and 11 reference files
- `skills/ux-baseline-check/` — state completeness (loading, empty, error)
- `skills/ui-polish-pass/` — final visual polish pass

**production pass** (for public sites and products):
- `skills/agent-friendly-design/` — make sites work for AI consumers

**reference gate** (opt-in before coding):
- `skills/visual-reference-calibration/` — reference contract for screenshots, sites, CodePens, or "make it feel like this" work

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

two tiers — see `skills/design-review/scripts/README.md`.

**pre-flight (source heuristics, gameable).** cheap grep over source; catch obvious defaults early:
```bash
python3 skills/design-review/scripts/anti-pattern-check.py <your-file.tsx>
python3 skills/design-review/scripts/state-check.py <your-file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <your-file.tsx>
```

**authoritative (rendered evidence — gate on this).** axe on the live DOM, screenshots per
state/breakpoint, real overflow, main/live-region semantics, CLS, computed fonts. a state passes
only if it actually renders:
```bash
node skills/design-review/scripts/capture.mjs "<running-route-url>" \
  --states default,loading,empty,error --out evidence/<slug>
```
the verdict rests on rendered evidence; source heuristics are advisory. fix serious axe,
overflow, semantic, CLS, and touch-target failures before presenting work.

for substantial independent review, keep the four ADS rubric scores as the verdict layer and add
structured findings beneath them. each finding needs a fixed category, minor/major/blocker
severity, rubric row, state, breakpoint, exact artifact, concrete target or optional normalized
region, falsifiable observation, and evidence. blockers cannot return `satisfied`; subjective
findings do not become deterministic gates without a rendered measurement.

## key rules
- core pack is always-on for visual work. you don't need permission to use it.
- creative pack skills self-gate. read their trigger rules and skip if they don't apply.
- if the default aesthetic is product-appropriate, don't fight it. make it excellent, not different.
