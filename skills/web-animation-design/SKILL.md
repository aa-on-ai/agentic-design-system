---
name: web-animation-design
description: "Design, implement or diagnose a scoped web-motion task involving timing, easing, interruption, gestures or animation performance. Skip general UI work covered by the baseline motion reference."
metadata:
  short-description: Design and implement web animations that feel natural and purposeful
---

# Web Animation Design

## Scope and ownership

Use when the task involves animation, motion or interaction feel, or ADS identifies a specific motion defect. For ordinary UI work, the [baseline motion reference](../design-review/references/motion.md) is sufficient. ADS owns the task, authority, review and repair budget; this is its implementation specialist, not a second harness.

Start from the actual request and existing primitive, states and project tokens. Identify the state, hierarchy, causality or feedback job. Preserve clear static feedback when motion would add no value. A review request stays read-only; an implementation request proceeds within its existing authorization. Do not replace an actionable request with a generic readiness response.

The examples below are implementation options informed by Emil Kowalski's "Animations on the Web" course, not a required aesthetic or dependency set. Numeric examples are starting points only where project tokens do not already define the decision.

## Review output

Report observed behavior, the relevant state/element, proposed change and evidence limits in the task's existing review. A before/after table helps compare several findings; a single defect needs no format ceremony. Separate deterministic state/timing checks, actual browser interaction, measured performance and the user's judgment of clarity and feel.

## Choose the existing implementation route

- Preserve the existing component and motion library. Do not install or migrate a dependency merely to follow an example; verify the installed package/version and its supported API.
- For interactive hover, press and open/close state changes, prefer CSS transitions when sufficient. They can retarget from the current interpolated state.
- Keyframes describe a timeline, useful for deliberate sequences or real loading loops. They do not automatically retarget to a changed endpoint like a transition. Cancellation, reversal or retargeting needs explicit orchestration.
- Use an existing Motion/animation-library route for gesture physics, coordinated exits or shared layout when that complexity is justified. Neither CSS nor JavaScript alone guarantees compositor execution.

Check reduced motion and retain the accessible primitive's focus, keyboard, hidden-content and unmount lifecycle. The Motion examples below use `motion/react`; adapt to the package actually present rather than silently changing imports or dependencies.

## Quick Start

When project tokens do not settle the choice, these are starting points:

1. **Is this element entering or exiting?** → Use `ease-out`
2. **Is an on-screen element moving?** → Use `ease-in-out`
3. **Is this a hover/color transition?** → Use `ease`
4. **Is this a high-frequency control?** → Prefer immediate/static feedback; add motion only for a concrete comprehension need

## The Easing Blueprint

### ease-out (Most Common)

Use for **user-initiated interactions**: dropdowns, modals, tooltips, any element entering or exiting the screen.

```css
/* Sorted weak to strong */
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
--ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
--ease-out-circ: cubic-bezier(0.075, 0.82, 0.165, 1);
```

Why it can work: Faster initial movement makes the response apparent quickly. The element "jumps" toward its destination then settles in.

### ease-in-out (For Movement)

Use when **elements already on screen need to move or morph**. Mimics natural motion like a car accelerating then braking.

```css
/* Sorted weak to strong */
--ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);
--ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
--ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
--ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1);
--ease-in-out-expo: cubic-bezier(1, 0, 0, 1);
--ease-in-out-circ: cubic-bezier(0.785, 0.135, 0.15, 0.86);
```

### ease (For Hover Effects)

Use for **hover states and color transitions**. The asymmetrical curve (faster start, slower end) feels elegant for gentle animations.

```css
transition: background-color 150ms ease;
```

### linear (Constant speed or direct mapping)

Useful for constant-speed motion, truthful time/progress visualization, or direct scroll/gesture mapping. Do not add smoothing lag to a control that should track input directly.

### ease-in (Almost Never)

Avoid a slow-start curve when it delays user feedback. An intentional departure may warrant a different curve; preserve the existing interaction semantics and inspect the result.

### Paired Elements Rule

Coordinate related elements so they feel like a unit. Shared easing/duration is a useful starting point; a purposeful overlay/content asymmetry is valid if it preserves the existing component lifecycle.

```css
/* Both use the same timing */
.modal {
  transition: transform 200ms ease-out;
}
.overlay {
  transition: opacity 200ms ease-out;
}
```

## Timing and Duration

## Duration Guidelines

