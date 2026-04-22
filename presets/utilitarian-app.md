# utilitarian app

## best for

product UI, settings, workflows, admin panels, internal tools, CRUD surfaces, account pages, operational interfaces.

this is the default preset when the product should feel clear, competent, and restrained.

## activates

- `design-review`
- `ux-baseline-check`
- `ui-polish-pass`
- `agent-friendly-design` when the work is production-facing
- `responsive.md`
- `ai-css-failure-patterns.md`
- `sticky-scroll-patterns.md` when layout includes sticky regions, drawers, dashboards, or tables

## intentionally skips

- `whimsical-design`
- `world-build`
- `web-animation-design` unless the task explicitly asks for motion feel

## design posture

- calm, direct, utilitarian
- hierarchy through spacing and type before color
- existing product patterns over reinvention
- restraint over visual noise

## quality bar

- no obvious AI dashboard tropes
- loading, empty, and error states present
- touch targets and responsive behavior handled cleanly
- visual hierarchy works without decorative color
- the result feels like product software, not a template demo

## recommended inputs

- existing product screenshots or live references
- component library / design system guidance
- `DESIGN.md` or a filled project identity template
- specific constraints around density, navigation, and states

## human judgment still required

- what the primary task flow should be
- whether a new pattern is actually justified
- when density is helping vs hurting
- what deserves emphasis in the information hierarchy

## run report defaults

when this preset is active, the run report should usually emphasize:

- **task classification:** utilitarian app / product UI / settings / operational surface
- **skills fired:** `design-review`, `ux-baseline-check`, `ui-polish-pass`, plus `agent-friendly-design` when shipping to production
- **skills skipped:** creative skills unless the brief explicitly asks for them
- **references consulted:** `spacing.md`, `anti-patterns.md`, `responsive.md`, `ai-css-failure-patterns.md`
- **issues detected:** hierarchy flattening, missing states, hover-only affordances, decorative color misuse, mobile focus problems
- **fixes applied:** simplified layout, stronger type hierarchy, state coverage, cleaner responsive behavior
- **human judgment required:** whether the interface needs more personality or should stay restrained

## example prompt framing

- build a calm, competent settings surface
- prioritize clarity and flow over personality
- use restraint. no decorative cards or color noise
- mobile should preserve focus, not desktop density
