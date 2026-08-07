import "server-only";

import { createHash } from "node:crypto";
import { lstat, readFile, realpath, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildProjectIdentityDraft, IDENTITY_END, IDENTITY_START } from "./projectIdentity";
import { PRESET_IDS, type PresetId, type WorkbenchSession } from "./workbenchSession";

const MAX_IDENTITY_BYTES = 262_144;

export type ProjectIdentityState = {
  targetPath: "DESIGN.md";
  currentContent: string | null;
  currentHash: string | null;
  mode: "create" | "update" | "unchanged" | "blocked";
  applyGateEnabled: boolean;
  canApply: boolean;
  blockReason: string | null;
};

export async function loadProjectIdentityState(session: WorkbenchSession): Promise<ProjectIdentityState> {
  const applyGateEnabled = process.env.ADS_WORKBENCH_ALLOW_APPLY === "1";
  const identityBlocked = session.intake.questions.some((question) => question.blocks === "project-identity");
  let root: string;
  try {
    root = await realpath(session.project.root);
    if (!(await stat(root)).isDirectory()) throw new Error("not a directory");
  } catch {
    return blockedState(applyGateEnabled, "The inspected project root is not available on this machine.");
  }

  const target = path.join(root, "DESIGN.md");
  let currentContent: string | null = null;
  try {
    const targetStat = await lstat(target);
    if (targetStat.isSymbolicLink()) return blockedState(applyGateEnabled, "DESIGN.md is a symlink, so Workbench will not replace it.");
    if (!targetStat.isFile()) return blockedState(applyGateEnabled, "DESIGN.md exists but is not a regular file.");
    if (targetStat.size > MAX_IDENTITY_BYTES) return blockedState(applyGateEnabled, "DESIGN.md is larger than the 256 KiB local safety limit.");
    currentContent = await readFile(target, "utf8");
  } catch (error) {
    if (!isMissing(error)) return blockedState(applyGateEnabled, "DESIGN.md could not be inspected safely.");
  }

  const hasStart = currentContent?.includes(IDENTITY_START) ?? false;
  const hasEnd = currentContent?.includes(IDENTITY_END) ?? false;
  if (hasStart !== hasEnd) return blockedState(applyGateEnabled, "DESIGN.md has an incomplete ADS Workbench identity block.", currentContent);

  const sourceSnapshotFresh = await verifySourceSnapshot(root, session);

  const inferredPreset = session.intake.preset.state === "inferred" ? session.intake.preset.value : null;
  const unchanged = inferredPreset
    ? buildProjectIdentityDraft(session, inferredPreset, currentContent) === currentContent
    : false;
  const blockReason = session.intake.status === "blocked"
    ? "The intake is blocked. Resolve its source conflict before applying project identity."
    : identityBlocked
      ? "Project identity questions remain unresolved in the inspected sources."
      : !sourceSnapshotFresh
        ? "Project sources changed after inspection. Run the read-only inspector again before applying identity."
      : !applyGateEnabled
        ? "Preview is available. Set ADS_WORKBENCH_ALLOW_APPLY=1 for an intentional local write session."
        : null;

  return {
    targetPath: "DESIGN.md",
    currentContent,
    currentHash: currentContent === null ? null : sha256(currentContent),
    mode: unchanged ? "unchanged" : currentContent === null ? "create" : "update",
    applyGateEnabled,
    canApply: blockReason === null,
    blockReason,
  };
}

export async function applyProjectIdentity(
  session: WorkbenchSession,
  input: { preset: PresetId; expectedCurrentHash: string | null; expectedDraft: string },
): Promise<{ status: "applied" | "unchanged"; targetPath: "DESIGN.md"; contentHash: string }> {
  if (!PRESET_IDS.includes(input.preset)) throw new Error("The selected preset is not supported.");
  const state = await loadProjectIdentityState(session);
  if (!state.canApply) throw new Error(state.blockReason ?? "Project identity apply is unavailable.");
  if (state.currentHash !== input.expectedCurrentHash) throw new Error("DESIGN.md changed after preview. Review a fresh diff before applying.");

  const draft = buildProjectIdentityDraft(session, input.preset, state.currentContent);
  if (draft !== input.expectedDraft) throw new Error("The approved draft no longer matches the canonical Workbench preview.");
  const contentHash = sha256(draft);
  if (draft === state.currentContent) return { status: "unchanged", targetPath: "DESIGN.md", contentHash };

  const root = await realpath(session.project.root);
  const target = path.join(root, "DESIGN.md");
  const temporary = path.join(root, `.DESIGN.md.ads-workbench-${process.pid}-${Date.now()}`);
  try {
    await writeFile(temporary, draft, { encoding: "utf8", flag: "wx", mode: 0o644 });
    await rename(temporary, target);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
  return { status: "applied", targetPath: "DESIGN.md", contentHash };
}

async function verifySourceSnapshot(root: string, session: WorkbenchSession): Promise<boolean> {
  for (const source of session.intake.sources) {
    if (source.path === "DESIGN.md") continue;
    try {
      const sourcePath = await realpath(path.join(root, source.path));
      if (sourcePath !== root && !sourcePath.startsWith(`${root}${path.sep}`)) return false;
      const sourceStat = await stat(sourcePath);
      if (!sourceStat.isFile() || sourceStat.size !== source.bytes) return false;
      if (sha256(await readFile(sourcePath, "utf8")) !== source.contentSha256) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function blockedState(applyGateEnabled: boolean, blockReason: string, currentContent: string | null = null): ProjectIdentityState {
  return {
    targetPath: "DESIGN.md",
    currentContent,
    currentHash: currentContent === null ? null : sha256(currentContent),
    mode: "blocked",
    applyGateEnabled,
    canApply: false,
    blockReason,
  };
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isMissing(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
