import "server-only";

import { readFile } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { WORKBENCH_FALLBACK_SESSION } from "./workbenchFixture";
import {
  PRESET_IDS,
  SOURCE_KINDS,
  WORKBENCH_SESSION_SCHEMA_ID,
  type EvidenceQuality,
  type EvidenceRef,
  type IntakeClaim,
  type PresetId,
  type Reason,
  type SourceKind,
  type WorkbenchNotice,
  type WorkbenchQuestion,
  type WorkbenchSession,
  type WorkbenchSource,
} from "./workbenchSession";

const EVIDENCE_QUALITIES = new Set<EvidenceQuality>([
  "direct-declaration",
  "cross-source",
  "single-signal",
]);
const INTAKE_STATUSES = new Set(["ready", "needs-human", "blocked"]);
const QUESTION_BLOCKS = new Set(["project-identity", "preset-recommendation"]);
const NOTICE_SEVERITIES = new Set(["error", "warning", "info"]);
const NOTICE_CODES = new Set([
  "source-unreadable",
  "source-too-large",
  "external-symlink-skipped",
  "unsupported-format",
  "identity-parse-failed",
]);
const FORBIDDEN_INSPECTOR_KEYS = new Set([
  "intent",
  "report",
  "reports",
  "check",
  "checks",
  "decision",
  "decisions",
  "approval",
  "approvals",
  "artifact",
  "artifacts",
  "humanConfirmed",
]);
const SHA256 = /^[a-f0-9]{64}$/;
const SEMVER = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const CONTRACT_ID = /^[a-z][a-z0-9-]*$/;
const SOURCE_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$)).+$/;
const MAX_SOURCES = 64;
const MAX_SOURCE_BYTES = 262_144;

