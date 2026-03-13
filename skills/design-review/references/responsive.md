# Responsive Design Reference

## The Problem

agents build for one viewport: desktop at 1440px. mobile is an afterthought or ignored entirely. touch targets are too small, text doesn't reflow, layouts break at tablet widths, and horizontal scrolling appears on phones.

responsive design isn't a feature — it's a baseline requirement. if it doesn't work on mobile, it doesn't work.

## Mobile-First, Always

build for the smallest screen first, then enhance for larger ones. this isn't dogma — it's practical:
- forces you to prioritize content (what actually matters?)
- prevents desktop layouts from being awkwardly crammed into mobile
- CSS `min-width` media queries add complexity upward, not downward

```css
/* base: mobile */
.grid { display: flex; flex-direction: column; gap: 16px; }

/* tablet and up */
@media (min-width: 768px) {
  .grid { flex-direction: row; }
}

/* desktop */
@media (min-width: 1024px) {
  .grid { max-width: 1200px; margin: 0 auto; }
}
```

## Breakpoints

use these as guidelines, not gospel:

| name | width | what changes |
|------|-------|-------------|
| mobile | < 640px | single column, stacked layout, hamburger nav |
| tablet | 640-1024px | 2-column where it makes sense, sidebar collapses |
| desktop | 1024-1440px | full layout, sidebars visible, multi-column |
| wide | > 1440px | max-width container, content doesn't stretch infinitely |

**important:** don't design for breakpoints. design for content. if a layout breaks at 900px, add a breakpoint at 900px. the content dictates the breakpoint, not a chart.

## Touch Targets

minimum 44x44px for anything tappable. this is WCAG AA and Apple HIG.

- buttons: min-height 44px, comfortable padding
- links in text: adequate line-height so they're tappable without hitting the wrong one
- icon buttons: even if the icon is 20px, the tap area should be 44px
- table rows: if rows are clickable, they need enough height
- close buttons: especially on modals — don't make these tiny

```css
.button { min-height: 44px; padding: 10px 20px; }
.icon-button { min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; }
```

## Layout Patterns

### single column (mobile default)
everything stacks. navigation collapses to hamburger or bottom tabs. content fills the width with horizontal padding (16-20px).

### sidebar → bottom nav
desktop sidebar navigation becomes bottom tab bar on mobile. don't just hide the sidebar behind a hamburger — bottom tabs are more discoverable and match native app patterns.

### card grid → stacked list
3-4 column card grids become a single-column stacked list on mobile. cards should still look good at full width — they might need internal layout changes (horizontal → vertical).

### data table → card list
tables don't work on mobile. options:
- convert each row to a card with key-value pairs
- show only the most important 2-3 columns, with a "view details" action
- horizontal scroll with a sticky first column (last resort)

never: shrink the entire table to fit. unreadable.

### charts → simplified
complex charts need mobile adaptations:
- reduce data density (fewer data points, simplified labels)
- stack charts vertically instead of side-by-side
- use simpler chart types (bar → horizontal bar, scatter → simplified)
- ensure touch-friendly tooltips (not hover-only)

## Typography Scaling

don't use the same type scale on mobile and desktop.

| element | mobile | desktop |
|---------|--------|---------|
| h1 | 28-32px | 40-56px |
| h2 | 22-26px | 28-36px |
| h3 | 18-20px | 22-26px |
| body | 16px | 16-18px |
| small | 13-14px | 14px |

body text should never be smaller than 16px on mobile. smaller text causes browsers to zoom on input focus, which breaks layouts.

## Spacing

mobile needs less padding than desktop, but not zero.

- container padding: 16-20px on mobile, 24-32px on tablet, 40-64px on desktop
- section spacing: 32-48px on mobile, 48-80px on desktop
- component spacing: 12-16px on mobile, 16-24px on desktop

don't just halve desktop spacing for mobile. some elements need MORE relative spacing on small screens to remain tappable and readable.

## Common Failures

- **hover-only interactions** — mobile has no hover. if information is revealed on hover, it needs a tap alternative (tooltip → tap to toggle, hover preview → tap to expand)
- **fixed-width elements** — anything with a pixel width will break on narrow screens. use max-width + width: 100%
- **horizontal overflow** — the #1 mobile bug. check every page at 375px width. if anything scrolls horizontally, fix it
- **tiny close buttons on modals** — modals on mobile should be full-screen or near-full-screen with a clear, large close/back action
- **input fields** — use appropriate input types (type="email", type="tel", type="number") so mobile keyboards match
- **viewport meta tag** — always include: `<meta name="viewport" content="width=device-width, initial-scale=1">`

## Testing

- check every page at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), and 1440px (desktop)
- use browser dev tools responsive mode
- test actual touch interactions, not just visual layout
- check that no horizontal scrollbar appears at any width
- verify all interactive elements are at least 44x44px tap targets
- test with keyboard navigation (tab order should make sense at all widths)

## Tailwind Shorthand

```
// mobile-first responsive
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
<div className="p-4 md:p-6 lg:p-8">
<h1 className="text-2xl md:text-4xl lg:text-5xl">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// hide/show at breakpoints
<nav className="hidden md:flex">        // desktop nav
<nav className="flex md:hidden">         // mobile nav

// container with responsive padding
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
```
