# Museum loan registrar — iteration 2 repair report

> Candidate rerun note, 2026-07-20: the public-hardening behavior-path changes only correct install
> inventory documentation. The frozen artifact was recaptured from the current behavior digest;
> all 8 rendered gates passed and all 8 screenshots compare perceptually identical to baseline.

## Run receipt

```yaml
GBRAIN_CHECK: exact_page channels/agentic-design found; inherited parent receipt
SOURCE_TRUTH:
  benchmark_contract: ../../BENCHMARK-CONTRACT.md
  case_outcome: ../outcome.md
  grader_finding: ../iteration-1/grade.json#finding-001
  grader_report: ../iteration-1/grader-report.md
  prior_builder_receipt: ../iteration-1/builder-report.md
  ads_release_sha: f7d9037012f4c730150b37fbcf86b510aedd6ecb
TASK_SCOPE: finding-001 only; mobile error decision discoverability
OVERREACH_BOUNDARY: no other case, prior benchmark, external exemplar, or grader finding inspected or changed
RUN_ARTIFACT: iteration-2/evidence/evidence.json
SCORER_RESULT: not_applicable; builder cannot grade
STOP_CONDITION: one allowed grader-directed repair pass completed; done_verified
ROUTE_USED: Codex implementation / default tier / isolated clean-room repair
GIT_EVIDENCE: no git commit, branch, index, deploy, or external mutation
```

## Repair applied

`finding-001` identified that the initial 390x844 error viewport matched default and deferred the
permission explanation and valid report action until after the long record. The repair changes
only the 390px-class error composition: the existing permission decision panel moves to the top of
the same record shell, condenses to the assertive explanation, paired actions, and helper text, and
then continues into the unchanged object, condition, and custody spine. Desktop composition and
every non-error state retain their prior behavior.

No duplicate action controls were introduced. The same `Approve transfer` button remains natively
disabled in error, and the same `Download condition report` button remains natively enabled.

## Finding-to-evidence map

| Finding | Required repair | Iteration-2 rendered evidence | Deterministic confirmation |
|---|---|---|---|
| `finding-001` | Initial error viewport must state what is blocked, explain senior approval, and show disabled approval beside enabled report download. | `evidence/error-390x844.png` visibly starts with `Approval permission required`, the senior-registrar explanation, a muted disabled `Approve transfer`, an outlined active `Download condition report`, and helper copy. This composition is clearly distinct from `evidence/default-390x844.png`. | At 390x844, alert bounds are top 112 / bottom 232; both action bounds are top 248 / bottom 312; helper bounds are top 322 / bottom 357. All are wholly inside the initial 844px. `approve.disabled=true` with native `disabled`; `download.disabled=false` with no `disabled` attribute. |

## Rendered evidence

Exact capture command:

```bash
node projects/agentic-design-system/.worktrees/v1.3.1-expanded-benchmark-source/skills/design-review/scripts/capture.mjs \
  "file:///Users/moltbot/clawd/memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/museum-loans/artifact/index.html" \
  --states default,loading,empty,error \
  --breakpoints 390x844,1280x800 \
  --out memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/museum-loans/iteration-2/evidence \
  --selectors '.record-shell,.decision-panel,#approve-transfer,#download-report'
```

Final rendered result:

- 8 snapshots captured: default, loading, empty, and error at 390x844 and 1280x800.
- Axe available: yes; serious/critical violations: 0.
- Horizontal overflow: none.
- Main landmark failures: none.
- Loading/error live-region failures: none.
- Touch targets under 44x44: none.
- CLS available for every snapshot; maximum 0.00000; failures: none.
- State rendering: all four requested states confirmed.

Gate assertion:

```bash
jq -e '.gates.axeAvailable == true and .gates.seriousAxeViolations == 0 and
  (.gates.horizontalOverflowAt|length)==0 and (.gates.landmarkFailures|length)==0 and
  (.gates.liveRegionFailures|length)==0 and (.gates.touchTargetsUnder44|length)==0 and
  .gates.clsAvailable == true and (.gates.clsFailures|length)==0 and
  (.gates.stateRendered.default and .gates.stateRendered.loading and
   .gates.stateRendered.empty and .gates.stateRendered.error)' \
  memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/museum-loans/iteration-2/evidence/evidence.json
```

Result: `true`, exit 0.

## Screenshot inspection

