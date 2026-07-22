import styles from "./trace-two.module.css";

const steps = [
  ["01", "Intent", "Keep dispatch usable when the connection drops."],
  ["02", "Baseline", "Load Pawprint’s states, actions, and existing UI."],
  ["03", "Rubric", "Check every nearby action against the state contract."],
  ["04", "Evidence", "Compare changed captures and preserve the originals."],
  ["05", "Release", "Separate grader, frozen run, auditable packet."],
] as const;

export function ProofSequence() {
  return (
    <section className={styles.method} aria-labelledby="method-title">
      <div className={styles.sectionIntro}>
        <div>
          <p className={styles.eyebrow}>How ADS got there</p>
          <h2 id="method-title">One case through the existing<br /><em>five-stage workshop.</em></h2>
        </div>
        <p>No new story system. This repair moves through the same assembly line the homepage teaches.</p>
      </div>
      <ol className={styles.assemblyLine}>
        {steps.map(([id, title, body]) => (
          <li className={id === "04" ? styles.activeStep : undefined} key={id}>
            <span>{id}</span><b>{title}</b><p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
