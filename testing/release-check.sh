#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

node testing/check-release-metadata.mjs
npm run orchestrator:contract
npm run ember:package
npm run ember:first-use
testing/install-smoke.sh
testing/install-matrix.sh
npm run visual-foundation:v2
npm run capture-evidence:v2
npm run challenger-contracts:smoke
npm run render-eval:smoke
npm run eval-loop:render-smoke
npm run production-gates:smoke
npm run structured-findings:smoke
npm run decision-trace:smoke
npm run regression:smoke

echo "release gate passed: metadata, Ember behavior, install distribution, visual foundation v2, challenger interaction contracts, render authority, production evidence, structured findings, eval-loop authority, decision provenance, and frozen adjacent-action regression"
