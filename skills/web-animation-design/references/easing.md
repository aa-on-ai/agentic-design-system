# Easing, Timing, And Frequency

## Easing

Use easing by intent:

- ease-out: elements entering or exiting, dropdowns, modals, tooltips, popovers.
- ease-in-out: elements already on screen that move, resize, or morph.
- ease: hover states and gentle color/background transitions.
- linear: constant-speed loops, marquees, tickers, progress tied to time.
- ease-in: almost never for UI; the slow start makes feedback feel delayed.

Useful curves:

```css
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
--ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
--ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
```

## Duration

| Element type | Duration |
| --- | --- |
| Micro-interaction | 100-150ms |
| Tooltip, dropdown, popover | 150-250ms |
| Modal, drawer, larger surface | 200-300ms |

Rules:

- Larger elements can move slightly slower than small elements.
- Exit can be about 20% faster than entrance.
- Match duration to travel distance.
- Paired elements, such as modal and overlay, should share timing.

## Frequency

- Seen 100+ times/day: remove or reduce animation.
- Occasional: standard UI timing.
- Rare or first-time: can carry more personality.

Product UI should feel fast. Marketing motion can be more expressive when it
supports the brand rather than hiding weak structure.
