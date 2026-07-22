import { TRACE } from "./traceData";
import styles from "./trace-two.module.css";

export function ProofResult() {
  return (
    <section className={styles.result} aria-labelledby="result-title">
      <div className={styles.resultCopy}>
        <p className={styles.eyebrow}>The result</p>
        <h2 id="result-title">One action changed.<br /><em>Six captures did not.</em></h2>
        <p>The repair is narrow enough to explain and complete enough to trust. The page shows both.</p>
      </div>
      <div className={styles.resultBoard}>
        <div className={styles.resultPrimary}><span>2 / 8</span><b>captures changed</b><p>Error state only, desktop and mobile.</p></div>
        <div><span>{TRACE.grade.findings.length}</span><b>material findings remain</b></div>
        <div><span>{TRACE.grade.weightedScore.toFixed(2)}</span><b>weighted grade</b></div>
        <div><span>{TRACE.evidence.publicRerunPerceptualDeltaPct} px</span><b>fresh rerun drift</b></div>
      </div>
    </section>
  );
}
