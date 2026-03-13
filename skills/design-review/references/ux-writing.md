# UX Writing Reference

## The Problem

agents write UI copy like documentation: formal, verbose, generic. button labels say "Submit" when they should say "Send message." error messages say "An error occurred" when they should say what actually went wrong. empty states say "No data found" when they should guide the user to the next action.

good UI copy is invisible when it works and helpful when things go wrong. it's a design material, not an afterthought.

## Principles

### say what it does, not what it is
- ❌ "Submit"
- ✅ "Send message"
- ❌ "Confirmation"
- ✅ "Your order is on its way"

### be specific over generic
- ❌ "An error occurred"
- ✅ "We couldn't save your changes. Check your connection and try again."
- ❌ "No results"
- ✅ "No projects match that filter. Try a broader search or create a new project."

### use the user's language
- ❌ "Invalid input detected in field"
- ✅ "That doesn't look like an email address"
- ❌ "Resource not found (404)"
- ✅ "We can't find that page. It might have been moved or deleted."

### front-load the important word
- ❌ "Click here to download the report"
- ✅ "Download report"
- ❌ "Are you sure you want to delete this?"
- ✅ "Delete this project? This can't be undone."

## Button Labels

buttons should describe the action, not the process.

| instead of | use |
|-----------|-----|
| Submit | Send message / Save changes / Create project |
| Cancel | Go back / Never mind / Keep editing |
| OK | Got it / Continue / Understood |
| Delete | Delete project / Remove member |
| Yes / No | Use the action as the label: "Delete" / "Keep" |
| Click here | [just make the relevant text the link] |
| Learn more | See pricing / Read the docs / View examples |

### button pairs (confirm/deny)
the primary action should be specific. the secondary should be soft.
- ✅ "Delete project" / "Keep project"
- ✅ "Send invite" / "Cancel"
- ✅ "Save and publish" / "Save as draft"
- ❌ "Yes" / "No"
- ❌ "OK" / "Cancel"

### destructive actions
make the consequence clear. use red/danger styling.
- ✅ "Delete project — this can't be undone"
- ✅ "Remove from team — they'll lose access immediately"
- ❌ "Are you sure?" (sure about what?)

## Empty States

empty states are the first impression for new users. they should guide, not dead-end.

### structure
1. **what this area is for** (one line)
2. **why it's empty** (context)
3. **what to do next** (primary action)

### examples

**good:**
> **No projects yet**
> Projects you create will appear here. Start with a template or build from scratch.
> [Create project] [Browse templates]

**bad:**
> No data found.

**good:**
> **Your inbox is empty**
> When teammates mention you or assign tasks, you'll see them here.

**bad:**
> 0 results

**good (with personality):**
> **Nothing to see here... yet**
> This dashboard fills up once your agents start running. Launch your first agent to see the magic.
> [Launch an agent →]

## Error Messages

### structure
1. **what happened** (clear, specific)
2. **why it happened** (if knowable)
3. **what to do** (actionable next step)

### examples

**good:**
> **Couldn't save your changes**
> The server didn't respond. Check your internet connection and try again.
> [Try again]

**bad:**
> Error 500: Internal Server Error

**good:**
> **That email is already registered**
> Try signing in instead, or use a different email.
> [Sign in] [Use different email]

**bad:**
> Error: Duplicate entry

**good (with personality):**
> **Well, that didn't work**
> We tried to send your message but the server is being uncooperative. Give it a moment and try again.
> [Retry]

## Loading States

### what to say
- if < 2 seconds: just show a spinner or skeleton, no text needed
- if 2-5 seconds: "Loading..." or context-specific: "Fetching your data..."
- if > 5 seconds: "This is taking longer than usual. Hang tight."
- if potentially minutes: "Processing your upload — this might take a minute. You can leave this page."

### skeleton screens > spinners
show the shape of the content that's coming. users perceive skeleton screens as faster than spinners.

## Microcopy

### form labels
- use sentence case: "Email address" not "Email Address"
- be specific: "Work email" not just "Email" (if it matters)
- placeholder text is NOT a label — it disappears on focus

### helper text
- put it below the field, not as placeholder
- explain format requirements upfront: "Must be at least 8 characters"
- don't: "Please enter a valid email address" (they haven't entered anything yet)

### success messages
- brief, warm, specific
- ✅ "Changes saved"
- ✅ "Invitation sent to alex@example.com"
- ❌ "Operation completed successfully" (robot voice)
- auto-dismiss after 3-5 seconds (don't make users close it)

### tooltips
- one sentence max
- explain WHY, not WHAT (the label already says what)
- ✅ tooltip on "Priority": "Higher priority items appear first in your team's queue"
- ❌ tooltip on "Priority": "Set the priority level"

## Tone Spectrum

match tone to context. not everything needs to be funny.

| context | tone | example |
|---------|------|---------|
| error (blocking) | calm, helpful | "We couldn't process your payment. Check your card details and try again." |
| error (minor) | light, reassuring | "Hmm, that link seems broken. Here's the homepage instead." |
| success | warm, brief | "You're all set!" |
| empty state | encouraging | "Nothing here yet — create your first project to get started." |
| destructive | serious, clear | "Delete this workspace? All projects and data will be permanently removed." |
| onboarding | friendly, guiding | "Welcome! Let's set up your first project. It'll take about 2 minutes." |
| loading (long) | patient, transparent | "Still working on it. Large files take a bit longer." |

## Common Failures

- **"Please"** everywhere — one "please" per page is fine. five is groveling.
- **passive voice** — "Your file has been uploaded" → "File uploaded" or "We uploaded your file"
- **tech jargon in user-facing copy** — "null", "undefined", "invalid payload", "403"
- **ALL CAPS for buttons** — reads as shouting. use sentence case.
- **vague CTAs** — "Get started" on every page. started with what?
- **no copy at all** — icon-only buttons without labels or tooltips. agents love this shortcut.
- **sycophantic copy** — "Great choice!" "Awesome!" "You're doing amazing!" — unless the brand genuinely talks like this, it reads as AI-generated
- **lorem ipsum left in place** — always use realistic mock data, never placeholder text

## Writing Checklist

before shipping any UI:
- [ ] every button says what it does (not "Submit" / "OK" / "Click here")
- [ ] every empty state guides to the next action
- [ ] every error says what happened and what to do
- [ ] form labels are specific and use sentence case
- [ ] destructive actions explain consequences
- [ ] no tech jargon in user-facing text
- [ ] no orphaned tooltips (every icon-only button has a label or tooltip)
- [ ] tone matches context (serious for destructive, warm for success)
