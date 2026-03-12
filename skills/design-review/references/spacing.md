# Spacing Reference

## Touch Targets (HARD RULE)
- **Minimum 48×48pt** for all clickable/tappable elements (not 44pt — we exceed WCAG)
- **8pt minimum spacing** between adjacent touch targets to prevent mis-taps
- Aligns with 8pt grid system
- **Clearly indicate the target area** — padding is part of the click target, not just the text
- Small text links with no padding = accessibility failure. Wrap them in a clickable container.

## Core Rules
- Spacing is the #1 tell.
- Good spacing makes average UI feel thoughtful. Bad spacing makes good ideas look amateur.
- When in doubt, add breathing room.
- Use spacing to create hierarchy before adding borders, cards, or color.

## Base System
- Work from a 4px base for enough control: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- 8pt-only systems are often too blunt for product UI.
- Keep values on the scale unless there is a strong optical reason not to.
- Name tokens semantically when the codebase supports it.
- Prefer `gap` for sibling relationships over ad-hoc margins.

## Default Application
- Tight inline relationships: 4-8px.
- Label to field / icon to text: 8-12px.
- Related controls in a group: 12-16px.
- Card or panel padding: 16px minimum, 20-24px usually better.
- Section spacing: 32-48px.
- Major page rhythm: 48-64px, sometimes 96px for premium breathing room.

## Rhythm
- Use contrast in spacing, not one value everywhere.
- Tight inside, loose outside.
- Related things should feel obviously grouped.
- Unrelated things should have enough air that they stop competing.
- Let line-height inform vertical rhythm. Text and space should feel like part of the same system.

## Layout Behavior
- Left-align by default and let whitespace do the organizing.
- Resist wrapping every group in a card. Spacing and alignment usually do the job better.
- Never nest cards inside cards if spacing can create the hierarchy instead.
- Use max widths so wide monitors do not destroy rhythm.
- On dense dashboards, reduce clutter with consistent gaps before shrinking text.

## Optical Judgment
- Icons, numerals, and text often need optical adjustment, not literal geometry.
- Something mathematically centered can still look wrong.
- Check baselines between columns, labels, and controls.
- Run the squint test: can you see groupings immediately?
- If the screen reads like one gray brick, the spacing system is failing.

## Responsive Spacing
- Small screens need discipline, not total compression.
- Keep edge padding at 16px minimum on mobile.
- Use 24-32px when the layout allows.
- Let spacing open up on larger screens; don't strand content in a tiny dense column.
- Use clamp carefully for layout rhythm, not as an excuse to stop making decisions.

## What Good Looks Like
- The page feels calm before you read a word.
- There is a visible cadence between page, section, group, and element.
- Dense UIs still feel organized because relationships are obvious.

## Avoid
- Random 10px, 14px, 18px decisions with no system.
- Cramped containers with 12px padding everywhere.
- Equal spacing between everything.
- Bootstrap-card padding as a default aesthetic.
- Solving hierarchy with borders when spacing would do it better.
