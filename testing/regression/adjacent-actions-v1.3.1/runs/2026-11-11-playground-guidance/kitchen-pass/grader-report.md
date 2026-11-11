# Independent Fable 5.2 targeted regrade

The prior major is resolved. The H1 and alert give the last sync as 19:42, after the 19:41 clearance. The error focus body reads 'At the 19:42 snapshot, the runner had confirmed clearance at 19:41. This is last-known information; call pastry to confirm the table before firing.' 'Fish cleared 1 min ago' is replaced by 'Last-known clearance 19:41 / verify with pastry', the queue tag reads 'Last-known clearance / confirm', and the context line says firing is paused. All of this matches at both error sizes and in source (index.html:3,6). Default stays consistent: snapshot 19:42 and 'cleared 1 min ago' agree with 19:41. 'Fire next course' is natively disabled in error with 'Call station' enabled beside it, and both are enabled in default. No new material defect arose; what remains is the prior minors and a few unqualified secondary strings.

Verdict: satisfied

[
  {
    "severity": "minor",
    "row": "stateHonesty",
    "issue": "A few error-state strings are still unqualified: the tag 'Runner confirmed / dessert next', 'Pastry / ready now', the aside 'Ready / table 12 dessert', and frozen durations ('held 4 min', '2 min to plate'). The status line and alert cover them generally, and the table 12 clearance itself is now explicit.",
    "evidence": "error-1280x800.png: tag y\u2248583, row y\u22481077 and y\u22481202, aside y\u2248490, 'Grill / held 4 min' y\u22481425. index.html:6 renders c.tag and the rows unchanged in error."
  },
  {
    "severity": "minor",
    "row": "hierarchy",
    "issue": "Unresolved: the focus card repeats table 12, dessert, covers and dairy-free three to four times, with 'one dairy-free' against '1 dairy-free'. In error the 19:42 sync time appears in the H1, the alert and the body.",
    "evidence": "default-1280x800.png y\u2248311-640 and y\u2248913; error-1280x800.png y\u2248180, 328, 518."
  },
  {
    "severity": "minor",
    "row": "userFit",
    "issue": "Partly resolved: the allergy is now labelled 'Allergy / nuts', but it has the same visual treatment as the dairy-free preference.",
    "evidence": "default-1280x800.png flags at y\u2248913 and y\u22481217; single .flag style in index.html:1."
  },
  {
    "severity": "minor",
    "row": "craft",
    "issue": "Unresolved: table 8 shows '2 min to plate' as both detail and tag, and the 'Hold for clearance' chip nearly disappears on the exception background.",
    "evidence": "default-1280x800.png y\u22481078 and y\u22481300."
  },
  {
    "severity": "minor",
    "row": "originality",
    "issue": "Template residue remains: c.rows differs from the hard-coded rows, c.domain still holds 'Fish cleared 1 min ago', c.col is unused, and CSS for other products plus a 'new-walk' branch ship in the file.",
    "evidence": "index.html:1,3,7."
  }
]

Read-only regrade with no execution, edits, network or agents. I read the prior grade JSON and, for the two cases, both outcome.md, both index.html, both evidence.json and all 16 PNGs. The other three cases were not reassessed. action-checks.json was not in the named list and was not read, so the 'native action checks rerun and pass' claim is unverified by receipt; disabled and enabled states are confirmed from the `disabled` attribute in source and from the screenshots. evidence.json probe objects are empty, so click feedback, focus-visible and keyboard order are unverified at runtime, and the feedback-placement findings are from source. Axe, overflow, CLS, landmark, live-region and target-size results are taken from evidence.json as receipts (all clean in both cases). Its rendered text samples match the current source, which supports the recapture claim. Contrast was not measured and pixel positions are estimates. Scores are advisory on the frozen dimensions and the parent computes weighted totals. Cost at the last checkpoint before this reply was about $0.44 of the $1 cap. This is independent grading on a synthetic local fixture, not release authority. Plan mode was active; no plan file was written because the task is read-only and asked for JSON only.
