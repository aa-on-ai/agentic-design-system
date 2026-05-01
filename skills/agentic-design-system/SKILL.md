---
name: agentic-design-system
description: >
  Design system for AI agents that build UI. Automatically routes to the right
  quality checks based on the task. Triggers on ANY visual, frontend, UI, design,
  component, page, layout, or styling work. Includes: anti-pattern detection,
  state completeness checks, accessibility verification, typography/color/spacing
  guidance, and creative direction when needed. Install this one skill to get the
  full system — it orchestrates everything else.
---

# Agentic Design System

you have a design system installed. this skill orchestrates it. read this BEFORE starting any visual work.

## How it works

the system has two packs of skills installed alongside this one. you don't need to read them all — this file tells you which ones to read for your current task.

### core pack (read these for ALL visual work)
- `skills/design-review/SKILL.md` — quality gate, reference files, verification scripts
- `skills/ux-baseline-check/SKILL.md` — loading, empty, error states
- `skills/ui-polish-pass/SKILL.md` — final spacing/alignment/hierarchy pass

### creative pack (read ONLY when triggered)
- `skills/visual-reference-calibration/SKILL.md` — BEFORE coding when Aaron provides a screenshot, CodePen, website, visual reference, or says “make it feel like this.” Write the Reference Intake Contract first so the agent knows what to borrow, what not to borrow, and the fidelity target.
- `skills/whimsical-design/SKILL.md` — ONLY if user asks for personality, delight, or brand expression. ONLY for marketing, editorial, or launch pages. Skip for utility UI.
- `skills/world-build/SKILL.md` — ONLY if user explicitly asks for immersion or atmosphere. Skip unless told otherwise.
- `skills/web-animation-design/SKILL.md` — ONLY if task specifically involves animation, motion, or interaction feel.

### agent-friendly (read for production sites)
- `skills/agent-friendly-design/SKILL.md` — semantic HTML, ARIA, structured data. Read when building anything that ships to production.

### project knowledge intake (optional; run when context needs alignment)
default path: use a preset when there is no project context, then build. if the task depends on product taste and a preset is not enough, inspect local docs/components/screenshots/references, ask only the missing blocking questions, and write the result into `DESIGN.md` or the `templates/project-identity-template.md` shape so downstream skills can use it.

### reference intake gate (optional; run before reference-led visual work)
if the user provides a visual reference/screenshot/site/CodePen, says “make it feel like…”, the work is marketing/editorial/launch art direction, or prior output failed because it was generic/sloppy/wrong vibe, load `skills/visual-reference-calibration/SKILL.md` before generating UI.

use `templates/reference-intake-contract.md`. hard rule for reference-led work: if you cannot state what to borrow, what not to borrow, and the fidelity target, you cannot build. if no visual reference matters, skip this gate. ask before building when the primary borrowed layer or fidelity target is unclear, when the reference implies unapproved structural change, or when Aaron already said the prior pass missed the point. after implementation, screenshot the result and report where it matched or drifted from the contract.

## Project handoff context (DESIGN.md)

if a `DESIGN.md` file exists at the repo root — or at a path the orchestrator passes in — load it as handoff context **before** building. it is the normative source of truth for design tokens (colors, typography, spacing, rounded, components) and a prose overlay for atmosphere, component tone, and anti-goals. if it does not exist and the task needs project taste, run project knowledge intake before generation.

- YAML frontmatter tokens win on conflicts with prose
- prose gives the **why** so the agent can judge edge cases
- unknown sections are preserved without error per the spec, so this repo's one extension (`Example Prompting Language`) is safe to use

the project-identity template for this repo lives at `templates/project-identity-template.md` and is DESIGN.md-shaped. worked examples live in `testing/fixtures/` — three bespoke (canopy, pawprint, notion-ai-settings) and three real from the ecosystem (airbnb, linear, notion).

format reference: https://github.com/google-labs-code/design.md (alpha — this repo consumes the format, does not author tooling for it)

prior art / ecosystem: https://github.com/VoltAgent/awesome-design-md — curated real-world DESIGN.md examples. the three real fixtures in `testing/fixtures/` were pulled via `npx getdesign@latest add <slug>`.

## Routing decision

