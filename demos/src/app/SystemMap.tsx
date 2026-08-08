import Link from "next/link";

const stages: Array<{
  number: string;
  verb: string;
  owner: string;
  description: string;
  href?: string;
}> = [
  {
    number: "01",
    verb: "Clarify",
    owner: "Human intent",
    description: "Name the user, outcome, constraints, and stop condition.",
  },
  {
    number: "02",
    verb: "Route",
    owner: "Optional Workbench",
    description: "Choose the project posture and activate only the skills the job needs.",
    href: "/workbench",
  },
  {
    number: "03",
    verb: "Build",
    owner: "Coding agent",
    description: "Use the repo-local skill pack to change the actual interface.",
  },
  {
    number: "04",
    verb: "Prove",
    owner: "Optional evidence tools",
    description: "Capture rendered states, checks, and regression receipts in the browser.",
    href: "/mcp",
  },
  {
    number: "05",
    verb: "Review",
    owner: "Independent grader",
    description: "Judge the rendered result from a separate context and return bounded findings.",
    href: "/trace",
  },
  {
    number: "06",
    verb: "Decide",
    owner: "Human verdict",
    description: "Accept, revise, or stop with the evidence and unresolved judgment visible.",
    href: "/trace/002",
  },
];

export function SystemMap() {
  return (
    <section className="system-map" id="system-map" aria-labelledby="system-map-title">
      <div className="system-map-intro">
        <div>
          <p>How the system fits together</p>
          <h2 id="system-map-title">One system.<br /><em>Six clear jobs.</em></h2>
        </div>
        <p>
          The skill pack is the foundation. Workbench and the evidence tools are optional layers,
          not separate products. They help a coding agent move from intent to a reviewable human decision.
        </p>
      </div>

      <div className="system-foundation">
        <span>Shared foundation</span>
        <strong>Repo-local Agentic Design System skills</strong>
        <p>Design judgment, state coverage, rendered verification, and review rules travel with the project.</p>
      </div>

      <ol className="system-stage-list">
        {stages.map((stage) => (
          <li key={stage.number}>
            <span>{stage.number}</span>
            <div>
              <p>{stage.verb}</p>
              <strong>{stage.owner}</strong>
              <small>{stage.description}</small>
              {stage.href && <Link className="focus-ring" href={stage.href}>Open this layer</Link>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
