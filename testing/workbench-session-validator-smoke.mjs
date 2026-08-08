import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { build } from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOADER = path.join(ROOT, "demos", "src", "app", "workbench", "loadWorkbenchSession.ts");
const INSPECTOR = path.join(ROOT, "workbench", "inspect.mjs");
const FIXTURES = path.join(ROOT, "testing", "fixtures", "workbench-inspector");
const SCHEMA = JSON.parse(await readFile(path.join(ROOT, "schemas", "workbench-session.v1.schema.json"), "utf8"));

const bundled = await build({
  entryPoints: [LOADER],
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  plugins: [{
    name: "empty-server-only",
    setup(buildApi) {
      buildApi.onResolve({ filter: /^server-only$/ }, () => ({ path: "server-only", namespace: "empty" }));
      buildApi.onLoad({ filter: /.*/, namespace: "empty" }, () => ({ contents: "export {};", loader: "js" }));
    },
  }],
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`;
const { loadWorkbenchSession, validateWorkbenchSession } = await import(moduleUrl);

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile(SCHEMA);

function inspect(name) {
  const result = spawnSync(process.execPath, [INSPECTOR, "--project", path.join(FIXTURES, name)], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function copy(value) {
  return structuredClone(value);
}

function expectValid(label, session) {
  assert.equal(validateSchema(session), true, `${label} should satisfy JSON Schema: ${ajv.errorsText(validateSchema.errors)}`);
  assert.doesNotThrow(() => validateWorkbenchSession(session), `${label} should satisfy the route validator`);
  console.log(`ok - ${label}`);
}

function expectParityRejection(label, session) {
  assert.equal(validateSchema(session), false, `${label} mutation unexpectedly satisfies JSON Schema`);
  assert.throws(() => validateWorkbenchSession(session), /Invalid ADS Workbench session/);
  console.log(`ok - ${label}`);
}

const rich = inspect("context-rich");
const light = inspect("context-light");
const conflict = inspect("conflicting");

const previousSessionPath = process.env.ADS_WORKBENCH_SESSION;
delete process.env.ADS_WORKBENCH_SESSION;
const fallback = await loadWorkbenchSession();
if (previousSessionPath === undefined) delete process.env.ADS_WORKBENCH_SESSION;
else process.env.ADS_WORKBENCH_SESSION = previousSessionPath;
expectValid("fallback session satisfies both validators", fallback);

expectValid("rich, light, and conflict inspector sessions satisfy both validators", [rich, light, conflict].map((session) => {
  validateWorkbenchSession(session);
  return session;
})[0]);
for (const session of [light, conflict]) {
  assert.equal(validateSchema(session), true, ajv.errorsText(validateSchema.errors));
  assert.doesNotThrow(() => validateWorkbenchSession(session));
}

const harmlessDots = copy(rich);
harmlessDots.intake.sources.push({
  path: "docs/version..notes.md",
  kind: "product-doc",
  contentSha256: "0".repeat(64),
  bytes: 0,
});
expectValid("schema-safe source paths may contain harmless double dots inside a filename", harmlessDots);

const invalidVersion = copy(rich);
invalidVersion.inspector.version = "1";
expectParityRejection("non-semver inspector version is rejected", invalidVersion);

const tooManySources = copy(rich);
tooManySources.intake.sources = Array.from({ length: 65 }, (_, index) => ({
  path: `docs/source-${index}.md`,
  kind: "product-doc",
  contentSha256: `${index.toString(16).padStart(64, "0")}`,
  bytes: 0,
}));
expectParityRejection("more than 64 sources is rejected", tooManySources);

const oversizedSource = copy(rich);
oversizedSource.intake.sources[0].bytes = 262_145;
expectParityRejection("source bytes above 256 KiB is rejected", oversizedSource);

const duplicateKinds = copy(light);
duplicateKinds.intake.claims.description.inspectedKinds = ["package-manifest", "package-manifest"];
expectParityRejection("duplicate unknown inspectedKinds are rejected", duplicateKinds);

const invalidReasonCode = copy(rich);
invalidReasonCode.intake.claims.name.reasons[0].code = "Bad code";
expectParityRejection("invalid reason code is rejected", invalidReasonCode);

const invalidConflictId = copy(conflict);
invalidConflictId.intake.claims.audience.questionId = "Bad id";
expectParityRejection("invalid conflicted questionId is rejected", invalidConflictId);

const invalidQuestionId = copy(conflict);
invalidQuestionId.intake.questions[0].id = "Bad id";
expectParityRejection("invalid question id is rejected", invalidQuestionId);

const oneOption = copy(conflict);
const optionQuestion = oneOption.intake.questions.find((question) => question.options);
assert.ok(optionQuestion, "conflict fixture should expose an option question");
optionQuestion.options = optionQuestion.options.slice(0, 1);
expectParityRejection("a one-option question is rejected", oneOption);

const unsafeNoticePath = copy(rich);
unsafeNoticePath.intake.notices.push({
  severity: "warning",
  code: "unsupported-format",
  path: "../outside.md",
  message: "Skipped an unsupported source.",
});
expectParityRejection("unsafe notice path is rejected", unsafeNoticePath);

console.log("workbench session validator smoke passed: 12/12");
