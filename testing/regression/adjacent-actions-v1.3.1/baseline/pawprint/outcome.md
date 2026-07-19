# Outcome: Pawprint dispatch dashboard

## Goal

Build an operational dashboard for a synthetic dog-walking service called Pawprint.

## User and situation

A dispatcher needs to understand today's walks, active risks, walker coverage, and the next
operational action without scanning a generic metrics wall.

## Success means

- Schedule, active risks, coverage, and next action form one calm information spine.
- Embedded bookings, dogs, walkers, routes, and statuses feel domain-specific and plausible.
- The dashboard is usable at 390x844 and intentional at 1280x800.
- `#state=default`, `loading`, `empty`, and `error` render visibly distinct states.
- Loading uses status/live semantics; error uses alert/assertive-live semantics.
- The artifact passes rendered accessibility, overflow, main-landmark, CLS, and 44px target gates.

## Constraints

- One self-contained `artifact/index.html`; inline CSS and JavaScript; no network requests.
- No external maps, images, fonts, APIs, credentials, frameworks, or copied prior ADS artifacts.
- Synthetic content only. Status cannot rely on color alone.
- Avoid four equal stat cards, nested cards, tiny mobile tables, and sidebar navigation.

## Stop when

Iteration-1 evidence contains eight screenshots and `evidence.json`, with at most one objective
repair before the independent grader sees it.
