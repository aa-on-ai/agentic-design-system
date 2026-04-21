# preset — saas

for dashboards, admin panels, settings pages, multi-tab product surfaces. anything whose job is to get out of the user's way so they can do work.

copy the template at `templates/project-identity-template.md` and start from these defaults.

---

## voice

- **tone.** neutral, precise, no-nonsense.
- **register.** professional. no jokes, no slang, no brand voice on error messages.
- **never:** "oops!", "awesome!", "let's get started", exclamation marks in system copy.
- **do:** name the action, name the object, name the consequence. "Delete 3 agents" not "Delete selected".

## visual system

### color

- **surface.** neutral with a tint (cool slate or warm stone). never pure white, never pure gray.
- **ink.** 90% primary, 60% secondary, 40% tertiary. opacity, not different hues.
- **accent.** one brand color for primary actions. semantic colors for status only.
- **semantic.** success (green), warning (amber), error (red), info (blue). define once, reuse.

### typography

- **display.** only on marketing pages, not in-product.
- **headings.** product headings are weight 500–600, rarely larger than 20px. hierarchy through weight, not size.
- **body.** 13–14px UI, 15–16px content pages. line height 1.45–1.55.
- **mono.** for IDs, timestamps, tabular numbers, code. always use `font-variant-numeric: tabular-nums` for dynamic numbers.

### spacing

- **scale.** 4/8/12/16/24/32.
- **density.** comfortable-to-compact. tables, forms, and data lean compact. content pages lean comfortable.
- **rhythm.** section gaps 24–32px, element gaps 8–16px, inline gaps 4–8px.

### shape

- **radius.** sm or md. 4–8px on buttons/inputs, 8–12px on cards.
- **borders vs shadows.** borders win. one hairline stroke per surface boundary. shadows only on menus and modals.
- **elevation.** 2 levels: base surface and floating.

### density

comfortable for content pages, dense for data surfaces. pick per area and stay consistent within it.

## patterns

### approved

- **nav.** sidebar for products with ≥5 top-level sections; top bar otherwise. command palette if ≥3 power users asked for it.
- **tables.** sticky header, hover row, inline destructive actions behind confirmation. empty state shows the action that would create the first row.
- **forms.** labels above inputs. inline validation on blur. primary action right. destructive actions require confirmation.
- **empty states.** icon + one-line reason + primary CTA. no illustrations.
- **loading.** skeletons for tables and cards, spinner for single actions. never a white flash.
- **error.** inline where the error lives. toasts only for transient feedback (save confirmed, copied, etc.).

### rejected

- full-page modals when a drawer would do
- primary action on the left
- color as the only status indicator
- decorative icons in data rows

## anti-patterns

- dashboard with 6 identical cards in a grid — no hierarchy
- "Welcome back, [Name]" banners without a useful CTA
- status pills using 5+ colors
- zinc-800 text on zinc-900 background (unreadable contrast common in unmodified shadcn)

## mock data

- plausible names, plausible timestamps (last 30 days), plausible volumes (a new account has 0–3 rows, a mature one has hundreds).
- statuses reflect a realistic distribution — not everything is "Active".
- monetary values localized to the user.

## references

- Linear — sidebar density, command palette, keyboard-first feel
- Vercel dashboard — spacing, typography, dark mode discipline
- Stripe dashboard — data density without noise, tabular clarity

**anti-reference.** the default shadcn dashboard template — unmodified zinc, 4 identical metric cards, no product voice.
