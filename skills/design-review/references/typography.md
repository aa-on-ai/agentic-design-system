# Typography Reference

## Core Rules
- Typography hierarchy beats color for information architecture.
- Fewer sizes with stronger contrast beat a mushy micro-scale.
- One strong type system beats two fonts fighting each other.
- If the layout feels noisy, simplify the type ramp before touching color.

## Hierarchy
- Weight before size. Often stronger emphasis solves what bigger text was trying to do badly.
- One clear H1 per screen. If two things scream, neither does.
- Most product screens only need three practical levels: primary, secondary, tertiary.
- Secondary text should step back without becoming weak or gray mush.

## Pairing
- Start with one family and multiple weights before reaching for a second font.
- Add a second typeface only when you need real contrast: editorial vs utilitarian, display vs body.
- Avoid defaulting to Inter unless the product truly wants invisible utility.
- Similar-but-different font pairings look accidental.

## Patterns Agents Miss
- Giant type is often compensation for weak layout.
- Metrics, tables, and dashboards want tabular numbers (`font-variant-numeric: tabular-nums`).
- Long-form text needs restrained measure and enough line-height to breathe.
- Centered paragraphs almost always make product UI worse.
- Use `text-wrap: balance` on headings and short text blocks to distribute text evenly across lines and prevent orphaned words. Use `text-wrap: pretty` for body copy where balance is too aggressive.

## Avoid
- Inter/system font autopilot.
- 14/15/16/18-style muddy scales.
- Decorative display fonts in body copy.
- Fake hierarchy created only with color changes.
