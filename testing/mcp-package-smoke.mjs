#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(repositoryRoot, "packages", "ads-mcp");
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "ads-mcp-package-smoke-"));

let fixtureServer;
let client;

try {
  const { stdout: packOutput } = await execFileAsync(
    "npm",
    ["pack", "--json", "--pack-destination", temporaryRoot],
    { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packed] = JSON.parse(packOutput);
  assert.equal(packed.name, "ads-mcp");
  assert.equal(packed.version, "0.3.0");
  assert.ok(packed.files.some(({ path: file }) => file === "dist/cli.js"));
  assert.ok(packed.files.some(({ path: file }) => file === "dist/vendor/capture.mjs"));
  assert.equal(
    packed.files.some(({ path: file }) => file === "scripts/postinstall.mjs"),
    false,
    "the package must not contain a browser-download postinstall",
  );
  assert.ok(packed.files.some(({ path: file }) => file === "LICENSE"));

  const archive = path.join(temporaryRoot, packed.filename);
  const consumerRoot = path.join(temporaryRoot, "consumer");
  const projectRoot = path.join(temporaryRoot, "project");
  const browserRoot = path.join(temporaryRoot, "browsers");
  const consumerEnvironment = {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: browserRoot,
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1",
  };
  await Promise.all([
    mkdir(consumerRoot, { recursive: true }),
    mkdir(path.join(projectRoot, "skills", "design-review"), { recursive: true }),
    mkdir(path.join(projectRoot, "src"), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(consumerRoot, "package.json"), '{"name":"ads-mcp-smoke-consumer","private":true}\n'),
    writeFile(path.join(projectRoot, "skills", "design-review", "SKILL.md"), "Rule: keep actions reachable.\n"),
    writeFile(path.join(projectRoot, "brief.md"), "Constraint: actions remain reachable.\n"),
    writeFile(path.join(projectRoot, "src", "Orders.tsx"), "export default function Orders() { return null; }\n"),
  ]);

  await execFileAsync(
    "npm",
    ["install", "--no-audit", "--no-fund", archive],
    { cwd: consumerRoot, env: consumerEnvironment, maxBuffer: 10 * 1024 * 1024 },
  );

  const executable = path.join(consumerRoot, "node_modules", ".bin", "ads-mcp");
  await assert.rejects(
    execFileAsync(executable, ["doctor", "--json"], { env: consumerEnvironment }),
    (error) => {
      const report = JSON.parse(error.stdout || "{}");
      assert.equal(error.code, 1);
      assert.equal(report.browser?.ready, false);
      assert.equal(report.browser?.setupCommand, "npx --yes ads-mcp@0.3.0 setup");
      return true;
    },
  );
  await execFileAsync(executable, ["setup"], {
    env: consumerEnvironment,
    maxBuffer: 10 * 1024 * 1024,
  });
  const { stdout: doctorOutput } = await execFileAsync(executable, ["doctor", "--json"], {
    env: consumerEnvironment,
  });
  assert.equal(JSON.parse(doctorOutput).browser?.ready, true);
  const { stdout: help } = await execFileAsync(executable, ["--help"], { env: consumerEnvironment });
  assert.match(help, /ads-mcp --root/);
  assert.match(help, /ads-mcp setup/);
  assert.match(help, /ads-mcp doctor/);
  assert.match(help, /--judge-command/);
  assert.match(help, /--swiftui-command/);

  const requireFromConsumer = createRequire(path.join(consumerRoot, "package.json"));
  const [{ Client }, { StdioClientTransport }] = await Promise.all([
    import(pathToFileURL(requireFromConsumer.resolve("@modelcontextprotocol/client"))),
    import(pathToFileURL(requireFromConsumer.resolve("@modelcontextprotocol/client/stdio"))),
  ]);

  fixtureServer = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end('<!doctype html><html lang="en"><head><title>Orders</title><meta name="viewport" content="width=device-width"></head><body><main><h1>Orders</h1><button style="min-width:48px;min-height:48px">Create order</button></main></body></html>');
  });
  const port = await new Promise((resolve, reject) => {
    fixtureServer.once("error", reject);
    fixtureServer.listen(0, "127.0.0.1", () => {
      const address = fixtureServer.address();
      if (!address || typeof address === "string") reject(new Error("fixture server has no port"));
      else resolve(address.port);
    });
  });

  const transport = new StdioClientTransport({
    command: executable,
    args: ["--root", projectRoot],
    env: consumerEnvironment,
    stderr: "pipe",
  });
  client = new Client({ name: "ads-package-smoke", version: "1.0.0" });
  await client.connect(transport);

  const tools = await client.listTools();
  assert.deepEqual(tools.tools.map(({ name }) => name).sort(), ["ads_evaluate", "ads_render", "ads_trace"]);
  assert.match(client.getInstructions() || "", /Call ads_trace only when the render manifest contains/);
  assert.match(client.getInstructions() || "", /Never invent provenance paths/);
  const renderResult = await client.callTool({
    name: "ads_render",
    arguments: {
      target: { type: "url", url: `http://127.0.0.1:${port}/` },
      viewports: [{ width: 390, height: 844 }],
      waitFor: "main",
      settleMs: 25,
      provenance: {
        observedSkillFiles: ["skills/design-review/SKILL.md"],
        sourceFiles: ["brief.md"],
        artifactFiles: ["src/Orders.tsx"],
      },
    },
  });
  const rendered = renderResult.structuredContent;
  assert.equal(rendered.status, "complete");

  const evaluateResult = await client.callTool({
    name: "ads_evaluate",
    arguments: {
      runId: rendered.runId,
      rubric: { task: "Review orders", criteria: [{ name: "Functionality", weight: 100 }] },
    },
  });
  assert.equal(evaluateResult.structuredContent.status, "needs_human");

  const traceResult = await client.callTool({
    name: "ads_trace",
    arguments: {
      runId: rendered.runId,
      context: "Package smoke",
      decisions: [{
        id: "reachable-action",
        decision: "Keep actions reachable.",
        artifact: { path: "src/Orders.tsx" },
        rule: { path: "skills/design-review/SKILL.md", excerpt: "Rule: keep actions reachable." },
        sourceConstraint: { path: "brief.md", excerpt: "Constraint: actions remain reachable." },
        evidence: [rendered.artifacts.evidence],
      }],
    },
  });
  assert.equal(traceResult.structuredContent.valid, true);
  const evidence = await client.readResource({ uri: rendered.artifacts.evidence });
  assert.equal(evidence.contents.length, 1);

  const urlOnlyRenderResult = await client.callTool({
    name: "ads_render",
    arguments: {
      target: { type: "url", url: `http://127.0.0.1:${port}/` },
      viewports: [{ width: 390, height: 844 }],
      waitFor: "main",
      settleMs: 25,
    },
  });
  const urlOnlyRendered = urlOnlyRenderResult.structuredContent;
  assert.equal(urlOnlyRendered.status, "complete");
  const urlOnlyTraceResult = await client.callTool({
    name: "ads_trace",
    arguments: {
      runId: urlOnlyRendered.runId,
      context: "URL-only package smoke",
      decisions: [{
        id: "requested-default-capture",
        decision: "Capture the requested default state.",
        artifact: { path: "https://agentic-design-system.vercel.app/mcp" },
        rule: { path: "user-request", excerpt: "Render the default state." },
        sourceConstraint: { path: "user-request", excerpt: "Render the default state." },
        evidence: [urlOnlyRendered.artifacts.evidence],
      }],
    },
  });
  assert.equal(urlOnlyTraceResult.structuredContent.valid, false);
  assert.deepEqual(urlOnlyTraceResult.structuredContent.errors, [
    "trace not applicable: render manifest is missing required provenance (observed skill files, source files, artifact files); rerun ads_render with provenance.observedSkillFiles, provenance.sourceFiles, and provenance.artifactFiles before calling ads_trace",
  ]);
  assert.doesNotMatch(
    urlOnlyTraceResult.structuredContent.errors.join("\n"),
    /ENOENT|realpath|user-request|https:/,
  );

  process.stdout.write(`${JSON.stringify({
    status: "passed",
    package: `${packed.name}@${packed.version}`,
    archive: packed.filename,
    browserSetup: "explicit",
    tools: tools.tools.map(({ name }) => name),
    sequence: [rendered.status, evaluateResult.structuredContent.status, traceResult.structuredContent.valid],
    urlOnlyTrace: {
      valid: urlOnlyTraceResult.structuredContent.valid,
      errors: urlOnlyTraceResult.structuredContent.errors,
    },
  }, null, 2)}\n`);
} finally {
  if (client) await client.close().catch(() => {});
  if (fixtureServer) {
    await new Promise((resolve) => fixtureServer.close(() => resolve()));
  }
  await rm(temporaryRoot, { recursive: true, force: true });
}