| Element Type                      | Duration  |
| --------------------------------- | --------- |
| Micro-interactions                | 100-150ms |
| Standard UI (tooltips, dropdowns) | 150-250ms |
| Modals, drawers                   | 200-300ms |

**Product defaults, not universal limits:**
- Keep product-control motion brief, normally within 100–300ms, with no bounce or elastic overshoot
- Larger elements animate slower than smaller ones
- Exit animations can be ~20% faster than entrance
- Match duration to distance and task frequency; do not delay usable content
- A longer gesture settle or expressive brand sequence needs support from the approved brief and inspection in context. It is not the default for adjacent controls

### The Frequency

Determine how often users will see the animation:

- **High frequency** → No added animation or minimal feedback
- **Occasional use** → Standard animation
- **Rare/first-time** → Can be more special

For example, a frequently opened command palette may benefit from appearing immediately.

## When to Animate

**Do animate:**

- Enter/exit transitions for spatial consistency
- State changes that benefit from visual continuity
- Responses to user actions (feedback)
- Rarely-used interactions where delight adds value

**Don't animate:**

- Repeated keyboard navigation or focus movement where animation delays response
- Hover effects on frequently-used elements
- High-frequency controls whose static feedback is already clear
- When speed matters more than smoothness

**Marketing vs. Product:**

- Marketing: More elaborate, longer durations allowed
- Product: Fast, purposeful, never frivolous

## Spring Animations

Springs can preserve a gesture's momentum and retargeting. They are an option, not inherently better than a short transition; duration-based and physics-based configurations behave differently.

### When to Use Springs

- Drag interactions with momentum
- Gestures that can be interrupted mid-animation
- A specifically approved expressive interaction where a spring serves the brief

### Configuration

**Duration-based, non-bouncing product example (adapt to installed API/tokens):**

```js
// Duration + bounce (easier to understand)
{ type: "spring", duration: 0.25, bounce: 0 }
```

**Traditional physics:**

```js
// Mass, stiffness, damping (more complex)
{ type: "spring", mass: 1, stiffness: 100, damping: 20 }
```

### Bounce Guidelines

- Baseline product motion has no bounce or elastic overshoot.
- A gesture/boundary response or brand expression may use a restrained exception only when the approved brief supports it. “Playful” alone does not authorize adding bounce everywhere.
- Judge the selected parameters in the actual interaction; numeric bounce ranges are not taste approval. Preserve immediate feedback and reduced-motion behavior.

### Interruptibility

Some spring implementations preserve current velocity when retargeted; verify the installed API. CSS transitions also retarget interactively. Do not confuse them with replaying a keyframe timeline from its authored start.

Exercise close/reopen/close inside the animation window. The latest intent must win without an obsolete callback clearing a newer state. Cancel or invalidate stale work on retarget/unmount, and handle zero-duration reduced-motion paths without waiting for an event that may not fire. Keep state cleanup in the existing primitive.

## Layout Animations (Framer Motion)

Motion layout projection can animate the visual result of size/position changes, including discrete layout changes such as `flex-direction`. It does not turn those CSS properties into directly interpolable values.

### The `layout` Prop
Add `layout` to any `motion.*` element to auto-animate layout changes:
```jsx
<motion.div layout className="element" />
```
The library measures supported layout changes and animates their visual result. Inspect child distortion, clipping, scrolling and performance in the actual consumer; the prop is not a smoothness guarantee.

### Shared Layout Animations (`layoutId`)
Connect two separate elements so one morphs into the other:
```jsx
// Tab highlight: only rendered for active tab
{activeTab === tab ? (
  <motion.div layoutId="tab-indicator" className="highlight" />
) : null}
```
Use cases: tab highlights, card → modal expansion, button → popover morph, trash interaction (images move between containers).

**Creative trick:** `layoutId` creates illusions. The feedback popover's "placeholder" is actually a `<span>` with a shared `layoutId`: not a real textarea placeholder. It morphs from button text to popover text.

### Dynamic Height Animation
When dynamic content needs an explicitly measured height, reuse a measurement facility already in the project; `react-use-measure` is one option if installed:
```jsx
import useMeasure from "react-use-measure";
const [ref, bounds] = useMeasure();

<motion.div animate={{ height: bounds.height }}>
  <div ref={ref}>{dynamicContent}</div>
</motion.div>
```

Height animation affects layout. Use it only when spatial continuity warrants it and measure the target browser; do not add a dependency just for this snippet.

