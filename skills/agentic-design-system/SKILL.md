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

## how it works

the system has two packs of skills installed alongside this one. you don't need to read them all — this file tells you which ones to read for your current task.

### core pack (read these for ALL visual work)
- `skills/design-review/SKILL.md` — quality gate, reference files, verification scripts
- `skills/ux-baseline-check/SKILL.md` — loading, empty, error states
- `skills/ui-polish-pass/SKILL.md` — final spacing/alignment/hierarchy pass

### creative pack (read ONLY when triggered)
- `skills/whimsical-design/SKILL.md` — ONLY if user asks for personality, delight, or brand expression. ONLY for marketing, editorial, or launch pages. Skip for utility UI.
- `skills/world-build/SKILL.md` — ONLY if user explicitly asks for immersion or atmosphere. Skip unless told otherwise.
- `skills/web-animation-design/SKILL.md` — ONLY if task specifically involves animation, motion, or interaction feel.

### agent-friendly (read for production sites)
- `skills/agent-friendly-design/SKILL.md` — semantic HTML, ARIA, structured data. Read when building anything that ships to production.

## routing decision

```
is this visual or frontend work?
├── no → skip everything, do the task
└── yes
    ├── new page/component → read core pack skills, then build
    ├── modification to existing UI → read design-review only
    └── non-visual (scripts, backend, config) → skip
    
    does it need creative direction?
    ├── user asked for personality/delight → also read whimsical-design
    ├── user asked for immersion/atmosphere → also read world-build  
    ├── task involves animation specifically → also read web-animation-design
    └── none of the above → core pack is enough
```

## the key rule

if the default aesthetic is appropriate for the product, don't fight it. make it excellent, not different. a weather app CAN be dark and glassy. an admin panel SHOULD be clean and utilitarian. core pack makes defaults excellent. creative pack makes them different. only add creative when different is what the product actually needs.

## verification (run before presenting)

after building, run these scripts on your output:

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>
```

fix any warnings before presenting work. these catch: agent default patterns (zinc palette, purple gradients, Inter font), missing states (loading, empty, error), and accessibility gaps (semantic HTML, aria labels, alt text, heading hierarchy).

## what the reference files cover

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

## compounding

after each build, if you learned something new — a pattern that worked, an anti-pattern you hit, a design decision worth preserving — add it to the relevant reference file. the system gets smarter every time it's used.
