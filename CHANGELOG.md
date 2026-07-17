# Changelog

All notable changes to Agentic Design System are recorded here.

## [1.2.0] - 2026-07-17

### Added

- Lightweight decision provenance: pre-run hashes for observed vs. declared skill files, exact
  excerpt/source verification, evidence-linked report enrichment, and a 250ms deterministic
  overhead budget with no added model, browser, or network calls.
- A worked trace inside the existing loop demo and a smoke test that rejects invented excerpts and
  declared-only causal claims.

## [1.1.0] - 2026-07-17

### Added

- Ten installable skills covering orchestration, core review, production, reference, variation,
  personality, atmosphere, and motion workflows.
- Outcome, project identity, reference intake, grader, and run-report templates bundled with the
  installed orchestrator.
- Six runnable workflow runbooks bundled with drift checks against their canonical copies.
- Render-authoritative comparison gates for accessibility, overflow, touch targets, distinct
  states, screenshots, and unresolved judging.
- Clean-project installation matrix for Claude Code, Codex, Cursor, OpenClaw, and Hermes.
- Canonical installation and release guides plus an automated GitHub release gate.

### Fixed

- Added `design-variations` to the Claude plugin manifest and aligned release metadata at v1.1.0.
- Replaced the hard-coded `.agents/skills/` installed-path assumption with paths relative to the
  orchestrator skill, so instructions work across all supported agents.
