import { INTENTS, type IntentId, type PresetId } from "./workbenchFixture";
import { projectDisplayName, type WorkbenchSession } from "./workbenchSession";

export type WorkbenchRoute = {
  status: "ready" | "needs-clarification";
  label: string;
  canonicalPath: string | null;
  reason: string;
  activates: string[];
  skipped: string[];
  clarification: string | null;
};

const VAGUE_TASKS = /^(make it better|improve (the )?ui|help with design|design this|fix it|review this|build this)[.!]?$/i;

export function routeWorkbenchIntent(intent: IntentId, task: string): WorkbenchRoute {
  const normalized = task.trim().replace(/\s+/g, " ");
  if (normalized.length < 12 || VAGUE_TASKS.test(normalized)) {
    return {
      status: "needs-clarification",
      label: "Task needs one concrete target",
      canonicalPath: null,
      reason: "Agentic Design System can choose the workflow only after the artifact or surface is named.",
      activates: [],
      skipped: ["Workflow selection", "Agent handoff", "Repository changes"],
      clarification: "What exact page, component, state, or interaction should the agent work on?",
    };
  }

  const lower = normalized.toLowerCase();
  if (intent === "explore") {
    return readyRoute(
      "Disposable browser exploration",
      "skills/design-variations/SKILL.md",
      "The user wants meaningful alternatives before production implementation.",
      ["Matched-content variants", "Desktop and mobile comparison", "Human choose, blend, or reject gate"],
      ["Production implementation", "Agent execution inside Workbench", "Deploy or external writes"],
    );
  }

  if (intent === "review") {
    const mobile = /\b(mobile|responsive|iphone|ios|android|pwa|tablet)\b/.test(lower);
    return readyRoute(
      mobile ? "Two-pass mobile review" : "Adversarial rendered review",
      mobile ? "workflows/mobile-review.md" : "workflows/adversarial-design-review.md",
      mobile
        ? "The named surface has mobile or responsive behavior that needs a dedicated second pass."
        : "The task asks for a verdict on an existing rendered surface before a bounded repair.",
      mobile
        ? ["Core Agentic Design System review", "Mobile and responsive review", "Rendered evidence and failed checks"]
        : ["Separate-context critique", "Agentic Design System rubric and structured findings", "One bounded repair pass"],
      ["New visual direction generation", "Agent execution inside Workbench", "Deploy or external writes"],
    );
  }

  const motion = /\b(animation|motion|transition|easing|spring|gesture)\b/.test(lower);
  const newSurface = /\b(new|create|add|build|implement)\b/.test(lower)
    && /\b(page|component|screen|flow|view|route)\b/.test(lower);
  if (motion) {
    return readyRoute(
      "Motion-aware production change",
      "skills/web-animation-design/SKILL.md",
      "The build request makes interaction motion part of the product outcome.",
      ["Core Agentic Design System chain", "Motion vocabulary pass", "Rendered interaction verification"],
      ["Divergent variants unless requested", "Agent execution inside Workbench", "Deploy or external writes"],
    );
  }
  return readyRoute(
    newSurface ? "New page or component workflow" : "Core production change",
    newSurface ? "workflows/new-page-component.mjs" : "routing/ROUTING.md#the-decision",
    newSurface
      ? "The task names a new product surface that needs the full outcome, capture, grader, and revision chain."
      : "The task changes an existing product surface, so the core chain and rendered gate are sufficient.",
    newSurface
      ? ["Core Agentic Design System chain", "Outcome and independent grader loop", "Responsive rendered evidence"]
      : ["Core Agentic Design System chain", "Existing pattern and state checks", "Rendered evidence"],
    ["Exploration variants unless requested", "Agent execution inside Workbench", "Deploy or external writes"],
  );
}

export function buildAgentHandoff(
  session: WorkbenchSession,
  preset: PresetId,
  intent: IntentId,
  task: string,
  route: WorkbenchRoute,
  identityState: "previewed" | "applied",
): string {
  if (route.status !== "ready" || !route.canonicalPath) throw new Error("A ready route is required before building a handoff.");
  const intentLabel = INTENTS.find((item) => item.id === intent)?.label ?? intent;
  return [
    "# Agentic Design System agent handoff",
    "",
    `Project: ${projectDisplayName(session)}`,
    `Repository: ${session.project.root}`,
    `Task: ${task.trim()}`,
    `Human intent: ${intentLabel}`,
    `Project identity: ${identityState === "applied" ? "Applied" : "Reviewed preview"}`,
    `Selected posture: ${preset}`,
    `Canonical route: ${route.canonicalPath}`,
    "",
    "## Why this route",
    route.reason,
    "",
    "## Activate",
    ...route.activates.map((item) => `- ${item}`),
    "",
    "## Keep skipped",
    ...route.skipped.map((item) => `- ${item}`),
    "",
    "## Required evidence",
    "- Exact route or artifact inspected",
    "- Desktop and mobile rendered receipts when visual output changes",
    "- Keyboard, overflow, accessibility, and adjacent-action checks",
    "- Failed checks, even when none",
    "",
    "## Stop condition",
    "Return one verified artifact with decision, evidence, risk, failed checks, and one exact next action. Do not deploy, publish, or execute external writes without separate approval.",
  ].join("\n");
}

function readyRoute(
  label: string,
  canonicalPath: string,
  reason: string,
  activates: string[],
  skipped: string[],
): WorkbenchRoute {
  return { status: "ready", label, canonicalPath, reason, activates, skipped, clarification: null };
}
