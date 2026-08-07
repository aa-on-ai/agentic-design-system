import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE = path.join(ROOT, "testing", "fixtures", "workbench-inspector", "context-rich");
const INSPECTOR = path.join(ROOT, "workbench", "inspect.mjs");

async function importBundled(entry) {
  const bundled = await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    plugins: [{
      name: "empty-server-only",
      setup(api) {
        api.onResolve({ filter: /^server-only$/ }, () => ({ path: "server-only", namespace: "empty" }));
        api.onLoad({ filter: /.*/, namespace: "empty" }, () => ({ contents: "export {};", loader: "js" }));
      },
    }],
  });
  return import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);
}

function inspect(project) {
  const result = spawnSync(process.execPath, [INSPECTOR, "--project", project], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function fileHashes(root) {
  const output = new Map();
  async function walk(directory) {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, "en"))) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile()) output.set(path.relative(root, absolute), sha256(await readFile(absolute)));
    }
  }
  await walk(root);
  return output;
}

function unchangedExcept(before, after, allowed) {
  assert.deepEqual([...before.keys()], [...after.keys()]);
  for (const [file, hash] of before) if (file !== allowed) assert.equal(after.get(file), hash, `${file} changed unexpectedly`);
}

const identity = await importBundled(path.join(ROOT, "demos", "src", "app", "workbench", "projectIdentity.ts"));
const identityServer = await importBundled(path.join(ROOT, "demos", "src", "app", "workbench", "projectIdentity.server.ts"));
const routing = await importBundled(path.join(ROOT, "demos", "src", "app", "workbench", "workbenchRouting.ts"));
const temporary = await mkdtemp(path.join(os.tmpdir(), "ads-workbench-step3-"));

