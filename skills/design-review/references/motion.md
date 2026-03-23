# Motion Reference

## Core Rules
- Motion should clarify state, not audition for attention.
- If the animation is more noticeable than the change it is explaining, it is wrong.
- No bounce. No elastic. No toy physics.
- Exits should usually feel faster than entrances.

## What Good Motion Does
- Confirms hover, press, open, close, and state change without drama.
- Helps the user track what moved and why.
- Makes the interface feel responsive and expensive, not busy.
- Uses consistency across similar interactions so the product feels intentional.

## Interruptibility
- CSS transitions are interruptible — they retarget to the latest state mid-animation. Use for interactive state changes (hover, open/close, toggles).
- CSS keyframe animations are NOT interruptible — they run on a fixed timeline. Use for staged sequences that run once (entrance animations, loading loops).
- If a user can change their intent mid-interaction (opening then quickly closing a dropdown), the animation MUST be interruptible. Non-interruptible animations on interactive elements make the UI feel broken.

## Enter vs Exit
- Enter animations can be expressive: combine opacity, translateY, and blur. Break content into chunks and stagger them (title, then description, then buttons) rather than animating one big block.
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
