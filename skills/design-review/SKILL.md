---
name: "design-review"
description: "Judge visual and frontend work for product fit, information architecture, reference fidelity, craft, and verified behavior. Scope review to the requested surface and change."
---

# Design Review Skill

## Role and scope

The ADS judgment owner, not a second execution loop. Review substantial visual work and requested
critiques; for small changes check only the affected result and nearby behavior. A copy-only edit
does not need research, variants, a full state matrix or a separate grader. Respect the task
budget and authorization established by [ADS](../agentic-design-system/SKILL.md).

## Visual foundation contract

For substantial work, use the Foundation profile locked by ADS at
`../agentic-design-system/contracts/visual-foundation.v2.json`.
Confirmed `never` rules block a ready verdict, not an honest handoff of unresolved findings.

- Never put a border on only one edge of a rounded rectangle. A complete perimeter remains valid.
- Never recreate that one-edge treatment with a zero-blur or inset shadow.
- Never force uppercase styling. Authored interface copy uses sentence case or title case, with a
  narrow exception for literal external identifiers that would become inaccurate if changed.
- Never use em dashes in interface copy.
- Never use static or animated status dots. Status remains readable without color; add an icon only
  when it materially improves scanning or comprehension.
- Apply the current no-decorative-dots preference to authored text separators and list markers too,
  not only circular status elements. Preserve literal data and mathematical notation.
- Use a real icon when a control has an icon equivalent. Preserve one coherent project family;
  otherwise use licensed Nucleo or one open family, never a mix.
- Utility work starts with the product font, a system sans, or another conventional general-purpose
  family. Expressive typography requires an eligible surface or an explicit outcome.
- Custom letter spacing and line height come from a declared type role, not decorative improvisation.
- Avoid colons in interface copy when a normal phrase works. Literal time, links, code, protocols,
  structured data, and verbatim external data remain valid.
- Use whitespace and grouping before adding dividers. Divider density stays an independent review
  judgment rather than a brittle automatic gate.

## Establish the review target

Recover the current brief, exact surface and preserve-list from the request, source and existing
`DESIGN.md` or guidelines. Inspect the actual baseline, components and tokens. A named backend,
framework or export format does not establish that this is the interface the user wanted.
Research only when a missing reference or pattern decision matters; reuse prior answers and
accepted examples. Do not require new references for a chosen direction or minor correction.

## Judgment order

1. **Product and task fit:** is this the intended product/surface, and can its user accomplish the
   requested job? Name the baseline strengths that must survive.
2. **Information architecture:** can the reader identify the important objects, comparison,
   timeframe and next action without implementation commentary? When evidence/detail opens,
   exercise the return path with reading context intact, including direct-entry behavior.
3. **Reference and visual direction:** compare the property the brief actually borrows, at the
   intended fidelity. Incidental reference chrome is not automatically part of the assignment.
4. **Craft:** inspect composition, hierarchy, typography, spacing and consistency at final size.
5. **Behavior and delivery:** verify applicable states, actual interactions, target browsers and
   that the requested artifact is accessible in the user's review environment.

Do not let later mechanical passes offset failure at an earlier level. Report observations against
actual artifacts, not a weighted self-score. Distinguish an observed defect, a taste judgment and
missing evidence. Use an independent critic only when authorized and available; retain human
judgment for unresolved product direction and taste.

## Core principles
- Restraint IS the design.
- Spacing is the #1 tell.
- Typography hierarchy > color for information architecture.
- Match the agreed reference property and fidelity before adding your own ideas.
- Existing patterns > new patterns.
- Interactive elements should feel polished, not dead.
- If the foundation is wrong, no polish fixes it.
- Good design is centripetal, not centrifugal.

## Reference Files
Read only what the task needs. Keep this SKILL lean, load detail on demand:

- `references/typography.md` — hierarchy, scale, pairing, measure
- `references/color.md` — restrained palettes, tinted neutrals, contrast, OKLCH
- `references/spacing.md` — spacing system, rhythm, grouping, layout density
- `references/motion.md` — timing, easing, reduced motion, interactive feel, named motion vocabulary
- `references/mobile.md` — mobile review profile: design-judgment vs platform-defect passes, decision forks, severity tiers
- `references/anti-patterns.md` — common agent patterns to reject
- `references/ux-writing.md` — interface copy, terminology consistency, labels, errors, and empty states

### For sub-agents
- Read the relevant reference files based on what you're building.
- New layout or dashboard? Read spacing + anti-patterns.
- Type-heavy screen? Read typography + spacing.
- Color or theming work? Read color + anti-patterns.
- Interactive polish? Read motion + anti-patterns.
- Mobile / responsive / app / PWA review? Read mobile + responsive.
- Interface copy or competing names for the same concept? Read ux-writing.
- Load only references that resolve a relevant design decision or observed defect.

## Verification within the requested scope

Use the applicable checks below after the judgment pass. Do not expand a tiny edit into a full
review. A required check that cannot run stays unverified, not silently omitted.