export async function loadWorkbenchSession(): Promise<WorkbenchSession> {
  const sessionPath = process.env.ADS_WORKBENCH_SESSION;

  if (!sessionPath) return validateWorkbenchSession(WORKBENCH_FALLBACK_SESSION);
  if (!isAbsolute(sessionPath)) {
    throw new Error("ADS_WORKBENCH_SESSION must be an absolute path.");
  }

  let source: string;
  try {
    source = await readFile(sessionPath, "utf8");
  } catch {
    throw new Error("The supplied ADS Workbench session could not be read.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error("The supplied ADS Workbench session is not valid JSON.");
  }

  return validateWorkbenchSession(parsed);
}

export function validateWorkbenchSession(input: unknown): WorkbenchSession {
  const session = record(input, "session");
  exactKeys(session, ["$schema", "schemaVersion", "kind", "inspector", "project", "intake"], "session");
  assertNoLaterPhaseState(session);

  if (session.$schema !== WORKBENCH_SESSION_SCHEMA_ID) fail("session.$schema is unsupported");
  if (session.schemaVersion !== 1) fail("session.schemaVersion must be 1");
  if (session.kind !== "ads.workbench.session") fail("session.kind is unsupported");

  const inspector = record(session.inspector, "session.inspector");
  exactKeys(inspector, ["version", "mode", "sourceFingerprint"], "session.inspector");
  const inspectorVersion = stringValue(inspector.version, "session.inspector.version");
  if (!SEMVER.test(inspectorVersion)) fail("session.inspector.version must use numeric semver");
  if (inspector.mode !== "read-only") fail("session.inspector.mode must be read-only");
  hashValue(inspector.sourceFingerprint, "session.inspector.sourceFingerprint");

  const project = record(session.project, "session.project");
  exactKeys(project, ["root", "rootLabel"], "session.project");
  const root = stringValue(project.root, "session.project.root");
  if (!isAbsolute(root)) fail("session.project.root must be absolute");
  stringValue(project.rootLabel, "session.project.rootLabel");

  const intake = record(session.intake, "session.intake");
  exactKeys(intake, ["status", "sources", "claims", "preset", "questions", "notices"], "session.intake");
  if (typeof intake.status !== "string" || !INTAKE_STATUSES.has(intake.status)) {
    fail("session.intake.status is unsupported");
  }

  const sourceInputs = arrayValue(intake.sources, "session.intake.sources");
  if (sourceInputs.length > MAX_SOURCES) fail(`session.intake.sources must contain at most ${MAX_SOURCES} items`);
  const sources = sourceInputs.map(validateSource);
  const sourcePaths = new Set(sources.map((source) => source.path));
  if (sourcePaths.size !== sources.length) fail("session.intake.sources paths must be unique");

  const claims = record(intake.claims, "session.intake.claims");
  exactKeys(claims, ["name", "description", "audience", "surface"], "session.intake.claims");
  const validatedClaims = {
    name: validateClaim<string>(claims.name, "session.intake.claims.name", isNonEmptyString, sourcePaths),
    description: validateClaim<string>(claims.description, "session.intake.claims.description", isNonEmptyString, sourcePaths),
    audience: validateClaim<string>(claims.audience, "session.intake.claims.audience", isNonEmptyString, sourcePaths),
    surface: validateClaim<string>(claims.surface, "session.intake.claims.surface", isNonEmptyString, sourcePaths),
  };
  const preset = validateClaim<PresetId>(
    intake.preset,
    "session.intake.preset",
    (value): value is PresetId => typeof value === "string" && PRESET_IDS.includes(value as PresetId),
    sourcePaths,
  );
  const questions = arrayValue(intake.questions, "session.intake.questions").map((question, index) =>
    validateQuestion(question, index, sourcePaths),
  );
  const questionIds = new Set(questions.map((question) => question.id));
  if (questionIds.size !== questions.length) fail("session.intake.questions ids must be unique");
  const notices = arrayValue(intake.notices, "session.intake.notices").map(validateNotice);

  for (const [label, claim] of Object.entries({ ...validatedClaims, preset })) {
    if (claim.state === "conflicted" && !questionIds.has(claim.questionId)) {
      fail(`session.intake.${label} references an unknown questionId`);
    }
  }

  return {
    $schema: WORKBENCH_SESSION_SCHEMA_ID,
    schemaVersion: 1,
    kind: "ads.workbench.session",
    inspector: {
      version: inspectorVersion,
      mode: "read-only",
      sourceFingerprint: inspector.sourceFingerprint as string,
    },
    project: { root, rootLabel: project.rootLabel as string },
    intake: {
      status: intake.status as WorkbenchSession["intake"]["status"],
      sources,
      claims: validatedClaims,
      preset,
      questions,
      notices,
    },
  };
}

function validateSource(input: unknown, index: number): WorkbenchSource {
  const path = `session.intake.sources[${index}]`;
  const source = record(input, path);
  exactKeys(source, ["path", "kind", "contentSha256", "bytes"], path);
  const sourcePath = sourcePathValue(source.path, `${path}.path`);
  if (typeof source.kind !== "string" || !SOURCE_KINDS.includes(source.kind as SourceKind)) {
    fail(`${path}.kind is unsupported`);
  }
  hashValue(source.contentSha256, `${path}.contentSha256`);
  if (!Number.isInteger(source.bytes) || (source.bytes as number) < 0 || (source.bytes as number) > MAX_SOURCE_BYTES) {
    fail(`${path}.bytes must be an integer from 0 through ${MAX_SOURCE_BYTES}`);
  }

  return {
    path: sourcePath,
    kind: source.kind as SourceKind,
    contentSha256: source.contentSha256 as string,
    bytes: source.bytes as number,
  };
}

function validateClaim<T>(
  input: unknown,
  path: string,
  validateValue: (value: unknown) => value is T,
  sourcePaths: Set<string>,
): IntakeClaim<T> {
  const claim = record(input, path);

  if (claim.state === "inferred") {
    exactKeys(claim, ["state", "value", "evidenceQuality", "reasons"], path);
    if (!validateValue(claim.value)) fail(`${path}.value is invalid`);
    const evidenceQuality = evidenceQualityValue(claim.evidenceQuality, `${path}.evidenceQuality`);
    const reasons = nonEmptyArray(claim.reasons, `${path}.reasons`).map((reason, index) =>
      validateReason(reason, `${path}.reasons[${index}]`, sourcePaths),
    );
    return { state: "inferred", value: claim.value, evidenceQuality, reasons };
  }

  if (claim.state === "unknown") {
    exactKeys(claim, ["state", "value", "reason", "inspectedKinds"], path);
    if (claim.value !== null) fail(`${path}.value must be null when unknown`);
    const reason = stringValue(claim.reason, `${path}.reason`);
    const inspectedKinds = arrayValue(claim.inspectedKinds, `${path}.inspectedKinds`).map((kind, index) => {
      if (typeof kind !== "string" || !SOURCE_KINDS.includes(kind as SourceKind)) {
        fail(`${path}.inspectedKinds[${index}] is unsupported`);
      }
      return kind as SourceKind;
    });
    if (new Set(inspectedKinds).size !== inspectedKinds.length) fail(`${path}.inspectedKinds must be unique`);
    return { state: "unknown", value: null, reason, inspectedKinds };
  }

  if (claim.state === "conflicted") {
    exactKeys(claim, ["state", "value", "candidates", "questionId"], path);
    if (claim.value !== null) fail(`${path}.value must be null when conflicted`);
    const candidates = nonEmptyArray(claim.candidates, `${path}.candidates`).map((candidate, index) => {
      const candidatePath = `${path}.candidates[${index}]`;
      const candidateRecord = record(candidate, candidatePath);
      exactKeys(candidateRecord, ["value", "evidenceQuality", "reasons"], candidatePath);
      if (!validateValue(candidateRecord.value)) fail(`${candidatePath}.value is invalid`);
      return {
        value: candidateRecord.value,
        evidenceQuality: evidenceQualityValue(candidateRecord.evidenceQuality, `${candidatePath}.evidenceQuality`),
        reasons: nonEmptyArray(candidateRecord.reasons, `${candidatePath}.reasons`).map((reason, reasonIndex) =>
          validateReason(reason, `${candidatePath}.reasons[${reasonIndex}]`, sourcePaths),
        ),
      };
    });
    if (candidates.length < 2) fail(`${path}.candidates must contain at least two values`);
    return {
      state: "conflicted",
      value: null,
      candidates,
      questionId: contractIdValue(claim.questionId, `${path}.questionId`),
    };
  }

  fail(`${path}.state is unsupported`);
}

function validateReason(input: unknown, path: string, sourcePaths: Set<string>): Reason {
  const reason = record(input, path);
  exactKeys(reason, ["code", "statement", "evidence"], path);
  return {
    code: contractIdValue(reason.code, `${path}.code`),
    statement: stringValue(reason.statement, `${path}.statement`),
    evidence: nonEmptyArray(reason.evidence, `${path}.evidence`).map((evidence, index) =>
      validateEvidence(evidence, `${path}.evidence[${index}]`, sourcePaths),
    ),
  };
}

function validateEvidence(input: unknown, path: string, sourcePaths: Set<string>): EvidenceRef {
  const evidence = record(input, path);
  exactKeys(evidence, ["source", "locator"], path, true);
  const source = stringValue(evidence.source, `${path}.source`);
  if (!sourcePaths.has(source)) fail(`${path}.source does not match an inspected source`);
  if (evidence.locator === undefined) return { source };

  const locator = record(evidence.locator, `${path}.locator`);
  if (locator.type === "file") {
    exactKeys(locator, ["type"], `${path}.locator`);
    return { source, locator: { type: "file" } };
  }
  if (locator.type === "lines") {
    exactKeys(locator, ["type", "start", "end"], `${path}.locator`);
    if (!Number.isInteger(locator.start) || !Number.isInteger(locator.end) || (locator.start as number) < 1 || (locator.end as number) < (locator.start as number)) {
      fail(`${path}.locator lines are invalid`);
    }
    return { source, locator: { type: "lines", start: locator.start as number, end: locator.end as number } };
  }
  fail(`${path}.locator.type is unsupported`);
}

function validateQuestion(input: unknown, index: number, sourcePaths: Set<string>): WorkbenchQuestion {
  const path = `session.intake.questions[${index}]`;
  const question = record(input, path);
  exactKeys(question, ["id", "blocks", "prompt", "options"], path, true);
  if (typeof question.blocks !== "string" || !QUESTION_BLOCKS.has(question.blocks)) fail(`${path}.blocks is unsupported`);
  const options = question.options === undefined
    ? undefined
    : minimumArray(question.options, `${path}.options`, 2).map((option, optionIndex) => {
        const optionPath = `${path}.options[${optionIndex}]`;
        const optionRecord = record(option, optionPath);
        exactKeys(optionRecord, ["value", "label", "evidence"], optionPath);
        return {
          value: stringValue(optionRecord.value, `${optionPath}.value`),
          label: stringValue(optionRecord.label, `${optionPath}.label`),
          evidence: nonEmptyArray(optionRecord.evidence, `${optionPath}.evidence`).map((evidence, evidenceIndex) =>
            validateEvidence(evidence, `${optionPath}.evidence[${evidenceIndex}]`, sourcePaths),
          ),
        };
      });

  return {
    id: contractIdValue(question.id, `${path}.id`),
    blocks: question.blocks as WorkbenchQuestion["blocks"],
    prompt: stringValue(question.prompt, `${path}.prompt`),
    ...(options ? { options } : {}),
  };
}

function validateNotice(input: unknown, index: number): WorkbenchNotice {
  const path = `session.intake.notices[${index}]`;
  const notice = record(input, path);
  exactKeys(notice, ["severity", "code", "path", "message"], path, true);
  if (typeof notice.severity !== "string" || !NOTICE_SEVERITIES.has(notice.severity)) fail(`${path}.severity is unsupported`);
  if (typeof notice.code !== "string" || !NOTICE_CODES.has(notice.code)) fail(`${path}.code is unsupported`);

  return {
    severity: notice.severity as WorkbenchNotice["severity"],
    code: notice.code as WorkbenchNotice["code"],
    ...(notice.path === undefined ? {} : { path: sourcePathValue(notice.path, `${path}.path`) }),
    message: stringValue(notice.message, `${path}.message`),
  };
}

function evidenceQualityValue(value: unknown, path: string): EvidenceQuality {
  if (typeof value !== "string" || !EVIDENCE_QUALITIES.has(value as EvidenceQuality)) fail(`${path} is unsupported`);
  return value as EvidenceQuality;
}

function assertNoLaterPhaseState(input: unknown, path = "session"): void {
  if (Array.isArray(input)) {
    input.forEach((item, index) => assertNoLaterPhaseState(item, `${path}[${index}]`));
    return;
  }
  if (!isRecord(input)) return;
  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN_INSPECTOR_KEYS.has(key)) fail(`${path}.${key} is later-phase state and cannot appear in an inspector session`);
    assertNoLaterPhaseState(value, `${path}.${key}`);
  }
}

