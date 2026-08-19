#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${1:-$ROOT}"
SKILLS_CLI_PACKAGE="${SKILLS_CLI_PACKAGE:-skills@1.5.19}"
TMP_DIR="$(mktemp -d /tmp/ads-install-matrix-XXXXXX)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

expected=(
  agent-friendly-design
  agentic-design-system
  design-review
  design-variations
  ui-polish-pass
  ux-baseline-check
  visual-reference-calibration
  web-animation-design
  whimsical-design
  world-build
)

bundled_templates=(
  outcome-template.md
  project-identity-template.md
  reference-intake-contract.md
  grader-report-template.md
  run-report-template.md
)

runbooks=(
  create-design-workflow.md
  mobile-review.md
  adversarial-design-review.md
  install-usability-smoke.md
  readme-docs-critique.md
  cold-agent-usage-test.md
  decision-provenance.md
)

bundled_presets=(
  utilitarian-app.md
  utilitarian-app.json
  dense-dashboard.md
  dense-dashboard.json
  marketing-editorial.md
  marketing-editorial.json
  README.md
)

agent_specs=(
  "claude-code|.claude/skills"
  "codex|.agents/skills"
  "cursor|.agents/skills"
  "openclaw|skills"
  "hermes-agent|.hermes/skills"
)

