---
name: agent-friendly-design
description: "Design websites and applications that AI agents can consume, navigate, and interact with. Use when building any site, app, or product that agents will use as an end-user — not just crawl or index. Covers semantic structure, accessibility-as-agent-interface, machine-readable data, API-first patterns, and the emerging protocols (llms.txt, MCP, NLWeb, A2UI) that make sites agent-ready. Triggers on: agent-friendly, agent-readable, agent-accessible, AX, agent experience, agentic web, dual-interface, machine-readable, llms.txt, MCP integration, NLWeb, accessibility tree, ARIA for agents, structured data, JSON-LD, Schema.org, API-first design, build for agents, agent-ready."
---

# agent-friendly design

how to build sites and apps that AI agents can actually use.

## why this exists

most design guidance is about agents *building* UI. this skill is about agents *consuming* UI. the audience for your site is no longer just humans — automated traffic surpassed human traffic in 2024 (51% of all web interactions). agents browse, compare, purchase, research, and interact on behalf of users.

if your site is invisible to agents, you're invisible to a growing majority of the web.

## the core insight

the accessibility tree — originally built for screen readers — is becoming the primary interface between AI agents and your website. OpenAI's Atlas explicitly uses ARIA tags to interpret page structure. Microsoft's Playwright MCP provides accessibility snapshots, not screenshots. even vision-first agents (Anthropic Computer Use, Google Mariner) are incorporating accessibility data for reliability.

**building for agents and building for accessibility are the same work.** every improvement you make for one benefits the other.

## the checklist

### 1. semantic HTML (non-negotiable)

agents can't "see" your layout. they read structure. div soup is invisible.

- use native elements: `<button>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<aside>`
- proper heading hierarchy: `<h1>` through `<h6>`, no skipped levels
- `<label>` elements explicitly associated with form inputs (use `for` attribute)
- `<table>` for tabular data with `<thead>`, `<th>`, and `scope` attributes
- links are `<a>` elements, buttons are `<button>` elements. never `<div onclick>`
- use `<form>` for forms, with `<fieldset>` and `<legend>` for groups
- meaningful `<img alt>` text (not "image1.png")

**test:** disable CSS. can you still understand the page? if yes, agents can too.

### 2. ARIA: useful, not magic

ARIA supplements semantic HTML — it doesn't replace it. use it when native elements can't express the interaction.

- `aria-label` on buttons and links that lack visible text (icon buttons, close buttons)
- `aria-expanded` on toggles, dropdowns, accordions
- `aria-live` regions for dynamic content agents need to notice (status messages, notifications)
- `role` attributes only when there's no native element (e.g., `role="tablist"`, `role="dialog"`)
- `aria-describedby` for complex form fields that need additional context
- `aria-hidden="true"` on decorative elements agents should ignore

**don't do:** put ARIA on everything. over-labeling creates noise. if the native element already communicates the role, skip the ARIA.

### 3. machine-readable state

agents can't interpret visual cues. a grayed-out button means nothing if `disabled` isn't set.

- use `disabled` attribute on inactive controls
- use `aria-selected`, `aria-checked`, `aria-pressed` for toggle states
- loading states: `aria-busy="true"` on containers updating content
- error states: `aria-invalid="true"` on fields with validation errors, plus `aria-errormessage` linking to the error text
- empty states: render actual DOM content (not just CSS `::after` pseudo-elements)
- pagination: current page marked with `aria-current="page"`

**the rule:** if a human can tell the state by looking, an agent should be able to tell the state by reading the DOM.

### 4. structured data (JSON-LD + Schema.org)

helps agents understand *what* your content is, not just how it's structured.

- `Organization`, `Product`, `Article`, `BreadcrumbList`, `FAQPage`, `HowTo` schemas as appropriate
- JSON-LD in `<script type="application/ld+json">` (preferred over microdata or RDFa)
- keep structured data in sync with visible content — don't stuff keywords
- include `dateModified` and `datePublished` so agents know freshness
- product pages: price, availability, reviews, SKU
- articles: author, datePublished, headline, description

### 5. llms.txt

a markdown file at `/llms.txt` that gives LLMs a concise overview of your site. like robots.txt, but for language models.

