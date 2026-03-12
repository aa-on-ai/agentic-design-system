# Color Reference

## Core Rules
- Restraint IS the design.
- Color is a scalpel, not confetti.
- Use typography, spacing, and surface hierarchy before adding another hue.
- Most product surfaces need one accent color, not a rainbow pretending to be a system.

## Palette Strategy
- Start with neutrals first. If the neutral system is bad, the whole UI feels cheap.
- Build: neutral scale, one accent, semantic colors, and surface layers.
- Keep accent usage rare so it keeps meaning.
- 60 / 30 / 10 is about visual weight, not area math.
- Skip secondary and tertiary brand colors unless the product truly needs them.

## Neutrals
- Use tinted neutrals, not pure gray.
- A tiny hue bias in the neutral ramp makes the whole interface feel more intentional.
- Warm products: add a subtle warm cast. Technical products: a subtle cool cast. Never enough to feel themed.
- Avoid pure black and pure gray. Real materials have temperature.
- In dark mode, depth comes from lighter surfaces, not giant shadows.

## OKLCH Guidance
- Prefer OKLCH for building scales because the steps behave more like human vision.
- As lightness approaches white or black, reduce chroma. High-chroma tints at extremes look synthetic fast.
- If using CSS tokens, keep primitive ramps separate from semantic tokens.
- Semantic tokens should swap across themes without rewriting the whole palette.

## Hierarchy Through Color
- Default text should be high-contrast neutral.
- Secondary text should step back with opacity or a softer neutral, not a random gray.
- Tertiary information can go quieter, but never into unreadable placeholder mush.
- Borders should usually be quieter than text and slightly stronger than backgrounds.
- Use accent color for action, selection, focus, and rare emphasis. Not every label, icon, and badge.

## Contrast
- Body text: 4.5:1 minimum.
- Large text and UI chrome: 3:1 minimum.
- Placeholder text still needs to be readable.
- Gray on colored backgrounds is almost always wrong. Use a darker/lighter version of the surface hue instead.
- Test dark mode separately. It is not light mode inverted.

## Surface Design
- Use surface steps to create hierarchy: page, panel, inset, control.
- Prefer subtle surface separation over borders everywhere.
- Strong colored fills should earn their place: alerts, callouts, selected states, charts.
- Heavy transparency is usually a smell. Build the right color instead.
- Exception: focus rings, overlays, and a few interactive states can use alpha intentionally.

## What Good Looks Like
- The screen works in grayscale and gets better with color.
- Accent color feels meaningful because it is scarce.
- Dark mode feels calm, not gamer-rig neon.
- Neutrals feel expensive because they are slightly alive.

## Avoid
- Purple gradients by default.
- Blue everywhere because no one made a decision.
- Pure #000, pure #fff, and dead zero-chroma grays.
- Gray text on colored backgrounds.
- Cyan/purple AI-saas palettes unless explicitly warranted.
- Using color alone to convey status or hierarchy.
