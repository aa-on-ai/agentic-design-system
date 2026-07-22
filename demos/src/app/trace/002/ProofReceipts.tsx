import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { TRACE } from "./traceData";
import styles from "./trace-two.module.css";

const metrics = [
  ["Screenshots", `${TRACE.evidence.screenshots} / ${TRACE.evidence.screenshots}`],
  ["Serious axe violations", String(TRACE.evidence.seriousOrCriticalAxeViolations)],
  ["Horizontal overflow", TRACE.evidence.horizontalOverflow ? "Found" : "None"],
  ["Targets under 44px", String(TRACE.evidence.touchTargetsUnder44)],
  ["Maximum CLS", TRACE.evidence.maxCumulativeLayoutShift.toFixed(5)],
  ["Fresh rerun delta", `${TRACE.evidence.publicRerunPerceptualDeltaPct}%`],
] as const;

const receipts = [
  ["Outcome contract", TRACE.receipts.outcome],
  ["Builder report", TRACE.receipts.builderReport],
  ["Independent grader report", TRACE.receipts.graderReport],
  ["Rendered evidence JSON", TRACE.receipts.evidence],
  ["Frozen suite contract", TRACE.receipts.frozenContract],
  ["Fresh rerun packet", TRACE.receipts.rerunPacket],
] as const;

export function ProofReceipts() {
  return (
    <section className={styles.proofPacket} id="packet" aria-labelledby="packet-title">
      <div className={styles.packetHeading}>
        <p className={styles.eyebrow}>Supporting evidence</p>
        <h2 id="packet-title">The proof packet stays available.<br /><em>It does not lead the story.</em></h2>
      </div>

      <dl className={styles.packetRail}>
        {metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>

      <details className={styles.packetDetails}>
        <summary className="focus-ring">
          <span>Outcome</span><b>What success meant</b>
          <span>Builder</span><b>What changed</b>
          <span>Grader</span><b>What was verified</b>
          <span className={styles.packetOpen}>Expand packet +</span>
        </summary>
        <nav className={styles.receiptLinks} aria-label="Proof packet source receipts">
          {receipts.map(([label, href]) => (
            <a key={label} className="focus-ring" href={href}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{label}</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
          <a className="focus-ring" href="/trace/002/trace.json">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>Machine-readable trace</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </details>
    </section>
  );
}
