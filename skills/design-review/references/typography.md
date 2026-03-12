# Typography Reference

## Core Rules
- Typography hierarchy > color for information architecture.
- Default to fewer sizes with more contrast, not many sizes 1-2px apart.
- One strong type system beats two mediocre fonts fighting each other.
- If the layout feels noisy, simplify the type ramp before touching color.

## Type Scale
- Keep a compact scale: 12 / 14 / 16 / 20 / 24 / 32 / 48.
- 16px is the default body floor for product UI.
- 14px is acceptable for dense secondary UI, never for long-form body copy.
- 12px is captions, metadata, legal, helper text. Use sparingly.
- Use 20-24px for section heads, 32-48px for page/hero moments.
- Prefer clear jumps over muddy ones. 16 → 20 is useful. 16 → 17 usually isn't.

## Hierarchy
- Build hierarchy with size, weight, spacing, and opacity together.
- Weight before size. Often 600 solves what 18px was trying to solve badly.
- Opacity before extra color. Secondary text should step back without becoming weak.
- One clear H1 per screen. If two things scream, neither does.
- Keep to 3 practical levels on most product screens: primary, secondary, tertiary.

## Measure & Readability
- Keep long-form text around 60-75ch max.
- Use more line-height as lines get longer.
- Body copy: roughly 1.45-1.6 line-height.
- Dark surfaces need slightly more line-height and slightly less weight.
- Left-align by default. Centered paragraphs are for posters, not product UI.

## Pairing
- Start with one family and multiple weights before reaching for a second font.
- Add a second typeface only when you need real contrast: display vs body, editorial vs utilitarian.
- Never pair fonts that are merely adjacent cousins. Similar-but-different looks accidental.
- Avoid defaulting to Inter unless the product truly wants invisible utility.
- Good directions when personality matters: Instrument Sans, Plus Jakarta Sans, Onest, Fraunces, Newsreader.
- System fonts are valid when speed, native feel, and restraint matter more than personality.

## Tokens & Implementation
- Name tokens by role, not raw size: `text-body`, `text-label`, `text-title`.
- Use rem for sizes so user settings still work.
- Tabular numbers for metrics, tables, timers, dashboards.
- Clamp large display sizes when needed, but keep core UI text stable.
- Don't fluid-scale buttons, labels, and compact controls into inconsistency.

## What Good Looks Like
- Headings feel obviously more important without bright colors doing the work.
- Metadata is quiet but still readable.
- Dense views still feel calm because the hierarchy is crisp.
- Numbers line up cleanly in tables and charts.

## Avoid
- Inter/system font defaults as thoughtless autopilot.
- 14/15/16/18-style mushy scales.
- Giant type used to compensate for weak layout.
- Decorative display fonts in body copy.
- Fake hierarchy created only with random color changes.
