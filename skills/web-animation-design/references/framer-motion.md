# Framer Motion Notes

Use Framer Motion, imported from motion/react, when CSS is not enough.

## Use It For

- layout animations
- shared element transitions with layoutId
- AnimatePresence enter/exit coordination
- spring physics and interruptible interactions
- gestures, drag, cursor follow, and motion values

## Layout

```jsx
<motion.div layout className="element" />
```

Use layout for size/position changes caused by state, content, or sibling
changes. Use layoutId for tab highlights, card-to-modal expansion, and other
shared-element illusions.

```jsx
{activeTab === tab ? (
  <motion.div layoutId="tab-indicator" className="highlight" />
) : null}
```

## AnimatePresence

- sync: enter and exit together.
- wait: exit completes before enter starts.
- popLayout: removes the exiting item from layout flow immediately.

Rules:

- Add stable key props to animated children.
- Use initial={false} for mount states that should not animate.
- Pass direction through custom when exit needs fresh state.

## Springs

Prefer duration + bounce for readable configs:

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

Use subtle bounce only when the interaction is playful or gesture-based. Most
product UI should use little or no bounce.

## Motion Values

- useMotionValue: direct gesture tracking, no React re-render loop.
- useSpring: follow-behind or momentum effects.
- useTransform: map one motion value to another.
- useMotionTemplate: build transform, clip-path, or CSS strings from values.

Use MotionConfig reducedMotion="user" at app level when Framer Motion is used
throughout an app.
