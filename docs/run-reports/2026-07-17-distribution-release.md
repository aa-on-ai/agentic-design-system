# Phase 4: distribution release

Date: 2026-07-17
Issue: #40
Branch: `agent/phase-4-distribution`
Release target: `v1.1.0`

## Decision

Treat distribution as a release gate, not a documentation claim. ADS must install from a clean
project into every supported agent's actual skill directory before a tag is created.

The repository release line is `v1.1.0`. The Claude plugin had already shipped metadata at
`1.0.1`; `v0.1.0` would have been a semver downgrade even though the private root harness still
used that version.

## What changed

- Added a five-agent clean-project matrix for Claude Code, Codex, Cursor, OpenClaw, and Hermes.
- Added release metadata validation, a complete release gate, and GitHub Actions enforcement.
- Added canonical install, integration, changelog, release procedure, and v1.1.0 notes.
- Added `design-variations` to the Claude plugin manifest and aligned all repository release
  metadata at `1.1.0`.
- Replaced the orchestrator's hard-coded `.agents/skills/` assumption with portable paths relative
  to the installed skill.
- Added React and React DOM to the root eval harness so rendered tests work in a cold checkout.
- Updated esbuild to remove the root harness's moderate development-server advisory.

## Verification

- `npm ci`: clean install, zero audit vulnerabilities.
- `npm run release:check`: passed.
- Release metadata: v1.1.0, 10 installable skills, manifests aligned.
- Install smoke: 10 skills, 1 variation asset, 5 templates, and 6 runbooks in sync.
- Install matrix: 5/5 agents passed with expected destination paths and lockfiles.
- Compare smoke: 37/37.
- Render smoke: 12/12.
- Eval-loop render authority: 15/15.
- No paid generation or screenshot judging was used.

## Failed checks

- The first cold-checkout render smoke passed 6/7 because `react` and `react-dom` were absent from
  the root harness. Both variants skipped at bundle time. The dependencies were added and the
  final cold-checkout smoke passed 12/12.

## Release boundary

The tag and GitHub release must point at the merge commit after the release-gate check passes on
`main`. A fresh public-source install matrix is the final post-release check.
