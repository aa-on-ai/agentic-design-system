import { AdsRunArtifact, type ArtifactStage } from "./AdsRunArtifact";
import { AssemblyLineClimber } from "./AssemblyLineClimber";

function InspectionLamp({ label, tone = "amber" }: { label: string; tone?: "amber" | "green" | "red" }) {
  return (
    <span className={`inspection-lamp inspection-lamp--${tone}`}>
      <span className="inspection-lamp-bulb" aria-hidden="true" />
      {label}
    </span>
  );
}

type StationProps = {
  number: string;
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  proofLabel: string;
  proof: string;
  notes: string[];
  stage: ArtifactStage;
  side: "left" | "right";
  lamp: string;
  lampTone?: "amber" | "green" | "red";
  machineLabel: string;
};

function Station({
  number, id, eyebrow, title, description, proofLabel, proof, notes,
  stage, side, lamp, lampTone, machineLabel,
}: StationProps) {
  return (
    <section
      className={`station station--${side} station--${stage}`}
      aria-labelledby={id}
      data-stage={stage}
      data-side={side}
      data-active="false"
      data-arrival="false"
    >
      <div className="station-index" aria-hidden="true"><span>{number}</span></div>
      <div className="station-copy">
        <p className="station-eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        <p className="station-description">{description}</p>
        <div className="station-proof">
          <span className="station-proof-mark" aria-hidden="true">+</span>
          <div><p>{proofLabel}</p><strong>{proof}</strong><span>{notes.join(" · ")}</span></div>
        </div>
      </div>
      <div className="machine-bay">
        <div className="machine-header">
          <span>{machineLabel}</span>
          <InspectionLamp label={lamp} tone={lampTone} />
        </div>
        <div className="artifact-cart">
          <span className="cart-handle cart-handle--left" aria-hidden="true" />
          <AdsRunArtifact stage={stage} />
          <span className="cart-handle cart-handle--right" aria-hidden="true" />
          <span className="cart-wheel cart-wheel--left" aria-hidden="true" />
          <span className="cart-wheel cart-wheel--right" aria-hidden="true" />
        </div>
        <div className="machine-footer" aria-hidden="true"><span>ADS / {number}</span><i /><span>Run 4821</span></div>
      </div>
    </section>
  );
}

const stations: StationProps[] = [
  { number: "01", id: "station-intent", eyebrow: "Input / outcome.md", title: "Turn the request into a testable outcome.", description: "ADS gives the agent a job it can fail: who the screen is for, what must become obvious, which states are required, and when the run stops.", proofLabel: "Input", proof: "A concrete brief the agent can build against.", notes: ["User + outcome", "Required states + stop condition"], stage: "intent", side: "left", lamp: "brief locked", machineLabel: "Outcome press" },
  { number: "02", id: "station-baseline", eyebrow: "First render / capture.mjs", title: "Catch the failure in the pixels.", description: "The first build runs in a browser. ADS records overflow, missing states, touch targets, and accessibility before taste enters the room.", proofLabel: "Failed check", proof: "Two visible failures tied to the rendered screen.", notes: ["Overflow +36px", "Error state missing"], stage: "baseline", side: "right", lamp: "2 checks failed", lampTone: "red", machineLabel: "Browser capture" },
  { number: "03", id: "station-rubric", eyebrow: "Repair / candidate", title: "Repair the screen, not the explanation.", description: "The coding agent changes the actual UI: delayed orders lead, recovery states exist, and the mobile layout no longer overflows.", proofLabel: "Corrected screen", proof: "The product changes where the evidence said it failed.", notes: ["Urgent work leads", "States complete · mobile fixed"], stage: "rubric", side: "left", lamp: "candidate ready", machineLabel: "Repair bench" },
  { number: "04", id: "station-evidence", eyebrow: "Evidence / run-report.md", title: "Package what changed and prove it.", description: "ADS captures consistent viewports and attaches axe, overflow, and touch receipts so a reviewer can inspect the same result.", proofLabel: "Evidence report", proof: "Screenshots and checks travel with the change.", notes: ["390 · 768 · 1280", "Axe · overflow · touch"], stage: "evidence", side: "right", lamp: "evidence complete", lampTone: "green", machineLabel: "Evidence light table" },
  { number: "05", id: "station-release", eyebrow: "Review / grader-report.md", title: "A separate critic decides what happens next.", description: "The grader accepts the evidence or returns a bounded revision. If the loop exhausts its budget, the unresolved judgment goes to a human.", proofLabel: "Grader verdict", proof: "Satisfied or needs revision, from a separate context.", notes: ["Independent critique", "Human fallback when unresolved"], stage: "release", side: "left", lamp: "satisfied", lampTone: "green", machineLabel: "Review gate" },
];

export function WorkshopRun() {
  return (
    <div className="factory-floor" id="assembly-line">
      <div className="continuous-track" aria-hidden="true"><span /></div>
      <AssemblyLineClimber />
      <div className="line-intro">
        <p>One UI run / 01–05</p>
        <h2>One request.<br />Five inspectable artifacts.</h2>
        <span>Input → failed check → correction → evidence → grader verdict</span>
      </div>
      {stations.map((station) => <Station key={station.number} {...station} />)}
      <div className="track-end" aria-hidden="true"><span>End of run</span></div>
    </div>
  );
}
