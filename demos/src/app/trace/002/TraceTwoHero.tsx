import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { TRACE } from "./traceData";
import styles from "./trace-two.module.css";

export function TraceTwoHero() {
  return (
    <section className={styles.hero} aria-labelledby="trace-two-title">
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>Current proof / trace 002</p>
        <h1 id="trace-two-title">The button changed<br /> <em>because the state did.</em></h1>
        <p className={styles.lede}>
          Pawprint&apos;s schedule became read-only. ADS caught the enabled-looking New walk action,
          disabled it natively, kept Retry active, and proved the unaffected states stayed untouched.
        </p>
      </div>

      <aside className={styles.runCard} aria-label="Trace 002 summary">
        <div className={styles.runCardTop}>
          <span><LockKeyhole size={14} aria-hidden="true" /> Frozen run</span>
          <span className={styles.satisfiedStatus}><i aria-hidden="true" /> {TRACE.grade.verdict}</span>
        </div>
        <strong>Pawprint / {TRACE.finding.id}</strong>
        <dl>
          <div><dt>Release</dt><dd>{TRACE.release.tag}</dd></div>
          <div><dt>Evidence</dt><dd>{TRACE.evidence.screenshots} / {TRACE.evidence.screenshots}</dd></div>
          <div><dt>Grade</dt><dd>{TRACE.grade.weightedScore.toFixed(2)} / 10</dd></div>
          <div><dt>Material findings</dt><dd>{TRACE.grade.findings.length}</dd></div>
        </dl>
        <a className={`${styles.rawLink} focus-ring`} href="/trace/002/trace.json">
          Open machine-readable trace <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </aside>
    </section>
  );
}
