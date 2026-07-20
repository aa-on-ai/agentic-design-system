# Kitchen pass — iteration 1 builder report

> Candidate rerun note, 2026-07-20: the public-hardening behavior-path changes only correct install
> inventory documentation. The frozen artifact was recaptured from the current behavior digest;
> all 8 rendered gates passed and all 8 screenshots compare perceptually identical to baseline.

## Scope and source truth

- Built only `kitchen-pass/artifact/index.html` and this iteration's evidence/report output.
- Outcome: `kitchen-pass/outcome.md`.
- Benchmark contract: `BENCHMARK-CONTRACT.md`.
- ADS source: release worktree at `f7d9037012f4c730150b37fbcf86b510aedd6ecb`.
- Loaded the exact release copies of the ADS orchestrator and core design skills. Followed the routed layout, spacing, typography, color, alignment, responsive/mobile, UX-writing, mock-data, and anti-pattern references. No external exemplars or other benchmark cases were inspected.

## Build result

The artifact is a single local HTML document with inline CSS and JavaScript, no network calls, and no external assets. It provides a composed service-pass spine with a lead table/course, target fire timing, station readiness, specific upcoming tickets, and direct service actions. The four requested URL-hash states render from `#state=default|loading|empty|error`.

The restrictive state is explicit in words, symbol, native behavior, and visual treatment: the error alert explains that the order feed is offline, `Fire next course` has the native `disabled` attribute and disabled styling, and its helper text explains why. `Call station` remains a native enabled button with click feedback. In default, both actions are native enabled buttons with click feedback.

## Verification commands and results

Source pre-flight, run from `/Users/moltbot/clawd`:

```bash
python3 projects/agentic-design-system/.worktrees/v1.3.1-expanded-benchmark-source/skills/design-review/scripts/anti-pattern-check.py memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/kitchen-pass/artifact/index.html
python3 projects/agentic-design-system/.worktrees/v1.3.1-expanded-benchmark-source/skills/design-review/scripts/state-check.py memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/kitchen-pass/artifact/index.html
python3 projects/agentic-design-system/.worktrees/v1.3.1-expanded-benchmark-source/skills/design-review/scripts/accessibility-check.py memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/kitchen-pass/artifact/index.html
```

Results:

- Anti-pattern check: PASS, 0 warnings, 0 info.
- State check: PASS; loading, empty, and error source signals present.
- Accessibility source check: PASS, 0 warnings, 0 info.

Exact release capture:

```bash
node projects/agentic-design-system/.worktrees/v1.3.1-expanded-benchmark-source/skills/design-review/scripts/capture.mjs "file:///Users/moltbot/clawd/memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/kitchen-pass/artifact/index.html" --states default,loading,empty,error --breakpoints 390x844,1280x800 --out memory/artifacts/ads-v1.3.1-expanded-benchmark-2026-07-19/kitchen-pass/iteration-1/evidence --selectors "h1,.feed-status,#fireCourse,#callStation"
```

Rendered results from `evidence/evidence.json`:

- 8 snapshots captured across four states and two fixed breakpoints.
- Axe available: yes; serious/critical axe violations: 0.
- Horizontal overflow: none.
- Main landmark failures: none.
- Loading status/live-region failures: none.
- Error alert/assertive-live failures: none.
- Touch targets under 44×44: none.
- CLS available at all 8 snapshots; maximum CLS: 0; failures: none.
- State rendering: default, loading, empty, and error all confirmed.

The final capture's eight screenshots were each visually inspected. Mobile layouts preserve readable type, full-width 50px actions, ordered content, and clear status/copy without clipping or horizontal compression. Desktop layouts retain one dominant service spine and an intentional lead/action split; all four states are visibly distinct. Loading skeleton geometry remains stable, empty has a clear next-step explanation, and error makes the blocked mutation and preserved contact path unambiguous.

## Native interaction receipt

A Playwright DOM check was run at exactly `390x844` and `1280x800` for default and error, including live clicks on available actions.

- Default at both breakpoints: `Fire next course` disabled=false/native-disabled=false; `Call station` disabled=false/native-disabled=false. Both clicks produced specific live-region feedback.
- Error at both breakpoints: `Fire next course` disabled=true/native-disabled=true; `Call station` disabled=false/native-disabled=false. Clicking `Call station` produced “Calling fish station on the kitchen line…”.

## Adjacent-action sweep

### Default

- State contract: the order feed is live; order mutation and human coordination are both allowed.
- `Fire next course`: primary filled treatment, enabled native button, helper says which stations receive the fire, click confirms the Table 14 fire.
- `Call station`: outlined but visibly actionable, enabled native button, helper confirms availability, click initiates station-call feedback.
- Nearby readiness rows and sequence tickets are informational and do not impersonate actions.

### Loading

- State contract: authority is not established while orders sync.
- No mutation or contact controls are shown inside the loading state, so no premature action contradicts the status. The skeleton is inside a polite status region with `aria-busy="true"`.

### Empty

- State contract: there is no course waiting to fire, but station coordination remains available.
- No fire mutation is offered. `Call station` is visibly and natively enabled with helper copy and click feedback.

### Error

- State contract: order-feed mutation is blocked; human coordination remains allowed.
- `Fire next course`: visibly muted, native `disabled`, helper begins “Unavailable” and names the offline feed as the reason.
- `Call station`: outlined, full-contrast, native enabled button; alert and helper both explicitly say calling still works; click feedback confirms the station line path.
- Header status, assertive alert, stale-sync timestamp, button semantics, emphasis, and helper text all agree at both breakpoints. No other nearby visible action contradicts the offline state.

## Notes and boundaries

- Screenshot files are full-page captures taken from the required fixed viewports, so content-rich default/error PNG heights exceed the viewport height by design.
- `setup-capture.mjs --check` reported missing `pixelmatch` and `pngjs`, which are comparison-only dependencies used by `compare.mjs`. The requested `capture.mjs` ran successfully with Playwright and axe available, so no install or external mutation was needed.
- No grading or self-score was performed. Independent scoring remains outside the builder context.
- Release worktree git status was not modified. The benchmark artifact directory is output data outside the release worktree.
