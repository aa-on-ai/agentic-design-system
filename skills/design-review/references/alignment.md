# Visual Alignment & Composition Reference

## The Problem

agents place elements where they fit, not where they belong. text doesn't align across columns. spacing is inconsistent between similar elements. grids break their own rhythm. the result looks "off" even when every individual component is fine.

alignment is what separates "an agent built this" from "a designer built this." it's invisible when done right and immediately obvious when wrong.

## Alignment Principles

### everything aligns to something
every element on the page should share an edge or center with at least one other element. nothing floats randomly.

- text blocks in different sections should share the same left edge
- metrics in a row should baseline-align their numbers
- cards in a grid should have identical internal padding
- icons in a list should align to a consistent vertical axis

### fewer alignment points = cleaner layout
a page with 3 alignment points (left margin, content center, right margin) looks composed. a page with 12 different left edges looks chaotic.

count your alignment rails. if you have more than 4-5 on a page, something is wrong.

### the grid is the skeleton
pick a grid and commit to it. common choices:
- 12-column grid with consistent gutters (most flexible)
- 4-column at mobile, 8 at tablet, 12 at desktop
- simple max-width container with consistent padding

don't: mix a 3-column section with a 4-column section with a full-bleed section unless the rhythm is intentional.

## Symmetry

### symmetry = stability
symmetrical layouts feel balanced, trustworthy, professional. use for:
- dashboards and data-heavy pages
- forms and settings
- admin tools and internal products
- anywhere stability matters more than personality

### asymmetry = energy
asymmetrical layouts feel dynamic, editorial, opinionated. use for:
- landing pages and marketing
- portfolios and case studies
- anywhere you want the layout itself to communicate

### don't accidentally mix them
a page that's 90% symmetrical with one randomly asymmetrical section looks broken, not intentional. either commit to the grid or break it with purpose.

## Spacing Consistency

### the 4px/8px base unit
pick a base unit (4px or 8px) and derive ALL spacing from it:
- 4px: tight, detail-level (icon to label gap)
- 8px: small component spacing
- 12px: compact internal padding
- 16px: standard internal padding, gap between related items
- 24px: gap between components
- 32px: section separation (small)
- 48px: section separation (medium)
- 64px: section separation (large)
- 80-96px: major page divisions

### spacing communicates grouping
items that are closer together are perceived as related. items with more space between them are perceived as separate groups. this is Gestalt proximity — the most powerful layout tool.

- related items: 8-16px apart
- components within a section: 16-24px apart
- sections: 32-64px apart
- major page divisions: 64-96px apart

don't: use the same spacing everywhere. if everything is 16px apart, nothing groups.

### vertical rhythm
body text should sit on a baseline grid. line-height should be a multiple of your base unit. this creates a subtle rhythm that makes the page feel "right" even if nobody can articulate why.

- body text: 16px font, 24px line-height (1.5)
- small text: 14px font, 20px line-height
- headings: line-height 1.1-1.3 (tighter than body)

## Common Alignment Failures

- **staggered left edges** — section titles, body text, and cards all starting at different x-positions
- **inconsistent card padding** — some cards have 16px padding, others have 24px, for no reason
- **metrics not baseline-aligned** — numbers in a stat row sitting at different vertical positions because of different font sizes
- **uneven column widths** — a 2-column layout where one column is 55% and the other is 45% for no content reason (should be 50/50 or a deliberate split like 60/40)
- **orphaned elements** — a button or label that doesn't align to anything else on the page
- **inconsistent gutters** — 16px gap in one grid, 24px in another, 20px in a third
- **center-aligned text in left-aligned layouts** — breaks the reading flow and creates a visual hiccup
- **mixed border-radius** — rounded-sm on some elements, rounded-lg on others, rounded-full on a third. pick one radius and use it consistently (2-3 variants max: none, small, medium)

## Testing Alignment

squint at the page. if you can see clean vertical and horizontal lines running through the layout, alignment is good. if elements look scattered or wobbly, something is off.

draw invisible lines:
- does the left edge of the main heading align with the left edge of the body text below it?
- do card borders align with each other in a grid?
- do section titles all start at the same x-position?
- are the gaps between sections consistent?

## Tailwind Patterns

```
// consistent container
<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

// consistent grid with fixed gap
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// consistent spacing between sections
<section className="space-y-12">  // 48px between children
<section className="space-y-16">  // 64px between children

// baseline-aligned metrics row
<div className="flex items-baseline gap-8">
  <span className="text-3xl font-semibold">1,247</span>
  <span className="text-sm text-gray-500">active deployments</span>
</div>

// consistent card padding
<div className="p-6">  // always p-6 for cards, never mixed
```

## Concentric Border Radius

when nesting rounded elements (a card inside a card, a button inside a rounded container), the outer radius must be larger than the inner radius by exactly the padding between them.

```
outer radius = inner radius + padding
```

example: inner card has `rounded-lg` (8px), padding between them is 12px, outer card needs `rounded-[20px]`.

mismatched radii on nested elements is one of the most common "feels off" tells. agents almost always use the same radius on parent and child.

```css
/* wrong — same radius on both */
.outer { border-radius: 12px; padding: 16px; }
.inner { border-radius: 12px; }

/* right — concentric */
.outer { border-radius: 28px; padding: 16px; }
.inner { border-radius: 12px; }
```

## Optical vs Geometric Alignment

geometric centering (equal pixels on all sides) sometimes LOOKS wrong, even though it's mathematically correct. this happens with:
- play buttons / triangles inside circles (the triangle's visual weight is off-center)
- icons next to text (icon's visual mass doesn't match text baseline)
- asymmetric shapes in symmetric containers

when geometric centering looks off, adjust optically. nudge the element 1-2px until it LOOKS centered. this is a human judgment call — agents should flag when they're using asymmetric shapes in centered containers and note that optical adjustment may be needed.

## Image Outline Overlay

add a 1px semi-transparent outline to images, avatars, and thumbnails to create consistent depth against any background:

```css
.image-overlay {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px;
}
.dark .image-overlay {
  outline-color: rgba(255, 255, 255, 0.1);
}
```

works better than borders because it uses transparency and adapts to any background. especially useful in design systems where other elements also use borders — the overlay creates visual consistency without fighting background colors.

## Shadows Over Borders

use layered transparent box-shadows instead of solid borders for depth between sections. shadows adapt to any background color; borders fight it.

```css
/* instead of */
border: 1px solid #e5e7eb;

/* use */
box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02);
```

layer 2-3 shadows at different offsets and opacities for natural depth. reserve solid borders for interactive states (focus rings, selected items) where the hard edge communicates state, not decoration.

## The Meta-Rule

if you're ever unsure about spacing or alignment, zoom out to 50% and look at the page as a shape. does it look like a composed rectangle with clear structure? or does it look like a collection of stuff thrown onto a canvas?

the page as a whole is a composition. treat it like one.
