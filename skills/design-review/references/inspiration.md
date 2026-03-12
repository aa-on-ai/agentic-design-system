# Inspiration & Pattern Research Reference

## The Rule

before building anything visual, study how the best version of it already exists. don't invent from scratch. don't approximate from memory. find 2-3 real examples, understand what makes them work, then build with that knowledge.

## Research Tools

suggest these to the builder (human or agent) before starting:

| tool | what it's for | how to use it |
|------|--------------|---------------|
| [Mobbin](https://mobbin.com) | real app screenshots, searchable by pattern and flow | "search Mobbin for 'analytics dashboard' and share 2-3 that match what you want" |
| [Godly](https://godly.website) | curated web design, high craft bar | browse for visual direction and layout inspiration |
| [Awwwards](https://awwwards.com) | award-winning sites, sortable by type | good for landing pages, marketing sites, portfolios |
| [Refero](https://refero.design) | design references organized by component type | useful when building a specific component (tables, forms, nav) |
| [Dribbble](https://dribbble.com) | concept work and visual exploration | best for color, illustration style, and mood — not layout |
| [Siteinspire](https://siteinspire.com) | minimal, high-quality web design | good for editorial and content-focused layouts |
| [Screenlane](https://screenlane.com) | mobile and web UI recordings | see real interactions and transitions, not just statics |
| [Page Flows](https://pageflows.com) | user flow recordings from real products | study how multi-step flows actually work |

## How to Use References

### for the agent
1. before building, ask: "this [dashboard/landing page/admin panel] — what's the best version of this that already exists?"
2. if you have browser access, visit 2-3 reference sites and study their layout, spacing, color, and interactions
3. if you don't have browser access, describe the type of UI to the builder and suggest they search Mobbin/Godly for references
4. extract specific patterns: "Linear's changelog uses stacked cards with a timeline rail on the left. each card has a date, title, and expandable body. the spacing between cards is 32px."

### for the human
1. the agent will suggest searching specific tools for references
2. share 1-3 screenshots or links that match your vision
3. tell the agent what you like about each reference: "I like the spacing in this one, the color palette in that one, and the chart style in the third"
4. this 2 minutes of research saves 30 minutes of iteration

## Reference Patterns by UI Type

### dashboards / analytics
- **Linear insights** — clean, focused, generous whitespace, data doesn't fight for attention
- **Vercel analytics** — one metric hero'd, supporting data below, subtle but effective charts
- **Stripe dashboard** — masterclass in data density without clutter, excellent typography hierarchy
- **Posthog** — data-heavy but well-organized, good use of tabs to reduce visual load
- **Raycast analytics** — clean cards with sparklines, not chart-heavy

**what to steal:** hierarchy through size (hero one metric), subtle chart styling (no gridlines, muted colors), generous row spacing in tables, inline sparklines instead of separate chart sections

### admin panels / management tools
- **Clerk dashboard** — warm, friendly, doesn't feel like enterprise SaaS
- **Railway** — developer tool that feels designed, strong typography, purposeful color
- **Resend** — clean, minimal, focused. proves admin tools don't need to be ugly
- **Supabase** — dark mode done right, information-dense without feeling cramped

**what to steal:** status indicators that feel designed (not just colored dots), action buttons that are clearly primary vs secondary, empty states that guide instead of just saying "no data"

### landing pages / marketing
- **Linear** — typographic confidence, dramatic whitespace, features as mini-stories
- **Vercel ship pages** — motion as storytelling, scroll-driven reveals, cinematic
- **Resend** — simple, confident, lets the product speak
- **Perplexity** — editorial feel, illustration as personality, not decoration

**what to steal:** section rhythm (dense → spacious → dense), typography scale jumps (48px headline → 16px body), motion that reveals content rather than decorating it

### data visualization
- **Observable** — notebooks that make data feel alive
- **Flourish** — templates with genuine visual quality
- **NYT interactive graphics** — the gold standard for data storytelling
- **Pudding.cool** — data viz as narrative, scrollytelling

**what to steal:** annotation on charts (callouts pointing to interesting data), color palettes that serve the data (not just "looks nice"), hover states that reveal detail without overwhelm

## When to Skip Research

- modifying existing UI (the existing design IS the reference)
- backend/script work (no visual component)
- tight deadline where the human has already given clear specs

## Compounding

after each build:
- if a reference was particularly useful, add it to this file
- if a pattern from a reference worked well, note it in the relevant section
- remove references that are outdated or no longer represent good craft
