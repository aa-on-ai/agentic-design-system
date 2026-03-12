---
name: design-review
description: >
  Quality gate for visual and UX work. Use before presenting any UI, component, page,
  layout, or frontend work to Aaron. Triggers: "review this design", "pre-flight check",
  "design QA", "visual review", "before I show Aaron", presenting screenshots, announcing
  frontend/design sub-agent completion. Also use when building new UI components, pages,
  or layouts to enforce quality standards during development.
---

# Design Review Skill

## When to Use
- Before presenting ANY visual or UX work to Aaron.
- Treat this as a quality gate, not optional polish.
- Sub-agents doing design/frontend work MUST run this before announcing completion.

## Pre-Work: Read Before Building

### 1. Read the project's guidelines
- Read `guidelines.md` or equivalent design system doc first if it exists.
- Follow the project's existing components, tokens, and patterns before inventing anything.
- If no formal guidelines exist, inspect the existing product and match its logic.

### 2. Research before designing
- Check how similar tools solve the same problem before inventing a pattern.
- Use proven references when they exist.
- Quality bar references:
  - UX Tools — editorial restraint, typography, calm hierarchy
  - Inflight by Ridd — motion, depth, data viz polish
  - Linear — dense information, excellent hierarchy, no noise
  - Vercel dashboard — spacing, typography, dark mode discipline

### 3. Check design memory
- Read `memory/channels/{channel-name}.md` for prior design decisions.
- If memory says Aaron rejected a pattern, don't repeat it.
- If a project brain file is linked from channel memory, read that too.

## Aaron's Core Principles
- Restraint IS the design.
- Spacing is the #1 tell.
- Typography hierarchy > color for information architecture.
- Match references at pixel level before adding your own ideas.
- Existing patterns > new patterns.
- Interactive elements should feel polished, not dead.
- If the foundation is wrong, no polish fixes it.
- Good design is centripetal, not centrifugal.

## Reference Files
Read only what the task needs. Keep this SKILL lean, load detail on demand:

- `references/typography.md` — hierarchy, scale, pairing, measure
- `references/color.md` — restrained palettes, tinted neutrals, contrast, OKLCH
- `references/spacing.md` — spacing system, rhythm, grouping, layout density
- `references/motion.md` — timing, easing, reduced motion, interactive feel
- `references/anti-patterns.md` — patterns Aaron will clock instantly and reject

### For sub-agents
- Read the relevant reference files based on what you're building.
- New layout or dashboard? Read spacing + anti-patterns.
- Type-heavy screen? Read typography + spacing.
- Color or theming work? Read color + anti-patterns.
- Interactive polish? Read motion + anti-patterns.
- If in doubt, at minimum read spacing + anti-patterns.

## Pre-Flight Checklist
Run this EVERY TIME before presenting work to Aaron.

### Step 1: Visual verification
- [ ] Take a screenshot of the rendered result.
- [ ] Compare side-by-side with the reference if one exists.
- [ ] Check the target viewport, not an arbitrary devtools width.

### Step 2: Design audit
- [ ] Spacing check — enough breathing room? Default to more.
- [ ] Color check — did you add color that wasn't necessary?
- [ ] Typography check — is hierarchy clear without leaning on color?
- [ ] Pattern check — are you using the project's existing components?
- [ ] Interaction check — hover, focus, active states exist and feel intentional.
- [ ] Integrity check — no placeholders, dead states, broken assets, or missing data handling.

### Step 3: Honesty check
- [ ] Is it actually done?
- [ ] Does it meet the brief, not an adjacent brief?
- [ ] Would you be proud to show this to Aaron cold?

### Step 4: Present with evidence
- Screenshot of the result
- What you referenced
- Known gaps or uncertainties
- Link to live/deployed version if applicable

## Updating This Skill
- After Aaron gives design feedback, capture it.
- Add redirects to `references/anti-patterns.md` or the relevant reference file.
- Add project-specific decisions to channel memory.
- Goal: don't get the same design feedback twice.
