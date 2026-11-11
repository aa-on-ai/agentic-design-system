# Independent Fable 5.2 regression grade

The initial major is closed: the error H1 now reads 'Confirm conditions before watering.' with a safe-mode status line, and it agrees with the alert, the disabled 'Adjust schedule' and the enabled 'Call grower'. Moisture now has a labelled comparison and the below-target row is distinct by container and text. Loading and empty copy are irrigation-specific, the blank band is gone, and the 'preview opened' message is replaced. The original aria-describedby minor and part of the row-tag minor remain. No major issue was found.

Verdict: satisfied

[
  {
    "severity": "minor",
    "row": "stateHonesty",
    "issue": "Safe mode does not say whether the planned 11:20 pulse will still run automatically. The large '28%' reading carries no last-known label of its own; only the alert and kicker qualify it.",
    "evidence": "error-1280x800.png: 'Next watering / 11:20 / last confirmed', 'Zone 3 moisture 28%' at about y=657-700, alert 'Schedule changes are disabled'."
  },
  {
    "severity": "minor",
    "row": "stateHonesty",
    "issue": "In error, the context line above the disabled button still reads as an instruction to do the blocked thing.",
    "evidence": "error-1280x800.png at about y=806: 'Adjust the six-minute pulse for zone 3.' directly above the disabled 'Adjust schedule'; index.html:6 renders c.target in every state."
  },
  {
    "severity": "minor",
    "row": "userFit",
    "issue": "The meter shows a 0-100 fill with no mark for the 32-40% band, so 'below target' is carried by text only. It uses the browser's default yellow, which is off-palette.",
    "evidence": "default-1280x800.png bar at about y=575-585; native <meter> in index.html:6."
  },
  {
    "severity": "minor",
    "row": "craft",
    "issue": "The exception row states the same thing twice ('Below target / inspect feed line' and the tag 'Check feed line'), and the tag is still an instruction where the other rows carry statuses. The chip nearly disappears on the exception background, and a second rule follows the box.",
    "evidence": "default-1280x800.png rows at y=837-992; default-390x844.png at about y=1040-1075."
  },
  {
    "severity": "minor",
    "row": "functionality",
    "issue": "Unresolved from the initial grade: the reason is attached with aria-describedby to a disabled button that cannot receive focus.",
    "evidence": "index.html:5."
  },
  {
    "severity": "minor",
    "row": "originality",
    "issue": "Template residue remains: unused c.rows, c.col and c.domain, CSS for other products, and an unreachable 'new-walk' branch. The empty state says 'No zones are assigned to this shift' twice.",
    "evidence": "index.html:1,3,7; empty-1280x800.png at y=226 and y=293."
  }
]

Read-only regrade with no execution. I read all 40 PNGs, 5 outcome.md, 5 index.html, 5 evidence.json, contracts/visual-foundation.v2.json, action-checks.json and the initial grades file. No prior runs, baselines or parent evaluations were consulted. action-checks.json as read holds 20 entries with only restrictedDisabled and preservedEnabled booleans. It has no download field, so the condition-report download is unverified by that receipt and confirmed from source only (Blob branch at museum-loans index.html:7). evidence.json probe objects are empty, so click feedback, focus-visible and keyboard order are unverified at runtime; the feedback-placement and aria-describedby findings come from source. Axe, overflow, CLS, landmark, live-region and 48px target results are taken from evidence.json as receipts. Contrast was not measured and pixel positions are estimates from the screenshots. Under the utility Foundation profile I observed system sans, no forced uppercase, no status dots, no em dashes, and colons only in times. Slash-delimited strings are used heavily as a separator across all five. The five artifacts share one template, so the residue, chip-contrast and repeated error-message findings share a root cause; the repeated H1, status line, alert title and alert body stack is present in all five error states and is recorded once, under pawprint. Scores use the frozen dimensions and the parent computes weighted totals. Cost at the last checkpoint before this reply was $0.93 of the $2.40 cap. This is independent grading, not release authority, on a synthetic local fixture rather than a deployed backend. Plan mode was active; no plan file was written because the task is read-only and asked for JSON only.

Routing replay: this independent grade is reused from 2026-11-11-playground-guidance, not a new model call. Source bytes and all eight screenshot bytes were verified identical before reuse. It does not grade the revised routing instructions.
