---
version: alpha
name: Pawprint
description: An admin dashboard for a dog walking service — operational, warm, dense but legible.

colors:
  primary: "#C2522E"
  secondary: "#334155"
  tertiary: "#F9F3E9"
  neutral: "#71716B"
  surface: "#FAFAF7"
  on-surface: "#1F1F1B"
  error: "#9F2F2F"

typography:
  headline-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "1.2"
  headline-md:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "1.25"
  body-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.5"
  body-md:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.5"
  body-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.45"
  label-md:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "1.3"
    letterSpacing: "0.02em"
  label-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "1.25"
    letterSpacing: "0.04em"

rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "10px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "6px"
  md: "12px"
  lg: "20px"
  xl: "32px"
  "2xl": "48px"

components:
  button-primary:
    background: "{colors.primary}"
    textColor: "{colors.surface}"
    radius: "{rounded.md}"
    paddingX: "{spacing.md}"
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
    border: "1px solid {colors.tertiary}"
  input:
    background: "{colors.surface}"
    radius: "{rounded.sm}"
    border: "1px solid {colors.neutral}"
    paddingX: "{spacing.md}"
    paddingY: "{spacing.sm}"
  table-row:
    background: "{colors.surface}"
    hover: "{colors.tertiary}"
    borderBottom: "1px solid {colors.tertiary}"
---

# Pawprint

## Overview

Warm, operational, friendly-utility, legible. Pawprint is a tool people use every day to run a small business — it must be fast to scan, forgiving of repetition, and honest about what's happening with each walk right now. Density is balanced (dense rows, standard chrome). Posture is utilitarian but never sterile; this is a product run by humans who love dogs, not a SaaS admin panel pretending to be enterprise.

Built on shadcn + custom tokens; default shadcn is too cold for this product — we warm it up through surface + tertiary tokens. Accessibility floor: WCAG AA. Production constraints: must stay readable at 1366×768 (common laptop screen) without horizontal scroll on the orders/walks table.

## Colors

Terracotta primary carries the warmth; slate secondary carries the utility. Tertiary cream is used for hover states, selected rows, and soft dividers — it's the glue that makes the dashboard feel sturdy, not clinical. Neutral is a warm gray, never pure.

- use primary only on the single primary action per view (e.g., "add walk", "assign walker") — never on secondary actions, never on chips, never on nav
- secondary (slate) is for time-sensitive status (overdue, pending, scheduled) and icon strokes
- tertiary (cream) carries hover states, selected rows, section dividers on cards
- error coordinates with terracotta — both warm reds — so destructive states don't feel like they're from a different system
- avoid: cold slate-only palettes, single-accent dashboards that feel like Linear clones

## Typography

Inter throughout — one family, full stop. No serif, no display typeface. Hierarchy comes from size + weight combined. Body-md (14px) is the workhorse for table rows and form labels. Label-md is uppercase-ish tracking only on table column headers and status chips. Tabular numerals on any numeric column.

## Layout

Balanced density. Content gutter: 20px. Section rhythm inside a view: 32px between major blocks, 12px within a card. Sidebar navigation is 220px wide on desktop. Max content width uncapped (admin uses the screen). Tables and lists use tighter row height (44px); cards use generous internal padding (20px).

### Responsive

- mobile should preserve: **focus** (density collapses; the single task in front of the user is what survives)
- sidebar becomes a bottom tab bar on mobile (<768px) with 4 anchors max; "more" opens a sheet
- tables collapse to cards: one row per card, primary columns stacked, secondary fields in a dismissible details row
- dashboards collapse to vertical stack; never preserve the multi-column grid on mobile
- sticky headers remain on tables; sticky filters collapse into a chip-bar above the list
- modals become bottom sheets on mobile, full-screen on small phones
- never duplicate actions into both a sticky header and a floating action button — pick one per view

## Elevation & Depth

Flat with borders. No shadows anywhere. Hierarchy comes from:
1. tonal shift (surface vs. tertiary for hover/selected)
2. 1px borders in tertiary cream (between cards, between table rows)

The one exception is the assignment modal, which gets a soft scrim and a single low shadow on the modal panel (`0 8px 24px rgba(31,31,27,0.08)`) — modal is the only "lift" in the system.

## Shapes

Medium-radius rectangles. Cards at 10px radius, buttons at 6px, inputs at 4px. Concentric radius discipline: a 4px input inside a 10px card has to be visually at rest, not fighting the card corner. No pill buttons (too consumer); no right-angle edges (too brutalist). Avatars are fully rounded (`rounded.full`).

## Components

- **buttons**: primary terracotta with surface text, medium radius. Secondary: bordered neutral with surface fill. Destructive: error fill with surface text. Size consistent within a view — never mix md and lg sizes in the same row.
- **cards**: surface fill, 1px tertiary border, 10px radius, 20px internal padding. Section headings inside cards are headline-md; content is body-md.
- **inputs / forms**: bordered neutral, 4px radius, default state is boxed (not bottom-border — we need clear target zones in dense forms). Focus gets a 2px terracotta outline. Error replaces the border with error color + inline body-sm error text below.
- **navigation**: left rail sidebar with icon + body-md label. Active state is tertiary fill + left 2px terracotta bar. Hover is tertiary fill only. No gradient backgrounds, no "active pills."
- **tables**: default row is surface; hover is tertiary; selected is tertiary + left 2px terracotta bar. Tabular numerals. Status chips are small (label-sm), always on tertiary or neutral fill — never primary.

## Do's and Don'ts

### Do
- use real-sounding dog names in mock data: "Biscuit", "Miso", "Wendell", "Tato". Never "Dog 1", "Buddy", or corporate-generic names.
- show walker avatars with a small dog-photo thumbnail alongside — it's the product's emotional core
- give every primary action a keyboard shortcut (press-to-command bar or `cmd+k`) — admins live in shortcuts
- prefer inline editing over modals for quick value changes (e.g., walk time, walker assignment)

### Don't
- no glassy/frosted surfaces — this is a dashboard, not Stripe's marketing site
- no rainbow status chips (green = good, red = bad, yellow = pending — stop there)
- no emoji-dog-icons in UI chrome; keep dogs in photos, not in the design system
- no empty states that brag ("You're all caught up!! 🐶") — a neutral "no walks scheduled today" is correct

---

## Example Prompting Language

> Extension. Lines the agent can reuse verbatim while building.

- "warm utility — Stripe admin if Stripe liked dogs"
- "terracotta is scarce — one primary action per view, nothing else"
- "flat with borders, never shadows except on modals"
- "inter throughout, tabular numerals on every numeric column"
- "mobile collapses density but preserves focus — one task, one view"
- "dog names in mock data are a real design detail, not a throwaway"
