# Motion Reference

## Core Rules
- Motion should clarify state, not audition for a dribbble reel.
- Fast enough to feel responsive, slow enough to feel intentional.
- If the motion draws more attention than the content change, it's wrong.
- No bounce. No elastic. No novelty easing.

## Timing
- 150-200ms for micro-interactions: hover, press, opacity, color, icon shifts.
- 200-250ms for control state changes: tabs, toggles, small reveals.
- 300ms for layout transitions: drawers, accordions, panels, filter bars.
- 400ms+ only for deliberate entrance moments or storytelling, not routine UI.
- Exits should usually be faster than entrances.

## Easing
- Prefer refined ease-out curves for entrances and micro-polish.
- Prefer ease-in for exits when something is leaving.
- Prefer ease-in-out for toggles that need symmetry.
- Good defaults: quart/quint/expo-style curves, not generic `ease`.
- The goal is smooth deceleration, not spring theater.

## Property Choice
- Animate transform and opacity first.
- Avoid animating width, height, padding, margin, top, left unless there's no better option.
- For accordions and collapses, prefer grid or transform-based patterns over raw height animation.
- Keep motion tokens centralized if the codebase supports them.

## Interactive Feel
- Hover should feel like acknowledgement, not a stunt.
- Pressed states should feel slightly faster and firmer than hover.
- Stagger only when it improves comprehension or delight.
- Cap stagger so lists do not feel laggy.
- Loading motion should reassure, not distract.

## Reduced Motion
- Support `prefers-reduced-motion`. Non-negotiable.
- Replace movement with fades when possible.
- Keep functional feedback even when spatial motion is reduced.
- Avoid large parallax, zooming, or sweeping motion in core UX.

## Performance & Perception
- Immediate feedback matters more than elaborate animation.
- For micro-feedback, aim near the instant-feeling threshold.
- Skeletons usually feel better than blank loading or generic spinners.
- Motion can mask tiny waits, but should not hide real slowness.

## What Good Looks Like
- The interface feels responsive and expensive.
- Hover, focus, and open/close states feel consistent across the product.
- Nothing jiggles, boings, or overshoots like a toy.

## Avoid
- Bounce or elastic easing.
- 500ms hover transitions.
- Animating everything because it feels unfinished without motion.
- Motion that breaks when reduced-motion is enabled.
- Using animation to cover weak IA or weak hierarchy.