## AnimatePresence (Deep)

### Modes
- `"sync"` (default): enter and exit play simultaneously
- `"wait"`: exit completes before enter starts (copy/check icon swap)
- `"popLayout"`: removes exiting element from layout flow immediately (often the right choice for morphing UIs)

### Direction-Aware Transitions
Use the `custom` prop to pass dynamic data to exiting components (whose state is stale):
```jsx
<AnimatePresence mode="popLayout" custom={direction}>
  <motion.div
    key={step}
    custom={direction}
    initial="enter"
    animate="center"
    exit="exit"
    variants={{
      enter: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
    }}
  />
</AnimatePresence>
```

### Key Rules
- Always add `key` prop on animated elements inside AnimatePresence
- Use `initial={false}` to skip mount animation (icon swaps, button states)
- Reproduce rapid-switching defects in the installed version before changing orchestration. Do not apply a historical version pin as an automatic repair

## Motion Values & Hooks

Motion values can update outside React's render cycle. That avoids per-frame React state updates, but does not guarantee a frame rate.

### `useMotionValue`: Instant updates (gestures)
```jsx
const x = useMotionValue(0);
// Update via x.set(newValue), read via x.get()
<motion.div style={{ x }} />
```
Use for: direct gesture tracking (drag distance → scale), any 1:1 mapping where spring lag would feel disconnected.

### `useSpring`: Animated updates (follow-behind)
```jsx
const x = useSpring(0, { mass: 0.1, damping: 16, stiffness: 71 });
// x.set(newValue) animates to it with spring physics
```
Use for: cursor followers, momentum effects, anything that should trail behind input.

### `useTransform`: Map one value to another
```jsx
// Range mapping: y position [0, 300] → scale [1, 1.5]
const scale = useTransform(y, [0, 300], [1, 1.5]);

// Function form: format a value
const display = useTransform(angle, v => `${Math.round(v)}°`);
```
Use for: scroll-linked effects, cursor-distance effects, value formatting.

### `useMotionTemplate`: String interpolation with motion values
```jsx
const clipPath = useMotionTemplate`inset(0px ${percent}% 0px 0px)`;
<motion.div style={{ clipPath }} />
```

### `MotionConfig`: Default transitions for a subtree
```jsx
<MotionConfig transition={{ type: "spring", duration: 0.25, bounce: 0 }}>
  {/* All children use this transition unless overridden */}
</MotionConfig>
```

## Orchestration (Stagger & Sequencing)

Use stagger only when a short sequence improves reading order or an approved expressive beat. Keep real content and actions available without waiting for the sequence.

### CSS stagger (no library):
```css
.item { animation: fadeSlideIn 200ms ease-out both; }
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
/* etc. */
```

### FM stagger:
```jsx
const container = {
  animate: { transition: { staggerChildren: 0.05 } }
};
const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};
```

**Rules:**
- Keep delays small (30-80ms between items)
- Include the last item's duration when bounding total sequence time: 10 items with 80ms between starts and 200ms duration take 920ms, too slow for a routine control
- Marketing pages can be more elaborate; product UI should be fast

## Brand Expression Through Animation Speed

Timing can reinforce an approved brand direction:
- **Speed:** immediate or very fast feedback.
- **Deliberate:** a restrained expressive transition where it does not delay the task.
- **Playful:** a narrowly scoped spring or morph, with any bounce exception justified by the brief.
- **Product UI** should generally feel fast regardless of brand.
- **Marketing pages** are where you express brand personality through motion.

## Fluid Interfaces (Aspirational)

Fluid continuity is useful when it explains where something came from or went. It is not a requirement that everything morph, and simple appearance may be clearer.

- Shared layout animations are the web's closest tool to native fluidity
- Check perceived continuity against actual task speed; do not assume animation makes latency acceptable
- Consider continuity during an authorized composition decision; do not rearrange the existing UI just to showcase a morph
- Text morphing (e.g., button label changes) highlights state changes subtly

## Performance

