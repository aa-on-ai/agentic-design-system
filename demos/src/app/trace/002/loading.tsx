import styles from "./trace-two.module.css";

export default function TraceTwoLoading() {
  return (
    <main className={`theme-page ${styles.page}`} aria-busy="true" aria-label="Loading Trace 002">
      <div className={styles.stateShell}>
        <p className={styles.kicker}>Current proof / trace 002</p>
        <h1>Loading the evidence packet.</h1>
        <div className={styles.loadingLine} aria-hidden="true" />
        <div className={styles.loadingLine} aria-hidden="true" />
        <div className={styles.loadingLine} aria-hidden="true" />
      </div>
    </main>
  );
}
