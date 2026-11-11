# Choose one capture route

Use this only when the task needs new rendered evidence. Reuse valid matched evidence for an
unchanged artifact; a small copy edit does not become a new tool workflow.

1. Inspect the tools actually exposed in this session. If `ads_render` is available and supports
   the target in the configured project root, prefer it when the required consumers can read its
   resources (directly or by exporting the existing artifacts). If comparison with an existing
   baseline is required, keep its capture route: MCP comparison needs a complete baseline run
   in the same run store, not a CLI evidence directory. A skill file, installed package or old
   receipt is not proof that an MCP tool is callable. Do not install or reconfigure a server merely
   to complete a capture when the existing CLI route is sufficient.
2. Call `ads_render` with the real target and only the task's states and viewports. Supply
   `provenance.observedSkillFiles`, `sourceFiles` and `artifactFiles` when their root-confined files
   are available; mark only actually read skills as observed. Retain the returned run ID and read
   the returned evidence, screenshot and manifest resources. `complete` means capture finished
   with no reported deterministic blockers, not that visual judgment or delivery passed. A
   completed capture with failed required gates is `blocked` and may still have useful artifacts.
3. Use `ads_evaluate` on that run when normalization or a baseline comparison is needed. Keep
   `judge.mode: "none"` unless configured paid judgment is explicitly authorized. `needs_human`
   is an unresolved visual decision, not an adapter failure. A configured judge's identity/usage
   receipt is reported evidence, not independent provider attestation. The server hint
   "render, then evaluate" gives ordering when evaluation is needed, not an extra obligation
   for lightweight work.
4. Use `ads_trace` only when requested: it requires a complete run with an actually observed
   skill file, a source file and an artifact file recorded and still unchanged. Decide provenance
   before the first render. Do not recapture an unchanged target merely to add optional tracing.

If the MCP tool is absent, the target is unsupported, or its resources cannot be read in this
session or exported to a required reviewer, use the existing CLI capture wrapper for web
evidence. Record why the route changed; unreadable resources after a capture are a transport
failure, not permission to discard its gate results.
For SwiftUI, use the project's configured native capture path; a browser screenshot does not
substitute for a native render. Neither route expands authority to remote origins, credentials,
installation, paid judgment or deployment.

Do not run MCP and CLI capture for the same unchanged target/state matrix. Preserve an MCP
blocked receipt and inspect `blockers[]` to distinguish a confirmed gate failure from missing
infrastructure or evidence. A CLI run cannot erase a failed accessibility/state gate. An
infrastructure or transport failure may justify the alternate route, with both receipts linked.
Inspect screenshots and gates whichever route ran, and exercise site-specific interactions and
target-browser/device behavior separately when the generic capture does not establish them.
If neither route can produce readable evidence, report the precise missing capability.
