# Layout Reference

## The Problem

agents default to one layout: card grid. 4 stat cards across the top, chart in the middle, table at the bottom. every dashboard, every admin panel, every analytics page. the layout itself becomes the tell that an agent built this.

good layout is composition. it creates hierarchy, guides the eye, and makes the content feel intentional. different content needs different structures.

## Layout Vocabulary

### split panel
two columns with different purposes. one side is navigation or context, the other is content.
- use when: detail views, master-detail, settings with categories
- example: email client (list | message), figma (layers | canvas)
- the columns don't have to be equal. 30/70 or 25/75 creates natural hierarchy
- the divider can be a line, a background change, or just whitespace

### editorial / magazine
content arranged like a newspaper or magazine spread. mixed column widths, pull quotes, full-bleed images, varied section heights.
- use when: landing pages, case studies, blog posts, marketing pages
- key: vary the rhythm. narrow text block → full-width image → two-column comparison → single quote
- don't: make every section the same width and padding

### asymmetric grid
intentionally uneven columns. one large element anchors the page, smaller elements orbit it.
- use when: dashboards where one metric matters most, portfolios, feature pages
- example: one large chart taking 60% width, three small cards stacked in the remaining 40%
- creates visual hierarchy through size, not just position

### sidebar + content
persistent navigation on the left, content fills the remaining space.
- use when: apps with many sections, admin panels, documentation
- don't: use a sidebar when there are fewer than 5 navigation items. tabs or a top nav work better
- the sidebar should be narrow (200-280px). wider than that and it fights the content

### full-bleed sections
content that stretches edge-to-edge, breaking out of the container.
- use when: hero sections, image galleries, data viz that needs horizontal space
- key: alternating full-bleed and contained sections creates rhythm
- works especially well for separating distinct content areas

### stacked rows / strips
horizontal bands that span the full width, each with different content.
- use when: roster/list views, timelines, activity feeds
- each strip can have its own internal layout (left-aligned text + right-aligned actions)
- works better than card grids for items that are similar but need to show different amounts of info

### centered single column
one narrow column of content, centered on the page. generous margins.
- use when: forms, checkout flows, focused reading, onboarding steps
- max-width: 640-720px for text-heavy content, up to 960px for mixed content
- the whitespace IS the design. don't fill it with sidebars or decorations

### bento grid
mixed-size cards in a dense grid. some cards are 1x1, some are 2x1, some are 2x2.
- use when: feature overviews, product pages, homepages that need to show many things
- key: the size of each card signals its importance. the biggest card is the most important thing
- don't: make all cards the same size (that's just a card grid again)
- reference: apple's product pages, linear's feature grid

## Composition Rules

### hierarchy through size
the most important thing should be the biggest thing. not the first thing, not the boldest color — the biggest.

### rhythm through variation
alternate dense sections with breathing room. if three sections in a row are the same height and density, the page feels monotonous.

### grouping through proximity
things that are related should be close together. things that are separate should have visible distance between them. this is more powerful than borders or backgrounds for creating structure.

### anchoring through asymmetry
a perfectly symmetrical layout feels static and template-ish. one dominant element (large chart, hero image, featured card) gives the eye somewhere to start.

### negative space as structure
whitespace isn't empty — it's a structural element. generous margins and padding signal quality. cramped layouts signal "we ran out of room" even if the screen is huge.

## Dashboard-Specific Guidance

dashboards are where agents fail hardest. every agent builds the same dashboard:
```
[stat] [stat] [stat] [stat]
[        chart             ]
[        table             ]
```

instead, try:
```
[hero metric + sparkline          ] [secondary metrics]
[main chart (60%)  ] [alerts (40%)                    ]
[detail table with inline actions                     ]
```

or:
```
[sidebar nav] [selected view fills remaining space    ]
             [with its own internal composition        ]
```

or:
```
[full-width trend chart with annotation callouts      ]
[three cards, different sizes: 2x1, 1x1, 1x1         ]
[activity feed as stacked strips                      ]
```

the key: no two sections should have the same visual weight. if everything is equally important, nothing is.

## Spatial Composition — Breaking the Grid

grids create order. but a page that never breaks its grid feels mechanical — like a spreadsheet with better fonts. the best interfaces establish a grid and then deliberately break it when the content demands attention.

### techniques
- **overlap** — let an element overlap the boundary between two sections. a card that sits half in the hero and half in the content below creates visual continuity and depth.
- **asymmetric columns** — not everything needs to be 50/50 or 33/33/33. use 60/40, 70/30, or even 80/20 when one element is clearly more important.
- **full-bleed breaking** — a section that breaks out of the max-width container and stretches edge-to-edge creates a dramatic pause in the reading rhythm.
- **negative space as structure** — an intentionally empty column or large gap isn't wasted space. it's directing attention to what remains.
- **diagonal flow** — elements arranged along a diagonal line (top-left to bottom-right) create energy and forward momentum. use for landing pages and marketing, not for data-heavy admin tools.
- **varied section heights** — sections with different internal heights create rhythm. a tall hero → short stat bar → tall content area → short CTA reads as composed. uniform height reads as template.

### when to break the grid
- hero sections and page headers (first impression, highest impact)
- featured content or "hero'd" metrics
- transitions between major page sections
- call-to-action areas
- full-bleed images or charts

### when NOT to break the grid
- data tables and lists (consistency aids scanning)
- form layouts (predictability reduces errors)
- navigation (users need spatial memory)
- repeated elements in a series (cards, list items)
