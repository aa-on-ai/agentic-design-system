---
version: alpha
name: <project-name>
description: <one-line product description>

colors:
  primary: "#000000"
  secondary: "#000000"
  tertiary: "#000000"
  neutral: "#000000"
  surface: "#FFFFFF"
  on-surface: "#111111"
  error: "#B00020"

typography:
  headline-display:
    fontFamily: "system-ui"
    fontSize: "64px"
    fontWeight: 600
    lineHeight: "1.1"
  headline-lg:
    fontFamily: "system-ui"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: "1.15"
  headline-md:
    fontFamily: "system-ui"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "1.2"
  body-lg:
    fontFamily: "system-ui"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "1.5"
  body-md:
    fontFamily: "system-ui"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.5"
  body-sm:
    fontFamily: "system-ui"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.45"
  label-md:
    fontFamily: "system-ui"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "1.4"
  label-sm:
    fontFamily: "system-ui"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "1.3"

rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "24px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "72px"

components:
  button-primary:
    background: "{colors.primary}"
    textColor: "{colors.on-surface}"
    radius: "{rounded.md}"
    paddingX: "{spacing.lg}"
    paddingY: "{spacing.sm}"
  button-secondary:
    background: "{colors.surface}"
    textColor: "{colors.on-surface}"
    radius: "{rounded.md}"
    border: "1px solid {colors.neutral}"
  card:
    background: "{colors.surface}"
    radius: "{rounded.lg}"
    padding: "{spacing.lg}"
  input:
    background: "{colors.surface}"
    radius: "{rounded.sm}"
    border: "1px solid {colors.neutral}"
    paddingX: "{spacing.md}"
    paddingY: "{spacing.sm}"
---

# <Project Name>

## Overview

Pick 2–4 adjectives for atmosphere and emotional register. State overall posture: editorial / utilitarian / playful / cinematic / analytical / calm / sharp. State density: spacious / balanced / dense. Write 1–2 sentences on what the product should feel like before the user reads a word.

Close with concrete implementation context: component library or design system this builds on (e.g., shadcn, Material, custom), token source, which existing references to match, accessibility floor (e.g., WCAG AA), and any hard production constraints (e.g., LCP budget, browser support).

## Colors

Palette rationale. Token intent:
- `primary` — key actions, brand anchor
- `secondary` / `tertiary` — supporting accents
- `neutral` — borders, dividers, restrained UI chrome
- `surface` / `on-surface` — background and its legible text
- `error` — destructive or failed states

Where should color be restrained? Where is color allowed to carry emphasis? What color habits should the agent avoid (for example: no gradients, no zinc-800 walls, no purple-on-white AI defaults).

## Typography

Primary and secondary typefaces. Display character vs. body character. Preferred weights. Hierarchy notes (when does hierarchy come from size vs. weight vs. spacing?). Letter-spacing and text-tone notes.

## Layout

Spacing posture: generous / standard / compact. Section rhythm. Panel/card padding. Edge padding. Max content width. Grid strategy. What should the UI feel like before you read a word?

### Responsive

Answer the ambiguous forks up front:
- what mobile should preserve: density / focus / atmosphere / comparison / speed
- sidebar strategy on mobile
- table strategy on mobile
- dashboard strategy on mobile
- sticky strategy on mobile
- modal strategy on mobile

What should collapse aggressively? What must remain visible? What should never be duplicated across mobile/desktop variants?

## Elevation & Depth

Hierarchy method: flat / tonal layers / shadow-based / border-based. Shadow strategy if any (soft/ambient vs. sharp/directional). When to elevate vs. when to stay flat.

## Shapes

Corner radius conventions. Shape language across components (buttons, cards, inputs, avatars). Any opinionated shape choices (pill buttons, squared inputs, full-rounded avatars, etc.).

## Components

Per-component guidance. Reference the tokens above. Cover at minimum:
- buttons (primary, secondary, destructive)
- cards / panels
- inputs / forms (default, focus, error)
- navigation (preferred pattern, active state, density)

## Do's and Don'ts

### Do
-

### Don't
-

---

## Example Prompting Language

> Extension section — not part of the DESIGN.md core spec. Kept as a distinct block because these are lines the agent should reuse verbatim when building, and burying them in prose defeats the purpose.

3–6 lines of natural language the agent can copy into its own planning:

-
-
-
