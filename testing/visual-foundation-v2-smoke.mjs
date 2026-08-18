#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);
const contractPath = path.join(root, "contracts", "visual-foundation.v2.json");
const bundledPath = path.join(root, "skills", "agentic-design-system", "contracts", "visual-foundation.v2.json");
const schemaPath = path.join(root, "schemas", "visual-foundation-contract.schema.json");
const presetSchemaPath = path.join(root, "schemas", "preset.schema.json");

const [contractSource, bundledSource, schemaSource] = await Promise.all([
  readFile(contractPath, "utf8"),
  readFile(bundledPath, "utf8"),
  readFile(schemaPath, "utf8"),
]);

assert.equal(bundledSource, contractSource, "installed contract copy must match the canonical contract byte for byte");

const contract = JSON.parse(contractSource);
const schema = JSON.parse(schemaSource);
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

assert.equal(validate(contract), true, ajv.errorsText(validate.errors, { separator: "\n" }));
assert.equal(contract.id, "ads-visual-foundation-v2");
assert.equal(contract.evidenceFormat, 2);

const profiles = new Map(contract.profiles.map((profile) => [profile.id, profile]));
const utility = profiles.get("utility");
const expressive = profiles.get("expressive");

assert.ok(utility, "utility profile is required");
assert.ok(expressive, "expressive profile is required");
assert.deepEqual(utility.weights, {
  functionality: 35,
  designQuality: 30,
  craft: 25,
  originality: 10,
});
assert.deepEqual(expressive.weights, {
  designQuality: 35,
  originality: 30,
  craft: 20,
  functionality: 15,
});

for (const profile of profiles.values()) {
  assert.equal(
    Object.values(profile.weights).reduce((sum, weight) => sum + weight, 0),
    100,
    `${profile.id} weights must total 100`,
  );
}

const rules = new Map(contract.rules.map((rule) => [rule.id, rule]));
for (const requiredRule of [
  "rounded-single-edge-border",
  "one-edge-shadow-spoof",
  "forced-uppercase",
  "authored-all-caps",
  "em-dash-copy",
  "unconventional-typography",
  "text-symbol-control",
  "status-dot",
  "status-readable-without-color",
  "colon-copy",
  "divider-density",
]) {
  assert.ok(rules.has(requiredRule), `${requiredRule} rule is required`);
}

assert.equal(rules.get("rounded-single-edge-border").policy, "never");
assert.equal(rules.get("status-dot").policy, "never");
assert.equal(
  rules.get("forced-uppercase").automaticEnforcement,
  "report-only",
  "forced-uppercase evidence remains report-only in the foundation release",
);
assert.equal(
  rules.get("em-dash-copy").automaticEnforcement,
  "report-only",
  "em-dash evidence remains report-only in the foundation release",
);
assert.equal(rules.get("colon-copy").automaticEnforcement, "report-only");
assert.equal(rules.get("divider-density").automaticEnforcement, "report-only");
assert.equal(contract.typography.utilityDefault, "conventional-general-purpose");
assert.deepEqual(contract.iconography.preferenceOrder, [
  "existing-coherent-project-family",
  "licensed-nucleo",
  "one-open-family",
]);

console.log("[visual-foundation-v2] contract, profiles, rules, and installed copy passed");

const presetSchema = JSON.parse(await readFile(presetSchemaPath, "utf8"));
const validatePreset = ajv.compile(presetSchema);
const presetProfiles = {
  "utilitarian-app": "utility",
  "dense-dashboard": "utility",
  "marketing-editorial": "expressive",
};

for (const [presetId, expectedProfile] of Object.entries(presetProfiles)) {
  const preset = JSON.parse(await readFile(path.join(root, "presets", `${presetId}.json`), "utf8"));
  assert.equal(validatePreset(preset), true, `${presetId} ${ajv.errorsText(validatePreset.errors)}`);
  assert.equal(preset.visualFoundationProfile, expectedProfile, `${presetId} must lock its visual foundation profile`);
}

console.log("[visual-foundation-v2] preset profile locks passed");

for (const templatePath of [
  path.join(root, "templates", "outcome-template.md"),
  path.join(root, "skills", "agentic-design-system", "templates", "outcome-template.md"),
]) {
  const outcomeTemplate = await readFile(templatePath, "utf8");
  for (const criterion of ["State coverage", "Accessibility", "Evidence"]) {
    assert.match(
      outcomeTemplate,
      new RegExp(`\\| ${criterion} \\| pass/fail \\| pass/fail \\|`),
      `${path.relative(root, templatePath)} must preserve all four rubric columns for ${criterion}`,
    );
  }
}

console.log("[visual-foundation-v2] outcome rubric table shape passed");

const releaseWorkflow = await readFile(path.join(root, ".github", "workflows", "release-gate.yml"), "utf8");
assert.match(
  releaseWorkflow,
  /npm run pawprint:states -- http:\/\/127\.0\.0\.1:3000/,
  "release-gate browser coverage must exercise Pawprint hash routing in Chromium",
);
assert.match(
  releaseWorkflow,
  /ADS_BROWSER=webkit npm run pawprint:states -- http:\/\/127\.0\.0\.1:3000/,
  "release-gate browser coverage must exercise Pawprint hash routing in WebKit",
);

console.log("[visual-foundation-v2] Pawprint release-gate browser coverage passed");

const utilityFontCheck = await execFileAsync("python3", [
  path.join(root, "skills", "design-review", "scripts", "anti-pattern-check.py"),
  path.join(root, "testing", "fixtures", "utility-font-pass.tsx"),
]);
assert.match(utilityFontCheck.stdout, /valid utility default/i);

console.log("[visual-foundation-v2] conventional utility font preflight passed without a warning exit");

async function rgOutput(args) {
  try {
    return (await execFileAsync("rg", args, { cwd: root })).stdout;
  } catch (error) {
    if (error.code === 1) return "";
    throw error;
  }
}

assert.equal(
  await rgOutput(["-n", "Aaron|memory/channels|channel memory|delighted him", "skills", "templates"]),
  "",
  "public skill content must not assume a maintainer, home memory layout, or user gender",
);
assert.equal(
  await rgOutput([
    "-n",
    "SIGNAL_STRONG|ANALYSER_ACTIVE|PROTOCOL: ACTIVE|ORBIT: STABLE|COMMS: OPEN|INITIALIZING|LOADING EVIDENCE|ENTERING LAB",
    "skills/world-build/SKILL.md",
  ]),
  "",
  "creative guidance must not recommend authored all-caps interface copy",
);
assert.equal(
  await rgOutput([
    "-n",
    "(?:node|python3) skills/(?:agentic-design-system|design-review)",
    "skills/agentic-design-system",
  ]),
  "",
  "installed commands must not assume the OpenClaw skills root",
);

const receiptRelative = path.join("docs", "foundation-v2", "receipts", "pawprint", "evidence.json");
await assert.doesNotReject(
  () => readFile(path.join(root, receiptRelative), "utf8"),
  "the run report's Pawprint evidence receipt must exist at a tracked path",
);
let receiptIgnored = false;
try {
  await execFileAsync("git", ["check-ignore", "--no-index", "-q", receiptRelative], { cwd: root });
  receiptIgnored = true;
} catch (error) {
  if (error.code !== 1) throw error;
}
assert.equal(receiptIgnored, false, "the Pawprint evidence receipt must not be ignored by git");

console.log("[visual-foundation-v2] public language and installed command paths passed");
