#!/usr/bin/env node

import { access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const capture = path.resolve(here, "..", "..", "design-review", "scripts", "capture.mjs");

if (process.argv.includes("--check")) {
  await access(capture);
  console.log(`capture command ready at ${capture}`);
  process.exit(0);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Usage  node <agentic-design-system skill>/scripts/run-capture.mjs <url> [capture options]");
  console.log("Check  node <agentic-design-system skill>/scripts/run-capture.mjs --check");
  process.exit(0);
}

await import(pathToFileURL(capture).href);
