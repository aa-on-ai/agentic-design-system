# Anti-Patterns Reference

## Strategic Mistakes
- Centrifugal design: choices made to feel different or branded rather than clearer or better.
- Decoration used to compensate for weak structure.
- New patterns invented when the product already has a good one.
- Polishing a bad foundation instead of rebuilding the layout.

## Typography Mistakes
- Inter or system font defaults as unexamined autopilot.
- Mushy scales with too many neighboring sizes.
- Large type trying to rescue weak hierarchy.
- Monospace used as a shortcut for "tech" personality.
- Too many font families fighting for attention.

## Color Mistakes
- Purple gradients, cyan glows, and generic AI-saas palettes.
- Blue everywhere as the default accent.
- Gray text on colored backgrounds.
- Pure black, pure gray, or dead neutrals with no temperature.
- Accent color sprayed across icons, labels, chips, and borders until it means nothing.
- Color doing the job typography and spacing should be doing.

## Layout Mistakes
- Bootstrap cards as a default answer.
- Card nesting.
- Identical card grids repeated across the screen.
- Centering everything because it feels "clean."
- Equal spacing everywhere, so nothing groups or leads.
- Heavy borders and separators where whitespace would be stronger.
- Hero metric layouts that scream template.
- 4 equal-width stat cards across the top of every dashboard (the #1 agent layout cliche).
- Every page using the same card-in-grid structure regardless of content type.
- Dark mode as the default because "it's a dashboard" — light mode is equally valid.
- Sidebar navigation on pages with fewer than 5 sections.
- Every section having the same visual weight — nothing hero'd, nothing secondary.
- rounded-lg on every surface creating a puffy, toy-like feel.
- zinc/slate as the only background palette — agents default to this every time.

## Demo/Meta-Navigation Mistakes
- State toggles (happy/loading/empty/error) rendered inline as part of the UI — they must be floating overlays, clearly separate from the actual product surface.
- Context briefs or design notes leaking into the rendered page (e.g. "This should feel like..." appearing as UI text).
- Debug controls styled to match the product UI — they should look like developer tools, not product features.

## Interaction Mistakes
- Missing hover, focus, or active states.
- Bounce or elastic easing.
- Hover-only affordances on touch-first surfaces.
- Tiny click targets.
- Modals used because they were easier than solving the flow.
- Generic confirmation dialogs where undo would be better.

## Craft Mistakes
- Colored icon circles that weren't in the brief.
- Placeholder copy left in place.
- Random shadows, glows, and blur used as "polish."
- Decorative sparklines, charts, or gradients with no information value.
- Rogue spacing values and near-miss alignments.
- New CSS tokens invented instead of using the system that's already there.

## Context Mistakes
- Using Stripe/Linear/Vercel as default visual references when the prompt names a different company.
- Treating a named company as mere theming (slap a logo on a generic layout) instead of a visual source.
- Screens that could swap company names and still "work" — no visual specificity to the premise.
- Generic AI model names or outdated model lists (GPT-3.5, Claude 1, etc. when current models exist).
- Fake agency/company/user names with no domain grounding ("Agency X," "User A," "Model B").
- Dashboard nouns that could apply to anything: "users," "revenue," "metrics," "performance" with no domain flavor.
- Satirical premises rendered as bland enterprise software — missing the joke entirely.
- Humor injected as headlines or one-liners instead of embedded in the data model (row names, statuses, tags).
- "Professional" used as an excuse to strip all personality from a premise that demands it.
- Multiple pages built with the same system looking indistinguishable from each other.
- Borrowing visual language from a product unrelated to the one named in the prompt.

## Responsive Mistakes
- Desktop table simply squeezed onto mobile with tiny text.
- Sidebar still occupying width on small screens instead of collapsing to hamburger/bottom nav.
- Chips, tags, or badges overflowing their containers on narrow widths.
- Long model names or agency names causing horizontal overflow.
- Fixed-width elements that don't adapt below 640px.
- Touch targets under 44px on mobile.
- Nav that disappears on mobile with no replacement (hamburger, bottom tabs, etc.).

## Aaron-Specific Red Flags
- Anything that feels like AI slop.
- Anything crowded.
- Anything loud without being sharp.
- Anything branded at the expense of usability.
- Anything that could have been fixed by more restraint.
