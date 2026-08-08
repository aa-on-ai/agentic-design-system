import Link from "next/link";

export type SystemDestination = "system" | "workbench" | "mcp" | "trace" | "proof";

const destinations: Array<{ id: SystemDestination; href: string; label: string }> = [
  { id: "system", href: "/#system-map", label: "System" },
  { id: "workbench", href: "/workbench", label: "Workbench" },
  { id: "mcp", href: "/mcp", label: "Evidence tools" },
  { id: "trace", href: "/trace", label: "Decision trace" },
  { id: "proof", href: "/trace/002", label: "Proof case" },
];

export function SystemNav({
  current,
  className = "",
}: {
  current?: SystemDestination;
  className?: string;
}) {
  const links = destinations.map((destination) => (
    <Link
      key={destination.id}
      href={destination.href}
      aria-current={current === destination.id ? "page" : undefined}
      className="focus-ring"
    >
      {destination.label}
    </Link>
  ));

  return (
    <nav className={`ads-system-nav ${className}`.trim()} aria-label="Agentic Design System">
      <div className="ads-system-nav-list">{links}</div>
      <details className="ads-system-nav-menu">
        <summary aria-label="Explore the system" className="focus-ring">
          <span className="ads-system-nav-summary-long">Explore the system</span>
          <span className="ads-system-nav-summary-short">Explore</span>
        </summary>
        <div>{links}</div>
      </details>
    </nav>
  );
}
