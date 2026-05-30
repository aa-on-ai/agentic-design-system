# Eval Loop Spec

## Overview
Automated A/B testing for the agentic design system. Same model, same prompt, 
one without skills (before), one with core pack (after). Scored programmatically 
and by a model judge.

## Architecture

```
eval-loop.ts (orchestrator)
├── generates "before" page (no skills prompt)
├── generates "after" page (with skills prompt)
├── runs programmatic evals:
│   ├── anti-pattern-check.py → anti-pattern score
│   ├── state-check.py → state completeness score
│   └── responsive-check (viewport screenshots) → overflow detection
├── runs model judge eval:
│   └── scores both pages on 5 dimensions (1-10)
├── compiles results → testing/results/{prompt-slug}.json
└── generates summary → testing/results/summary.json
```

## Test Prompts (v1)
1. "build a landing page for a new weather app called Canopy"
2. "build an admin dashboard for a dog walking service called Pawprint"  
3. "build a settings page for Notion's AI features"

## Programmatic Scores
- anti-pattern warnings (lower = better)
- anti-pattern info notes (lower = better)
- state completeness: loading, empty, error (3 binary checks)
- responsive breakpoints detected (boolean)

## Model Judge Dimensions (1-10 each)
1. **hierarchy** — is there a clear visual hierarchy? does the eye know where to go?
2. **spacing** — does spacing feel intentional? tight inside, loose outside?
3. **copy** — is the copy specific and opinionated, or generic filler?
4. **product-fit** — does this look like it belongs to the named product/category?
5. **screenshot-worthy** — would someone screenshot this and share it?

## Output Format
```json
{
  "prompt": "build a landing page for...",
  "slug": "canopy",
  "timestamp": "2026-03-17T21:00:00Z",
  "before": {
    "antiPatterns": { "warnings": 3, "info": 1 },
    "states": { "loading": false, "empty": false, "error": false },
    "responsive": true,
    "judge": { "hierarchy": 7, "spacing": 6, "copy": 5, "productFit": 8, "screenshotWorthy": 6 },
    "total": 32
  },
  "after": {
    "antiPatterns": { "warnings": 0, "info": 0 },
    "states": { "loading": true, "empty": true, "error": true },
    "responsive": true,
    "judge": { "hierarchy": 8, "spacing": 8, "copy": 8, "productFit": 9, "screenshotWorthy": 7 },
    "total": 40
  },
  "delta": 8,
  "winner": "after"
}
```

## Scoring Formula
- anti-pattern warnings: -2 each
- anti-pattern info: -1 each  
- each missing state: -3
- no responsive breakpoints: -5
- judge dimensions: raw score (1-10 each, max 50)
- total = judge_total + state_bonus + anti_pattern_penalty + responsive_penalty

## Files to Create
- `testing/eval-loop.ts` — main orchestrator (Node/TypeScript)
- `testing/prompts.json` — test prompt definitions
- `testing/judge-prompt.md` — the model judge system prompt
- `testing/results/` — output directory
- `testing/TESTING.md` — updated with eval loop docs
