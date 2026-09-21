---
name: "ui-polish-pass"
description: "Refine UI craft and reusable primitives: spacing, hierarchy, alignment, control geometry, text/data/form mechanics, and interaction finish within the chosen design."
---

# UI Polish Pass

## Role and scope

The ADS craft owner. Apply the mechanics relevant to the changed surface as part of the same
build/review pass, after task fit and information structure are sound. A tiny change gets a tiny
check. Do not redesign a chosen direction, make prototypes production-grade, or exempt utility
work from basic usability. New direction needs a real unresolved decision, not a polish ritual.

## Core Lens
- Distill before decorating.
- Strip the screen to its essential structure, then add back only what earns its place.
- If a polish pass needs more color, more cards, and more chrome, it is probably not a polish pass.
- Use `/bolder` and `/quieter` as directional moves:
  - `/bolder` = increase contrast, hierarchy, or confidence without adding clutter
  - `/quieter` = remove noise, reduce emphasis, let the right thing lead

## Visual foundation check

Prefer the product's existing tokens. When no coherent foundation exists, define the smallest useful set before polishing:

- type roles, scale, line height, and readable line length
- spacing steps and grouping rhythm
- surface, border, text, action, and semantic colors
- radius and elevation rules
- icon family and sizing rules

Do not invent a new token when an established one fits. If repeated elements conflict, repair the owning primitive within the authorized scope before micro-details; report broader system work instead of silently expanding the change.

## Mechanical defaults

These contracts standardize interface mechanics, not product identity. Preserve a coherent project system when it already defines stricter rules.

### Control geometry

When no control scale exists, use three named heights:

- `compact: 32px` for dense desktop-only tools
- `default: 40px` for routine desktop controls
- `touch: 48px` for touch-first and primary mobile controls

Controls in the same row share a height. Touch targets are at least 48 by 48px with at least 8px between adjacent targets, even when the visible glyph is smaller. Use 18px Nucleo interface icons inside routine controls and reserve 24px icons for larger standalone or editorial use. Centralize icon-to-label gaps, horizontal padding, radius, and focus treatment in the control primitive.

Dropdown carets have at least 16px edge inset and reserve at least 44px for text clearance.
Put both values in the shared select/menu-trigger primitive, not repeated per-instance patches.
Verify long labels, focus and open/close behavior in the target desktop and mobile/WebKit surface.

### Text survival

- Let content wrap by default. Truncate only when the product contract explicitly requires a single line.
- A truncated value needs a reliable way to reveal the full value through an accessible tooltip, disclosure, or detail view.
- Give flex and grid text children `min-width: 0` where needed so long content can wrap or truncate without forcing page overflow.
- Do not put meaningful text in fixed-height containers.
- Verify long names, localization expansion, browser zoom, and 200 percent text scaling.
- When inline metadata crowds the primary text, stack or reflow it before shrinking type.
- Preserve the same information hierarchy when text size or viewport width changes.

### Data grammar

- Left-align text columns and right-align numeric columns.
- Use tabular figures for changing numbers, comparisons, prices, percentages, counts, and timestamps.
- Apply one locale-aware format per data type. Keep decimal precision, units, signs, date style, and time zone explicit and consistent.
- Represent missing, zero, not-applicable, and loading as different states. Use meaningful labels instead of an ambiguous dash.
- Keep table header and body row density paired. Do not mix row heights inside one table without semantic need.
- Give dense tables the page width they need. Do not bury them in modals, nested cards, or cramped side panels.
- On narrow screens, choose an intentional table strategy such as priority columns, row details, cards, or horizontal scrolling with a visible cue. Never squeeze desktop columns into unreadable text.

### Interaction state system

Every interactive primitive defines enabled, hover, focus-visible, pressed, selected when applicable, disabled, and busy states from one token recipe.

- Use a visible focus indicator with at least a 2px perimeter-equivalent area and a 3:1 change of contrast. Prefer a two-color ring when surfaces vary.
- Hover cannot reveal the only available action or explanation.
- Pressed and busy states acknowledge input immediately without moving surrounding layout.
- Selection, status, and validation cannot rely on color alone.
- If a disabled control's reason matters, explain it in persistent nearby copy. Do not rely on a tooltip that requires focusing the disabled control.
- State combinations must remain legible, including selected plus hover, selected plus focus, and busy plus disabled.

### Surface hierarchy

Use at most three semantic surface levels unless the product proves it needs more:

- `base` for the page canvas
- `raised` for persistent panels and grouped work areas
- `overlay` for menus, popovers, dialogs, and transient layers

Each level owns its background, border, radius, and elevation recipe. Borders communicate grouping or state; shadows communicate actual elevation. Do not add a card merely to create padding. Avoid card-inside-card layouts unless the nested surface has a distinct interaction or state role.

### Form anatomy

