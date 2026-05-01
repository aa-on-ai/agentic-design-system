# Routing

how to decide which skills to run and when.

## Two packs

**core pack** (always active for visual work):
- design-review — quality gate
- ux-baseline-check — state completeness
- ui-polish-pass — final visual polish
- agent-friendly-design — make sites work for AI consumers

**creative pack** (opt-in only):
- visual-reference-calibration — reference contract before generation
- whimsical-design — personality and delight
- world-build — immersive atmosphere
- web-animation-design — motion and interaction feel

core pack runs on every visual task. creative pack runs only when triggered. each creative skill has its own trigger rules in its SKILL.md — read those, not just this doc.

## The decision

```
is this visual or user-facing?
├── no → skip (scripts, backend, config, data)
└── yes → core pack always runs
    │
    does it need creative direction?
    ├── visual reference/screenshot/site/CodePen/"feel like" prompt → add visual-reference-calibration BEFORE generation
    ├── user asked for personality/delight/whimsy → add whimsical-design
    ├── user asked for immersion/atmosphere/world → add world-build
    ├── user asked about animation/motion/feel → add web-animation-design
    ├── it's marketing/launch/portfolio/editorial → whimsical-design likely helps
    └── none of the above → core pack is enough
```

**the key rule:** if the default aesthetic is appropriate for the product, don't fight it. a weather app CAN be dark and glassy. an admin panel SHOULD be clean and utilitarian. "different from defaults" is not always better. core pack makes the defaults excellent. creative pack makes them different. only add creative when different is actually what the product needs.

## Project Knowledge Intake (optional; run when alignment is needed)

default path: use a preset when there is no project context, then build. run Project Knowledge Intake only when the task depends on product taste and the project needs shared context beyond a preset.

intake gathers:
- brand/design docs, product specs, and prior decisions
- existing components, tokens, routes, and screenshots
- audience, domain nouns, workflows, and product language
- visual references and anti-references
- constraints: accessibility, responsive behavior, performance, libraries, launch risk

then ask only the minimum clarifying questions needed to remove blocking ambiguity. do not interview when files already answer the question. emit or update a project identity brief using `templates/project-identity-template.md`, then continue with the normal chain.

order: **ingest/interview → generate → critique → verify → report**.

## Reference Intake Gate (optional; run when a visual target matters)

if the prompt includes a visual reference, screenshot, site, CodePen, Dribbble shot, “make it feel like…”, marketing/editorial/launch art direction, or a previous output failed because the vibe was generic/sloppy/wrong, run `visual-reference-calibration` before building.

create `templates/reference-intake-contract.md` or the same shape in the run report. the contract must state:
- source/reference
- primary borrowed layer: structure, scale, motion, mood, typography, art style, surface, or interaction model
- secondary borrowed layers, if any
- what not to borrow
- fidelity target: close mimic, same spirit, or loose cue
- product constraints
- success cues and failure cues

hard rule for reference-led work: if the agent cannot state what to borrow, what not to borrow, and the fidelity target, it cannot build. if the task is not reference-led, skip this gate.

ask before building when:
- the primary borrowed layer is unclear
- the fidelity target is unclear and would change implementation strategy
- the reference implies structural change but the user did not approve it
- Aaron already said we missed the point

done gate for reference-led work:
1. screenshot the result
2. compare against the reference contract when cheap/easy
3. report where it matched and where it drifted

order for reference-led work: **project knowledge intake (if needed) → reference intake contract → generate → critique → screenshot comparison → report**.

## Context pass (run first if applicable)

if the prompt names a real company, product, founder, or public figure:

0. **contextual grounding** — BEFORE anything else, research the named entity. study their actual product's visual language (layout, nav, typography, color, density, interaction style). identify 10-20 real nouns from their domain. determine the premise's tone (satirical? deadpan? earnest?). write a brief: "this should feel like [company]'s actual product, with [tone] energy, using [real nouns]."

rules:
- the named company's product IS the primary visual reference. not Stripe. not Linear. not "best in class SaaS."
- generic references (Mobbin, Godly) are secondary — use them only to fill gaps the source product doesn't cover
- if the prompt is satirical or parodic, the humor should live in the DATA (row names, statuses, labels, timestamps) not in the visual design. the UI should look real; the content should be funny.
- mock data must be current: real model names, real agencies, real features, plausible scenarios
- ask: "would someone who works at this company recognize this as their tool?" if no, you're building the wrong thing.

skip this step only if the prompt is generic (no named entities).

## Core chain (default for all visual work)

run in order:

0. **project knowledge intake** — when context is incomplete, gather or interview enough to create/update the project identity brief before building.
1. **pattern benchmarking** — BEFORE building, research how the best version of this already exists. read `skills/design-review/references/inspiration.md`. find 2-3 real examples via Mobbin/Godly. this step takes 2 minutes and saves 30 minutes of iteration.
2. **design-review** — quality gate. catches structural problems, anti-patterns, missing states.
3. **ux-baseline-check** — state inventory. happy path, empty, loading, error, edge cases.
4. **ui-polish-pass** — final polish. spacing, alignment, hierarchy, visual cleanup.

## Core + creative (only when triggered)

add creative skills on top of core when the triggers are met:

- **+ whimsical-design** — when user asks for personality, delight, or brand expression. when building marketing/editorial/launch pages. when the output needs to be screenshotable.
- **+ world-build** — when user explicitly asks for immersion or atmosphere. portfolio sites, product launches, game UIs. runs BEFORE the core chain (sets creative direction first).
- **+ web-animation-design** — when user asks about motion, easing, springs, interaction feel, or "make it smooth." when the task specifically involves animation work.

## Review only

for modifications to existing UI where the structure already exists.

run:
1. **design-review** — pre-flight checklist only

examples: adjusting spacing, updating copy, minor layout tweaks, checking a screen before merge.

## Agent-friendly pass

for any web project shipping to production where agents may consume or interact with the site. runs independently from the visual quality chain.

1. **agent-friendly-design** — semantic HTML, ARIA, structured data, llms.txt, API-first patterns, crawlability

this skill runs alongside the core chain, not instead of it. a page can need both visual quality (for humans) and agent-friendly design (for agents).

## Skip

don't run the design chain for non-visual work:
- scripts, tests, data migrations
- backend logic, API routes
- config, infrastructure
- anything with no user-facing impact

## Divergent exploration mode

when the task is creative or the direction is unclear, don't commit to one approach. instead:

1. ask the builder: "this could go a few directions — want me to explore 2-3 options or pick one?"
2. if exploring: build multiple versions with a navigation element (version selector, tabs, URL variants)
3. different agents can work on different directions simultaneously
4. the builder picks a winner or hybridizes, then run the quality chain on the chosen direction

use for layout decisions and visual direction. not for button colors.

## Token budget awareness

- only load reference files you actually need
- creative pack skills are short — low token cost when loaded
- web-animation-design has a PRACTICAL-TIPS.md supplement — load only when doing animation work
- if you're doing review-only, one skill file is all you need

## Compounding

after every build or review, capture what worked and what didn't:
- new anti-patterns go in `skills/design-review/references/anti-patterns.md`
- project-specific decisions go in the project's `guidelines.md` or `DESIGN.md`
- the system gets smarter every time it's used. don't skip this step.
