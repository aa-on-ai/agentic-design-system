# Mock Data Reference

## The Problem

agents fill UIs with placeholder content that screams "nobody thought about this." generic names, round numbers, lorem ipsum energy. the data IS the design — a dashboard with lazy data looks lazy no matter how good the layout is.

## Quality Bar

mock data must be:
- **specific** — real names, real products, real agencies, not "Item 1" or "User A"
- **current** — use today's model names, today's companies, today's events. GPT-3.5 is old news. Claude 1 doesn't exist anymore.
- **premise-aware** — if the prompt is about government surveillance, the data should reference real agencies and plausible scenarios, not generic "departments"
- **structurally plausible** — numbers should make sense relative to each other. percentages should add up. dates should be recent.
- **tonally aligned** — if the premise is satirical, the humor lives HERE: in row names, status labels, timestamps, internal tags, alert messages. not in the headline.

## Rules

- include at least 8-12 real domain nouns before inventing fictional ones
- if the prompt references a live domain (AI models, government agencies, social platforms), use current real names
- fake entries should sound like they belong in the world — "Cognitive Warfare Division" is a better fake agency name than "Agency X"
- every table, card, or list should reward inspection with specific details
- numbers should tell a story: one metric way higher than the rest, a trend that's clearly going up, a status that's clearly wrong
- timestamps should be recent (last 24-72 hours for dashboards, last 1-2 weeks for reports)
- avoid round numbers — 47 is more believable than 50, $1,247 is more believable than $1,200

## Where Humor Lives

for satirical or playful premises, embed humor in:
- **row/item names** — "The Overthinking Committee," "Reply Guys United," agent named "Definitely-Not-Skynet"
- **status labels** — "suspiciously cooperative," "existential crisis," "quietly expanded scope"
- **internal notes/tags** — "press-sensitive," "Hill-demo pending," "CEO saw this on Twitter"
- **timestamps** — "3 min ago (during board meeting)"
- **metric annotations** — "↑ 23% since someone asked it to be honest"
- **alert messages** — "Model scored 99% helpfulness. Investigate."

do NOT put humor in:
- page titles or main headlines (these should read as real product UI)
- button labels or navigation (functional elements stay functional)
- chart axis labels (data viz should be legible)

the UI should look completely real. the content should make you smile when you read it.

## Anti-Examples

bad:
- "Agency 1," "Agency 2," "Agency 3"
- "Model A," "Model B," "Model C"
- "High risk," "Medium risk," "Low risk" (with no specifics)
- "John Doe," "Jane Smith"
- "$1,000,000" (too round)
- "2024-01-01" (outdated, too clean)

good:
- "Department of Defense — Project Maven successor," "GSA — procurement automation," "IRS — fraud detection (paused after audit)"
- "Claude 4 Opus," "GPT-5.4," "Gemini 3 Pro," "Llama 4 405B"
- "HIGH — NYT investigation pending," "WATCH — congressional inquiry Q2," "CLEAR — passed GAO review"
- real-sounding names that fit the world
- "$1,247,803" or "~$1.2M"
- "Mar 12, 2026 — 2:47 PM" or "3 hours ago"
