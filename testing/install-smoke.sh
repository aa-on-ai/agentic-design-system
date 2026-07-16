#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${1:-$ROOT}"
TMP_DIR="$(mktemp -d /tmp/ads-install-smoke-XXXXXX)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$TMP_DIR/home" "$TMP_DIR/config" "$TMP_DIR/data"

(
  cd "$TMP_DIR"
  HOME="$TMP_DIR/home" \
    XDG_CONFIG_HOME="$TMP_DIR/config" \
    XDG_DATA_HOME="$TMP_DIR/data" \
    npx skills add "$SOURCE" --yes
)

expected=(
  agent-friendly-design
  agentic-design-system
  design-review
  ui-polish-pass
  ux-baseline-check
  visual-reference-calibration
  web-animation-design
  whimsical-design
  world-build
)

for skill in "${expected[@]}"; do
  path="$TMP_DIR/.agents/skills/$skill/SKILL.md"
  if [[ ! -f "$path" ]]; then
    echo "missing installed skill: $skill" >&2
    exit 1
  fi
done

bundled_templates=(
  outcome-template.md
  project-identity-template.md
  reference-intake-contract.md
  grader-report-template.md
  run-report-template.md
)

for template in "${bundled_templates[@]}"; do
  path="$TMP_DIR/.agents/skills/agentic-design-system/templates/$template"
  if [[ ! -f "$path" ]]; then
    echo "missing bundled template: $template" >&2
    exit 1
  fi
  if ! diff -q "$ROOT/templates/$template" "$path" >/dev/null; then
    echo "bundled template drift: templates/$template != installed skills/agentic-design-system/templates/$template" >&2
    echo "  re-sync: cp templates/$template skills/agentic-design-system/templates/$template" >&2
    exit 1
  fi
done

# Runnable workflow runbooks must ship with the orchestrator skill AND stay byte-identical to the
# canonical top-level workflows/ — otherwise installed agents get a stale steering wheel.
runbooks=(
  create-design-workflow.md
  mobile-review.md
  adversarial-design-review.md
  install-usability-smoke.md
  readme-docs-critique.md
  cold-agent-usage-test.md
)

for runbook in "${runbooks[@]}"; do
  installed="$TMP_DIR/.agents/skills/agentic-design-system/workflows/$runbook"
  canonical="$ROOT/workflows/$runbook"
  if [[ ! -f "$installed" ]]; then
    echo "missing bundled workflow runbook: $runbook" >&2
    exit 1
  fi
  if ! diff -q "$canonical" "$installed" >/dev/null; then
    echo "workflow runbook drift: workflows/$runbook != bundled skills/agentic-design-system/workflows/$runbook" >&2
    echo "  re-sync: cp workflows/$runbook skills/agentic-design-system/workflows/$runbook" >&2
    exit 1
  fi
done

echo "install smoke passed: ${#expected[@]} skills, ${#bundled_templates[@]} bundled templates, and ${#runbooks[@]} workflow runbooks (all in sync)"
