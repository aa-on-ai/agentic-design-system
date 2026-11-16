# Account-settings examples integrated into the ADS site

## User-facing change
Homepage Examples navigation and a native workshop section lead to /examples/account-settings. Three model choices pair frozen ADS/no-ADS outcomes, desktop/phone captures, context-preserving interactive viewers and expandable method/provenance. Same typography, rose/graphite tokens, header/theme behavior and install path as the existing site. Not a separate evaluation application.

## Source and scope
Base main254eaca9fbc464db8b7bef62febb6d9eb68ed794 matched the production deployment at intake. Six generated HTML files are unchanged, SHA-256 recorded in public/examples/account-settings/provenance.json. No new model runs or candidate repairs. Fresh synthetic builds are not evidence of preservation of an existing product. No leaderboard or general ADS-effect claim.

## Verification
- Next production build and TypeScript pass. Scoped ESLint and git diff whitespace checks pass.
- Desktop Chromium1280x800 and phone WebKit390x844: homepage to examples, all3models ×2capture sizes, loaded screenshots, theme switching, context-preserving return path. No observed page errors or horizontal overflow.
- All6embedded examples: name edit/save/reload tested on both browsers;12/12passed. This tests integration, not all original candidate functionality.
- New comparison page initial axe A/AA scan returned no violations on both surfaces. Not an accessibility-conformance claim. At320px no homepage/comparison overflow.
- Invalid model query safely falls back to Astra; parameter cannot select arbitrary iframe source. Each iframe source is one of6curated static files, sandboxed without top navigation/popups. These reviewed files share origin to preserve localStorage; this is not an untrusted arbitrary-code hosting service. Response CSP blocks network connections, form submission, external resources and non-self framing. No credentials or real accounts.
- Existing hero/Ember/install design retained; shared header extraction inspected. Full-page desktop/phone/light/dark screenshots visually reviewed by Clawc.

## Remaining limits
Frozen candidate usability findings remain visible in comparison notes. Initial tests were feedback to the builders; not held-out evidence. Cross-provider runtimes and high-effort labels differ; one pair/model. Reviewer family overlap and reviewer-informed later preference disclosed. Existing Vercel preview sign-in may still prevent remote access; deployment transport and local checks do not prove recipient rendering. Aaron retains taste and production-release judgment.

## Review status
Agent-built and parent-reviewed, not a fresh independent Fable review of the integration. Earlier Fable critique covers the six candidates/method and is attributed as such. No merge or production release included.
