# Pawprint v1.3.1 regression builder report

> Candidate rerun note, 2026-08-05: the visual-integrity repair raises the shared rendered target
> gate from 44px to 48px without changing this frozen artifact. The artifact was freshly recaptured
> from behavior digest `4a2e53c1`; all 8 rendered gates passed and all 8 screenshots compare
> bit-for-bit identical to the prior passing run.

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
- no touch targets below 48x48
- max CLS 0.00000 against a 0.1 threshold
- evidence SHA-256: `97de660826e2c0207e26a5eb45dca3f3175705c10c6c4d29d2928403d3dbcfe4`

## Baseline comparison

- 8 pairs compared; all 8 are identical
- default, loading, empty, and error are bit-for-bit identical at both breakpoints
- strict comparison reports zero changed pixels across the full matrix
- dimensions match for every pair; no incomparable evidence
- comparison SHA-256: `063df6cc59f7874788bf47a39dfec22d2b2cd08e202c4940a4d6e77c4bc857a5`

## Builder stop

The named repair is implemented and evidence-complete. Final quality is reserved for the separate
ADS grader.
