"use client";

import styles from "./workbench.module.css";

export default function WorkbenchError({ reset }: { reset: () => void }) {
  return (
    <main className={styles.routeState} role="alert">
      <strong>The Workbench session could not load.</strong>
      <p>The supplied read-only intake file is missing or invalid. No project files were touched.</p>
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}
