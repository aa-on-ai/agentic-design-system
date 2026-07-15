# Screenshot review

## Pass 1

Reviewed the full-page 1280, 768, and 390 captures in light and dark, then inspected the hero and station 01 at 1x viewport size.

- The first view is distinct and legible: the existing workshop illustration now feeds directly into a physical rail, while the headline establishes ADS as the inspection layer around a builder.
- The continuous track reads at full-page scale and the five large machine bays create one teaching sequence rather than a repeated feature-card grid.
- The Orders artifact is large enough to judge at each station. Its changing ticket, state shelf, measurements, viewport proof, and release detail visibly carry the story.
- Mobile preserves the rail as the left spine and stacks copy before the machine, with no horizontal overflow or undersized rendered targets.
- Day/night mode reads as the same workshop on different shifts, not as a recolored dashboard.

Issues found:

1. The light-mode orange serif hero line failed contrast against the workshop cream at all three captured widths.
2. Chromium produced stale black compositor tiles inside dark-mode machine screenshots after scrolling while the full-viewport hero image used an animated `clip-path` layer.

## Repair pass

- Darkened the light-mode orange and separated small functional labels onto a still-darker orange-ink token.
- Replaced the theme image `clip-path` transition with a short opacity crossfade, preserving day/night feedback without the offscreen compositor defect.
- Re-ran source heuristics and live rendered capture. Final light and dark evidence both report zero serious/critical axe violations, zero horizontal overflow, and zero rendered interactive targets under 44px at 390, 768, and 1280.

## Remaining judgment

The final page is intentionally long because the continuous physical line is the concept. Whether the 01-05 story should be shortened is a product/editorial decision, not a correctness defect; the hero and first proof station are independently reviewable without reading the entire page.
