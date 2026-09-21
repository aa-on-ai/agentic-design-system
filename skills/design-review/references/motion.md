# Motion Reference

## Core Rules
- Motion should clarify state, not audition for attention.
- If the animation is more noticeable than the change it is explaining, it is wrong.
- Utility controls favor restrained motion. Use springs or overshoot only when a gesture or brief-supported expressive context benefits; do not animate high-frequency controls by default.
- Exits should usually feel faster than entrances.

## What Good Motion Does
- Confirms hover, press, open, close, and state change without drama.
- Helps the user track what moved and why.
- Makes the interface feel responsive and expensive, not busy.
- Uses consistency across similar interactions so the product feels intentional.

## Interruptibility
- CSS transitions are interruptible — they retarget to the latest state mid-animation. Use for interactive state changes (hover, open/close, toggles).
- CSS keyframes run on an authored timeline; class toggles alone do not smoothly retarget it. Prefer transitions for ordinary interactive state changes, or explicitly implement cancellation/retargeting when a staged sequence needs it.
- If a user can change their intent mid-interaction (opening then quickly closing a dropdown), the animation MUST be interruptible. Non-interruptible animations on interactive elements make the UI feel broken.
- Test interactive motion twice inside its animation window. The second trigger must retarget from
  the current visual state or use a deliberate, documented debounce. A snap back to the authored
  start frame is a failure. Record the trigger timing and a short motion capture; when the trigger
  cannot be exercised, mark interruptibility `not verified`.

## Pointer capability

- Put motion-bearing `:hover` styles behind `(hover: hover) and (pointer: fine)` so coarse-pointer
  taps do not leave transformed or animated hover states behind.
- Put tap and press feedback in `:active`; do not depend on hover emulation for touch feedback.
- This rule applies to hover motion. Static hover color or underline changes remain a separate
  interaction judgment.

## Enter vs Exit
- Entrances can be expressive when the brief supports them. Opacity, offset, blur or stagger are options, not required layers; preserve immediate access to content and measure expensive effects.
- Exit animations should be subtler than enter. Use a small fixed offset (like -12px) instead of the full reverse movement. The element is leaving — it doesn't need the same attention as arrival.
- This asymmetry (expressive enter, subtle exit) is what makes motion feel polished rather than mechanical.

## Patterns Agents Miss
- Stagger only when it improves comprehension or delight. Do not make lists feel slow.
- Loading motion should reassure, not distract. Skeletons usually beat blank space or generic spinners.
- Reduced motion support is non-negotiable. Replace movement with fades when needed, but keep feedback.
- Motion cannot rescue weak IA, weak hierarchy, or weak copy.

## Avoid
- Long hover transitions.
- Animating everything because the static version feels unfinished.
- Overshoot, boing, or parallax in core product UX.
- Using motion to hide latency instead of fixing the experience.

## Motion vocabulary (shared language)

Use named patterns so review is promptable — "the sheet needs a **direction-aware transition**
with a reduced-motion fade," not "make it smooth." Vocabulary borrowed from animations.dev
(Emil Kowalski); ADS curates the review-relevant subset below and ties each name to a purpose.
The full lexicon (springs, scroll-driven, perf terms) lives at <https://animations.dev/vocabulary>.

**Every animation must serve one of four jobs. If it serves none, cut it.**
- **state** — show that something changed (open/close, selected, loaded)
- **hierarchy** — direct attention in sequence (what to read first)
- **causality** — connect cause to effect (this tap produced that panel)
- **feedback** — confirm the interface received the input

| pattern | job | default timing / easing | reduced-motion | evidence |
|---|---|---|---|---|
| **press/tap feedback** | feedback | project state token; subtle scale only if useful | static color/outline feedback; omit travel/scale when needed | actual active-state interaction |
| **ripple** | feedback | expand from tap point, ~200ms ease-out | keep, or replace with a static highlight | named + origin = tap point |
| **crossfade** | state | 150–200ms ease-out, paired in+out | keep (opacity is allowed) | both elements share timing |
| **enter/exit** | state | enter ease-out 200–250ms; exit ~20% faster, smaller offset | replace movement with fade | enter/exit asymmetry present |
| **accordion / collapse** | state | height 200–250ms ease-in-out | fade content, skip height travel if heavy | measured height, not snap |
| **layout animation** | causality | ease-in-out, match distance to duration | fade between states instead of moving | element identity preserved |
| **shared element transition** | causality | 250–300ms ease-in-out | crossfade the two elements | the element travels, not two copies |
| **direction-aware transition** | causality | forward/back move opposite ways, ease-out | fade, drop the directional offset | direction matches nav intent |
| **page / view transition** | causality | 200–300ms ease-out | fade only | route change is visibly connected |
| **origin-aware animation** | causality | scale from trigger, set `transform-origin` | fade | popover grows from its button, not center |
| **stagger** | hierarchy | 30–80ms between items, cap total < ~400ms | render all at once (no per-item delay) | order matches reading priority |
| **skeleton / shimmer** | state | sheen loop while loading | static skeleton, no sheen | shown during real load, not faked |
| **pulse** | hierarchy | gentle scale/opacity loop, sparing | freeze | used for one thing, not ambient noise |
| **shake / wiggle** | feedback | short jitter on error/reject | replace with color/static error | tied to a real rejection |
| **rubber-banding** | feedback | resistance + snap-back at scroll bounds | keep minimal or drop | only at true boundaries |

**Evidence for motion** = name the pattern, record its timing/easing values, and confirm a
`prefers-reduced-motion` fallback exists (a gate, not a nicety). When the motion is load-bearing
(it carries state or causality), exercise the interaction and attach a short capture or timing receipt. A
snippet records implementation, and a still records appearance; neither proves runtime motion. Retrigger interactive motion inside its animation window and
record whether it retargets, deliberately debounces, or snaps. For implementation depth, defer to
`web-animation-design`.
