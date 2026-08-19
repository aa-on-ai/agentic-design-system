# Foundation v2 run report

## Artifact state

- Local worktree `/Users/moltbot/clawd/.tmp/ads-foundation-20260818`
- Branch `agent/ads-foundation-20260818`
- Base commit `77ad47a1730fbe680a81744aec71125e03dd8805`
- Not committed, pushed, merged, published, or deployed

## Implemented

- Added machine-readable utility and expressive visual profiles
- Added a canonical visual foundation contract with allowed and forbidden examples
- Added evidence format 2 computed-style measurements in report-only mode
- Added positive and negative fixtures for deterministic and heuristic measurements
- Restored Pawprint direct hash routing for default, loading, empty, and error states
- Replaced Pawprint text symbols and status dots with project icons and readable labels
- Added a path-neutral installed capture wrapper
- Bundled routing, presets, schemas, and the visual contract with the orchestrator skill
- Made the five-agent installation matrix execute installed consumer commands
- Made the installation matrix resolve instructional references under every installer root
- Removed named-user assumptions from public skills and templates
- Added Pawprint Chromium and WebKit coverage to the GitHub release gate
- Added a browser assertion that mobile Pawprint content clears the fixed system navigation
- Added regressions for portable commands, public-language neutrality, staged enforcement,
  creative copy guidance, rubric-table shape, and the tracked evidence receipt

## Rendered evidence

- Packet `docs/foundation-v2/receipts/pawprint/evidence.json`
- Evidence format 2
- Eight screenshots across 390 by 844 and 1280 by 800
- All eight screenshots have unique SHA-256 hashes and render signatures
- Default, loading, empty, and error states all rendered distinctly
- Zero serious or critical axe violations
- No horizontal overflow
- No landmark or live-region failures
- No touch targets below 48 by 48
- Maximum cumulative layout shift 0
- No rounded single-edge borders
- No one-edge shadow candidates
- No forced uppercase
- No typography candidates
- No symbol-only controls
- No status-dot candidates
- No colon or em dash candidates
- Divider evidence remains contextual and report-only

## Verification

- Chromium Pawprint direct-state and tab-to-hash test passed
- WebKit Pawprint direct-state and tab-to-hash test passed
- Mobile system-navigation clearance passed in Chromium and WebKit
- Demo lint passed
- Demo production build passed
- Release check passed
- Five-agent installation matrix passed for Claude Code, Codex, Cursor, OpenClaw, and Hermes Agent
- All 22 `<skills-root>/...` references resolved under every installer root
- Frozen v1.3.1 packet verified unchanged
- Source accessibility, anti-pattern, and state checks passed
- `git diff --check` passed

## Independent review repair

- A fresh Hermy review rejected the first candidate with two medium findings
- Remaining literal `skills/...` and repo-only fixture paths made installed guidance non-portable
- The fixed mobile system navigation overlapped the Pawprint eyebrow in all four 390 by 844 captures
- This repair replaces installed guidance with resolvable `<skills-root>/...` references, adds
  five-target reference validation, gives Pawprint mobile and tablet content explicit shell
  clearance, adds a browser overlap regression, and recaptures the evidence packet
- The reviewer exhausted its tool limit before running npm or browser checks and did not write its
  requested durable result file. The final verification below reruns every skipped command.

## Review boundary

- The screenshots were inspected locally for state distinction, hierarchy, readability, responsive behavior, and the new visual contract
- The Next.js development toolbar appears in local screenshots and is not product interface
- No broad public-demo migration was attempted
- No heuristic visual-foundation finding was promoted to a release blocker
- No new example route was created
- Independent critic review and a new append-only candidate suite remain release gates

## Failed checks

- None in the final verification pass
