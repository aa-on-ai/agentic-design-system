# preset — editorial

for marketing pages, launch sites, essays, portfolios, documentation homepages. anything whose primary job is to be read and screenshotted.

copy the template at `templates/project-identity-template.md` and start from these defaults. override anything that doesn't fit.

---

## voice

- **tone.** warm, confident, declarative.
- **register.** casual-professional. writes like a human with opinions.
- **never:** "revolutionize", "unlock", "seamlessly", "the future of", lifestyle adjective stacks.
- **do:** specific claims, named nouns, concrete verbs. if a sentence could appear on any landing page, rewrite it.

## visual system

### color

- **surface.** warm off-white (e.g. `#FBFAF7`) or deep ink (e.g. `#0F1114`). pick one commitment. no "beige and charcoal" hedge.
- **ink.** one primary (90–100%), one muted (60%), one tertiary (40%).
- **accent.** one. used once per viewport. never on decorative elements.
- **semantic.** defer — editorial rarely needs success/warning/error.

### typography

- **display.** a serif or a distinctive sans (GT Sectra, Tiempos, Söhne, Monument Grotesk, Inter Display). weight in the 500–700 range. size range 48–112px.
- **headings.** h2 sits 1.5–1.75× body. h3 is the body with weight bumped.
- **body.** 17–20px, line height 1.55–1.7, measure 62–72ch.
- **mono.** only if the product shows code or prices.

### spacing

- **scale.** 8-point, doubled for section breaks (64, 96, 128).
- **density.** airy. section gaps ≥ 96px on desktop.
- **rhythm.** the reader scrolls — each section should feel like a beat.

### shape

- **radius.** sharp or sm. editorial never uses pill.
- **borders vs shadows.** hairline borders (1px at 8% opacity). shadows are a last resort.
- **elevation.** max 1 level.

### density

airy. if a section feels full, remove an element before shrinking the margins.

## patterns

### approved

- **hero.** one headline, one subhead, one CTA. hero image optional and earned.
- **nav.** top bar, 3–5 items, no dropdowns. logo left, nav center or right.
- **prose.** centered content column 62–72ch. never full-width prose.
- **pull quotes.** allowed once per page.
- **CTA.** solid primary, ghost secondary. exactly two styles exist.

### rejected

- card grids as the main layout
- hero gradients that span the viewport
- "trusted by" logo walls without anchor (they read as filler)
- auto-advancing carousels

## anti-patterns

- headline + subhead + CTA + eyebrow + tag + icon above the fold — the eye can't rank them
- serif for the hero, sans for the body, monospace for CTAs (too many voices)
- filler stock illustration

## mock data

names, brands, and references should be real and current. if it's a personal portfolio, the projects are real. if it's marketing, the testimonials are attributable.

## references

- Linear marketing site — restraint, typography, spacing
- Vercel launch pages — hierarchy, motion, dark/light discipline
- Stripe press releases — prose density, quote treatment

**anti-reference.** any SaaS homepage with 4 feature cards + "trusted by" + gradient mesh background.
