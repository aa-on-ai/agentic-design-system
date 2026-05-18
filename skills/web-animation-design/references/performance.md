# Animation Performance

## Golden Rule

Animate transform and opacity by default. These avoid layout and paint work and
are the safest path to smooth animation.

Avoid animating:

- padding, margin, height, width
- large blur filters, especially above 20px
- deep inherited CSS variables
- state-driven values that cause React renders on every frame

## CSS vs JavaScript

- CSS is best for simple, predetermined, perf-critical animations.
- JavaScript is best for dynamic, interruptible, gesture, and layout animation.
- Combine them: CSS for simple motion, Framer Motion for complex interaction.

## Jank Fixes

Use will-change when transform animations shift or flicker:

```css
.animated-element {
  will-change: transform;
}
```

Do not scatter will-change everywhere. Apply it to elements that actually animate.

## CSS Variable Gotcha

CSS variables inherit. Updating a variable high in a deep component tree can
recalculate styles for every child. For drag/scroll updates, prefer direct
transform styles on the animated element.

```jsx
// Better for hot paths
const style = { transform: `translateY(${distance}px)` };
```

## Debugging

- Record the animation and inspect it frame by frame.
- Check whether layout or paint is being triggered.
- Test under load, not only on an empty page.
- Review after a break if the motion still feels off.
