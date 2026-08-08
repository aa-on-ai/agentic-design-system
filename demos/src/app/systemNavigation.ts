export type SystemDestination =
  "system" | "workbench" | "mcp" | "trace" | "proof";

export const SYSTEM_DESTINATIONS: Array<{
  id: SystemDestination;
  href: string;
  label: string;
  description: string;
}> = [
  {
    id: "system",
    href: "/#top",
    label: "Overview",
    description: "What the system changes",
  },
  {
    id: "workbench",
    href: "/workbench",
    label: "Workbench",
    description: "Prepare an exact handoff",
  },
  {
    id: "mcp",
    href: "/mcp",
    label: "Evidence tools",
    description: "Capture and inspect proof",
  },
  {
    id: "trace",
    href: "/trace",
    label: "Decision trace",
    description: "Follow the reasoning",
  },
  {
    id: "proof",
    href: "/trace/002",
    label: "Proof case",
    description: "Review the complete loop",
  },
];

export function currentSystemDestination(pathname: string): SystemDestination {
  if (pathname === "/workbench") return "workbench";
  if (pathname === "/mcp") return "mcp";
  if (pathname === "/trace/002") return "proof";
  if (pathname.startsWith("/trace")) return "trace";
  return "system";
}
