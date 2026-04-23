# run report — pawprint

**prompt:** build an admin dashboard for a dog walking service called Pawprint
**type:** dashboard
**generator model:** gpt-5.4
**judge model:** claude-sonnet-4-6
**timestamp:** 2026-04-23T18:20:50.018Z
**score:** 11 → 40 (+29)
**verdict:** after — strong lift

## files

- before: `testing/results/pawprint/before.tsx`
- after: `testing/results/pawprint/after.tsx`

## rules fired

### before

- anti-pattern summary: 4 warnings, 1 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| info | Zinc/Slate palette | 56 |
| warning | No loading state | 1 |
| warning | No empty state | 1 |
| warning | No error state | 1 |
| warning | Placeholder text | 2 |

#### state-check.py

| state | present |
|---|---|
| loading | no |
| empty | no |
| error | no |

#### accessibility-check.py

| severity | rule | count |
|---|---|---:|
| info | Inputs without labels | 1 |
| info | Missing form input types | 1 |
| warning | No focus-visible styles | 1 |

- state coverage: 0/3
- responsive breakpoints: yes

### after

- anti-pattern summary: 0 warnings, 0 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| warning | none | 0 |
| info | none | 0 |

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
| spacing | 7 | 8 | +1 |
| copy | 6 | 8 | +2 |
| productFit | 7 | 8 | +1 |
| screenshotWorthy | 6 | 8 | +2 |
| **judge total** | **33** | **40** | **+7** |

## penalties

| category | before | after |
|---|---:|---:|
| anti-pattern | -9 | 0 |
| missing states | -9 | 0 |
| accessibility | -4 | 0 |
| responsive | 0 | 0 |

## qualitative notes

- after variant is rule-clean on anti-pattern checks.
- state coverage moved 0/3 -> 3/3; judge total moved 33 -> 40 (+7).
- largest judge lift: copy (+2).

## follow-ups

1. anti-pattern hits present on the after variant → candidates for `skills/design-review/references/anti-patterns.md`
2. judge dimensions under 7 on after → iterate before shipping
3. rubric weights from `skills/agentic-design-system/SKILL.md` (Design Quality 35%, Originality 30%, Craft 20%, Functionality 15%) are not automatically scored here — apply manually before verdict

## raw

see `scores.json` in this directory for the full structured output.