for spec in "${agent_specs[@]}"; do
  IFS='|' read -r agent install_root <<< "$spec"
  sandbox="$TMP_DIR/$agent"
  project="$sandbox/project"
  mkdir -p "$project" "$sandbox/home" "$sandbox/config" "$sandbox/data"

  if ! (
    cd "$project"
    HOME="$sandbox/home" \
      XDG_CONFIG_HOME="$sandbox/config" \
      XDG_DATA_HOME="$sandbox/data" \
      npx --yes "$SKILLS_CLI_PACKAGE" add "$SOURCE" --agent "$agent" --copy --yes
  ) >"$sandbox/install.log" 2>&1; then
    echo "install failed for $agent" >&2
    sed -n '1,240p' "$sandbox/install.log" >&2
    exit 1
  fi

  for skill in "${expected[@]}"; do
    path="$project/$install_root/$skill/SKILL.md"
    if [[ ! -f "$path" ]]; then
      echo "missing installed skill for $agent: $install_root/$skill/SKILL.md" >&2
      exit 1
    fi
  done

  installed_count="$(find "$project/$install_root" -mindepth 2 -maxdepth 2 -type f -name SKILL.md | wc -l | tr -d ' ')"
  if [[ "$installed_count" != "${#expected[@]}" ]]; then
    echo "unexpected skill count for $agent: expected ${#expected[@]}, found $installed_count" >&2
    exit 1
  fi

  variation_asset="$project/$install_root/design-variations/assets/variations.html"
  if [[ ! -f "$variation_asset" ]]; then
    echo "missing installed variation asset for $agent" >&2
    exit 1
  fi
  if ! diff -q "$ROOT/skills/design-variations/assets/variations.html" "$variation_asset" >/dev/null; then
    echo "installed variation asset drift for $agent" >&2
    exit 1
  fi

  trace_script="$project/$install_root/agentic-design-system/scripts/decision-trace.mjs"
  if [[ ! -f "$trace_script" ]]; then
    echo "missing installed decision-trace script for $agent" >&2
    exit 1
  fi
  if ! diff -q "$ROOT/skills/agentic-design-system/scripts/decision-trace.mjs" "$trace_script" >/dev/null; then
    echo "installed decision-trace script drift for $agent" >&2
    exit 1
  fi

  structured_findings_reference="$project/$install_root/agentic-design-system/references/structured-findings.md"
  if [[ ! -f "$structured_findings_reference" ]]; then
    echo "missing installed structured-findings reference for $agent" >&2
    exit 1
  fi

  visual_contract="$project/$install_root/agentic-design-system/contracts/visual-foundation.v2.json"
  if [[ ! -f "$visual_contract" ]]; then
    echo "missing installed visual-foundation contract for $agent" >&2
    exit 1
  fi
  if ! diff -q "$ROOT/contracts/visual-foundation.v2.json" "$visual_contract" >/dev/null; then
    echo "installed visual-foundation contract drift for $agent" >&2
    exit 1
  fi

  routing="$project/$install_root/agentic-design-system/routing/ROUTING.md"
  if [[ ! -f "$routing" ]]; then
    echo "missing installed routing contract for $agent" >&2
    exit 1
  fi
  if ! diff -q "$ROOT/routing/ROUTING.md" "$routing" >/dev/null; then
    echo "installed routing contract drift for $agent" >&2
    exit 1
  fi

  for schema in preset.schema.json visual-foundation-contract.schema.json; do
    installed="$project/$install_root/agentic-design-system/schemas/$schema"
    canonical="$ROOT/schemas/$schema"
    if [[ ! -f "$installed" ]]; then
      echo "missing bundled schema for $agent: $schema" >&2
      exit 1
    fi
    if ! diff -q "$canonical" "$installed" >/dev/null; then
      echo "bundled schema drift for $agent: $schema" >&2
      exit 1
    fi
  done

  for preset in "${bundled_presets[@]}"; do
    installed="$project/$install_root/agentic-design-system/presets/$preset"
    canonical="$ROOT/presets/$preset"
    if [[ ! -f "$installed" ]]; then
      echo "missing bundled preset for $agent: $preset" >&2
      exit 1
    fi
    if ! diff -q "$canonical" "$installed" >/dev/null; then
      echo "bundled preset drift for $agent: $preset" >&2
      exit 1
    fi
  done
  if ! diff -q "$ROOT/skills/agentic-design-system/references/structured-findings.md" "$structured_findings_reference" >/dev/null; then
    echo "installed structured-findings reference drift for $agent" >&2
    exit 1
  fi

  for template in "${bundled_templates[@]}"; do
    installed="$project/$install_root/agentic-design-system/templates/$template"
    canonical="$ROOT/templates/$template"
    if [[ ! -f "$installed" ]]; then
      echo "missing bundled template for $agent: $template" >&2
      exit 1
    fi
    if ! diff -q "$canonical" "$installed" >/dev/null; then
      echo "bundled template drift for $agent: $template" >&2
      exit 1
    fi
  done

  for runbook in "${runbooks[@]}"; do
    installed="$project/$install_root/agentic-design-system/workflows/$runbook"
    canonical="$ROOT/workflows/$runbook"
    if [[ ! -f "$installed" ]]; then
      echo "missing bundled workflow for $agent: $runbook" >&2
      exit 1
    fi
    if ! diff -q "$canonical" "$installed" >/dev/null; then
      echo "bundled workflow drift for $agent: $runbook" >&2
      exit 1
    fi
  done

  capture_runner="$project/$install_root/agentic-design-system/scripts/run-capture.mjs"
  if ! node "$capture_runner" --check >"$sandbox/capture-check.log" 2>&1; then
    echo "installed capture command failed for $agent" >&2
    sed -n '1,120p' "$sandbox/capture-check.log" >&2
    exit 1
  fi

  if ! node "$trace_script" --help >"$sandbox/trace-help.log" 2>&1; then
    echo "installed decision-trace command failed for $agent" >&2
    sed -n '1,120p' "$sandbox/trace-help.log" >&2
    exit 1
  fi

  sample="$project/ads-consumer-sample.tsx"
  printf '%s\n' \
    'export function Sample({ state }: { state: string }) {' \
    '  return <main className="sm:p-4"><h1>Orders</h1><section>{state === "loading" ? "Loading" : state === "empty" ? "No orders yet" : state === "error" ? "Error, try again" : "Ready"}</section><button className="focus-visible:ring-2">Retry</button></main>;' \
    '}' >"$sample"
  for source_check in anti-pattern-check.py state-check.py accessibility-check.py; do
    if ! python3 "$project/$install_root/design-review/scripts/$source_check" "$sample" >"$sandbox/$source_check.log" 2>&1; then
      echo "installed source command failed for $agent: $source_check" >&2
      sed -n '1,160p' "$sandbox/$source_check.log" >&2
      exit 1
    fi
  done

  node "$ROOT/testing/installed-reference-smoke.mjs" "$project/$install_root"

  if [[ ! -f "$project/skills-lock.json" ]]; then
    echo "missing skills-lock.json for $agent" >&2
    exit 1
  fi

  echo "install passed: $agent -> $install_root"
done

echo "install matrix passed: ${#agent_specs[@]} agents x ${#expected[@]} skills, with contracts, routing, presets, executable consumer commands, portable instructional references, templates, workflow runbooks, and lockfiles verified"
