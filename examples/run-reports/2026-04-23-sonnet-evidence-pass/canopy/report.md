# run report — canopy

**prompt:** build a landing page for a new weather app called Canopy
**type:** landing
**generator model:** gpt-5.4
**judge model:** claude-sonnet-4-6
**timestamp:** 2026-04-23T18:18:00.756Z
**score:** 20 → 39 (+19)
**verdict:** after — modest lift

## files

- before: `testing/results/canopy/before.tsx`
- after: `testing/results/canopy/after.tsx`

## rules fired

### before

- anti-pattern summary: 3 warnings, 1 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| info | Zinc/Slate palette | 28 |
| warning | No loading state | 1 |
| warning | No empty state | 1 |
| warning | No error state | 1 |

#### state-check.py

| state | present |
|---|---|
| loading | no |
| empty | yes |
| error | no |

#### accessibility-check.py

| severity | rule | count |
|---|---|---:|
| warning | No focus-visible styles | 1 |

- state coverage: 1/3
- responsive breakpoints: yes

### after

- anti-pattern summary: 1 warnings, 1 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| warning | Placeholder text | 4 |
| info | Generic button labels | 1 |

#### state-check.py

| state | present |
|---|---|
| loading | yes |
| empty | yes |
| error | yes |

#### accessibility-check.py

| severity | rule | count |
|---|---|---:|
| warning | none | 0 |
| info | none | 0 |

- state coverage: 3/3
- responsive breakpoints: yes

## judge scores (1–10 each)

| dimension | before | after | delta |
|---|---:|---:|---:|
| hierarchy | 7 | 8 | +1 |
| spacing | 7 | 9 | +2 |
| copy | 7 | 9 | +2 |
| productFit | 7 | 8 | +1 |
| screenshotWorthy | 7 | 8 | +1 |
| **judge total** | **35** | **42** | **+7** |

## penalties

| category | before | after |
|---|---:|---:|
| anti-pattern | -7 | -3 |
| missing states | -6 | 0 |
| accessibility | -2 | 0 |
| responsive | 0 | 0 |

## qualitative notes

- after variant still has 1 warning(s) and 1 info hit(s).
- state coverage moved 1/3 -> 3/3; judge total moved 35 -> 42 (+7).
- largest judge lift: spacing (+2).

## follow-ups

1. anti-pattern hits present on the after variant → candidates for `skills/design-review/references/anti-patterns.md`
2. judge dimensions under 7 on after → iterate before shipping
3. rubric weights from `skills/agentic-design-system/SKILL.md` (Design Quality 35%, Originality 30%, Craft 20%, Functionality 15%) are not automatically scored here — apply manually before verdict

## raw

see `scores.json` in this directory for the full structured output.
