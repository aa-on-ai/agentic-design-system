# case studies

what the loop actually did, on three real prompts, with rule hits and rubric scores — not just a summary number.

| case | type | before | after | delta | live route |
|---|---|---:|---:|---:|---|
| [canopy](./canopy.md) | landing | 16 | 40 | +24 | [`/before/canopy`](../../demos/src/app/before/canopy/page.tsx) · [`/after/canopy`](../../demos/src/app/after/canopy/page.tsx) |
| [pawprint](./pawprint.md) | dashboard | 15 | 41 | +26 | scored-only |
| [notion-ai-settings](./notion-ai-settings.md) | settings | 17 | 40 | +23 | scored-only |
| **average** |  | **16** | **40.3** | **+24.3** |  |

each case lists:

- exact rule hits from `anti-pattern-check.py` and `state-check.py`
- judge scores across the 5 dimensions with delta
- deterministic penalty breakdown
- a short narrative on what the loop actually caught
- follow-ups — what a human reviewer should still do

source data is in `testing/results/` (`summary.json` per-prompt `scores.json`). rendered before/after pages are committed to `demos/` for canopy only in v1.1 — pawprint and notion-ai-settings render to the demos app in a follow-up (see [`PHASE-2.md`](../../PHASE-2.md)).

## how to read these

start from the rubric delta. if all five dimensions moved, the loop changed the aesthetic. if only penalties moved, the loop caught floor issues but not taste issues — that's a signal to look at the project-identity file, not the skills.

the screenshot-worthy dimension is the one most correlated with "does this feel intentional." treat the others as necessary-not-sufficient.