Prefer `transform` and `opacity` for motion when they express the intended change. They often avoid layout work and are good compositor candidates, but the browser, animated content, library implementation and device determine the actual execution path. A CSS declaration or library prop is not a GPU/frame-rate guarantee. See the [Motion performance guide](https://motion.dev/docs/performance).

- Height, width, padding and margin animation can require layout; use only for a justified spatial change and measure the real consumer.
- Blur/filter cost depends on the painted area, radius, device and browser. There is no universally safe 20px cutoff. Do not use blur to conceal an unresolved transition or state defect.
- Keep per-frame changes local. Inherited custom-property updates can broaden style work; preserve project tokens and inspect affected descendants before changing the approach.
- Avoid per-frame React state updates when direct motion values or a supported animation API suffice. Neither every React render nor every JavaScript animation necessarily drops a frame.
- Add `will-change` only for an observed issue when measurement supports it, limited to the relevant elements/lifetime. It is a hint with memory and stacking-context costs, not forced GPU execution. See [MDN will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change).

Record the actual browser/device, interaction and performance trace when performance is a claim. Check desktop and target mobile/WebKit for justified layout or blur motion; a build, transformed still or successful dependency import is not that evidence.

## Accessibility

Animations can cause motion sickness or distraction for some users.

### prefers-reduced-motion

Honor the preference through the existing CSS or library mechanism. For a decorative CSS animation, a scoped fallback can disable it:

```css
.modal {
  animation: fadeIn 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .modal {
    animation: none;
  }
}
```

### Reduced Motion Guidelines

Reduced motion must retain state and feedback, not necessarily animation. A static change is valid; a short fade is optional if appropriate, not a universal fallback.

- **Remove:** transform-based movement, scaling, sliding, parallax
- **Retain:** visible state, focus and truthful status; use static feedback or a suitable brief fade
- **Optional replacements:** slide-in → fade-in, scale → opacity, complex → static or simple
- Disable autoplay on videos/animated images; show play buttons instead
- Stop decorative loops and show a chosen static frame. A negative animation delay alone does not pause an animation

### Framer Motion Implementation

**Option 1: Per-component hook**
```jsx
import { useReducedMotion } from "motion/react";

function Component({ isOpen }) {
  const shouldReduceMotion = useReducedMotion();
  const closedX = shouldReduceMotion ? 0 : "-100%";

  return (
    <motion.div animate={{
      opacity: isOpen ? 1 : 0,
      x: isOpen ? 0 : closedX
    }} />
  );
}
```

**Option 2: Existing subtree configuration**
```jsx
import { MotionConfig } from "motion/react";

// Honors the user preference for Motion transform/layout animation in this subtree
<MotionConfig reducedMotion="user">{children}</MotionConfig>
```
Use or extend the existing configuration within scope, not a duplicate app wrapper. The documented default is `"never"`; `"user"` disables transform/layout animation, while other values may still animate. Inspect opacity, color, timing and any CSS/third-party loops separately. See [MotionConfig documentation](https://motion.dev/docs/react-motion-config). These snippets describe motion only, not a complete accessible modal lifecycle.

### Touch Device Considerations

```css
/* Disable hover animations on touch devices */
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    transform: scale(1.05);
  }
}
```

Touch devices trigger hover on tap, causing false positives.

## Practical Tips

Quick reference for common scenarios. See [PRACTICAL-TIPS.md](PRACTICAL-TIPS.md) for detailed implementations.

| Scenario                        | Solution                                        |
| ------------------------------- | ----------------------------------------------- |
| Press feedback is missing       | Preserve static feedback first; use scoped scale only if justified |
| Element appears from nowhere    | Start from `scale(0.95)`, not `scale(0)`        |
| Shaky/jittery animations        | Inspect layout, snapping and rendering before testing a hint |
| Hover causes flicker            | Animate child element, not parent               |
| Popover scales from wrong point | Set `transform-origin` to trigger location      |
| Sequential tooltips feel slow   | Skip delay/animation after first tooltip        |
| Small buttons hard to tap       | Preserve the shared target-size primitive; avoid overlapping hitboxes |
| Something still feels off       | Record/retrigger and inspect the state and geometry before adding effects |
| Hover triggers on mobile        | Use `@media (hover: hover) and (pointer: fine)` |

## Easing Decision Flowchart

Is the element entering or exiting the viewport?
├── Yes → ease-out
└── No
├── Is it moving/morphing on screen?
│ └── Yes → ease-in-out
└── Is it a hover change?
├── Yes → ease
└── Is it constant motion?
├── Yes → linear
└── Default → ease-out

## Reference Files

- [PRACTICAL-TIPS.md](PRACTICAL-TIPS.md): read only the relevant implementation recipe.
- [Transitions candidate](references/transitions-candidate.md): consult only when one pinned recipe addresses a specific motion gap; assessed, not adopted or installed.

---
