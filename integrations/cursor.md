# cursor

how to wire the agentic design system into Cursor.

## setup

Cursor reads `.cursorrules` (or `.cursor/rules`) from your project root. this is where the design system hooks in.

### 1. copy skills into your project

```bash
cp -r skills/ /path/to/your/project/skills/
```

### 2. add to .cursorrules

paste the contents of `templates/agents-snippet.md` into your `.cursorrules` file.

minimal version:

```
## Design Quality Chain

Before presenting any visual/UI work, run the appropriate skill chain:

- New visual work → read and follow in order:
  1. skills/design-review/SKILL.md
  2. skills/ux-baseline-check/SKILL.md
  3. skills/whimsical-design/SKILL.md
  4. skills/web-animation-design/SKILL.md
  5. skills/ui-polish-pass/SKILL.md

- Modifying existing UI → read skills/design-review/SKILL.md (pre-flight only)
- Non-visual work → skip

Reference files: skills/design-review/references/ (load only what's relevant)
```

### 3. add brand guidelines

copy `templates/brand-guidelines-template.md` to your project root as `guidelines.md`.

Cursor's agent will reference this when making design decisions.

## cursor-specific notes

### composer vs tab

- **composer** (agent mode) is where the design system shines. it can read skill files, follow the chain, and apply quality gates.
- **tab** (autocomplete) won't engage with skills. it's still useful for code completion but won't run the design chain.

### context window

Cursor's context window is smaller than some alternatives. be strategic:
- don't ask it to load all skills at once
- reference specific skills: "read skills/web-animation-design/SKILL.md and add entrance animations to these components"
- the routing doc helps — agent only loads what the task requires

### .cursor/rules directory

if you prefer per-file rules, you can split the design chain into separate rule files:

```
.cursor/rules/
├── design-chain.md      # routing logic
├── design-review.md     # link to skill
└── brand-guidelines.md  # your tokens
```

this keeps `.cursorrules` clean and lets you toggle rules on/off.

## divergent exploration

```
I need a layout for the settings page. explore 3 different approaches:
1. sidebar navigation with content area
2. tabbed sections
3. single scrollable page with anchored nav

build all 3 as separate components with a selector to switch between them.
```

## tips

- **@-mention files** to ensure Cursor reads them: `@skills/design-review/SKILL.md check this component`
- **use notepads** for persistent design context that doesn't clutter .cursorrules
- **compound after sessions** — update anti-patterns.md when Cursor makes mistakes the gate should catch
