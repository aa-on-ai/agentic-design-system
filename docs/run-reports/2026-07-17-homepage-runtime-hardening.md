# Homepage runtime hardening

## Outcome

Goal: harden the recovered homepage runtime without changing the explanatory structure or reintroducing scroll choreography.

Success means:

- only the active theme hero is requested on first load
- mobile LCP is at most 2.5 seconds, CLS is at most 0.1, and tested interactions stay under 200ms
- Chromium and WebKit pass at 390, 768, and 1280px
- reduced motion, keyboard focus, copy feedback, and theme persistence pass
- the recovery visuals remain effectively unchanged

Stop when: the same production build has a before/after performance packet, a cross-browser interaction matrix, rendered captures, and a bounded next decision.

## Implementation

- Replaced two always-rendered priority hero images with one server-selected active image.
- Added responsive `sizes="100vw"` output and AVIF/WebP negotiation.
- Persisted theme choice in a cookie so the server renders the correct theme, preload, image, and toggle state before hydration.
- Kept the visible hero in place while the alternate theme image decodes after an explicit toggle.
- Removed the unused reveal-origin and resize event machinery from the theme toggle.
- Added copy failure feedback with a fixed-width live region.
- Disabled both Ember reactions and control transforms under reduced motion.
- Raised the assembly Ember above the intro layer so its direct-interaction button is actually clickable.
- Added repeatable runtime and browser hardening scripts.

## Performance receipt

Command:

```bash
npm run homepage:runtime -- http://127.0.0.1:3100 evidence/phase-2-runtime/<baseline|candidate>.json
```

Environment: Chromium 148, three runs per profile. Mobile is 390x844 at DPR 2 with 4x CPU slowdown, 150ms latency, 1.6Mbps down, and 750Kbps up. Desktop is 1280x900 with no synthetic throttling. Interaction timing covers theme toggle and install copy.

| Profile | Metric | Baseline median | Candidate median | Gate |
|---|---:|---:|---:|---:|
| Mobile | LCP | 3736ms | 2308ms | <=2500ms |
| Mobile | CLS | 0 | 0 | <=0.1 |
| Mobile | INP proxy | 64ms | 72ms | <=200ms |
| Desktop | LCP | 112ms | 120ms | <=2500ms |
| Desktop | CLS | 0 | 0 | <=0.1 |
| Desktop | INP proxy | 88ms | 56ms | <=200ms |

Mobile LCP improved 38.2%. The interaction variance stayed comfortably inside the 200ms gate.

### First-load hero request chain at 390px

| Theme | Baseline | Candidate |
|---|---|---|
| Light | light + dark, 399,242 transferred bytes total, WebP at 3840w | light only, 86,514 transferred bytes, AVIF at 828w |
| Dark | light + dark, 399,242 transferred bytes total, WebP at 3840w | dark only, 56,272 transferred bytes, AVIF at 828w |

Candidate cache header: `public, max-age=14400, must-revalidate`.

## Browser and interaction receipt

Command:

```bash
npm run homepage:hardening -- http://127.0.0.1:3100
```

Passed in Chromium and WebKit at 390x844, 768x1024, and 1280x900:

- one first-load hero matching the active and persisted theme
- no horizontal overflow or page errors
- full-page scroll with stable Ember transform and CLS 0
- five distinct ADS artifacts, orange release bay, no handoff, and no active station state
- reduced-motion Ember reactions and theme transitions disabled
- all 15 interactive controls keyboard-reachable with visible focus in Chromium
- copy feedback announced without resizing the install action

Existing checks also passed:

- `npm run homepage:smoke`
- `node testing/homepage-recovery-webkit.mjs`
- `npm run compare:smoke` (37/37)
- `npm run render-eval:smoke` (11/11)
- changed-file ESLint
- Next production build

Repo-wide ESLint remains red on the pre-existing Notion demo static-component errors outside this change.

The source-only state heuristics also flag missing loading, empty, and error strings on the static marketing page and its leaf controls. Those are advisory false positives for this surface, not rendered state failures. The authoritative browser gates are the six captures and interaction matrix above.

## Rendered evidence

Local packet:

- `evidence/phase-2-runtime/baseline.json`
- `evidence/phase-2-runtime/candidate.json`
- `evidence/phase-2-runtime/captures-light/`
- `evidence/phase-2-runtime/captures-dark/`

All six candidate captures have zero serious or critical axe violations, no horizontal overflow, and no touch targets below 44x44.

Perceptual comparison against recovery `671fc1f`:

- light: 0.040% to 0.062% changed pixels
- dark: 0.025% to 0.105% changed pixels

The small delta is limited to the hero encoding and the assembly Ember stacking fix. The five-artifact story, warm orange release treatment, spacing, typography, and breakpoints remain intact.

## Known tradeoff

Theme persistence is now server-readable, so app routes are request-rendered instead of fully static. This prevents the wrong theme, toggle state, or hero preload from being emitted before hydration. The measured homepage still passes the mobile LCP gate, but production deployment metrics should be checked after merge because edge cold-start behavior is not represented by local `next start`.
