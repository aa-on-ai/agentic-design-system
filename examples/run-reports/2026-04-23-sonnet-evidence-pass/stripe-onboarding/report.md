# run report — stripe-onboarding

**prompt:** build a three-step onboarding flow for a Stripe-style payments product: business info, identity verification, bank account. progress indicator at the top and one primary action per step
**type:** onboarding
**generator model:** gpt-5.4
**judge model:** claude-sonnet-4-6
**timestamp:** 2026-04-23T18:27:51.570Z
**score:** 9 → 35 (+26)
**verdict:** after — strong lift

## files

- before: `testing/results/stripe-onboarding/before.tsx`
- after: `testing/results/stripe-onboarding/after.tsx`

## rules fired

### before

- anti-pattern summary: 4 warnings, 2 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| info | Zinc/Slate palette | 90 |
| warning | No loading state | 1 |
| warning | No empty state | 1 |
| warning | No error state | 1 |
| warning | Placeholder text | 20 |
| info | transition-all usage | 1 |

#### state-check.py

| state | present |
|---|---|
| loading | no |
| empty | no |
| error | no |

#### accessibility-check.py

| severity | rule | count |
|---|---|---:|
| warning | No semantic landmarks | 1 |
| warning | Div soup | 1 |
| info | Inputs without labels | 1 |

- state coverage: 0/3
- responsive breakpoints: yes

### after

- anti-pattern summary: 1 warnings, 1 info

#### anti-pattern-check.py

| severity | rule | count |
|---|---|---:|
| info | Zinc/Slate palette | 101 |
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
| info | Missing form input types | 9 |
| warning | Multiple h1 elements | 1 |

- state coverage: 3/3
- responsive breakpoints: yes

## judge scores (1–10 each)

| dimension | before | after | delta |
|---|---:|---:|---:|
| hierarchy | 7 | 8 | +1 |
| spacing | 7 | 8 | +1 |
| copy | 6 | 8 | +2 |
| productFit | 7 | 9 | +2 |
| screenshotWorthy | 6 | 8 | +2 |
| **judge total** | **33** | **41** | **+8** |

## penalties

| category | before | after |
|---|---:|---:|
| anti-pattern | -10 | -3 |
| missing states | -9 | 0 |
| accessibility | -5 | -3 |
| responsive | 0 | 0 |

## qualitative notes

- after variant still has 1 warning(s) and 1 info hit(s).
- state coverage moved 0/3 -> 3/3; judge total moved 33 -> 41 (+8).
- largest judge lift: copy (+2).

## follow-ups

1. anti-pattern hits present on the after variant → candidates for `skills/design-review/references/anti-patterns.md`
2. judge dimensions under 7 on after → iterate before shipping
3. rubric weights from `skills/agentic-design-system/SKILL.md` (Design Quality 35%, Originality 30%, Craft 20%, Functionality 15%) are not automatically scored here — apply manually before verdict

## raw

see `scores.json` in this directory for the full structured output.
