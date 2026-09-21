# Ember reads: fixture-orders / good

Verdict: **needs repair**

## Ticket
- Packet: `evidence/render/fixture-orders/good`
- Surface: `fixture/variant-orders.tsx`, mounted at `mount/index.html`, an Acme Orders list
- Profile: utility, not recorded; assumed because this is an operations list
- Required states and breakpoints: `default`, `empty`, `loading`, `error` at 390x844 and 1280x800,
  per `evidence.json` `capturedStates` and `breakpoints`
- Read: `receipt.json`, `capture/evidence.json`, `capture/modal-interaction-receipt.json`,
  `../render-report.md`, `../skips.json`, `fixture/variant-orders.tsx`,
  `contracts/visual-foundation.v2.json`, eight screenshots
- Missing: none

## Receipts
| state @ breakpoint | axe s/c | overflow | targets <44 | landmarks present | live region / expected | CLS | screenshot | seen |
|---|---:|---|---:|---|---|---:|---|---|
| default @ 390x844 | 1 critical `image-alt` | none | 0 | main, nav, header (no footer) | none | 0 | `capture/default-390x844.png` | "Acme Orders" wordmark in serif fallback type, "Orders" heading and three rows in sans, rows joined with em dashes |
| default @ 1280x800 | 1 critical `image-alt` | none | 0 | main, nav, header (no footer) | none | 0 | `capture/default-1280x800.png` | same list, wider |
| loading @ 390x844 | 0 | none | 0 | main, nav, header | status | 0 | `capture/loading-390x844.png` | "Loading your orders" line |
| loading @ 1280x800 | 0 | none | 0 | main, nav, header | status | 0 | `capture/loading-1280x800.png` | same |
| empty @ 390x844 | 0 | none | 0 | main, nav, header | none | 0 | `capture/empty-390x844.png` | "No orders yet" message |
| empty @ 1280x800 | 0 | none | 0 | main, nav, header | none | 0 | `capture/empty-1280x800.png` | same |
| error @ 390x844 | 0 | none | 0 | main, nav, header | alert | 0 | `capture/error-390x844.png` | "Couldn't load orders" with retry copy |
| error @ 1280x800 | 0 | none | 0 | main, nav, header | alert | 0 | `capture/error-1280x800.png` | same |

## Verdict
Needs repair. All four states render distinctly at both widths, so the ticket is trustworthy, but
the default state carries one critical axe violation at each width: an image with no alternative
text, per `receipt.json` `gates.seriousAxeViolations` = 2. The same state also renders em dashes
in authored row copy, which the capture reports as three `emDashTextCandidates` and the
screenshot confirms. Both fixes fit one repair pass.

## Why
- `image-alt`, impact critical, one node, at default @ 390x844 and default @ 1280x800, per `capture/evidence.json` each snapshot's `axe.violations`.
- Em dash in authored copy at default, per `capture/evidence.json` `visualFoundation.emDashTextCandidates` ("#1042 — Maya Chen — shipped" and two more) and the default screenshots. `contracts/visual-foundation.v2.json` rule `em-dash-copy` is `never`; the allowed exception is verbatim external data, and these rows are fixture-authored.
- Every state is real: four distinct `renderedTextSample` values and `gates.stateRendered` all true.
- Loading exposes a status region and error exposes an alert region, per each snapshot's `statusRegion` and `alertRegion`.
- No overflow, no small targets, CLS 0 at every snapshot, per `gates`.
- No dialog declared; `modal-interaction-receipt.json` `required` = false, `passed` = true.
- The judge did not score: `receipt.json` `judge.judged` = false, and `judge.reason` starts "no judge API key" and asks for human review. `render-report.md` shows "needs human (4 shots ready)". That does not change a gate.

## Next
```text
Repair fixture/variant-orders.tsx in the default state only.
1. Give the <img> a real alt, or alt="" plus aria-hidden="true" if it is decorative.
2. Replace the em-dash separators in the three order rows with structured cells or a plain separator
   that is not an em dash. Keep the order id, customer, and status readable in that order.
Then recapture default, loading, empty, and error at both 390x844 and 1280x800. The fresh default snapshots must report
gates.seriousAxeViolations = 0 and visualFoundation.emDashTextCandidates = [] at both widths.
Leave the loading, empty, and error implementations unchanged, but capture each again at both widths and check for regressions against this packet. The refreshed packet must contain all eight state/viewport snapshots.
```

## For a human
- `gates.renderedFonts` is `["Times"]`, the body-level browser fallback; the `<main>` sets a sans
  stack (fixture line 19), so only the wordmark renders in Times. Utility allows a conventional
  family, but decide whether this fixture is meant to carry any product type at all before judging
  design quality.
- The judge withheld a score. If a scored design verdict is needed, run the judge or review the
  eight screenshots yourself.
- The sibling variant `broken` failed to bundle (`../skips.json`, missing
  `totally-not-installed-chart-lib`). That is a separate ticket and does not affect this one.
