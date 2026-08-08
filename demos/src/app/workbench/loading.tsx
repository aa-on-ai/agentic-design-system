import styles from "./workbench.module.css";

export default function WorkbenchLoading() {
  return (
    <main className={styles.routeState} aria-busy="true" aria-live="polite">
      <span aria-hidden="true" />
      <p>Loading the read-only Workbench session.</p>
    </main>
  );
}
