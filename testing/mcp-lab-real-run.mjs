#!/usr/bin/env node

import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const requireFromMcp = createRequire(new URL("../packages/ads-mcp/package.json", import.meta.url));
const [{ Client }, { StdioClientTransport }] = await Promise.all([
  import(pathToFileURL(requireFromMcp.resolve("@modelcontextprotocol/sdk/client/index.js")).href),
  import(pathToFileURL(requireFromMcp.resolve("@modelcontextprotocol/sdk/client/stdio.js")).href),
]);

const urlIndex = process.argv.indexOf("--url");
const url = urlIndex >= 0 ? process.argv[urlIndex + 1] : "http://127.0.0.1:3010/mcp";
if (!url) throw new Error("--url requires a value");

const root = process.cwd();
const cli = path.join(root, "packages", "ads-mcp", "dist", "cli.js");
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [cli, "--root", root, "--timeout-ms", "60000"],
  stderr: "pipe",
});
const client = new Client({ name: "ads-mcp-lab-verifier", version: "1.0.0" });

await client.connect(transport);
try {
  const tools = await client.listTools();
  const renderResult = await client.callTool({
    name: "ads_render",
    arguments: {
      target: { type: "url", url },
      states: ["default"],
      viewports: [
        { width: 390, height: 844 },
        { width: 1280, height: 800 },
      ],
      waitFor: "main[data-mcp-lab]",
      settleMs: 150,
      provenance: {
        observedSkillFiles: ["skills/agent-friendly-design/SKILL.md"],
        sourceFiles: ["docs/run-reports/2026-07-22-ads-mcp-lab-page.md"],
        artifactFiles: [
          "demos/src/app/mcp/page.tsx",
          "demos/src/app/mcp/mcp.module.css",
        ],
        adsRelease: "v1.3.1",
      },
    },
  });
  const rendered = renderResult.structuredContent;

  const evaluateResult = await client.callTool({
    name: "ads_evaluate",
    arguments: {
      runId: rendered.runId,
      rubric: {
        task: "Make the ADS MCP understandable on mobile and desktop",
        criteria: [
          { name: "Design Quality", weight: 35 },
          { name: "Originality", weight: 30 },
          { name: "Craft", weight: 20 },
          { name: "Functionality", weight: 15 },
        ],
      },
    },
  });

  const traceResult = await client.callTool({
    name: "ads_trace",
    arguments: {
      runId: rendered.runId,
      context: "ADS MCP public lab",
      decisions: [
        {
          id: "semantic-contract-surface",
          decision: "Keep the critical MCP contract server-rendered in semantic landmarks.",
          artifact: {
            path: "demos/src/app/mcp/page.tsx",
            location: "McpPage main and article landmarks",
          },
          rule: {
            path: "skills/agent-friendly-design/SKILL.md",
            excerpt: "use native elements: `<button>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<aside>`",
          },
          sourceConstraint: {
            path: "docs/run-reports/2026-07-22-ads-mcp-lab-page.md",
            excerpt: "The visible example is backed by a real MCP client run, not invented product telemetry.",
          },
          evidence: [rendered.artifacts.evidence],
        },
      ],
    },
  });

  const evidence = await client.readResource({ uri: rendered.artifacts.evidence });
  const validationUri = traceResult.structuredContent.artifacts.validation;
  const validation = await client.readResource({ uri: validationUri });
  const evidencePayload = JSON.parse(evidence.contents[0].text);
  const validationPayload = JSON.parse(validation.contents[0].text);

  process.stdout.write(`${JSON.stringify({
    toolNames: tools.tools.map(({ name }) => name).sort(),
    render: rendered,
    evaluate: evaluateResult.structuredContent,
    trace: traceResult.structuredContent,
    evidenceGates: evidencePayload.gates,
    validation: validationPayload,
  }, null, 2)}\n`);
} finally {
  await client.close();
}
