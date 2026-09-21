#!/usr/bin/env node

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skill = await readFile(path.join(root, "skills/agentic-design-system/SKILL.md"), "utf8");

const headings = [...skill.matchAll(/^## ([^\n]+)$/gm)].map((match) => match[1].trim());
let previous = -1;
for (const step of ["Understand", "Choose", "Work", "Prove", "Decide"]) {
  const index = headings.indexOf(step);
  assert.ok(index > previous, `scoped loop must expose ordered ## ${step}`);
  previous = index;
}

for (const required of [
  "Tiny copy-only or mechanical edits stay tiny",
  "Preserve what already works",
  "Explore",
  "Build",
  "Review",
  "task-relevant source checks and states",
  "Ember’s review",
  "one implementation/review pass plus at most",
  "ready",
  "needs repair",
  "blocked",
]) {
  assert.ok(skill.includes(required), `orchestrator must preserve ${JSON.stringify(required)}`);
}

for (const forbidden of [
  /score your output/i,
  /at least 3 passes/i,
  /core pack.*always active/i,
  /approval before repository writes/i,
]) {
  assert.doesNotMatch(skill, forbidden, `orchestrator must not restore ${forbidden}`);
}

for (const removed of [
  "workflows/create-design-workflow.md",
  "skills/agentic-design-system/workflows/create-design-workflow.md",
  "skills/design-review/scripts/compare.mjs",
]) {
  await assert.rejects(access(path.join(root, removed)), { code: "ENOENT" }, `${removed} must remain absent`);
}

for (const publicDoc of ["README.md", "AGENTS.md", "docs/README.md"]) {
  const source = await readFile(path.join(root, publicDoc), "utf8");
  assert.match(source, /skills\/agentic-design-system\/SKILL\.md/, `${publicDoc} must point to ADS`);
  assert.doesNotMatch(source, /create-design-workflow/i, `${publicDoc} must not advertise a parallel entrypoint`);
}

assert.match(await readFile(path.join(root, "AGENTS.md"), "utf8"), /substantial design build or review handoff[\s\S]*Ember/i);
assert.match(await readFile(path.join(root, "README.md"), "utf8"), /substantial design handoffs[\s\S]*Ember/i);

console.log("default orchestrator contract passed: one scoped loop, task-triggered specialists, Ember default handoff, and no parallel entrypoint");
