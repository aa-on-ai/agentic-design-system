# run report — linear-issues-table

**prompt:** build an issue list for a Linear-style project tracker with filters, sticky header, priority and status cells, and inline row actions
**type:** data-table
**generator model:** gpt-5.4
**judge model:** claude-sonnet-4-6
**timestamp:** 2026-04-23T18:25:18.130Z
**score:** 12 → 32 (+20)
**verdict:** after — strong lift

## files

- before: `testing/results/linear-issues-table/before.tsx`
- after: `testing/results/linear-issues-table/after.tsx`

## rules fired

### before

- anti-pattern summary: 4 warnings, 1 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| info | Zinc/Slate palette | 35 |
| warning | No loading state | 1 |
| warning | No empty state | 1 |
| warning | No error state | 1 |
| warning | Placeholder text | 7 |

#### state-check.py

| state | present |
|---|---|
| loading | no |
| empty | yes |
| error | no |

#### accessibility-check.py

| severity | rule | count |
|---|---|---:|
| warning | No semantic landmarks | 1 |
| info | Div soup | 1 |
| info | Inputs without labels | 1 |
| info | Missing form input types | 1 |
| warning | No focus-visible styles | 1 |

- state coverage: 1/3
- responsive breakpoints: yes

### after

- anti-pattern summary: 1 warnings, 1 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| info | Zinc/Slate palette | 95 |
| warning | Placeholder text | 7 |

#### state-check.py

| state | present |
|---|---|
| loading | yes |
| empty | yes |
| error | yes |

#### accessibility-check.py

| severity | rule | count |
|---|---|---:|
| info | Div soup | 1 |
| warning | Buttons without accessible labels | 3 |
| info | Inputs without labels | 1 |
| info | Missing form input types | 1 |

- state coverage: 3/3
- responsive breakpoints: yes

## judge scores (1–10 each)

| dimension | before | after | delta |
|---|---:|---:|---:|
| hierarchy | 7 | 8 | +1 |
| spacing | 7 | 8 | +1 |
| copy | 6 | 8 | +2 |
| productFit | 7 | 8 | +1 |
| screenshotWorthy | 7 | 8 | +1 |
| **judge total** | **34** | **40** | **+6** |

## penalties

| category | before | after |
|---|---:|---:|
| anti-pattern | -9 | -3 |
| missing states | -6 | 0 |
| accessibility | -7 | -5 |
| responsive | 0 | 0 |

## qualitative notes

- after variant still has 1 warning(s) and 1 info hit(s).
- state coverage moved 1/3 -> 3/3; judge total moved 34 -> 40 (+6).
- largest judge lift: copy (+2).

## follow-ups

1. anti-pattern hits present on the after variant → candidates for `skills/design-review/references/anti-patterns.md`
2. judge dimensions under 7 on after → iterate before shipping
3. rubric weights from `skills/agentic-design-system/SKILL.md` (Design Quality 35%, Originality 30%, Craft 20%, Functionality 15%) are not automatically scored here — apply manually before verdict

## raw

see `scores.json` in this directory for the full structured output.