try {
  const project = path.join(temporary, "project");
  await cp(FIXTURE, project, { recursive: true });
  const session = inspect(project);
  const initial = await fileHashes(project);
  const originalIdentity = await readFile(path.join(project, "DESIGN.md"), "utf8");

  process.env.ADS_WORKBENCH_ALLOW_APPLY = "0";
  const previewState = await identityServer.loadProjectIdentityState(session);
  const draft = identity.buildProjectIdentityDraft(session, "dense-dashboard", previewState.currentContent);
  const diff = identity.diffProjectIdentity(previewState.currentContent, draft);
  assert.equal(previewState.canApply, false);
  assert.match(previewState.blockReason, /ADS_WORKBENCH_ALLOW_APPLY=1/);
  assert.ok(diff.some((line) => line.kind === "add" && line.text.includes("Agentic Design System project identity")));
  assert.ok(draft.startsWith(originalIdentity.trimEnd()), "existing DESIGN.md content must be preserved");
  assert.match(draft, /`src\/styles\/tokens\.css`/);
  assert.deepEqual(await fileHashes(project), initial, "preview generation changed the project tree");
  await assert.rejects(
    identityServer.applyProjectIdentity(session, { preset: "dense-dashboard", expectedCurrentHash: previewState.currentHash, expectedDraft: draft }),
    /ADS_WORKBENCH_ALLOW_APPLY=1/,
  );
  assert.deepEqual(await fileHashes(project), initial, "disabled apply gate changed the project tree");
  console.log("ok - preview and disabled apply leave the target repository byte-identical");

  process.env.ADS_WORKBENCH_ALLOW_APPLY = "1";
  const readmePath = path.join(project, "README.md");
  const originalReadme = await readFile(readmePath, "utf8");
  await writeFile(readmePath, `${originalReadme}\nSource changed after inspection.\n`);
  const staleSourceState = await identityServer.loadProjectIdentityState(session);
  assert.equal(staleSourceState.canApply, false);
  assert.match(staleSourceState.blockReason, /sources changed after inspection/);
  await assert.rejects(
    identityServer.applyProjectIdentity(session, { preset: "dense-dashboard", expectedCurrentHash: previewState.currentHash, expectedDraft: draft }),
    /sources changed after inspection/,
  );
  await writeFile(readmePath, originalReadme);
  assert.deepEqual(await fileHashes(project), initial, "rejected stale-source apply changed the project tree");
  console.log("ok - stale inspected sources fail closed before identity apply");

  const writableState = await identityServer.loadProjectIdentityState(session);
  await assert.rejects(
    identityServer.applyProjectIdentity(session, { preset: "dense-dashboard", expectedCurrentHash: writableState.currentHash, expectedDraft: `${draft}\nchanged` }),
    /approved draft no longer matches/,
  );
  assert.deepEqual(await fileHashes(project), initial, "rejected draft changed the project tree");

  const applied = await identityServer.applyProjectIdentity(session, {
    preset: "dense-dashboard",
    expectedCurrentHash: writableState.currentHash,
    expectedDraft: draft,
  });
  assert.equal(applied.status, "applied");
  const afterApply = await fileHashes(project);
  unchangedExcept(initial, afterApply, "DESIGN.md");
  const appliedIdentity = await readFile(path.join(project, "DESIGN.md"), "utf8");
  assert.match(appliedIdentity, /ads-workbench:project-identity:start/);
  assert.match(appliedIdentity, /Design posture:\*\* Dense dashboard/);
  console.log("ok - explicit apply changes only the approved DESIGN.md artifact");

  const currentState = await identityServer.loadProjectIdentityState(session);
  assert.equal(currentState.mode, "unchanged");
  const unchanged = await identityServer.applyProjectIdentity(session, {
    preset: "dense-dashboard",
    expectedCurrentHash: currentState.currentHash,
    expectedDraft: appliedIdentity,
  });
  assert.equal(unchanged.status, "unchanged");
  assert.deepEqual(await fileHashes(project), afterApply, "idempotent apply changed the project tree");
  console.log("ok - repeated apply is idempotent");

  await writeFile(path.join(project, "DESIGN.md"), `${appliedIdentity}\nConcurrent local edit\n`);
  await assert.rejects(
    identityServer.applyProjectIdentity(session, {
      preset: "dense-dashboard",
      expectedCurrentHash: currentState.currentHash,
      expectedDraft: appliedIdentity,
    }),
    /changed after preview/,
  );
  assert.match(await readFile(path.join(project, "DESIGN.md"), "utf8"), /Concurrent local edit/);
  console.log("ok - stale previews fail closed and preserve the concurrent edit");

  const explore = routing.routeWorkbenchIntent("explore", "Compare three onboarding structures for the first-run dashboard");
  assert.equal(explore.canonicalPath, "skills/design-variations/SKILL.md");
  const buildNew = routing.routeWorkbenchIntent("build", "Build a new account settings page in the existing product stack");
  assert.equal(buildNew.canonicalPath, "workflows/new-page-component.mjs");
  const buildExisting = routing.routeWorkbenchIntent("build", "Tighten spacing and hierarchy on the existing billing screen");
  assert.equal(buildExisting.canonicalPath, "routing/ROUTING.md#the-decision");
  const buildMotion = routing.routeWorkbenchIntent("build", "Improve the drawer transition timing on the settings screen");
  assert.equal(buildMotion.canonicalPath, "skills/web-animation-design/SKILL.md");
  const reviewMobile = routing.routeWorkbenchIntent("review", "Review the mobile checkout confirmation screen before merge");
  assert.equal(reviewMobile.canonicalPath, "workflows/mobile-review.md");
  const reviewDesktop = routing.routeWorkbenchIntent("review", "Review the existing analytics dashboard before merge");
  assert.equal(reviewDesktop.canonicalPath, "workflows/adversarial-design-review.md");
  const ambiguous = routing.routeWorkbenchIntent("build", "Make it better");
  assert.equal(ambiguous.status, "needs-clarification");
  assert.match(ambiguous.clarification, /exact page, component, state, or interaction/);
  console.log("ok - representative Explore, Build, motion, Review, mobile, and ambiguous tasks route deterministically");

  const handoff = routing.buildAgentHandoff(session, "dense-dashboard", "review", "Review the mobile checkout confirmation screen before merge", reviewMobile, "previewed");
  assert.match(handoff, /Canonical route: workflows\/mobile-review\.md/);
  assert.match(handoff, /Project identity: Reviewed preview/);
  assert.match(handoff, /Agent execution inside Workbench/);
  assert.match(handoff, /Do not deploy, publish, or execute external writes/);
  assert.match(handoff, /Failed checks, even when none/);
  console.log("ok - generated handoff names canonical authority, evidence, skipped work, and stop condition");
} finally {
  delete process.env.ADS_WORKBENCH_ALLOW_APPLY;
  await rm(temporary, { recursive: true, force: true });
}

console.log("workbench Step 3 smoke passed: 7/7");
