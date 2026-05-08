# run report — dense dashboard example

> illustrative example only. this is a probe for the explainability shape, not a final product contract.

## task classification
- task type: dense dashboard / comparison-heavy analytics surface
- matched preset: `dense-dashboard`
- confidence: high
- reason: multiple priority metrics, sticky filters, tabular data, mobile translation ambiguity

## skills fired
- `design-review`
  - why it fired: visual/dashboard work always goes through the core quality gate
  - role it played: rejected the default equal-card admin layout and pushed for stronger composition
- `ux-baseline-check`
  - why it fired: analytics surfaces need loading, empty, and filtered states
  - role it played: added no-results and data-unavailable states
- `ui-polish-pass`
  - why it fired: dense layouts need a final spacing and weighting pass or they feel cramped
  - role it played: improved scanability and reduced visual noise
- `responsive-design-forks`
  - why it fired: table and sidebar behavior on mobile required explicit tradeoff decisions
  - role it played: surfaced the choice between cross-row comparison and simplified detail reading
- `sticky-scroll-patterns`
  - why it fired: layout contained sticky filters and independent scroll regions
  - role it played: fixed sticky offsets and clarified which regions should scroll independently
- `agent-friendly-design`
  - why it fired: production analytics UI needed accessible structure and keyboard support
  - role it played: improved table semantics and navigation order

## skills skipped
- `whimsical-design`
  - why it did not fire: no request for expressive brand personality
- `world-build`
  - why it did not fire: no immersive narrative brief
- `web-animation-design`
  - why it did not fire: motion was not central to the task

## references consulted
- `spacing.md`
  - decision it influenced: created contrast between the hero metric, secondary metrics, and the table region
- `anti-patterns.md`
  - decision it influenced: avoided the generic 4-stat-cards + chart + table pattern
- `responsive.md`
  - decision it influenced: treated mobile as a translation problem, not a shrink pass
- `ai-css-failure-patterns.md`
  - decision it influenced: fixed sticky failures caused by overflow and caught missing `min-w-0`
- `responsive-design-forks.md`
  - decision it influenced: chose priority columns + detail expansion over blind horizontal compression on mobile
- `sticky-scroll-patterns.md`
  - decision it influenced: established sticky header offsets and independent scrolling for sidebar vs main content

## issues detected
- visual / design:
  - too many equal-weight cards made the screen feel templated
  - secondary information was competing with the main chart
- UX / states:
  - no empty state for filtered datasets
  - no clear handling for delayed or unavailable data
- responsive:
  - mobile behavior for the table and filters was undefined
  - sticky filters failed inside an overflow container
- accessibility / semantics:
  - table headers were not fully scoped and keyboard navigation was awkward

## fixes applied
- restructured the page into a dominant hero metric + secondary metric cluster + clearer table region
- added filtered empty state and unavailable-data handling
- chose priority columns + row expansion for mobile instead of horizontal squish
- repaired sticky behavior by restructuring overflow and offset math
- tightened spacing and reduced decorative panel chrome so density stayed readable

## human judgment required
- should mobile preserve more cross-row comparison, even at the cost of simplicity?
- which metric truly deserves the dominant slot when space is tight?

## short end-user summary
- why this setup: this was a comparison-heavy dashboard, so the system prioritized composition, responsive table decisions, and sticky behavior
- what ran: design review, UX state checks, polish, responsive fork checks, and sticky-pattern review
- what improved: stronger hierarchy, explicit mobile strategy, repaired sticky behavior, and better state coverage
- what still needs a human: how much comparison context must survive on mobile and which metric leads the story
