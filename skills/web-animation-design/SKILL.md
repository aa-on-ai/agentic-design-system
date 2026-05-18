---
name: web-animation-design
description: >
  Creative-pack skill for web animation, motion, easing, timing, springs,
  transitions, keyframes, cubic-bezier, hover effects, gestures, interaction
  feel, Framer Motion, GSAP, reduced motion, jank, and animation performance.
  Use only when the task explicitly involves motion.
metadata:
  short-description: Design and implement purposeful web animation
---

# Web Animation Design

This is not part of the default UI path. Use it when animation is the work,
or when the user asks for motion, easing, smoothness, transitions, springs,
microinteractions, gestures, or animation performance.

## When To Use

- Easing, duration, spring, keyframe, transition, hover, or gesture decisions.
- Framer Motion, GSAP, CSS transitions, CSS keyframes, or cubic-bezier tuning.
- Modal, popover, drawer, tooltip, page transition, drag, or shared-layout animation.
- Debugging jank, flicker, shaky transforms, reduced-motion behavior, or perf issues.
- Reviewing whether motion helps or slows a product workflow.

## When Not To Use

- General UI building with no explicit motion requirement.
- Standard polish where design-review/references/motion.md is enough.
- Keyboard-heavy or high-frequency workflows where speed matters more than motion.

## First Decision

- Entering or exiting: use ease-out.
- Moving or morphing on screen: use ease-in-out or a spring.
- Hover or color transition: use ease.
- Constant-speed loop: use linear.
- Seen 100+ times per day: remove or drastically reduce motion.

## Tool Choice

- CSS transitions/keyframes: simple enter/exit, hover, perf-critical, predetermined loops.
- Framer Motion from motion/react: layout changes, AnimatePresence, layoutId, springs, gestures.
- Motion values: direct gesture tracking or cursor/scroll-linked effects.
- Avoid JS animation when CSS transform/opacity will do the job.

## Hard Rules

- Always support prefers-reduced-motion.
- Animate transform and opacity by default.
- Avoid animating layout properties, large blur filters, or deep CSS variables.
- Keep product UI motion under 300ms unless there is a deliberate exception.
- Exit animations can be about 20% faster than entrance.
- Elements that move together use the same easing and duration.
- Disable hover animations on touch devices.

## Review Format

When reviewing animation changes, use a compact table:

| Before | After |
| --- | --- |
| 400ms ease-in modal | 220ms ease-out modal |
| no reduced-motion path | fade-only reduced-motion path |

## References

- references/easing.md - easing, timing, duration, frequency
- references/framer-motion.md - layout, AnimatePresence, motion values, springs
- references/performance.md - GPU-safe properties, CSS vs JS, debugging
- references/accessibility.md - reduced motion and touch rules
- references/practical-tips.md - common implementation recipes

Load only the reference needed for the task. Do not paste the reference manual
back into the answer.
