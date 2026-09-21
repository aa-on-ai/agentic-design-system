#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="${1:-$ROOT}"
HERMES_BIN="${HERMES_BIN:-hermes}"
SKILLS_CLI_PACKAGE="${SKILLS_CLI_PACKAGE:-skills@1.5.19}"

if ! command -v "$HERMES_BIN" >/dev/null 2>&1; then
  echo "native Hermes CLI not found: $HERMES_BIN" >&2
  echo "set HERMES_BIN to the Hermes executable and retry" >&2
  exit 2
fi

TMP_DIR="$(mktemp -d /tmp/ads-hermes-discovery-XXXXXX)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

project="$TMP_DIR/project"
isolated_home="$TMP_DIR/home"
isolated_hermes_home="$TMP_DIR/hermes-home"
mkdir -p "$project" "$isolated_home" "$isolated_hermes_home/skills"
git -C "$project" init --quiet

(
  cd "$project"
  HOME="$isolated_home" \
    HERMES_HOME="$isolated_hermes_home" \
    XDG_CONFIG_HOME="$TMP_DIR/config" \
    XDG_DATA_HOME="$TMP_DIR/data" \
    npx --yes "$SKILLS_CLI_PACKAGE" add "$SOURCE" --agent hermes-agent --copy --yes
) >"$TMP_DIR/install.log" 2>&1

if [[ ! -f "$project/.hermes/skills/agentic-design-system/SKILL.md" ]] ||
   [[ ! -f "$project/.hermes/skills/ember/SKILL.md" ]]; then
  echo "Hermes installer payload is incomplete" >&2
  sed -n '1,200p' "$TMP_DIR/install.log" >&2
  exit 1
fi

run_hermes() {
  (
    cd "$project"
    HOME="$isolated_home" \
      HERMES_HOME="$isolated_hermes_home" \
      XDG_CONFIG_HOME="$TMP_DIR/config" \
      XDG_DATA_HOME="$TMP_DIR/data" \
      "$HERMES_BIN" "$@"
  )
}

run_hermes skills list >"$TMP_DIR/untrusted-list.log" 2>&1
if grep -q 'agentic-design-system' "$TMP_DIR/untrusted-list.log"; then
  echo "Hermes exposed an untrusted project skill" >&2
  sed -n '1,160p' "$TMP_DIR/untrusted-list.log" >&2
  exit 1
fi

run_hermes skills trust >"$TMP_DIR/trust.log" 2>&1
run_hermes skills list >"$TMP_DIR/trusted-list.log" 2>&1

for skill in agentic-design-system ember; do
  if ! grep -q "$skill" "$TMP_DIR/trusted-list.log"; then
    echo "Hermes did not discover trusted project skill: $skill" >&2
    sed -n '1,200p' "$TMP_DIR/trust.log" >&2
    sed -n '1,200p' "$TMP_DIR/trusted-list.log" >&2
    exit 1
  fi
done

echo "Hermes discovery smoke passed: project skills hidden before trust and ADS + Ember visible after trust in an isolated profile"