All 8 iteration-2 screenshots were opened and inspected at original detail. Default, loading, and
empty remain visually unchanged at mobile and desktop. Desktop error preserves the prior
asymmetric condition/custody and decision-panel behavior. Mobile error now opens with a compact
permission decision docket, keeps both 64px-tall actions comfortably tappable, and then returns to
the intact object, handling note, and complete four-step custody trail in one continuous spine.

No clipping, overlap, unintended horizontal scroll, broken wrapping, duplicate controls, or
decorative regression was observed.

## Native adjacent-action sweep

| State | Breakpoint | Approve transfer | Download condition report | Copy / emphasis agreement |
|---|---|---|---|---|
| default | 390x844 | Visible native button; enabled; no `disabled` attribute | Visible native button; enabled; no `disabled` attribute | Filled approval and outlined report actions remain unchanged in the default decision section. |
| default | 1280x800 | Visible native button; enabled; no `disabled` attribute | Visible native button; enabled; no `disabled` attribute | Desktop default behavior is preserved. |
| error | 390x844 | Visible native button; `disabled=true`; native `disabled` attribute; 139x64 | Visible native button; `disabled=false`; no `disabled` attribute; 163x64 | Alert says permission is required and only a senior registrar can approve. Helper explicitly preserves report download. Both actions are in the initial viewport. |
| error | 1280x800 | Visible native button; `disabled=true`; native `disabled` attribute | Visible native button; `disabled=false`; no `disabled` attribute | Desktop error behavior, helper copy, and visual emphasis are preserved. |

Loading exposes no premature action and retains polite status/live semantics with `aria-busy`.
Empty exposes only the enabled `Open active loan` recovery action. No nearby control contradicts
its state contract.

A Playwright interaction probe clicked `Download condition report` in default and error at both
breakpoints. All four clicks produced `condition-report-NRM-1978-45.txt`, and all four pages
reported zero JavaScript errors.

## Source pre-flight

Commands rerun:

```bash
python3 projects/agentic-design-system/.worktrees/v1.3.1-expanded-benchmark-source/skills/design-review/scripts/anti-pattern-check.py \
  memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/museum-loans/artifact/index.html
python3 projects/agentic-design-system/.worktrees/v1.3.1-expanded-benchmark-source/skills/design-review/scripts/state-check.py \
  memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/museum-loans/artifact/index.html
python3 projects/agentic-design-system/.worktrees/v1.3.1-expanded-benchmark-source/skills/design-review/scripts/accessibility-check.py \
  memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/museum-loans/artifact/index.html
rg -n 'https?://|<link|<img|fetch\(' \
  memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/museum-loans/artifact/index.html
```

Results:

- State check: pass.
- Accessibility source check: pass, zero warnings and zero info findings.
- External network/asset scan: no matches.
- Anti-pattern heuristic: unchanged false-positive warning, `No responsive breakpoints`. The
  TSX/Tailwind-oriented regex does not recognize the document's plain CSS media queries; rendered
  mobile and desktop evidence remains authoritative and passes.

## Files changed

- `artifact/index.html`
- `iteration-2/evidence/default-390x844.png`
- `iteration-2/evidence/default-1280x800.png`
- `iteration-2/evidence/loading-390x844.png`
- `iteration-2/evidence/loading-1280x800.png`
- `iteration-2/evidence/empty-390x844.png`
- `iteration-2/evidence/empty-1280x800.png`
- `iteration-2/evidence/error-390x844.png`
- `iteration-2/evidence/error-1280x800.png`
- `iteration-2/evidence/evidence.json`
- `iteration-2/builder-report.md`

Iteration-1 artifacts and receipts were not overwritten. `outcome.md`, benchmark contract,
grader receipts, and all paths outside the museum case were read-only.

## Deviations

- No deviation from the exact `finding-001` revision prompt.
- The advisory anti-pattern heuristic still cannot parse plain CSS media queries; authoritative
  rendered evidence passes at both requested breakpoints.
- No grading or self-scoring was performed. `SCORER_RESULT` remains `not_applicable`.

## Detail

The repair prioritizes permission safety only in the restrictive mobile state, leaving default
workflow emphasis untouched. The initial error viewport now answers all three operational
questions before any object details: approval is blocked, a senior registrar must approve, and the
condition report remains available. The record then continues with the same object identity,
condition warning, and custody history, so the safer hierarchy does not remove registrar context.
