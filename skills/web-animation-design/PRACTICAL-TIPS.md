# Practical Animation Tips

Conditional recipes for a scoped motion task. Read only the relevant section under [web-animation-design](SKILL.md); preserve the existing accessible primitive, project tokens and task budget. Examples illustrate motion, not complete components or verified browser behavior.

## Recording & Debugging

### Record Your Animations

When something feels off but you can't identify why, record the animation and play it back frame by frame. This reveals details invisible at normal speed.

### Fix Shaky Animations

Inspect layout changes, fractional geometry, rasterization and layer behavior before attributing a shift to a rendering cause. Test a scoped hint only when the observed issue and measurement justify it:

```css
.element[data-motion-preparing] {
  will-change: transform;
}
```

Remove the temporary hint when no longer useful. `will-change` does not force GPU execution or prove smoothness, and excessive use can increase memory/rendering cost. See [MDN will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change).

### Take Breaks

Use a fresh look when it helps diagnose feel, within the existing task budget. Do not impose a multi-day review or new approval ceremony on a small correction.

## Button & Click Feedback

### Scale Buttons on Press

Preserve an existing clear pressed state. If tactile scale is justified, scope it to the intended control, not every button:

```css
.tactile-button:active {
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .tactile-button:active {
    transform: none;
  }
}
```

Retain the primitive's visible static pressed and focus feedback in both modes.

### Don't Animate from scale(0)

A large zoom from `scale(0)` can feel disconnected from a routine control; preserve the intended origin and context.

**Bad:**

```css
.element {
  transform: scale(0);
}
.element.visible {
  transform: scale(1);
}
```

**Good:**

```css
.element {
  transform: scale(0.95);
  opacity: 0;
}
.element.visible {
  transform: scale(1);
  opacity: 1;
}
```

For a routine popover, a small scale change plus opacity may preserve context better than a large zoom. This is not a requirement that all elements scale; a static appearance or fade may be clearer.

## Tooltips & Popovers

### Skip Animation on Subsequent Tooltips

First tooltip: delay + animation. Subsequent tooltips (while one is open): instant, no delay.

```css
.tooltip {
  transition:
    transform 125ms ease-out,
    opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* Skip animation for subsequent tooltips */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

Attribute names are illustrative. Check the installed primitive's documented state hooks; do not assume different libraries expose identical attributes. Preserve keyboard-triggered access and hidden-content semantics.

### Make Animations Origin-Aware

Popovers should scale from their trigger, not from center.

```css
/* Default (wrong for most cases) */
.popover {
  transform-origin: center;
}

/* Correct - scale from trigger */
.popover {
  transform-origin: var(--transform-origin);
}
```

**Radix dropdown-menu example (verify the installed primitive):**

```css
.popover {
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
}
```

**Other primitives:** use the actual documented origin variable, not a guessed shared name. A project adapter might expose:

```css
.popover {
  transform-origin: var(--transform-origin);
}
```

## Speed & Timing

### Keep Animations Fast

Keep product-control feedback brief, ordinarily 100–300ms with no bounce, using the project's purpose-matched tokens. Do not spin loaders faster or hide latency to imply faster data arrival.

Longer gesture settling or expressive brand sequences are exceptions supported by the approved brief, not defaults for controls. Include stagger delays in total time and never delay usable data to finish a reveal.

### Keep Keyboard Feedback Immediate

Arrow-key navigation and keyboard shortcuts can be repeated rapidly. Avoid animation that makes feedback lag behind those inputs.

Avoid delayed feedback for:

- List navigation with arrow keys
- Keyboard shortcut responses
- Tab/focus movements

Do not remove an accessible state change merely because the input came from a keyboard. A panel transition may be shared with pointer activation if it stays responsive and preserves focus, semantics and reduced motion.

### Be Careful with Frequently-Used Elements

A hover effect is nice, but if triggered multiple times a day, it may benefit from no animation at all.

**Guideline:** Use your own product daily. You'll discover which animations become annoying through repeated use.

## Hover States

### Fix Hover Flicker

When hover animation changes element position, the cursor may leave the element, causing flicker.

**Problem:**

```css
.box:hover {
  transform: translateY(-20%);
}
```

**Solution:** Animate a child element instead:

```html
<div class="box">
  <div class="box-inner"></div>
