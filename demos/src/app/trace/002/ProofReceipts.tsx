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
    <section className={styles.receipts} aria-labelledby="receipts-title">
      <div className={styles.receiptsHeading}>
        <p className={styles.sectionLabel}>Verification</p>
        <h2 id="receipts-title">The claim resolves<br /> all the way down.</h2>
        <p>Scores stay subjective. Rendered failures, missing states, and contradictory actions do not.</p>
      </div>

      <dl className={styles.metrics}>
        {metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>

      <nav className={styles.receiptLinks} aria-label="Trace 002 source receipts">
        {receipts.map(([label, href]) => (
          <a key={label} className="focus-ring" href={href}>
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{label}</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ))}
      </nav>
    </section>
  );
}
