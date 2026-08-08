export const PRESET_IDS = ["marketing-editorial", "utilitarian-app", "dense-dashboard"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export const WORKBENCH_SESSION_SCHEMA_ID = "https://github.com/aa-on-ai/agentic-design-system/schemas/workbench-session.v1.schema.json" as const;

export const SOURCE_KINDS = [
  "project-identity",
  "product-doc",
  "agent-instructions",
  "design-guidelines",
  "design-tokens",
  "component",
  "screenshot",
  "prior-decision",
  "package-manifest",
] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export type EvidenceQuality = "direct-declaration" | "cross-source" | "single-signal";

export type EvidenceRef = {
  source: string;
  locator?:
    | { type: "file" }
    | { type: "lines"; start: number; end: number };
};

export type Reason = {
  code: string;
  statement: string;
  evidence: EvidenceRef[];
};

export type InferredClaim<T> = {
  state: "inferred";
  value: T;
  evidenceQuality: EvidenceQuality;
  reasons: Reason[];
};

export type UnknownClaim = {
  state: "unknown";
  value: null;
  reason: string;
  inspectedKinds: SourceKind[];
};

export type ConflictedClaim<T> = {
  state: "conflicted";
  value: null;
  candidates: Array<{
    value: T;
    evidenceQuality: EvidenceQuality;
    reasons: Reason[];
  }>;
  questionId: string;
};

export type IntakeClaim<T> = InferredClaim<T> | UnknownClaim | ConflictedClaim<T>;

export type WorkbenchSource = {
  path: string;
  kind: SourceKind;
  contentSha256: string;
  bytes: number;
};

export type WorkbenchQuestion = {
  id: string;
  blocks: "project-identity" | "preset-recommendation";
  prompt: string;
  options?: Array<{
    value: string;
    label: string;
    evidence: EvidenceRef[];
  }>;
};

export type WorkbenchNotice = {
  severity: "error" | "warning" | "info";
  code:
    | "source-unreadable"
    | "source-too-large"
    | "external-symlink-skipped"
    | "unsupported-format"
    | "identity-parse-failed";
  path?: string;
  message: string;
};

export type WorkbenchSession = {
  $schema: typeof WORKBENCH_SESSION_SCHEMA_ID;
  schemaVersion: 1;
  kind: "ads.workbench.session";
  inspector: {
    version: string;
    mode: "read-only";
    sourceFingerprint: string;
  };
  project: {
    root: string;
    rootLabel: string;
  };
  intake: {
    status: "ready" | "needs-human" | "blocked";
    sources: WorkbenchSource[];
    claims: {
      name: IntakeClaim<string>;
      description: IntakeClaim<string>;
      audience: IntakeClaim<string>;
      surface: IntakeClaim<string>;
    };
    preset: IntakeClaim<PresetId>;
    questions: WorkbenchQuestion[];
    notices: WorkbenchNotice[];
  };
};

export function inferredValue<T>(claim: IntakeClaim<T>): T | null {
  return claim.state === "inferred" ? claim.value : null;
}

export function claimEvidencePaths<T>(claim: IntakeClaim<T>): string[] {
  if (claim.state !== "inferred") return [];

  return Array.from(
    new Set(claim.reasons.flatMap((reason) => reason.evidence.map((evidence) => evidence.source))),
  );
}

export function projectDisplayName(session: WorkbenchSession): string {
  return inferredValue(session.intake.claims.name) ?? session.project.rootLabel;
}
