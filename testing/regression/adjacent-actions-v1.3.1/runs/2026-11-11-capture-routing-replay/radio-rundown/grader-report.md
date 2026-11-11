# Independent Fable 5.2 regression grade

The initial major is closed: the lock state reads 'Playout holds the running order.' with 'Rundown current / reordering locked until 16:26', and the outage wording and '/ last confirmed' are gone. That gives a clear boundary between playout authority and talkback coordination. The move target is named, a snapshot time and spare-time indicator are present, the empty state is in second person with no stale show context, loading copy is radio-specific, and the blank band is gone. 'Move segment' is disabled and 'Call host' is enabled in error, with both enabled in default. Only minors remain.

Verdict: satisfied

[
  {
    "severity": "minor",
    "row": "adjacentActionSemantics",
    "issue": "The target of 'Move segment' is assigned by a prose line rather than by selection or placement. The button still sits on the on-air card while its target, Neighborhood notices, is a row below with no affordance.",
    "evidence": "default-1280x800.png: context line at about y=646 and button at y=713 against the row at y=1005."
  },
  {
    "severity": "minor",
    "row": "hierarchy",
    "issue": "Timing facts are heavily repeated. 16:26 appears in the kicker, body, clock and notes, and 'no spare time' appears as the tag, a clock cell, a sentence and a note.",
    "evidence": "default-1280x800.png: y=311, 393, 459, 542, 599 and the aside at y=365 and y=517."
  },
  {
    "severity": "minor",
    "row": "userFit",
    "issue": "The clock is four equal-weight cells, so 'Snapshot time' has the same emphasis as the remaining and spare time that carry the risk. The hard-handoff row is not distinguished in the list.",
    "evidence": "default-1280x800.png clock at y=505-555; 'Weather handoff' row at y=879 uses class 'routine' in index.html:6."
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
