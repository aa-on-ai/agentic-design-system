---
version: alpha
name: Canopy
description: A calm, atmospheric weather app landing page.

colors:
  primary: "#2F5D50"
  secondary: "#A8BFA3"
  tertiary: "#D9C9A8"
  neutral: "#6B6F6A"
  surface: "#F6F4EE"
  on-surface: "#1C201C"
  error: "#8A3A2E"

typography:
  headline-display:
    fontFamily: "Fraunces, ui-serif, Georgia, serif"
    fontSize: "72px"
    fontWeight: 500
    lineHeight: "1.05"
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Fraunces, ui-serif, Georgia, serif"
    fontSize: "44px"
    fontWeight: 500
    lineHeight: "1.1"
    letterSpacing: "-0.015em"
  headline-md:
    fontFamily: "Fraunces, ui-serif, Georgia, serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: "1.2"
  body-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: "1.55"
  body-md:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.55"
  label-md:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "1.3"
    letterSpacing: "0.04em"

rounded:
  none: "0px"
  sm: "6px"
  md: "12px"
  lg: "24px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "28px"
  xl: "48px"
  "2xl": "80px"
  "3xl": "128px"

components:
  button-primary:
    background: "{colors.primary}"
    textColor: "{colors.surface}"
    radius: "{rounded.full}"
    paddingX: "{spacing.lg}"
    paddingY: "{spacing.sm}"
  button-secondary:
    background: "transparent"
    textColor: "{colors.on-surface}"
    radius: "{rounded.full}"
    border: "1px solid {colors.neutral}"
  card:
    background: "{colors.surface}"
    radius: "{rounded.lg}"
    padding: "{spacing.xl}"
    elevation: "tonal"
---

# Canopy

## Overview

Calm, atmospheric, editorial, trustworthy. Weather is emotional; Canopy's landing should feel like standing in a forest at first light — grounded, unhurried, honest about the sky. Density is spacious. Posture is editorial-calm. Before a user reads a word, the page should feel like it respects their time and doesn't need to shout to be heard.

Built on shadcn + a custom tokens file; do not ship unmodified shadcn primitives. Accessibility floor: WCAG AA on all text (primary-on-surface measures 7.3:1, AAA-safe). Production constraint: must render under 1.2s LCP on mid-tier mobile — no hero video, one above-the-fold image max.

## Colors

Forest-green primary anchors the brand without feeling corporate. Sage and stone accents soften it. Surface is a warm off-white (linen, not paper) that signals natural material. Neutral is a tinted warm gray — never pure 500-gray.

- use primary only on the hero CTA and one key accent moment (e.g., today's forecast card)
- secondary (sage) carries weather iconography and soft chart fills
- tertiary (stone) appears in metadata, timestamps, caption text
- avoid: gradients, glassy overlays, weather-app-cliche "sunny yellow" and "storm purple"

## Typography

Fraunces (variable serif) for display and headlines — the optical size gives it warmth at large scales. Inter for body. Serif/sans pairing signals editorial without feeling dated. Weights restrained to 400/500; no bold anywhere. Hierarchy comes from size and line-height, not weight. Light letter-spacing tracking on labels (+0.04em) for a field-guide feel.

## Layout

Generous spacing. Section rhythm is 128px between major blocks, 48px within. Edge padding on desktop: 80px. Max content width: 1120px. Single-column hero, two-column secondary sections. The landing page breathes; whitespace is the primary compositional tool.

### Responsive

- mobile should preserve: **atmosphere** (density can collapse; calm must survive)
- edge padding on mobile: 20px
- typography drops: headline-display to 48px, body-lg to 17px
- two-column sections stack to single-column with 48px between them
- nav becomes a compact top bar; no hamburger on a landing this short — use a single anchor link to a pricing or "get the app" section
- never duplicate the hero CTA into a sticky mobile footer — one CTA, one location

## Elevation & Depth

Tonal layers, not shadows. Cards differentiate from the background by being 3–6% darker or lighter — never by casting a shadow. The one exception is a very soft ambient shadow on the primary forecast card (`0 1px 2px rgba(28,32,28,0.04)`), treated as a tonal edge rather than a lift.

## Shapes

Fully rounded pill buttons. Large-radius cards (24px). Squared photographs and weather-map imagery — the circle/square contrast is intentional. No decorative shapes in the background.

## Components

- **buttons**: pill primary on forest-green with surface text; pill secondary with neutral border, no fill. Hover deepens the primary by 6% on the lightness axis; focus gets a 2px outset ring in secondary sage.
- **cards**: linen surface with tonal edge. 48px internal padding. Contents align to an inner 8px grid.
- **inputs / forms**: not applicable to the landing (no sign-up form in hero). If used later: bottom-border only, no boxed inputs.
- **navigation**: top nav is transparent-over-hero, becomes linen-fill + neutral-border on scroll. Links are body-md, +0.02em tracking, active state is underline offset by 6px.

## Do's and Don'ts

### Do
- let whitespace carry the composition — aim for the feeling of page margins in a field guide
- use real photography or tasteful illustration for atmosphere, never stock weather-icon sets
- keep copy short, specific, and honest ("partly cloudy, 62°, breeze from the NW" beats "stay ahead of the weather")

### Don't
- no zinc/slate neutrals, no purple AI-gradients
- no glassmorphism or backdrop-blur effects
- no dramatic hero video — stillness is the mood
- no more than one call-to-action in the hero

---

## Example Prompting Language

> Extension. Lines the agent can reuse verbatim while building.

- "keep it calm, slow, editorial — a field guide, not an app store"
- "hierarchy comes from spacing and type, not color"
- "forest-green is scarce; use it once in the hero and once in the primary card"
- "tonal layers over shadows, always"
- "pill buttons on Fraunces display — the contrast between round and typographic is the whole visual signature"
