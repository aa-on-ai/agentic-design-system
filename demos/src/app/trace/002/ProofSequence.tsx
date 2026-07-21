import { CheckCircle2, CircleAlert, LockKeyhole, ShieldCheck } from "lucide-react";
import { TRACE } from "./traceData";
import styles from "./trace-two.module.css";

const steps = [
  {
    id: "01",
    label: "Finding",
    title: "The state and its nearby action disagreed.",
    body: TRACE.finding.problem,
    meta: `${TRACE.finding.category} / ${TRACE.finding.severity}`,
    icon: CircleAlert,
  },
  {
    id: "02",
    label: "Repair",
    title: "Disable the mutation, visibly and natively.",
    body: `Both responsive New walk controls use native disabled semantics in error. Desktop says “${TRACE.repair.desktopLabel}.”`,
    meta: TRACE.repair.semantics,
    icon: LockKeyhole,
  },
  {
    id: "03",
    label: "Preservation",
    title: "Keep the recovery path alive.",
    body: `${TRACE.preserved.action} remains enabled. Default, loading, and empty remain pixel-identical at both breakpoints.`,
    meta: `${TRACE.preserved.unaffectedPairs} unchanged screenshot pairs`,
    icon: ShieldCheck,
  },
  {
    id: "04",
    label: "Verdict",
    title: "A separate grader cleared the repair.",
    body: TRACE.grade.closure,
    meta: `${TRACE.grade.verdict} / ${TRACE.grade.weightedScore.toFixed(2)} weighted score`,
    icon: CheckCircle2,
  },
] as const;

export function ProofSequence() {
  return (
    <section className={styles.sequence} aria-labelledby="sequence-title">
      <div className={styles.sectionHeading}>
        <p className={styles.sectionLabel}>The repair chain</p>
        <h2 id="sequence-title">One contradiction.<br /> Four receipts.</h2>
      </div>
      <ol className={styles.sequenceList}>
        {steps.map(({ id, label, title, body, meta, icon: Icon }) => (
          <li key={id}>
            <span className={styles.sequenceIndex}>{id}</span>
            <div className={styles.sequenceIcon}><Icon size={20} aria-hidden="true" /></div>
            <div>
              <p>{label}</p>
              <h3>{title}</h3>
              <span>{body}</span>
              <small>{meta}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