- Use a visible label. Placeholder text is an example or hint, never the only label.
- Keep label, control, helper text, validation, and status in one predictable component anatomy.
- Reuse the helper-text slot for validation when possible so errors do not cause large layout jumps.
- Use the correct input type, input mode, autocomplete token, and native semantics.
- Size fields for the expected answer. Short values should not default to full-page width.
- Put validation near the field and action feedback near the initiating action. Toasts are secondary confirmation, not the only error or success channel.

### Async stability and recovery

- Skeletons and loading placeholders match the final content geometry closely enough to prevent layout shift.
- Keep the initiating control visible while work is pending. Disable or relabel it and expose progress at the point of action.
- Preserve usable partial data when one request fails.
- Optimistic updates need a rollback path. Prefer undo for reversible destructive actions and confirmation for genuinely irreversible ones.
- Empty and error states preserve the page's visual spine and include the next useful action.

### Responsive transformation and layering

- Every complex component declares its small-screen strategy: reflow, reorder, disclose, substitute, or intentionally scroll.
- Mobile is a different composition when the job changes. It is not a uniformly shrunken desktop.
- Sticky headers, bottom actions, dialogs, and focused controls respect safe areas and do not obscure content or keyboard focus.
- Use named layer tokens for base content, sticky elements, popovers, dialogs, and notifications. Do not accumulate arbitrary `z-index` values.
- Preserve scroll position, selection, filters, and task context across navigation when users reasonably expect to return.

Do not use these mechanical defaults to choose a universal typeface, palette, density personality, or brand expression. Those remain project-level decisions.

## Iconography defaults

Treat Nucleo as the default icon ecosystem when a project does not already have an established icon system and its license permits use.

- Use Nucleo UI Outline 18 for product interfaces and compact controls.
- Use Nucleo Core Outline 24 for larger product, editorial, or marketing contexts.
- Preserve an existing coherent icon family until the project explicitly approves migration.
- Allow intentional exceptions for native platform conventions, branded systems, games, and other domain-specific visual languages.
- Do not mix icon families or stroke systems inside one surface without an explicit design reason.

Use a shared `Icon` or `InlineIcon` primitive to centralize family, size, stroke, color, alignment, accessibility, and optical corrections.

- Icons beside text align to the text's first-line baseline. In flex layouts, start with baseline alignment and apply any family-level optical offset in the shared primitive, never as one-off per-icon nudges.
- Standalone icons inside square buttons, toolbars, avatars, or other fixed icon containers stay geometrically centered.
- Decorative icons are hidden from assistive technology. Icon-only controls need an accessible name.
- When an icon's meaning is not universally clear, pair it with a visible label.

Nucleo is a licensed dependency, not a bundle to redistribute. Never commit the full premium library or a license key. Use authorized package access, keep credentials in secret storage, and verify project-specific sharing, open-source, template, and icon-count terms before release. When premium use is not licensed, use an appropriate Nucleo Essential open-source set or the project's documented fallback.

## Craft review

Inspect the relevant dimensions together, not seven mandatory passes:

- **Spacing and composition:** group related content, use the established scale, preserve the
  product's density, and create one clear primary focus. Removing redundant chrome can help;
  removing required information does not.
- **Typography:** use coherent roles and readable measure. Preserve conventional utility type,
  natural casing and declared type rhythm. Extra color or smaller text cannot rescue unclear IA.
- **Alignment:** consistent gutters, optical icon alignment, stable control rows and sensible
  content width. Use the shared primitive for family-level optical correction.
- **Color and contrast:** use project semantic tokens and test final composited colors. Arbitrary
  opacity percentages do not guarantee readable secondary text. Check supported themes.
- **Interaction feel:** preserve visible focus and immediate input feedback. Use purposeful,
  interruptible motion only when it helps; high-frequency controls may need no animation.
  Follow the existing motion tokens and `../web-animation-design/SKILL.md` for implementation.
  Restrained easing fits utility work; gesture springs or expressive motion need contextual
  justification. Respect reduced motion; neither bounce nor scale-on-press is universal.
- **Finish:** tabular changing numbers, resilient wrapping, coherent icons, concentric nested
  radii when appropriate, and intentional property-specific transitions. No `transition: all`.
  Do not force antialiasing, image outlines, animated icon swaps or press scaling onto every surface.

Foundation rules stay with ADS/design-review: no visual status/decorative dots, forced uppercase,
rounded one-edge borders or shadow imitations. Keep literal data intact. Do not add dividers or
cards solely to manufacture hierarchy.

## Proof and stopping

Inspect the rendered result at final size and target viewport; compare against the chosen baseline
and relevant reference. Exercise affected control behavior, long content and responsive changes.
Use actual task clarity and reference fidelity as the bar, not whether a named fashionable product
might ship it. Screenshots do not prove interaction or taste acceptance.

Polish only as far as the requested artifact needs. A throwaway experiment can stay rough; a useful
internal tool still needs legibility and working controls. If craft exposes a structural defect,
return that finding to the ADS judgment pass within its existing budget, not a new redesign loop.