function exactKeys(input: Record<string, unknown>, allowed: string[], path: string, optional = false): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(input)) {
    if (!allowedSet.has(key)) fail(`${path}.${key} is not part of the session contract`);
  }
  if (!optional) {
    for (const key of allowed) {
      if (!(key in input)) fail(`${path}.${key} is required`);
    }
  } else {
    const required = allowed.filter((key) => !["locator", "options", "path"].includes(key));
    for (const key of required) {
      if (!(key in input)) fail(`${path}.${key} is required`);
    }
  }
}

function hashValue(value: unknown, path: string): string {
  const hash = stringValue(value, path);
  if (!SHA256.test(hash)) fail(`${path} must be a SHA-256 value`);
  return hash;
}

function stringValue(value: unknown, path: string): string {
  if (!isNonEmptyString(value)) fail(`${path} must be a non-empty string`);
  return value;
}

function contractIdValue(value: unknown, path: string): string {
  const id = stringValue(value, path);
  if (!CONTRACT_ID.test(id)) fail(`${path} must use lowercase kebab-case`);
  return id;
}

function sourcePathValue(value: unknown, path: string): string {
  const sourcePath = stringValue(value, path);
  if (!SOURCE_PATH.test(sourcePath)) fail(`${path} must be a safe project-relative path`);
  return sourcePath;
}

function arrayValue(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(`${path} must be an array`);
  return value;
}

function nonEmptyArray(value: unknown, path: string): unknown[] {
  const array = arrayValue(value, path);
  if (array.length === 0) fail(`${path} must not be empty`);
  return array;
}

function minimumArray(value: unknown, path: string, minimum: number): unknown[] {
  const array = arrayValue(value, path);
  if (array.length < minimum) fail(`${path} must contain at least ${minimum} items`);
  return array;
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) fail(`${path} must be an object`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function fail(message: string): never {
  throw new Error(`Invalid ADS Workbench session: ${message}.`);
}
