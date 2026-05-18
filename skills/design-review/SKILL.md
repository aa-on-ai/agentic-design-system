---
name: design-review
description: >
  Core visual quality gate for UI, components, pages, layouts, and frontend
  work. Use before presenting visual work and during design QA.
---

# Design Review

Apply this to visual/frontend work selected by the ADS router. It is a quality
gate, not a taste manifesto.

## When To Use

- Before presenting visual or UX work.
- During UI bug fixes, responsive fixes, screenshot review, and polish passes.
- In sub-agents before they announce completion on design/frontend work.

## When Not To Use

- Non-visual backend, scripts, data, config, or dependency work.
- Copy-only edits that do not affect UI hierarchy or presentation.
- Motion-specific decisions; route those to web-animation-design.

## Pre-Work

- Read project guidelines, DESIGN.md, or equivalent design system docs first.
- Match existing components, tokens, and patterns before inventing new ones.
- Inspect the existing product if formal guidelines do not exist.
- Check relevant channel/project memory for rejected patterns or active direction.
- Use real references when the brief names them or the pattern is well established.
- Hot path: restraint, spacing, typography hierarchy, existing patterns, foundation before polish.

## Reference Files

Load only what the task needs:

- references/anti-patterns.md - common AI visual defaults to avoid
- references/layout.md - composition, grids, and page structure
- references/typography.md - hierarchy, scale, pairing, measure
- references/color.md - restrained palettes, tinted neutrals, contrast
- references/spacing.md - rhythm, grouping, layout density
- references/alignment.md - radius, optical alignment, shadows, overlays
- references/responsive.md - mobile and breakpoint checks
- references/motion.md - baseline motion quality
- references/ux-writing.md - labels, empty states, UI copy
- references/mock-data.md - realistic product content
- references/inspiration.md - reference priority and source handling

Default references:

- new layout or dashboard: spacing + anti-patterns
- type-heavy screen: typography + spacing
- color/theming: color + anti-patterns
- interactive polish: motion + anti-patterns
- unsure: spacing + anti-patterns

## Pre-Flight Checklist

Before presenting work:

- Render the result and inspect the target viewport.
- Compare side by side with the reference or existing pattern.
- Check spacing, color, typography, hierarchy, and component consistency.
- Verify hover, focus, active, loading, empty, and error states when relevant.
- Confirm no placeholders, broken assets, dead controls, or missing data handling.
- Ask whether the work meets the brief, not an adjacent brief.

## Scripts

Run these when the scripts directory is available and the touched files are TSX:

```bash
python3 skills/design-review/scripts/anti-pattern-check.py <file.tsx>
python3 skills/design-review/scripts/state-check.py <file.tsx>
python3 skills/design-review/scripts/accessibility-check.py <file.tsx>
```

Use ci/design-eval.py for PR integration.

## Output

Report with evidence:

- screenshot or visual inspection result
- what changed
- what reference or product pattern was used
- verification commands run
- known gaps or uncertainty

## Updating This Skill

After durable design feedback, update the relevant reference file or project
memory. Do not grow this SKILL.md with examples or doctrine.
