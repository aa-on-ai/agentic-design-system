# Trust and customization

Use this reference when evaluating an install or changing project defaults, not as another stage
in every design task. Reading skill instructions does not itself execute the bundled scripts.
The host agent decides which commands to run under the task's existing permissions.

## Execution inventory

Run commands from the consumer project root. Paths below are relative to the installed skills
directory: prepend your agent’s directory (for example, `.agents/skills/` for Codex or Cursor)
to each helper path when invoking it. Do not change into the skills directory to run setup.
Commands are optional task tools,
not an automatic install sequence. This inventory covers every executable helper shipped under
`skills/`; it does not enumerate arbitrary commands an agent may choose while implementing UI.

| Helper / command | Reads, writes, and external effects |
|---|---|
| `python3 design-review/scripts/anti-pattern-check.py <files>` | Reads supplied source files and prints heuristic findings. Does not edit those files. Optional telemetry below. |
| `python3 design-review/scripts/state-check.py <files>` | Reads supplied source files and prints state heuristics. Does not edit those files. Optional telemetry below. |
| `python3 design-review/scripts/accessibility-check.py <files>` | Reads supplied source files and prints semantic/accessibility heuristics. Does not edit those files. Optional telemetry below. |
| `node design-review/scripts/setup-capture.mjs --check` | Checks package imports and launches/closes Chromium. No dependency installation. |
| `node design-review/scripts/setup-capture.mjs` | If not ready, runs `npm install -D playwright @axe-core/playwright` in the consumer project, then `npx playwright install chromium`, then verifies in a fresh process. Changes dependencies/lockfile and `node_modules`; downloads a browser to Playwright's configured cache. Package-manager lifecycle behavior also applies. |
| `node design-review/scripts/capture.mjs <url> --out <dir>` | Opens the supplied route and requested states in Chromium, loads page resources, runs browser checks including declared modal interactions, and writes screenshots, `evidence.json`, and `modal-interaction-receipt.json`. Default output is `evidence/<host>` under the current directory. Reusing an output path can overwrite evidence. |
| `design-review/scripts/rendered-dot-candidates.mjs` | Browser-side diagnostic imported by capture, not a separate CLI. Reads rendered DOM/text/styles and returns candidates; no independent file or network writes. |
| `node agentic-design-system/scripts/run-capture.mjs <url> ...` | Delegates to the capture helper above. `--check` only checks that the helper file exists; it does not verify browser readiness. |
| `node agentic-design-system/scripts/decision-trace.mjs capture --out <manifest> ...` | Reads/hashes named local skill and source files and writes the manifest. No model, browser, or network calls. |
| `node agentic-design-system/scripts/decision-trace.mjs verify --manifest <file> --trace <file> ...` | Reads and validates local provenance. Optional `--validation` writes a receipt; `--report` adds/replaces the managed provenance block in the named report. No model, browser, or network calls. |
| `node ember/scripts/source-preflight.mjs <source-root> <scope.json> <url> <new-receipt.json>` | Reads/hashes named source files; runs read-only `git rev-parse HEAD` and `git status`; opens declared Chromium/WebKit states and performs scope-declared clicks. Writes a new receipt, refusing an existing output file. Requires browsers/dependencies already available. |

### Network and data boundaries

The three Python source checkers send a GET request to
`$ADS_TELEMETRY_URL/skill-fired/<script-name>` **only when `ADS_TELEMETRY_URL` is set**.
There is no built-in endpoint. The code adds the script name, not source contents, to the request;
normal network metadata and anything already present in your configured URL still apply. Leave
that variable unset to disable these pings. Failures are silently ignored by the helpers.

Browser checks are not read-only transactions: route loading runs the app's JavaScript and may
contact its services; modal/preflight clicks can trigger app actions. Use a local fixture or
explicitly authorized test environment. Screenshots and receipts can contain visible private data;
review them before sharing. These scripts are not a security sandbox.

### Installation and optional integrations

- `npx skills add ... --copy --yes` invokes an external installer, fetches/copies skills into the
  selected agent directory, and writes `skills-lock.json`. It does not install the capture runtime
  or edit project instruction files. Review the installer/version as a separate dependency.
- Hermes discovery additionally uses `hermes skills trust`, which records the reviewed Git root
  in the active Hermes profile. Start a fresh session afterward.
- `npx playwright install webkit` is a separate optional browser download for WebKit checks.
- The separately installed [ads-mcp package](https://github.com/aa-on-ai/agentic-design-system/blob/main/packages/ads-mcp/README.md)
  starts a local stdio server. `npx` may fetch the package; `setup` downloads Chromium, while
  `doctor` checks readiness. Tools write run artifacts under the configured project root
  (default `.ads/runs`). Optional visual-judge and SwiftUI adapters execute configured commands;
  their network access, model costs, and side effects depend on those commands. They are not
  enabled by installing the skill pack. Review the package guide and adapter configuration separately.
- Source-checkout evaluation harnesses and the workshop app are maintainer tooling, not bundled
  skill-install startup commands. Their package manifests and testing guide define that surface.

## Customize the design direction

Put durable choices in your project's `DESIGN.md` and existing component/token sources, not by
editing every installed skill. State the desired direction, preserved constraints, and deliberate
exceptions. An explicit current user decision governs; ADS preserves unknown `DESIGN.md` sections
and uses frontmatter tokens over conflicting prose. Updates may replace installed skill files.

Where fallback taste lives:

- `agentic-design-system/contracts/visual-foundation.v2.json`: utility/expressive profiles and review rules.
- `agentic-design-system/presets/`: optional starting points when the project has no established language.
- `ui-polish-pass/SKILL.md`: control geometry, typography mechanics, icon selection, and spacing behavior.
- `web-animation-design/SKILL.md` and `design-review/references/motion.md`: motion guidance.
- `whimsical-design/SKILL.md` and `world-build/SKILL.md`: opt-in expressive direction, not default styling.

Example project direction (adapt it, do not treat these values as universal defaults):

```markdown
## Design direction
- Preserve our existing type, color, spacing, and component tokens.
- Icons: use our existing family. For new surfaces without one, use Phosphor at a consistent weight.
- Motion: use our established duration/easing tokens and support reduced motion.
- Density: preserve the current product's compact desktop layout and mobile reflow.
```

Public ADS does not require a particular commercial icon vendor or personal brand style. Keep a
coherent existing family first, then an explicitly selected and appropriately licensed family;
otherwise choose one suitable open-source family. A taste override does not waive accessibility
or turn an unverified interaction into a pass. Surface conflicts instead of silently replacing the
product language or weakening the relevant checks.

## Credits and provenance

See the repository's [influences record](https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/influences.md)
for named sources, what was borrowed, and what was re-expressed. Source links within references
provide additional context. That record is not a complete historical code-provenance audit or
permission to redistribute third-party assets. Preserve applicable licenses and notices when
adapting source; do not infer authorship or a license from stylistic similarity.
