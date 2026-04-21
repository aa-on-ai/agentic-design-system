# project identity

the identity file is the compounding layer. agents read it before building, write to it after building. fill it in rather than leave blanks — every empty section is license for the agent to invent defaults.

copy this file into your project as `guidelines.md` (the name the skills expect). start from a preset in `presets/` if your project is close to editorial, SaaS, or utility.

---

## product

**what we build.** one sentence, concrete. not "an AI platform" — "a bookkeeping tool for freelance designers."

**who it is for.** one named user type. their context, their constraint.

**what we are not.** the adjacent categories we resemble but deliberately reject.

## voice

**tone.** one axis: warm ↔ neutral ↔ clinical. pick.

**register.** one axis: casual ↔ professional ↔ formal. pick.

**what we never write.** "revolutionize", "unlock", "supercharge", "seamlessly", em-dashes-as-decoration, anything that could appear in any landing page.

**what we do write.** specific verbs, real nouns, product-native metaphors.

## visual system

### color

- **surface.** 1 base tone + max 2 derived shades. tinted neutral preferred over pure gray.
- **ink.** 1 primary text color + 1 muted (60–70% opacity of primary) + 1 tertiary (40–50%).
- **accent.** 1 brand color. used for action, status, selection. never decoration.
- **semantic.** success, warning, error, info. define hex once. reuse.

do not improvise color outside this list. if you need a new one, write it down here first.

### typography

- **display.** font family + weight + size range for the single h1 per screen.
- **headings.** h2–h4 scale; prefer weight changes over size changes.
- **body.** family + size + line height. measure ≤75ch for prose.
- **mono.** only if the product shows code, data, or tabular numbers.

### spacing

- **scale.** pick one: 4/8/12/16/24/32/48/64, or tailwind default. stick to it.
- **density.** comfortable ↔ compact. pick one per product area.
- **rhythm.** section gaps ≥ element gaps ≥ inline gaps. sections breathe; elements cluster.

### shape

- **radius.** pick one family (sharp, sm, md, lg, pill). concentric: outer = inner + padding.
- **borders vs shadows.** one system wins per surface. mixing reads cheap.
- **elevation.** max 3 levels. more is noise.

### density

one axis: airy ↔ dense. match to the job. dashboards tend dense. landing tends airy. internal tools tend dense.

## patterns

### approved

- **navigation.** how does the primary nav work? sidebar, top bar, command palette, all of the above?
- **tables.** sticky headers, row hover, inline actions vs. overflow menu, row count expectation.
- **forms.** inline validation vs on-submit; required marker style; button order (primary on right by default, left on Windows conventions).
- **empty states.** illustration? icon? pure text + CTA? pick one.
- **modals.** when they're allowed. default answer is rarely.
- **primary action.** where it lives on each surface. consistency beats cleverness.

### rejected

list patterns you've already ruled out, with a one-line reason.

- card grid as default layout — too generic
- dark gradient heros — AI-slop tell
- "welcome to your dashboard" empty states — content-free greeter
- zinc-800 everywhere — unmodified shadcn look

## anti-patterns (project-specific)

recurring mistakes the agent has made or shouldn't make. append to this list after every build that needed review churn.

- example: "the onboarding wizard used 4 levels of heading hierarchy — we only allow 3"
- example: "admin tables showed relative timestamps; we standardized on absolute + tooltip"

## mock data rules

- real names, real brands, real scenarios. no "Acme" unless you are Acme.
- timestamps inside the last 30 days.
- money in the user's currency. no "$1,234.56" when the product is in €.
- humor lives in row content, not in UI chrome.

## references

- 2–3 products whose UI you'd screenshot as a quality bar for this project.
- 1 anti-reference: a product that does what you don't want to do.

## known gaps

things we know the system doesn't cover yet. lists the places agents should ask before assuming.

---

## how the agent uses this file

1. read `guidelines.md` before building.
2. treat **visual system** as non-negotiable.
3. treat **patterns → approved** as strong defaults.
4. treat **patterns → rejected** and **anti-patterns** as hard stops.
5. after the build, emit a `report.md` per `templates/run-report-template.md`. if anything in this file should change, propose the diff in the report's follow-ups.

## how humans maintain this file

- review `report.md` follow-ups after each build.
- promote repeating rule hits into the anti-patterns list here.
- promote successful choices into patterns → approved.
- prune this file quarterly. drift and contradictions kill trust fast.
