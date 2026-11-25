# Independent Fable 5.2 regression grade

The initial major is closed: the error state now reads as a permission restriction ('Approval belongs to the collections lead.', 'Read access active / collections lead approval required'), and the '/ last confirmed' and 'live updates unavailable' wording is gone. The empty state no longer names a loan and offers 'Open sample loan'. Loading copy is registrar-specific, the identifier uses a hyphen, the blank band is gone, and the 'preview opened' message is replaced. 'Approve transfer' is disabled and 'Download condition report' is enabled in error, with both enabled in default. Only minors remain.

Verdict: satisfied

[
  {
    "severity": "minor",
    "row": "adjacentActionSemantics",
    "issue": "Unresolved from the initial grade: the safe next step, asking the collections lead, is prose only. No collections lead is named anywhere and there is no request action. The outcome does not require one.",
    "evidence": "error-1280x800.png alert text; 'Object record' lists only the receiving registrar."
  },
  {
    "severity": "minor",
    "row": "stateHonesty",
    "issue": "In error, the context line above the disabled button still tells a registrar without approval rights to approve.",
    "evidence": "error-1280x800.png at about y=727: 'Approve loan 2026-041 for the 14 November courier handoff.' above the disabled 'Approve transfer'; index.html:6."
  },
  {
    "severity": "minor",
    "row": "originality",
    "issue": "The new object summary restates facts already on screen instead of adding registrar evidence. Accession repeats the side record, and condition and packing repeat the body and tag.",
    "evidence": "default-1280x800.png: summary at y=505-533 against the body at y=393, the tag at y=458 and the aside at y=337-365."
  },
  {
    "severity": "minor",
    "row": "userFit",
    "issue": "The milestone the approval controls, 'Courier handoff / Awaiting approval', looks the same as completed rows. The other artifacts received an exception treatment.",
    "evidence": "default-1280x800.png rows at y=779-1135; all three rows use class 'routine' in index.html:6."
  },
  {
    "severity": "minor",
    "row": "originality",
    "issue": "Template residue remains: unused c.rows, c.col and c.domain, CSS for other products, and an unreachable 'new-walk' branch.",
    "evidence": "index.html:1,3,7."
  }
]

Read-only regrade with no execution. I read all 40 PNGs, 5 outcome.md, 5 index.html, 5 evidence.json, contracts/visual-foundation.v2.json, action-checks.json and the initial grades file. No prior runs, baselines or parent evaluations were consulted. action-checks.json as read holds 20 entries with only restrictedDisabled and preservedEnabled booleans. It has no download field, so the condition-report download is unverified by that receipt and confirmed from source only (Blob branch at museum-loans index.html:7). evidence.json probe objects are empty, so click feedback, focus-visible and keyboard order are unverified at runtime; the feedback-placement and aria-describedby findings come from source. Axe, overflow, CLS, landmark, live-region and 48px target results are taken from evidence.json as receipts. Contrast was not measured and pixel positions are estimates from the screenshots. Under the utility Foundation profile I observed system sans, no forced uppercase, no status dots, no em dashes, and colons only in times. Slash-delimited strings are used heavily as a separator across all five. The five artifacts share one template, so the residue, chip-contrast and repeated error-message findings share a root cause; the repeated H1, status line, alert title and alert body stack is present in all five error states and is recorded once, under pawprint. Scores use the frozen dimensions and the parent computes weighted totals. Cost at the last checkpoint before this reply was $0.93 of the $2.40 cap. This is independent grading, not release authority, on a synthetic local fixture rather than a deployed backend. Plan mode was active; no plan file was written because the task is read-only and asked for JSON only.

Routing replay: this independent grade is reused from 2026-11-11-playground-guidance, not a new model call. Source bytes and all eight screenshot bytes were verified identical before reuse. It does not grade the revised routing instructions.
