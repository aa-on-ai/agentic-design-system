# Outcome: Trace 002 current proof

## Goal

Turn the frozen Pawprint v1.3.1 adjacent-action regression into a public, inspectable proof page.

## Success means

- The page uses the existing ADS workshop identity and does not change the homepage hero or assembly line.
- A first-time visitor can explain the failure, repair, preserved action, and verdict in under two minutes.
- Default and error screenshots at 390×844 and 1280×800 are visible on the page.
- Every public claim resolves to the frozen release packet or the fresh public-hardening rerun.
- The page passes rendered accessibility, overflow, touch-target, and responsive checks.
- The trace is available as machine-readable JSON at `/trace/002/trace.json`.

## Source truth

- Release: `v1.3.1` at `f7d9037012f4c730150b37fbcf86b510aedd6ecb`.
- Frozen suite: `testing/regression/adjacent-actions-v1.3.1/`.
- Case: `baseline/pawprint/`.
- Fresh rerun: `runs/2026-07-20-public-hardening/pawprint/`, committed at
  `7644d39ac371320b8f8ca712ce08c1396ff06f53`.
- Site baseline: `origin/main` at `ec27c2da6c0b245698cee5403e200ab97728eac9`.

## Visual direction

An audit sheet pinned inside the existing illustrated workshop: warm paper, restrained orange,
one evidence spine, and the real rendered interface as the dominant proof.

## Constraints

- Keep Trace 001 intact at `/trace`.
- Link the homepage footer to the current Trace 002.
- Do not invent findings, scores, screenshots, hashes, or grader language.
- Do not deploy or write to GitHub without Aaron's explicit approval.

## Stop when

Rendered receipts exist for mobile, tablet, and desktop; deterministic checks pass; and Aaron has a
specific publish decision.
