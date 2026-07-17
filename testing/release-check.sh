#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

node testing/check-release-metadata.mjs
testing/install-smoke.sh
testing/install-matrix.sh
npm run compare:smoke
npm run render-eval:smoke
npm run eval-loop:render-smoke
npm run decision-trace:smoke

echo "release gate passed: metadata, install distribution, comparison, render authority, eval-loop authority, and decision provenance"