### Step 1: Visual verification
- [ ] Take a screenshot of the rendered result.
- [ ] Compare side-by-side with the reference if one exists.
- [ ] Check the target viewport, not an arbitrary devtools width.
- [ ] Verify state differences with screenshots and state-specific interaction receipts. Identical
  text-and-markup signatures flag a comparison, not a missing state: focus or hover can change
  pixels without changing markup. Resolve conflicting state gates against rendered evidence;
  neither signature equality nor inequality alone establishes whether the intended state rendered.
  Keep any injected diagnostic styling separate from primary captures and record it explicitly.
- [ ] Expand nested disclosures and any inline/full-detail copies that can coexist before running
  rendered accessibility checks. Measure disclosure tap targets on the phone viewport and inspect
  repeated landmark names. Use labeled groups for repeated items that do not warrant landmarks;
  verify the expanded state again after repair.
- [ ] Exercise reachable modal surfaces. Verify initial focus, Tab and Shift+Tab containment,
  Escape dismissal, focus return, and inert background content. If the capture cannot open the
  modal without site-specific instructions, record `not verified` rather than passing it.
- [ ] For help disclosures inside dialogs, test click/tap then Escape in desktop Chromium and
  mobile WebKit, not only component tests. Focus the help trigger on activation when needed so
  Escape closes the expanded help without closing the dialog; once help is closed, let Escape
  reach the dialog. Verify focus stays on the trigger and repeated help controls remain independent.

### Step 2: Design audit
- [ ] Spacing check — grouping and density serve the task and preserve the chosen product language.
- [ ] Color check — did you add color that wasn't necessary?
- [ ] Typography check — is hierarchy clear without leaning on color?
- [ ] Pattern check — are you using the project's existing components?
- [ ] Interaction check — hover, focus, active states exist and feel intentional.
- [ ] Terminology check — each user-facing concept has one primary name; aliases are introduced
  once and do not compete with the primary term.
- [ ] Integrity check — no placeholders, dead states, broken assets, or missing data handling.
- [ ] Preference check — inspect the affected rendered copy, markers and generated CSS content.
  Resolve applicable capture findings against the actual context before a ready verdict; literal
  notation is not decoration. A source scan or a zero candidate count does not establish compliance.

### Step 3: Honesty check
- [ ] Is it actually done?
- [ ] Does it meet the brief, not an adjacent brief?
- [ ] Would this hold up in a cold review?

### Step 4: Run source pre-flight scripts
Run relevant checks for the affected code and claims when the scripts are available. Replace
`<skills-root>` with the directory containing the installed skill folders:

```bash
# check for common agent anti-patterns
python3 <skills-root>/design-review/scripts/anti-pattern-check.py <your-file.tsx>

# verify loading, empty, and error states exist
python3 <skills-root>/design-review/scripts/state-check.py <your-file.tsx>

# check semantic HTML, aria labels, alt text, heading hierarchy
python3 <skills-root>/design-review/scripts/accessibility-check.py <your-file.tsx>
```

investigate the warnings before presenting. these checks grep source and are intentionally cheap and gameable; a comment containing “loading, empty, error” can satisfy the state check without rendering any state. they advise, but they do not clear the work.

For meaningful visual changes, capture the actual route. Select the states the task requires;
`default,loading,empty,error` below is an example, not a mandatory universal matrix:

```bash
node <skills-root>/agentic-design-system/scripts/run-capture.mjs "<running-route-url>" \
  --states default,loading,empty,error --out evidence/<slug>
```

Inspect the capture and exercise required interactions; an automatic capture may not reach all
site-specific states. Gate mechanics on established rendered fields, not taste. Evidence format 2 also records rounded one-edge
borders, one-edge shadow candidates, forced uppercase, typography outliers, symbol-only controls,
status-dot candidates, dot-glyph/list-marker candidates, divider count, colons, and em dashes. those new measurements remain
report-only until their fixture precision is proven.

`visualFoundation.dotGlyphCandidates` reports text, CSS-generated glyphs and native round list
markers estimated as visible. Inspect each finding: transparent/clipped glyphs can be false
positives, and unmarked mathematics or verbatim text can be legitimate.
Code/math elements are excluded; ordinary punctuation is unchanged. Shadow DOM, canvas, image
content and custom graphical markers still require visual review. This diagnostic never edits copy.

the rendered capture also reports visible `aria-modal` contract results and motion-bearing `:hover`
rules that lack `(hover: hover) and (pointer: fine)`. these interaction diagnostics are report-only
during calibration. a missing or unreachable modal is `not verified`, not a pass.

CI adapters are source-repository maintenance, not shipped runtime dependencies. Verify the
source checkout and requested scope before proposing integration; do not add CI for routine design work.

### Step 5: Present with evidence

Return the task outcome, preserved baseline, relevant evidence and known gaps. Use a usable
attachment or an already-authorized accessible URL when remote review is needed. Distinguish
local preparation, actual delivery, human acceptance and release. Builds, scanner passes and
screenshot existence do not independently establish any of the latter three.

## Feedback ownership

Follow ADS feedback classification. Keep explicit preferences with their current owner, product
choices in project context, repeated measurable defects in primitives/tests, and one-off fixes
with the task. Do not append a new general rule merely because feedback occurred. Preserve
accepted examples with their acceptance evidence, not the agent's self-rating.
