# preset — utility

for tools. weather, calculators, converters, auth flows, receipt printers, status pages, single-purpose apps. anything whose job is answered by "did it do the thing." personality is optional and often wrong.

copy the template at `templates/project-identity-template.md` and start from these defaults.

---

## voice

- **tone.** matter-of-fact. friendly if it earns its place, silent if it doesn't.
- **register.** casual or professional depending on audience. pick one and commit.
- **never:** "oops", marketing adjectives, cute microcopy on critical actions.
- **do:** one verb per button, one sentence per instruction.

## visual system

### color

- **surface.** one background commitment — dark or light. not both.
- **ink.** high contrast; utility apps get read in sunlight, at night, one-handed.
- **accent.** one. used for the primary action, nothing else.
- **semantic.** success, warning, error if the app has states that can fail. skip if it doesn't.

### typography

- **display.** rare. one headline max, if at all.
- **headings.** h2 at most — utility apps don't usually have nested hierarchy.
- **body.** 15–16px. generous line height (1.55–1.7) for thumb-reading.
- **mono.** for numbers, times, IDs. tabular-nums always on anything that changes.

### spacing

- **scale.** 8-point. predictable.
- **density.** comfortable. utility apps get used in motion — touch targets ≥48px, gaps ≥8px.
- **rhythm.** one primary thing per screen. if you're squeezing, the IA is wrong.

### shape

- **radius.** md. forgiving rounded corners read warmer without being playful.
- **borders vs shadows.** light app: borders. dark app: neither — let spacing carry it.
- **elevation.** 1 level, rarely.

### density

comfortable to airy. utility apps should feel calm. empty space is trust.

## patterns

### approved

- **single primary action per screen.** if there's a secondary, it's a link or a ghost button.
- **no nav** until the app has ≥3 screens. then a bottom tab bar (mobile) or a slim top bar (web).
- **state reflects reality.** loading, empty, error are the product, not decoration. a weather app with no error state is broken.
- **numbers.** tabular, aligned, labeled with their unit.
- **inputs.** large, forgiving, labeled. never placeholder-only fields.

### rejected

- dashboards in tools that don't need them
- "what's new" banners in utility apps
- settings pages with 40 toggles when 4 would do
- onboarding walkthroughs for a one-screen app

## anti-patterns

- animations that delay the answer ("stylishly load the temperature over 800ms" — no)
- brand-voice microcopy on error messages ("whoopsie! let's try that again!")
- decorative gradients that reduce readability
- glassmorphism on content that needs to be legible at a glance

## mock data

- real cities, real timestamps, realistic ranges
- no placeholder "—" or "N/A" without a reason; if the data is genuinely absent, say why

## references

- Apple Weather — hierarchy, typography, state design
- iA Writer — restraint, type, background commitment
- Things 3 — primary-action discipline, spacing

**anti-reference.** any weather app with a video background of clouds. any calculator with a theme store.