```
is this visual or frontend work?
├── no → skip everything, do the task
└── yes
    ├── new page/component → run project knowledge intake if context is thin, read core pack skills, then build
    ├── modification to existing UI → read design-review only
    └── non-visual (scripts, backend, config) → skip
    
    does it need creative direction?
    ├── user provided a visual reference/screenshot/CodePen/site/"feel like this" → also read visual-reference-calibration BEFORE coding
    ├── user asked for personality/delight → also read whimsical-design
    ├── user asked for immersion/atmosphere → also read world-build  
    ├── task involves animation specifically → also read web-animation-design
    └── none of the above → core pack is enough
```

## The key rule

if the default aesthetic is appropriate for the product, don't fight it. make it excellent, not different. a weather app CAN be dark and glassy. an admin panel SHOULD be clean and utilitarian. core pack makes defaults excellent. creative pack makes them different. only add creative when different is what the product actually needs.

## Design rubric (grade yourself before presenting)

score your output on these 4 criteria before announcing. inspired by Anthropic's multi-agent harness research — separating generation from evaluation produces dramatically better work.

| Criteria | Weight | What it means | Failing looks like |
|----------|--------|--------------|-------------------|
| **Design Quality** | 35% | Does it feel like a coherent whole? Colors, typography, layout, spacing combine into a distinct mood and identity. | Components feel disconnected. No visual theme. "Collection of parts" energy. |
| **Originality** | 30% | Evidence of custom decisions? Or is this template layouts, library defaults, and AI-generated patterns? A human designer should recognize deliberate creative choices. | Purple gradients over white cards. Unmodified shadcn. Zinc-800 everywhere. Stock hero sections. |
| **Craft** | 20% | Technical execution: typography hierarchy, spacing consistency, color harmony, contrast ratios. Competence check. | Broken fundamentals. Inconsistent spacing. Missing hover states. Bad contrast. |
| **Functionality** | 15% | Can users understand what it does, find primary actions, complete tasks without guessing? | Unclear CTAs. Hidden navigation. Confusing state transitions. |

**Design Quality and Originality are weighted highest.** models already score well on Craft and Functionality by default. the gap is always in making something that feels intentional and distinctive vs. generic.

### scoring guide
- **8-10:** ship it. would impress a human designer.
- **6-7:** functional but needs another pass. common for first iteration.
- **4-5:** generic AI slop. needs a creative pivot, not polish.
- **1-3:** broken fundamentals. rebuild.

**if you score yourself below 6 on Design Quality or Originality, don't present. iterate.**

## Iteration philosophy

more iterations with structured feedback produce breakthroughs. Anthropic's harness research found that on iteration 10 of a museum site, the model reimagined the entire approach as a 3D spatial experience — something that would never emerge from a single pass.

**rules for iteration:**
- don't stop at "good enough" on creative work. push for at least 3 passes on new pages/components.
- after each pass, score yourself on the rubric. if Design Quality or Originality aren't improving, **pivot the aesthetic entirely** instead of refining the current direction.
- refinement and pivoting are both valid. if scores trend up, refine. if scores plateau, pivot.
- the "2 rounds of fixes = rebuild" rule applies to BUG FIXES, not creative iteration. creative exploration benefits from more rounds, not fewer.

## Verification (run before presenting)

after ingest/interview (if needed), building, and scoring yourself on the rubric, run these scripts:

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>
```

fix any warnings before presenting work. these catch: agent default patterns (zinc palette, purple gradients, Inter font), missing states (loading, empty, error), and accessibility gaps (semantic HTML, aria labels, alt text, heading hierarchy).

## What the reference files cover

when you read `skills/design-review/SKILL.md`, it points to reference files in `skills/design-review/references/`. you don't need to read all of them — only load what's relevant:

- `anti-patterns.md` — what NOT to do (always worth reading)
- `layout.md` — composition and grid-breaking (read for new pages)
- `typography.md` — type hierarchy, pairing, text-wrap (read when type feels off)
- `color.md` — palette strategy, tinted neutrals (read when color feels generic)
- `spacing.md` — rhythm and judgment (read when spacing feels cramped or uniform)
- `alignment.md` — concentric radius, optical alignment, shadows, image overlays (read for polish)
- `responsive.md` — mobile failures and what to check (read for responsive work)
- `motion.md` — interruptibility, enter/exit asymmetry (read when adding motion)
- `ux-writing.md` — copy quality, button labels, empty states (read when writing UI text)
- `mock-data.md` — realistic content, where humor goes (read when generating sample data)
- `inspiration.md` — context pass, reference priority (read when building for a named company)

## Compounding

after each build, if you learned something new — a pattern that worked, an anti-pattern you hit, a design decision worth preserving — add it to the relevant reference file. the system gets smarter every time it's used.
