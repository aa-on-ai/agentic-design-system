# ADS adjacent-action regression contract

This is the immutable v1.3.1 baseline for the adjacent-action consistency rule.

Every candidate rerun uses the same five outcomes, four states, two breakpoints, scoring weights,
rendered hard gates, and action contracts. In each restrictive error state, the named mutation must
be natively disabled while the legitimate adjacent action remains enabled. The mutation must still
be enabled in default. Pawprint's Retry control is intentionally error-only; the four transfer
cases require the preserved action in both default and error.

The baseline is checksum-locked. A behavior change never edits it. The run command creates a new
append-only packet under `runs/<run-id>/`, and CI compares that packet with the baseline. Subjective
score deltas are reported, not promoted into deterministic gates. Rendered failures, unresolved
major/blocker findings, missing cases, changed outcomes, contradictory mutations, and over-disabled
legitimate actions fail.

The suite gains a sixth domain only after a verified failure class appears that these five cases do
not represent. That expansion creates a new suite version rather than rewriting v1.3.1.
