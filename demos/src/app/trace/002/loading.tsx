import styles from "./trace-two.module.css";

export default function TraceTwoLoading() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Loading the Pawprint proof case">
      <div className={styles.stateShell}>
        <p className={styles.eyebrow}>Pawprint dispatch · proof case</p>
        <h1>Loading the evidence packet.</h1>
        <div className={styles.loadingLine} aria-hidden="true" />
        <div className={styles.loadingLine} aria-hidden="true" />
        <div className={styles.loadingLine} aria-hidden="true" />
      </div>
    </main>
  );
}
