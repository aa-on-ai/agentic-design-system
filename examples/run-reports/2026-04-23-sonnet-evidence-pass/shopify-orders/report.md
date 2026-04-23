# run report — shopify-orders

**prompt:** build an orders table for a Shopify-style commerce admin with status chips, payment state, fulfillment timeline, and saved views
**type:** operations
**generator model:** gpt-5.4
**judge model:** claude-sonnet-4-6
**timestamp:** 2026-04-23T18:35:30.938Z
**score:** 20 → 34 (+14)
**verdict:** after — modest lift

## files

- before: `testing/results/shopify-orders/before.tsx`
- after: `testing/results/shopify-orders/after.tsx`

## rules fired

### before

- anti-pattern summary: 3 warnings, 1 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| info | Zinc/Slate palette | 111 |
| warning | No loading state | 1 |
| warning | No error state | 1 |
| warning | Placeholder text | 2 |

#### state-check.py

| state | present |
|---|---|
| loading | yes |
| empty | yes |
| error | no |

#### accessibility-check.py

| severity | rule | count |
|---|---|---:|
| info | Div soup | 1 |
| info | Inputs without labels | 1 |
| info | Missing form input types | 1 |

- state coverage: 2/3
- responsive breakpoints: yes

### after

- anti-pattern summary: 1 warnings, 1 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| info | Zinc/Slate palette | 130 |
| warning | Placeholder text | 2 |

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
| screenshotWorthy | 6 | 8 | +2 |
| **judge total** | **33** | **40** | **+7** |

## penalties

| category | before | after |
|---|---:|---:|
| anti-pattern | -7 | -3 |
| missing states | -3 | 0 |
| accessibility | -3 | -3 |
| responsive | 0 | 0 |

## qualitative notes

- after variant still has 1 warning(s) and 1 info hit(s).
- state coverage moved 2/3 -> 3/3; judge total moved 33 -> 40 (+7).
- largest judge lift: copy (+2).

## follow-ups

1. anti-pattern hits present on the after variant → candidates for `skills/design-review/references/anti-patterns.md`
2. judge dimensions under 7 on after → iterate before shipping
3. rubric weights from `skills/agentic-design-system/SKILL.md` (Design Quality 35%, Originality 30%, Craft 20%, Functionality 15%) are not automatically scored here — apply manually before verdict

## raw

see `scores.json` in this directory for the full structured output.
