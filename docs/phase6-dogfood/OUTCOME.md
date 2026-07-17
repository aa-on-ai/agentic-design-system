# Phase 6 prospective dogfood outcome

## Goal

Add a public `/trace` page to the ADS demo site that lets a reviewer understand one real decision-provenance chain without reading raw JSON.

## Product constraints

- Use the existing ADS visual language and site chrome; this is part of the product, not a synthetic fixture.
- Present the preserved loop demo as historical evidence with `reviewed` status, never as prospective proof.
- Show each decision as a readable chain: decision, governing rule, source constraint, and evidence.
- Keep the page server-rendered and semantic, with real links to the preserved artifacts.
- Use one focused reading spine on small screens rather than compressing a dashboard or table.
- Add no runtime model, browser, or network calls for provenance.

## Success criteria

- A reviewer can answer why an element exists, which exact rule governed it, and what evidence cleared it in under two minutes.
- The page has one clear H1, landmark structure, visible keyboard focus, descriptive links, and no color-only status meaning.
- The default page clears rendered accessibility, horizontal-overflow, and 44px touch-target gates at 390, 768, and 1280px.
- The pre-build manifest and final trace each complete within the 250ms local budget.
- The final trace contains 3–7 verified decisions with no manual repair after generation.

## State inventory

This is a static, server-rendered evidence document. Loading, empty, error, disabled, and mutation states are not applicable; the default document is the complete state.

## Stop condition

Stop when the build and rendered gates pass, the screenshots have been visually reviewed, the final trace verifies, and its managed report block is generated.
