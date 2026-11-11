import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const checker = fileURLToPath(new URL("./installed-reference-smoke.mjs", import.meta.url));

async function check(t, source, files = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "ads-entrypoint-links-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries({ "variations/SKILL.md": source, ...files })) {
    const target = path.join(root, name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return spawnSync(process.execPath, [checker, root], { encoding: "utf8" });
}

test("a relative dependency absent from the shipped pack fails", async (t) => {
  const result = await check(t, "Use [helper](../browser-variant-workflow/SKILL.md).\n");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unresolved link.*browser-variant-workflow/);
});

test("shipped siblings, anchors and encoded asset paths resolve", async (t) => {
  const result = await check(t,
    "[Review](../review/SKILL.md#checks) [Asset](assets/my%20study.html) [Guide](<assets/my study.html>)\n",
    { "review/SKILL.md": "# Review\n", "variations/assets/my study.html": "<main>Study</main>" });
  assert.equal(result.status, 0, result.stderr);
});

test("external links, local anchors and fenced examples are not dependencies", async (t) => {
  const result = await check(t,
    "[Docs](https://example.com/docs) [Mail](mailto:test@example.com) [Here](#checks)\n"
    + "```md\n[Example](../not-installed/SKILL.md)\n```\n");
  assert.equal(result.status, 0, result.stderr);
});

test("a relative link outside the installed pack fails", async (t) => {
  const result = await check(t, "[Host file](../../package.json)\n");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /outside the installed pack/);
});
