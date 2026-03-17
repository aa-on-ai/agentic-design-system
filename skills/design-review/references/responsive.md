# Responsive Design Reference

## Core Rules
- If it breaks on mobile, it is broken.
- Build from the smallest screen up so content hierarchy gets decided early.
- Design for where the content breaks, not where a breakpoint chart says it should.
- Small screens need prioritization, not a desktop layout compressed until it cries.

## Hard Requirements
- No horizontal overflow at 375px. Ever.
- All tappable targets should be at least 48×48px with visible hit area.
- Hover-only behavior is a bug. Every hover reveal needs a tap path.
- Body text on mobile should stay readable. Do not miniaturize your way out of layout problems.

## Patterns Agents Miss
- Desktop sidebars rarely survive intact on mobile. Collapse, reframe, or move navigation.
- Tables do not magically become mobile-friendly by shrinking. Convert to cards, reduce columns, or create a detail view.
- Charts need simplification on mobile: fewer labels, fewer simultaneous views, touch-friendly interactions.
- Modals on mobile should usually become full-screen or near-full-screen with a clear back/close action.
- Fixed widths are landmines. If something has to feel fixed, cap it with `max-width`, not a rigid width.

## What To Check
- 375px: no overflow, no clipped text, no microscopic tap targets.
- 768px: awkward in-between states are resolved, not ignored.
- 1440px: layout breathes instead of stretching into a sparse mess.
- Keyboard navigation still makes sense across widths.
- Inputs use the right keyboard types and remain easy to hit.

## Avoid
- Treating mobile as a later polish pass.
- Hiding complexity behind hover.
- Keeping desktop information density when the screen no longer supports it.
- Shrinking tables, charts, or controls until they are technically visible but practically unusable.
