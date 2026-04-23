# run report — batch summary

**timestamp:** 2026-04-23T18:38:33.231Z
**generator model:** gpt-5.4
**judge model:** claude-sonnet-4-6
**prompts:** 8/8 succeeded

## score summary

- total score average: 12.13 -> 38.13 (+26)
- judge total average: 31.5 -> 41.13 (+9.630000000000003)
- anti-pattern warnings average: 3.63 -> 0.5
- anti-pattern info average: 0.88 -> 0.63

## prompt results

| slug | type | before | after | delta | rule hits before -> after | states before -> after |
|---|---|---:|---:|---:|---|---|
| canopy | landing | 20 | 39 | +19 | 5 -> 2 | 1/3 -> 3/3 |
| pawprint | dashboard | 11 | 40 | +29 | 8 -> 0 | 0/3 -> 3/3 |
| notion-ai-settings | settings | 18 | 44 | +26 | 5 -> 0 | 0/3 -> 3/3 |
| linear-issues-table | data-table | 12 | 32 | +20 | 10 -> 6 | 1/3 -> 3/3 |
| stripe-onboarding | onboarding | 9 | 35 | +26 | 9 -> 4 | 0/3 -> 3/3 |
| vercel-pricing | pricing | -11 | 43 | +54 | 5 -> 1 | 0/3 -> 3/3 |
| figma-comments-panel | collaboration | 18 | 38 | +20 | 7 -> 0 | 1/3 -> 3/3 |
| shopify-orders | operations | 20 | 34 | +14 | 7 -> 5 | 2/3 -> 3/3 |

## qualitative notes

- 8/8 prompts improved after the core-pack loop.
- 8/8 after variants reached full loading/empty/error coverage.
- no failed prompts in this batch.

## per-prompt reports

see `testing/results/<slug>/report.md` for rule-level tables and detailed notes.
