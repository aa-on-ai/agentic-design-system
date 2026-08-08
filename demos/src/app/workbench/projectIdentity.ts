import { PRESETS, type PresetId } from "./workbenchFixture";
import { projectDisplayName, type WorkbenchSession } from "./workbenchSession";

export const IDENTITY_START = "<!-- ads-workbench:project-identity:start -->";
export const IDENTITY_END = "<!-- ads-workbench:project-identity:end -->";

export type IdentityDiffLine = {
  kind: "context" | "add" | "remove";
  text: string;
};

export function buildProjectIdentityDraft(
  session: WorkbenchSession,
  preset: PresetId,
  currentContent: string | null,
): string {
  const name = projectDisplayName(session);
  const description = claimText(session.intake.claims.description);
  const audience = claimText(session.intake.claims.audience);
  const surface = claimText(session.intake.claims.surface);
  const presetLabel = PRESETS.find((item) => item.id === preset)?.label ?? preset;
  const sources = session.intake.sources.map((source) => `- \`${source.path}\` — ${source.kind}`).join("\n");
  const unresolved = session.intake.questions.length > 0
    ? session.intake.questions.map((question) => `- ${question.prompt}`).join("\n")
    : "- None from deterministic intake";
  const section = [
    IDENTITY_START,
    "## Agentic Design System project identity",
    "",
    `- **Product:** ${name}`,
    `- **Description:** ${description}`,
    `- **Audience:** ${audience}`,
    `- **Surface:** ${surface}`,
    `- **Design posture:** ${presetLabel} (\`${preset}\`)`,
    "",
    "### Operating posture",
    "",
    "- Preserve the existing component, token, and layout language before introducing new patterns.",
    "- Let typography, spacing, and source-backed evidence carry hierarchy before adding color or chrome.",
    "- Treat this identity as project context. The selected Agentic Design System workflow still owns task-specific execution and verification.",
    "",
    "### Source truth",
    "",
    sources || "- No supported project sources were found",
    "",
    "### Unresolved human judgment",
    "",
    unresolved,
    "",
    "### Constraints and verification",
    "",
    "- Keep repository inspection deterministic and provenance-backed.",
    "- Preview every generated repository change before apply.",
    "- Use semantic controls, keyboard-visible focus, and rendered desktop and mobile evidence.",
    "- End substantive work with decision, evidence, risk, failed checks, and one exact next action.",
    IDENTITY_END,
  ].join("\n");

  if (!currentContent) return `# ${name}\n\n${section}\n`;

  const start = currentContent.indexOf(IDENTITY_START);
  const end = currentContent.indexOf(IDENTITY_END);
  if ((start === -1) !== (end === -1) || (start !== -1 && end < start)) {
    throw new Error("Existing DESIGN.md has an incomplete ADS Workbench identity block.");
  }
  if (start !== -1) {
    const after = end + IDENTITY_END.length;
    return `${currentContent.slice(0, start)}${section}${currentContent.slice(after)}`.trimEnd() + "\n";
  }
  return `${currentContent.trimEnd()}\n\n${section}\n`;
}

export function diffProjectIdentity(currentContent: string | null, draft: string): IdentityDiffLine[] {
  const before = (currentContent ?? "").split("\n");
  const after = draft.split("\n");
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < before.length - prefix
    && suffix < after.length - prefix
    && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) suffix += 1;

  const contextStart = Math.max(0, prefix - 2);
  const contextEndBefore = before.length - suffix;
  const contextEndAfter = after.length - suffix;
  const lines: IdentityDiffLine[] = before.slice(contextStart, prefix).map((text) => ({ kind: "context", text }));
  lines.push(...before.slice(prefix, contextEndBefore).map((text) => ({ kind: "remove" as const, text })));
  lines.push(...after.slice(prefix, contextEndAfter).map((text) => ({ kind: "add" as const, text })));
  lines.push(...after.slice(contextEndAfter, Math.min(after.length, contextEndAfter + 2)).map((text) => ({ kind: "context" as const, text })));
  return lines;
}

export function hasManagedIdentityBlock(content: string | null): boolean {
  if (!content) return false;
  return content.includes(IDENTITY_START) && content.includes(IDENTITY_END);
}

function claimText(claim: WorkbenchSession["intake"]["claims"]["description"]): string {
  if (claim.state === "inferred") return claim.value;
  if (claim.state === "conflicted") return `Unresolved conflict — ${claim.candidates.map((candidate) => candidate.value).join(" / ")}`;
  return `Unknown — ${claim.reason}`;
}
