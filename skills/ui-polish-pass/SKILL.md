---
name: ui-polish-pass
description: >
  Final visual polish pass for UI work. Use when a screen is functionally complete
  but needs spacing, hierarchy, alignment, and visual cleanup before presenting to Aaron.
  Triggers: "polish this", "tighten up the UI", "visual pass", "spacing feels off",
  "make it look professional", "it works but looks rough", "design polish",
  "before presenting to Aaron", final stage of any frontend sub-agent task.
---

# UI Polish Pass

The screen works. Now make it feel right. This is the difference between functional and professional.

## Core Lens
- Distill before decorating.
- Strip the screen to its essential structure, then add back only what earns its place.
- If a polish pass needs more color, more cards, and more chrome, it is probably not a polish pass.
- Use `/bolder` and `/quieter` as directional moves:
  - `/bolder` = increase contrast, hierarchy, or confidence without adding clutter
  - `/quieter` = remove noise, reduce emphasis, let the right thing lead

## The Pass (run sequentially)

### Pass 1: Spacing & Breathing Room
- [ ] Section spacing — major sections have clear visual separation (32-48px minimum between groups)
- [ ] Element spacing — consistent gaps within groups (use the project's spacing scale, usually 4/8/12/16/24)
- [ ] Edge padding — content doesn't touch container edges. Minimum 16px padding, 24-32px preferred
- [ ] The squint test — do clear groups emerge, or is it one undifferentiated blob?
- [ ] Remove, don't add — if two elements feel crowded, try removing one before adding more UI

### Pass 2: Typography Hierarchy
- [ ] One clear headline — the page has exactly one thing that reads as the primary heading
- [ ] Three levels max — heading, subheading, body. If you need more, the IA is probably wrong
- [ ] Weight before size — try bold before bigger. Try softer opacity before smaller
- [ ] No orphan labels — labels without content, headers without their section
- [ ] Consistent text styles — same content type uses the same style everywhere

### Pass 3: Alignment & Grid
- [ ] Left-align by default — center alignment is for special moments, not routine content
- [ ] Consistent gutters — columns have the same gap throughout
- [ ] Baseline alignment — text in adjacent columns sits cleanly together
- [ ] No rogue pixels — near-miss alignment reads cheap fast
- [ ] Max content width — prose doesn't exceed 65-75 characters per line

### Pass 4: Color & Contrast
- [ ] Restrained palette — use project colors only, don't improvise new ones
- [ ] Tinted neutrals — prefer slightly warm/cool neutrals over pure gray
- [ ] Hierarchy through opacity — secondary text at 60-70%, tertiary at 40-50% when appropriate
- [ ] No decoration color — color means action, status, selection, or rare emphasis
- [ ] Dark/light mode — if the project supports both, check both

### Pass 5: Interactive Feel
- [ ] Hover states exist — every clickable element acknowledges intent
- [ ] Transitions are smooth — 150-200ms for micro-interactions, ~300ms for layout changes
- [ ] Easing is refined — no bounce, no elastic, no novelty curves
- [ ] Cursor changes — pointer on clickable, not-allowed on disabled, grab on draggable
- [ ] Focus visible — tab through the page, always know where you are
- [ ] No dead zones — click targets are generous, not tiny islands of text

### Pass 6: Micro-Details
- [ ] **Tabular numbers** — any dynamically updating number uses `font-variant-numeric: tabular-nums` to prevent layout shift (counters, prices, stats, timers)
- [ ] **Text wrapping** — headings use `text-wrap: balance`, body text uses `text-wrap: pretty` to avoid orphans
- [ ] **Font smoothing** — root layout has `-webkit-font-smoothing: antialiased` for crisper text on macOS
- [ ] **Concentric border radius** — nested rounded elements have outer radius = inner radius + padding (see alignment.md)
- [ ] **Image outlines** — images on light backgrounds get a subtle `outline: 1px solid rgba(0,0,0,0.06)` for consistent depth
- [ ] **Icon animations** — icons that change state (open/close, play/pause) cross-fade with opacity + scale, not hard swap
- [ ] **Scale on press** — buttons use `scale(0.97)` on active state for tactile feedback, 100ms transition
- [ ] **No `transition: all`** — always specify exact properties (`transition-property: transform, opacity`)

### Pass 7: Final Proof
- [ ] Screenshot at 1x — does it still look professional at actual pixels?
- [ ] Compare to reference — side by side, honestly
- [ ] The 3-second test — can someone tell what the screen is for quickly?
- [ ] Would Linear or Vercel ship this?
- [ ] Final distill pass — what can you remove and make better at the same time?

## When NOT to Polish
- Prototypes Aaron hasn't aligned on yet
- Throwaway experiments or spikes
- Internal tools where speed matters more than beauty

Polish comes after structure is approved. Never polish a bad foundation.

## Speed Tips
- Fix spacing first — it solves half the problem
- Use the browser inspector grid overlay to check alignment
- Compare at actual viewport width, not narrow devtools panels
- If you're spending more than 15 minutes on polish, something structural is probably wrong
- If the UI feels weak, choose a direction: `/bolder` or `/quieter`, then commit
