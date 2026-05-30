---
version: alpha
name: Notion AI Settings
description: A settings page for Notion's AI features — restrained, near-monochrome, dense, honest.

colors:
  primary: "#2383E2"
  secondary: "#37352F"
  tertiary: "#F7F6F3"
  neutral: "#91918E"
  surface: "#FFFFFE"
  on-surface: "#37352F"
  error: "#E03E3E"

typography:
  headline-lg:
    fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "-0.01em"
  headline-md:
    fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "1.3"
  body-lg:
    fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "1.5"
  body-md:
    fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.5"
  body-sm:
    fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.4"
  label-md:
    fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "1.3"
  label-sm:
    fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "1.3"

rounded:
  none: "0px"
  sm: "3px"
  md: "6px"
  lg: "8px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  "2xl": "36px"

components:
  button-primary:
    background: "{colors.primary}"
    textColor: "{colors.surface}"
    radius: "{rounded.sm}"
    paddingX: "{spacing.md}"
    paddingY: "{spacing.sm}"
  button-secondary:
    background: "transparent"
    textColor: "{colors.on-surface}"
    radius: "{rounded.sm}"
    hoverBackground: "{colors.tertiary}"
  input:
    background: "{colors.surface}"
    radius: "{rounded.sm}"
    border: "1px solid rgba(55,53,47,0.16)"
    paddingX: "{spacing.md}"
    paddingY: "{spacing.sm}"
  toggle:
    trackOff: "{colors.neutral}"
    trackOn: "{colors.primary}"
    thumb: "{colors.surface}"
    radius: "{rounded.full}"
  section-divider:
    color: "rgba(55,53,47,0.09)"
---

# Notion AI Settings

## Overview

Restrained, minimal, honest, Notion-native. Settings pages are read more than they're admired — the job is to make the right toggle easy to find and the consequences of each setting easy to understand. Density is compact. Posture is utilitarian, with Notion's specific flavor: soft warm-off-white surface, charcoal text, sparse use of the blue accent. Before reading a word, the page should feel like it belongs inside a Notion workspace — not a different product with Notion branding.

Built to drop into Notion's existing app shell; the settings page is a content column (max ~720px) within the wider app. Accessibility floor: WCAG AA. Production constraint: this page loads synchronously with the rest of Notion — no heavy visual dependencies, no custom fonts beyond IBM Plex Sans (Notion's system).

## Colors

Near-monochrome. Charcoal-on-off-white is the default mode. Blue primary is used for active toggles and the single save/confirm action at the bottom of a settings group. Tertiary cream is for subtle section backgrounds and hover states. Neutral warm gray for inactive toggle tracks, dividers, and secondary label text.

- primary (blue) appears in **two places only**: on-state of toggles/switches, and the "save changes" primary button when changes are pending
- tertiary (cream) is for hover + section grouping backgrounds
- divider lines use the on-surface color at 9% opacity — never pure gray
- error (red) appears only inline on validation — never as a badge or chip color
- avoid: color-coded "on/off/pending/error" chip systems — in Notion, state is expressed through position, weight, and toggle affordance, not through palettes

## Typography

IBM Plex Sans throughout — Notion's actual type choice. No display sizes; the largest thing on this page is a 22px section header. Body-md (14px) is the default. Label-md (13px, 500 weight) for toggle labels. Body-sm (13px, 400 weight) for descriptions under each toggle. Negative letter-spacing on the one headline size (-0.01em). Numerals are default (not tabular — this isn't a data product).

## Layout

Compact posture. Content column: max 720px, centered in the settings viewport. Section rhythm: 36px between named sections, 16px between settings rows within a section. Row structure per-toggle: 3-column grid — label+description on the left (flexible), spacer, toggle on the right. Labels are top-aligned to the first line of the description.

Edge padding: 24px on desktop, 16px on mobile.

### Responsive

- mobile should preserve: **focus** (everything stays vertically stacked; no feature survives that doesn't pull its weight)
- sidebar (settings sub-nav) becomes a single-row horizontal scroll bar at the top on mobile; no hamburger, no bottom tabs
- toggle rows stay toggle rows — never collapse to a stacked layout where the toggle appears below the label (breaks the scannability)
- modals become full-screen sheets
- sticky "save changes" bar stays fixed to bottom on mobile when changes are pending; on desktop it's inline below the section

## Elevation & Depth

Flat. Zero shadows, zero elevation. Hierarchy comes from:
1. text weight and size
2. 1px dividers in `on-surface @ 9% opacity` between setting rows
3. subtle tertiary-cream background on hover for interactive rows

The "save changes" pending bar is the one exception — it has a 1px top border in neutral and a faint tertiary fill to differentiate from the settings content above it. No shadow even there.

## Shapes

Small, soft radii everywhere. Buttons and inputs at 3px — just enough to not feel sharp. Cards (when used for grouped settings) at 6–8px. Toggles are fully rounded pills (the Notion default). No decorative shapes; no rounded-corner brutalism; no perfectly square edges.

## Components

- **buttons**: primary is 3px-radius blue fill with surface text, used ONLY for the "save changes" sticky. Secondary is text-only with a tertiary-cream hover background — used for "cancel", "reset to default", inline actions.
- **toggles**: Notion's rounded-pill toggle. Off-state track is neutral gray; on-state track is primary blue. Thumb is surface white, 2px inset from the track edge. Animation is a 180ms ease-out translate on the thumb; no bounce.
- **inputs**: bordered at 1px `rgba(55,53,47,0.16)`, 3px radius, surface fill. Focus state gets a 2px ring in primary blue (not a border-color change). Error state replaces the border with error color and adds body-sm error text below.
- **cards/panels**: rarely needed — most settings sit in a single linear column. When grouping is required, use a flat tertiary-cream background with 6px radius and 16px internal padding, no border.
- **navigation**: the settings sub-nav is a vertical list on the left with body-md labels. Active state is tertiary-cream background + on-surface text. Hover is tertiary-cream background only. No icons unless already present in the product.
- **section-dividers**: horizontal rule at `rgba(55,53,47,0.09)`, full-width of the content column, above each named section heading (except the first).

## Do's and Don'ts

### Do
- describe each AI feature toggle with a single body-sm line that explains the consequence, not the feature ("AI suggestions will appear inline as you type in documents" — not "Enable AI suggestions")
- keep the "save changes" primary button disabled until a field actually changes; enable on first edit, hold until save completes
- show the current plan/billing context at the top of the AI section (since AI features depend on it) — but keep it as a single line of body-sm with a "manage plan" text link, not a card or callout
- group related toggles; separate groups with a divider + section heading

### Don't
- no gradient backgrounds, no glassy modals, no shadow-elevated "popular choice" cards
- no emoji in setting labels — Notion allows emoji in content, not in chrome
- no animated toggle trails or spring physics — Notion's toggle is crisp, not playful
- no "beta" badges unless the backend is genuinely labeled beta — no decorative badges for marketing

---

## Example Prompting Language

> Extension. Lines the agent can reuse verbatim while building.

- "near-monochrome — charcoal on off-white, blue only on toggle-on and the primary save button"
- "IBM Plex Sans, no display sizes, 14px body is the default"
- "flat, no shadows, no elevation anywhere — dividers and tertiary hovers only"
- "settings rows are a 3-column grid: label+description, spacer, toggle"
- "describe the consequence of each toggle, not the feature"
- "the save-changes bar is the only moment blue appears outside of toggles"
