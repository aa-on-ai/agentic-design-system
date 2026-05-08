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

for template in outcome-template.md grader-report-template.md; do
  path="$TMP_DIR/.agents/skills/agentic-design-system/templates/$template"
  if [[ ! -f "$path" ]]; then
    echo "missing bundled template: $template" >&2
    exit 1
  fi
done

echo "install smoke passed: ${#expected[@]} skills and bundled outcome/grader templates"
