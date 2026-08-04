#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(repositoryRoot, "packages", "ads-mcp");
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "ads-mcp-cold-start-"));
let client;

try {
  await execFileAsync("npm", ["run", "build"], {
    cwd: packageRoot,
    maxBuffer: 10 * 1024 * 1024,
  });
  const { stdout: packOutput } = await execFileAsync(
    "npm",
    ["pack", "--json", "--pack-destination", temporaryRoot],
    { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packed] = JSON.parse(packOutput);
  assert.equal(packed.name, "ads-mcp");
  assert.equal(packed.version, "0.3.0");
  assert.equal(
    packed.files.some(({ path: file }) => file === "scripts/postinstall.mjs"),
    false,
    "the package must not contain a browser-download postinstall",
  );

  const archive = path.join(temporaryRoot, packed.filename);
  const projectRoot = path.join(temporaryRoot, "project");
  const npmCache = path.join(temporaryRoot, "npm-cache");
  const browserRoot = path.join(temporaryRoot, "browsers");
  await Promise.all([
    mkdir(projectRoot, { recursive: true }),
    mkdir(npmCache, { recursive: true }),
    mkdir(browserRoot, { recursive: true }),
    writeFile(path.join(temporaryRoot, "package.json"), '{"name":"ads-cold-client","private":true}\n'),
  ]);

  const requireFromPackage = createRequire(path.join(packageRoot, "package.json"));
  const [{ Client }, { StdioClientTransport }] = await Promise.all([
    import(pathToFileURL(requireFromPackage.resolve("@modelcontextprotocol/client"))),
    import(pathToFileURL(requireFromPackage.resolve("@modelcontextprotocol/client/stdio"))),
  ]);
  const environment = {
    ...process.env,
    npm_config_cache: npmCache,
    npm_config_audit: "false",
    npm_config_fund: "false",
    npm_config_update_notifier: "false",
    PLAYWRIGHT_BROWSERS_PATH: browserRoot,
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1",
  };
  const transport = new StdioClientTransport({
    command: "npm",
    args: [
      "exec",
      "--yes",
      `--package=${archive}`,
      "--",
      "ads-mcp",
      "--root",
      projectRoot,
    ],
    env: environment,
    stderr: "pipe",
  });
  client = new Client({ name: "ads-cold-start-smoke", version: "1.0.0" });
  const started = performance.now();
  let timeout;
  await Promise.race([
    client.connect(transport),
    new Promise((_, reject) => {
      timeout = setTimeout(
        () => reject(new Error("cold MCP connection exceeded Claude Code's 30000ms budget")),
        30_000,
      );
    }),
  ]).finally(() => clearTimeout(timeout));
  const connectMs = Math.round(performance.now() - started);

  const tools = await client.listTools();
  assert.deepEqual(
    tools.tools.map(({ name }) => name).sort(),
    ["ads_evaluate", "ads_render", "ads_trace"],
  );
  const renderResult = await client.callTool({
    name: "ads_render",
    arguments: {
      target: { type: "url", url: "http://127.0.0.1:65534/" },
      states: ["default"],
      viewports: [{ width: 390, height: 844 }],
    },
  });
  const rendered = renderResult.structuredContent;
  assert.equal(rendered.status, "blocked");
  assert.ok(rendered.blockers.some((blocker) => blocker.includes("ads-mcp@0.3.0 setup")));
  const resources = await client.listResources();
  assert.ok(resources.resources.some(({ uri }) => uri === rendered.artifacts.evidence));
  assert.deepEqual(await readdir(browserRoot), [], "cold MCP startup must not download Chromium");

  process.stdout.write(`${JSON.stringify({
    status: "passed",
    package: `${packed.name}@${packed.version}`,
    connectMs,
    budgetMs: 30_000,
    tools: tools.tools.map(({ name }) => name),
    missingBrowser: rendered.status,
    listedResources: resources.resources.length,
    browserDownloaded: false,
  }, null, 2)}\n`);
} finally {
  if (client) await client.close().catch(() => {});
  await rm(temporaryRoot, { recursive: true, force: true });
}
