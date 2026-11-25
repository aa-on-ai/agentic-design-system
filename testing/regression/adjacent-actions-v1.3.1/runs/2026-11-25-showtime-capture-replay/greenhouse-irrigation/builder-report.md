# Showtime capture replay: greenhouse-irrigation

Claude Code (cloud session) replayed this case after the capture and guidance changes on branch
`showtime/skills-hardening`: capture now fails on unreachable or 4xx/5xx targets, records HTTP
status per snapshot, clears stale evidence, and adds `--as <state>`; the skills document the
`#state=` convention and the never-rule precedence for documented project decisions.

The artifact is reused unchanged from `2026-11-11-capture-routing-replay` (byte-identical
`artifact/index.html`); it was not newly generated under the revised guidance. All four states at
both breakpoints were recaptured with the revised CLI route (`run-capture.mjs`).

Equivalence with the prior capture: 8/8 render signatures and
8/8 rendered text samples match; every gate matches except
`renderedFonts`. Screenshots are not byte-identical (0/8): the prior run was captured on macOS and
this one on Linux Chromium, where `system-ui` resolves to a different font, so some lines wrap
differently and full-page heights change by up to 56px. A side-by-side review found the same
content, layout, states and action enablement.

The prior independent grade is reused on the basis of matching render signatures, text and gates,
not byte equality, and this case was not regraded. This verifies the revised capture route and
output preservation, not fresh agent generation or independent route selection.
