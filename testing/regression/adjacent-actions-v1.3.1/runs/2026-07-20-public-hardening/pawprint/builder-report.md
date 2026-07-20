# Pawprint v1.3.1 regression builder report

> Candidate rerun note, 2026-07-20: the public-hardening behavior-path changes only correct install
> inventory documentation. The frozen artifact was recaptured from the current behavior digest;
> all 8 rendered gates passed and all 8 screenshots compare perceptually identical to baseline.

- Timestamp: 2026-07-19T07:24:29Z
- Baseline: Pawprint v1.3.0 benchmark iteration 2
- Target finding: `pawprint-i2-001`
- Artifact SHA-256: `67ba4414157f9e69665ae392803a474204a657124a08bf96932797ac023751d3`

## Repair

The error state now disables both responsive header variants of the New walk action using native
button semantics. Desktop labels the visible action `New walk unavailable`; mobile exposes the
same reason through its accessible name. The visible disabled treatment removes primary emphasis,
while Retry remains active. Default, loading, and empty retain their active New walk actions.

## Source pre-flight

- `anti-pattern-check.py`: pass, 0 warnings
- `state-check.py`: pass, loading/empty/error present
- `accessibility-check.py`: pass, 0 warnings

## Rendered authority

- 8/8 screenshots captured at 390x844 and 1280x800 across default/loading/empty/error
- 0 serious/critical axe violations
- no horizontal overflow
- no missing `main` landmarks or required live regions
- all four states rendered distinctly
- no touch targets below 44x44
- max CLS 0.00000 against a 0.1 threshold
- evidence SHA-256: `cf42b2d951ce0047d03ea68ca5470c565f3feb3b3f66b4118de5deb1e2d9b414`

## Baseline comparison

- 8 pairs compared; 6 are identical
- default, loading, and empty are pixel-identical at both breakpoints
- error changed by 0.77% at 1280x800 and 0.011% at 390x844
- dimensions match for every pair; no incomparable evidence
- comparison SHA-256: `fde1e7b784dd42a766c4025831f078f92a4b54625452185a5e9df850128155d7`

## Builder stop

The named repair is implemented and evidence-complete. Final quality is reserved for the separate
ADS grader.
