# Motion Accessibility

Always support reduced motion. No exceptions.

## CSS

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

Reduced motion does not always mean no motion. It means removing motion that
causes discomfort while preserving comprehension.

## Replace

- slide with fade
- scale with opacity
- parallax with static positioning
- autoplay with a paused state and play control
- complex loops with a still frame

Keep subtle opacity, color, and background changes when they help comprehension.

## Framer Motion

```jsx
import { MotionConfig } from "motion/react";

<MotionConfig reducedMotion="user">{children}</MotionConfig>
```

For per-component control, use useReducedMotion and replace transform movement
with opacity-only states.

## Touch Devices

Only apply hover motion when hover is real:

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: scale(1.02);
  }
}
```

Keep touch targets at least 44px when motion or gesture controls are involved.