</div>
```

```css
.box:hover .box-inner {
  transform: translateY(-20%);
}

.box-inner {
  transition: transform 200ms ease;
}
```

The parent's hover area stays stable while the child moves. Put this motion-bearing hover rule behind the pointer-capability query below, and provide equivalent static focus feedback.

### Disable Hover on Touch Devices

Touch devices don't have true hover. Accidental finger movement triggers unwanted hover states.

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: scale(1.05);
  }
}
```

If using framework variants, inspect the generated selector/media query in the installed version rather than assuming it includes both capability conditions.

## Touch & Accessibility

### Ensure Appropriate Target Areas

Prefer the shared component's target sizing and spacing. A pseudo-element can enlarge the hit region without changing visible geometry, but must not overlap adjacent targets or intercept unrelated actions.

For a touch-oriented control, 44px is a useful product starting point, not a blanket statement of standards compliance. Preserve the actual project's accessibility requirements and verify hit regions in context.

```css
.touch-hitbox {
  position: relative;
}

.touch-hitbox::before {
  content: "";
  position: absolute;
  display: block;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  min-height: 44px;
  min-width: 44px;
}
```

Usage:

```jsx
<button className="touch-hitbox">
  <BellIcon />
</button>
```

## Easing Selection

### Use ease-out for Enter/Exit

Elements entering or exiting should use `ease-out`. The fast start creates responsiveness.

```css
.dropdown {
  transition:
    transform 200ms ease-out,
    opacity 200ms ease-out;
}
```

`ease-in` starts slowly, so avoid it when the delay obscures input feedback. Preserve the project's intentional entry/exit asymmetry where appropriate.

### Use ease-in-out for On-Screen Movement

Elements already visible that need to move should use `ease-in-out`. Mimics natural acceleration/deceleration like a car.

```css
.slider-handle {
  transition: transform 250ms ease-in-out;
}
```

### Use Custom Easing Curves

Use established project easing first. A custom curve is an option for a specific feel problem, not an automatic improvement over built-in CSS easing.

**Resources:**

- Relevant easing options live in [the motion skill](SKILL.md#the-easing-blueprint). Do not import a global token collection to change one transition.

## Visual Tricks

### Blur Is an Optional Effect, Not a Repair

First inspect state lifecycle, retargeting, geometry and timing. Use blur only when the selected reference or approved expressive brief needs it. Do not blur text or controls to conceal an unresolved defect.

```css
.expressive-layer {
  transition:
    transform 150ms ease-out,
    filter 150ms ease-out;
}

.expressive-layer[data-exiting] {
  transform: translateY(-2px);
  filter: blur(2px);
}
```

This effect still needs a scoped reduced-motion fallback that leaves state readable. Preserve the existing component's completion and focus handling.

**Performance:** measure the real surface on target desktop and mobile/WebKit. Radius alone is not a cost guarantee; painted area, device and browser matter. If useful evidence is unavailable, leave performance unverified and prefer the simpler effect.

## Lifecycle and Evidence

- Retrigger interactive motion inside its animation window, including close/reopen/close. A stale cleanup must not finish a newer close. Preserve cancellation/unmount handling and latest-user-intent state.
- Prefer the primitive's supported completion lifecycle. If a timer adapter is genuinely needed, read computed duration from the themed consumer, convert seconds and milliseconds correctly, and account for the actual delay/sequence. Test the zero-duration/reduced-motion path. Do not paste a `parseFloat` timeout from a recipe.
- Exercise pointer and keyboard activation, Escape, focus restoration and hidden-content tab order. Motion CSS alone does not supply these behaviors.
- Drive skeleton/content reveal from real async state. Check cached/fast and slow data, error/retry and long content without fixed demo waits or collapsed geometry.
- Capture normal, interrupted and reduced-motion behavior in the real browser. Stills prove composition only. Keep deterministic timing, browser interaction, performance and the user's clarity and feel judgment separate.

## Why Details Matter

> "All those unseen details combine to produce something that's just stunning, like a thousand barely audible voices all singing in tune."
> Paul Graham, Hackers and Painters

Details that go unnoticed are good—users complete tasks without friction. Great interfaces enable users to achieve goals with ease, not to admire animations.
