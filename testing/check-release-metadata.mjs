import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(root, relativePath), "utf8"));

const packageJson = await readJson("package.json");
const packageLock = await readJson("package-lock.json");
const pluginJson = await readJson(".claude-plugin/plugin.json");
const changelog = await readFile(path.join(root, "CHANGELOG.md"), "utf8");

const versions = new Map([
  ["package.json", packageJson.version],
  ["package-lock.json", packageLock.version],
  ["package-lock.json root package", packageLock.packages?.[""]?.version],
  [".claude-plugin/plugin.json", pluginJson.version],
]);
const uniqueVersions = new Set(versions.values());
if (uniqueVersions.size !== 1 || uniqueVersions.has(undefined)) {
  throw new Error(
    `release version drift: ${[...versions].map(([file, version]) => `${file}=${version}`).join(", ")}`,
  );
}

const version = packageJson.version;
if (!changelog.includes(`## [${version}] - `)) {
  throw new Error(`CHANGELOG.md has no dated [${version}] release heading`);
}

const skillEntries = await readdir(path.join(root, "skills"), { withFileTypes: true });
const skillNames = [];
for (const entry of skillEntries) {
  if (!entry.isDirectory()) continue;
  try {
    await access(path.join(root, "skills", entry.name, "SKILL.md"));
    skillNames.push(entry.name);
  } catch {
    // A directory without SKILL.md is not an installable skill.
  }
}
skillNames.sort();

const pluginSkillNames = pluginJson.skills
  .map((skillPath) => skillPath.replace(/^skills\//, ""))
  .sort();

if (JSON.stringify(skillNames) !== JSON.stringify(pluginSkillNames)) {
  throw new Error(
    `plugin skill manifest drift: directories=${skillNames.join(",")} manifest=${pluginSkillNames.join(",")}`,
  );
}

if (!pluginJson.description.includes(`${skillNames.length} skills`)) {
  throw new Error(`plugin description does not report ${skillNames.length} skills`);
}

console.log(`release metadata passed: v${version}, ${skillNames.length} installable skills, manifests aligned`);
