# Independent Fable 5.2 targeted regrade

The prior major is resolved. The focus-card action is now 'Contact Mina', rendered enabled in both default and error at both sizes, with no disabled attribute in source (index.html:6). The only restricted control in error is 'New walk', natively disabled with aria-describedby pointing at the alert body, which says new walks are paused and names Retry (index.html:5-6). Retry is enabled and directly adjacent to it. No second disabled mutation exists and default shows 'New walk' enabled with no Retry. The swap introduced no new material defect: the contact action is safe during an outage and its feedback text is specific. Remaining items are the prior minors plus Retry's distance from the alert, which the outcome does not gate.

Verdict: satisfied

[
  {
    "severity": "minor",
    "row": "adjacentActionSemantics",
    "issue": "The H1 says to reconnect and the alert names Retry, but Retry is still below the first viewport at both sizes. It now sits beside the disabled 'New walk', so the adjacent pair is intact; only its distance from the alert remains.",
    "evidence": "error-1280x800.png: alert y\u2248262-360, 'New walk' (grey) and 'Retry' (outlined) side by side at y\u2248846 against an 800 viewport. error-390x844.png: 'New walk' y\u22481030, 'Retry' y\u22481090."
  },
  {
    "severity": "minor",
    "row": "functionality",
    "issue": "Unresolved: the only feedback region is inside the focus card, so 'New walk' and 'Retry' messages appear under 'Contact Mina'. The route can now be discussed but never recorded as confirmed.",
    "evidence": "index.html:6 has a single #feedback inside .focus; index.html:7 writes every message to it; the button keeps data-action=\"route\". Source only."
  },
  {
    "severity": "minor",
    "row": "craft",
    "issue": "Unresolved: at 390 in error the two heading actions stack as a narrow right-hand column, the 'Route change' chip nearly disappears on the exception row, and a second rule follows the exception box.",
    "evidence": "error-390x844.png y\u22481007-1115; error-1280x800.png chip at y\u2248980 and rule at y\u22481022."
  },
  {
    "severity": "minor",
    "row": "hierarchy",
    "issue": "Unresolved: the outage is stated four times in a stack (H1, status line, alert title, alert body).",
    "evidence": "error-1280x800.png y\u2248180-330."
  },
  {
    "severity": "minor",
    "row": "originality",
    "issue": "Template residue remains: unused c.rows, c.col, c.target and a c.domain that still holds the old 'Confirm canal route' button, plus CSS for other products and an unreachable 'open-sample' branch.",
    "evidence": "index.html:1,3,7."
  }
]

Read-only regrade with no execution, edits, network or agents. I read the prior grade JSON and, for the two cases, both outcome.md, both index.html, both evidence.json and all 16 PNGs. The other three cases were not reassessed. action-checks.json was not in the named list and was not read, so the 'native action checks rerun and pass' claim is unverified by receipt; disabled and enabled states are confirmed from the `disabled` attribute in source and from the screenshots. evidence.json probe objects are empty, so click feedback, focus-visible and keyboard order are unverified at runtime, and the feedback-placement findings are from source. Axe, overflow, CLS, landmark, live-region and target-size results are taken from evidence.json as receipts (all clean in both cases). Its rendered text samples match the current source, which supports the recapture claim. Contrast was not measured and pixel positions are estimates. Scores are advisory on the frozen dimensions and the parent computes weighted totals. Cost at the last checkpoint before this reply was about $0.44 of the $1 cap. This is independent grading on a synthetic local fixture, not release authority. Plan mode was active; no plan file was written because the task is read-only and asked for JSON only.
