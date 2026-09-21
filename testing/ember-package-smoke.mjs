#!/usr/bin/env node

import assert from "node:assert/strict";
import { lstat, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceSkillsRoot = path.join(root, "skills");
const skillsRoot = path.resolve(process.argv[2] ?? sourceSkillsRoot);
const emberRoot = path.join(skillsRoot, "ember");
const assets = [
  "SKILL.md",
  "references/ember-contract.md",
  "examples/ready.md",
  "examples/needs-repair.md",
  "examples/blocked.md",
  "references/first-use.md",
  "scripts/source-preflight.mjs",
];

const missing = [];
for (const asset of assets) {
  try {
    assert.ok((await stat(path.join(emberRoot, asset))).isFile());
  } catch {
    missing.push(`ember/${asset}`);
  }
}
assert.deepEqual(missing, [], `Ember payload is incomplete: ${missing.join(", ")}`);

const resolvedSkillsRoot = await realpath(skillsRoot);
for (const asset of assets) {
  const installed = path.join(emberRoot, asset);
  assert.ok(!(await lstat(installed)).isSymbolicLink(), `${asset} must be copied, not linked`);
  const relative = path.relative(resolvedSkillsRoot, await realpath(installed));
  assert.ok(relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative),
    `${asset} must remain inside the installed skills directory`);
  assert.deepEqual(await readFile(installed), await readFile(path.join(sourceSkillsRoot, "ember", asset)),
    `installed Ember asset differs from the candidate: ${asset}`);
}

const skill = await readFile(path.join(emberRoot, "SKILL.md"), "utf8");
for (const dependency of ["../agentic-design-system/SKILL.md", "references/ember-contract.md"]) {
  assert.ok(skill.includes(dependency), `Ember must name its portable dependency: ${dependency}`);
  assert.ok((await stat(path.resolve(emberRoot, dependency))).isFile(),
    `Ember dependency does not resolve: ${dependency}`);
}

// Check local Markdown links in the entry and contract after the install has moved them.
for (const asset of ["SKILL.md", "references/ember-contract.md", "references/first-use.md"]) {
  const file = path.join(emberRoot, asset);
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1].replace(/^<|>$/g, "").split("#")[0];
    if (!target || /^[a-z][a-z\d+.-]*:/i.test(target)) continue;
    assert.ok(!path.isAbsolute(target), `${asset} has a non-portable absolute link: ${target}`);
    const resolved = path.resolve(path.dirname(file), target);
    const relative = path.relative(skillsRoot, resolved);
    assert.ok(relative !== ".." && !relative.startsWith(`..${path.sep}`),
      `${asset} links outside the installed skills: ${target}`);
    await stat(resolved);
  }
}

console.log(`[ember-package-smoke] ${assets.length} copied assets and sibling dependencies verified under ${skillsRoot}`);
