# dense dashboard

## best for

data-heavy tools, analytics products, ops consoles, monitoring surfaces, finance views, tables with comparison-heavy workflows.

use this when users need to scan, compare, and maintain context across many signals.

## activates

- `design-review`
- `ux-baseline-check`
- `ui-polish-pass`
- `agent-friendly-design` when the work is production-facing
- `responsive.md`
- `ai-css-failure-patterns.md`
- `responsive-design-forks.md`
- `sticky-scroll-patterns.md`

## intentionally skips

- `whimsical-design`
- `world-build`
- `web-animation-design` unless motion is part of the brief

## design posture

- dense but legible
- comparison first
- preserve structure before adding visual personality
- dashboards are compositions, not card grids

## quality bar

- no 4-stat-cards + chart + table autopilot layout
- clear primary vs secondary visual weight
- tables and filters survive mobile with explicit decisions
- sticky elements earn their space and actually work
- the screen feels information-rich, not cramped

## recommended inputs

- real or realistic data shapes
- known priority metrics / entities
- device targets for dense usage
- explicit mobile strategy for tables, sidebars, and sticky chrome
- `DESIGN.md` or project identity notes with responsive stance

## human judgment still required

- what should remain simultaneously visible vs collapse on mobile
- which data deserves dominant placement
- when a table should stay a table vs translate to cards or detail views
- how much density the product can support before trust drops

## run report defaults

when this preset is active, the run report should usually emphasize:

- **task classification:** dense dashboard / analytics / comparison-heavy interface
- **skills fired:** `design-review`, `ux-baseline-check`, `ui-polish-pass`, `responsive-design-forks`, `sticky-scroll-patterns`, plus `agent-friendly-design` when relevant
- **skills skipped:** creative skills unless the brief explicitly calls for motion or brand expression
- **references consulted:** `spacing.md`, `anti-patterns.md`, `responsive.md`, `ai-css-failure-patterns.md`, `responsive-design-forks.md`, `sticky-scroll-patterns.md`
- **issues detected:** equal-weight cards, broken sticky behavior, bad table translation on mobile, hidden comparison context, cramped density
- **fixes applied:** clearer composition, explicit mobile fork choice, sticky repair, table strategy, better visual weighting
- **human judgment required:** what must stay visible on mobile and which metrics deserve dominant placement

## example prompt framing

- build a dense but legible dashboard for comparison-heavy work
- avoid generic admin templates and equal-weight cards
- treat mobile as a deliberate translation problem, not a shrink pass
- preserve analytical clarity over decorative polish
