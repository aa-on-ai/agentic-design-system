---
name: "ux-baseline-check"
description: "Define and verify applicable UI states, responsive and accessible behavior, and reusable component contracts for changed screens, flows, and primitives."
---

# UX Baseline Check

## Role and scope

The ADS state and component-contract owner. Select states from the requested behavior and product
contract, not every state that can be imagined. A tiny copy or spacing edit checks its affected
behavior without inventing loading, forms, permissions or additional screens. Use the ADS task
budget; this inventory is part of the same work/review pass, not a separate ceremony.

## Component contract before duplication

Before introducing a new reusable component or duplicating one, recover or define its contract
from existing code/types/stories. Do not require a separate document when those already answer:

- anatomy and content slots
- properties and meaningful variants
- applicable data, interaction, validation, loading, error, and success states
- responsive behavior at target breakpoints
- keyboard, pointer, touch, and semantic behavior
- the existing component and tokens it reuses

Every instance should follow the same contract. A component without this contract is not ready to proliferate.

## The State Inventory

Before any page or component is "done", verify each applicable state exists:

### 1. Data States
- [ ] **Empty** — no data yet. Helpful message + clear CTA, not a blank screen
- [ ] **Loading** — preserve content geometry and expose genuine pending work; do not delay cached/fast data to show a loader
- [ ] **Loaded** — the happy path, obviously
- [ ] **Error** — API failure, network issue. User-friendly message + retry action
- [ ] **Partial** — some data loaded, some failed. Don't hide what works
- [ ] **Long content** — what happens with 200 items? 2000-character names? Test it

### 2. Interaction States
- [ ] **Hover** — appropriate pointer feedback; do not make touch or keyboard use depend on it
- [ ] **Focus** — keyboard navigation works, focus rings visible
- [ ] **Active/pressed** — buttons respond to clicks visually
- [ ] **Disabled** — native semantics and a legible state; explain the reason in persistent nearby copy when needed, not a tooltip that requires focusing a disabled control
- [ ] **Selected** — multi-select, current tab, active filter all visually distinct

### 3. Form States
- [ ] **Validation** — timely field-level guidance, with blur/submit timing suited to the task; do not reject unfinished input prematurely
- [ ] **Required fields** — clearly marked
- [ ] **Success feedback** — user knows their action worked (toast, inline, redirect)
- [ ] **Destructive recovery** — prefer undo for reversible actions; confirm genuinely irreversible or consequential actions, retaining the product’s authority model
- [ ] **Autofill** — doesn't break layout when browser autofills

### 4. Responsive

Use supported target breakpoints; these are example widths, not four mandatory captures:
- [ ] **Mobile (375px)** — usable, not just visible. Touch targets ≥48px with ≥8px spacing between them
- [ ] **Tablet (768px)** — layout adapts, not just shrinks
- [ ] **Desktop (1280px)** — the primary target, looks intentional
- [ ] **Wide (1800px+)** — content doesn't stretch absurdly. Max-width or centered

### 5. Accessibility
- [ ] **Keyboard nav** — can reach all interactive elements with Tab
- [ ] **Screen reader** — semantic HTML, aria-labels on icons, alt text on images
- [ ] **Color contrast** — measure final composited colors against the applicable text/control requirement; do not assume opacity percentages prove contrast
- [ ] **No color-only indicators** — don't rely solely on red/green for status

### 6. Edge Cases
- [ ] **First-time user** — onboarding or empty state guides them
- [ ] **Permission denied** — user sees why they can't access, not a broken page
- [ ] **Stale data** — timestamps or refresh indicators when data might be outdated
- [ ] **Concurrent edits** — what happens if two people edit the same thing?

## Adjacent-action consistency

For changed readonly, disabled, offline, permission-limited or destructive states, inspect every
nearby primary, secondary, toolbar and inline action at the affected breakpoints. Labels, emphasis,
enabledness, native semantics and helper text must agree with the state. Remove, disable, relabel
or explain a contradiction while preserving valid actions in unaffected states. Verify again after
repair; fixing only the named control is insufficient.

## Use within the ADS pass

Identify applicable states before implementation and exercise them before the design verdict.
A small form change still needs its relevant form/accessibility checks; a static page does not
need fabricated async states. Required missing states stay open and block claiming the feature
complete. Record unavailable evidence or an intentional product deferral separately from a pass.
Use a real browser for meaningful interaction changes, including the target mobile/WebKit surface
when applicable. Source strings and screenshots alone do not establish state transitions.