```markdown
# Your Project Name

> Brief description of what this site/product does.

## Docs

- [Getting Started](https://yoursite.com/docs/getting-started): How to set up...
- [API Reference](https://yoursite.com/docs/api): Full API documentation...

## Optional

- [Changelog](https://yoursite.com/changelog): Recent updates...
```

- keep it under 2000 tokens for quick context loading
- link to detailed markdown versions of important pages (append `.md` to URLs if possible)
- update when content changes — stale llms.txt is worse than none
- spec: https://llmstxt.org

### 6. crawlability and rendering

agents can't all execute JavaScript. many rely on raw HTML.

- server-side render (SSR) or pre-render critical content
- don't hide key information behind client-side-only JavaScript
- update `robots.txt` to allow known AI user-agents (ChatGPT-User, OAI-SearchBot, Googlebot, etc.)
- maintain an up-to-date `sitemap.xml`
- fast response times (agents may time out at 10-30 seconds)
- important content should be high in the HTML source (agents may not scroll)

### 7. predictable interactions

agents automate by finding patterns. inconsistency breaks them.

- consistent naming: if "Add to Cart" is the button text on one page, don't make it "Buy Now" on another
- standard HTML form controls (not custom JavaScript widgets that look like inputs but aren't)
- predictable IDs and class names across similar pages
- avoid modals, popups, and interstitials that require complex dismissal sequences
- minimize login walls for browsing (allow guest checkout where possible)
- avoid CAPTCHAs on non-critical flows — they block agents completely

### 8. API-first patterns

if agents can get data without scraping HTML, everyone wins.

- REST or GraphQL endpoints for core data (products, content, status)
- OpenAPI spec published and linked from llms.txt
- MCP (Model Context Protocol) server for direct tool access — agents can call your API through MCP without browser automation
- NLWeb integration for natural language queries against your data
- A2UI for agent-driven native interfaces (Google's open project — agents send component blueprints that inherit host app styling)
- webhooks for state changes agents need to react to

### 9. content for agents, not just humans

- write clear, descriptive page titles (agents use `<title>` heavily)
- meta descriptions that actually describe the page content
- use descriptive link text ("View pricing details") not generic ("Click here")
- break long content into sections with headings
- provide summaries or TL;DRs for dense pages
- don't rely on images alone to convey information — always have text equivalents

### 10. test with agents

- use browser dev tools to inspect the accessibility tree (Chrome: Accessibility pane in Elements)
- test critical flows with AI browser agents (ChatGPT Atlas, Playwright MCP)
- run Lighthouse accessibility audit — most issues it catches affect agents too
- check that forms can be completed programmatically
- verify that dynamic content updates are reflected in the DOM, not just visually

## the dual-interface mental model

you're building two interfaces on one page:

**human interface:** visual hierarchy, color, typography, whitespace, motion, delight
**agent interface:** semantic structure, ARIA roles, JSON-LD, predictable controls, API endpoints

they don't conflict. a well-structured semantic page is easier for humans AND agents. the dual-interface is additive, not a trade-off.

## routing

- **every web project:** items 1-3 (semantic HTML, ARIA, machine-readable state) are non-negotiable
- **public-facing sites:** add items 4-6 (structured data, llms.txt, crawlability)
- **products/e-commerce/SaaS:** add items 7-9 (predictable interactions, API-first, content optimization)
- **full agent-readiness:** all 10 items

## emerging protocols to watch

| protocol | what it does | status |
|----------|-------------|--------|
| [llms.txt](https://llmstxt.org) | markdown site overview for LLMs | adopted by many, simple to implement |
| [MCP](https://modelcontextprotocol.io) | direct tool access for agents (no browser needed) | growing fast, Anthropic-led |
| [NLWeb](https://github.com/microsoft/nlweb) | natural language queries against your data | Microsoft open-source, early |
| [A2UI](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/) | agent-driven native UI components | Google, early spec |
| [AGENTS.md](https://docs.agentsmd.org) | project-level agent instructions | community adoption growing |

## compounding

after building or auditing a site for agent-friendliness:
- document which patterns agents struggled with → add to this skill's checklist
- note which ARIA patterns made the biggest difference → share with the team
- track agent traffic in analytics (user-agent strings) → understand actual usage
- test new protocols as they mature (MCP, A2UI) → update this guide

the web is shifting from page-driven to action-driven. designing for agents isn't future-proofing — it's building for today's traffic.
