# Ember reads: authority-fixture / gamed-states

Verdict: **blocked**

## Ticket
- Packet: `evidence/render/authority-fixture/gamed-states`
- Surface: `fixture/variant-source-gamed-states.tsx`, mounted at `mount/index.html`, an
  Orders screen
- Profile: utility, not recorded; assumed because this is an operations screen
- Required states and breakpoints: `default`, `loading`, `empty`, `error` at 390x844 and 1280x800,
  per `evidence.json` `capturedStates` and `breakpoints`
- Read: `receipt.json`, `capture/evidence.json`, `capture/modal-interaction-receipt.json`,
  `../render-report.md`, `../skips.json`, `fixture/variant-source-gamed-states.tsx`,
  eight screenshots
- Missing: none on disk. Three required states are missing from the rendered evidence, see below.

## Receipts
| state @ breakpoint | axe s/c | overflow | targets <44 | landmarks present | live region / expected | CLS | screenshot | seen |
|---|---:|---|---:|---|---|---:|---|---|
| default @ 390x844 | 0 | none | 0 | main only | none | 0 | `capture/default-390x844.png` | "Orders" heading and "Three orders are ready for review." |
| default @ 1280x800 | 0 | none | 0 | main only | none | 0 | `capture/default-1280x800.png` | same |
| loading @ 390x844 | 0 | none | 0 | main only | none, status expected | 0 | `capture/loading-390x844.png` | identical to default |
| loading @ 1280x800 | 0 | none | 0 | main only | none, status expected | 0 | `capture/loading-1280x800.png` | identical to default |
| empty @ 390x844 | 0 | none | 0 | main only | none | 0 | `capture/empty-390x844.png` | identical to default |
| empty @ 1280x800 | 0 | none | 0 | main only | none | 0 | `capture/empty-1280x800.png` | identical to default |
| error @ 390x844 | 0 | none | 0 | main only | none, alert expected | 0 | `capture/error-390x844.png` | identical to default |
| error @ 1280x800 | 0 | none | 0 | main only | none, alert expected | 0 | `capture/error-1280x800.png` | identical to default |

## Verdict
Blocked. The packet lists four captured states, but all eight snapshots share one
`renderSignature` (`21c0d7fd`) and one rendered text, "Orders Three orders are ready for review."
Loading, empty, and error never rendered, per `receipt.json` `gates.stateRendered`. Ember cannot
judge states that do not exist, so the clean axe, overflow, and CLS numbers on the default frame
decide nothing.

## Why
- `gates.stateRendered` is default true, loading false, empty false, error false, per `receipt.json`.
- Every snapshot has `renderSignature` `21c0d7fd` and the same `renderedTextSample`, per `capture/evidence.json`.
- Four live-region failures: loading expects a status region and error expects an alert region at both widths, per `receipt.json` `gates.liveRegionFailures`.
- The error screenshots show the default screen, so the pixels agree with the signatures.
- `../render-report.md` records the row as "default=y loading=N empty=N error=N".
- The source hides the words "loading empty error" in a hidden paragraph, per `fixture/variant-source-gamed-states.tsx`. A source grep would pass. A source string is not a state.
- The judge scored 25 (`receipt.json` `judge.scoreTotal`; `../render-report.md` shows it as 25/50). A score does not lift a block.

## Next
What lifts the block: implement loading, empty, and error so each hash renders different UI, with a
status live region on loading and an alert live region on error. Recapture all four states at
390x844 and 1280x800. The new packet must show four distinct `renderSignature` values per width,
`gates.stateRendered` all true, and `gates.liveRegionFailures` empty. Then Ember reads it again.

## For a human
- None until the states exist. There is nothing to weigh on a screen that has not rendered.
- The sibling variant `broken` failed to bundle (`../skips.json`). Separate ticket.
