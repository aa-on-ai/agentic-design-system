#!/usr/bin/env node

import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const skillsRoot = process.argv[2];
if (!skillsRoot) {
  console.error("usage: node testing/installed-reference-smoke.mjs <installed-skills-root>");
  process.exit(2);
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(candidate);
    return entry.isFile() && entry.name.endsWith(".md") ? [candidate] : [];
  }));
  return files.flat();
}

const failures = [];
const references = new Set();

for (const file of await markdownFiles(skillsRoot)) {
  const source = await readFile(file, "utf8");
  const lines = source.split("\n");

  lines.forEach((line, index) => {
    for (const match of line.matchAll(/`skills\/[^`\s]+`/g)) {
      failures.push(`${path.relative(skillsRoot, file)}:${index + 1} uses non-portable ${match[0]}`);
    }
    if (line.includes("testing/fixtures")) {
      failures.push(`${path.relative(skillsRoot, file)}:${index + 1} references repo-only testing/fixtures`);
    }
  });

  for (const match of source.matchAll(/<skills-root>\/([A-Za-z0-9._/-]+)/g)) {
    references.add(match[1]);
  }
}

for (const reference of references) {
  const target = path.join(skillsRoot, reference);
  try {
    await stat(target);
  } catch {
    failures.push(`<skills-root>/${reference} does not resolve under ${skillsRoot}`);
  }
}

assert.deepEqual(failures, [], `installed guidance has unresolved references\n${failures.join("\n")}`);
console.log(`[installed-reference-smoke] ${references.size} portable references resolved under ${skillsRoot}`);
