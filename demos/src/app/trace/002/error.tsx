"use client";

import Link from "next/link";
import styles from "./trace-two.module.css";

export default function TraceTwoError({ reset }: { reset: () => void }) {
  return (
    <main className={styles.page}>
      <section className={styles.stateShell} role="alert" aria-labelledby="trace-error-title">
        <p className={styles.eyebrow}>Pawprint proof / unavailable</p>
        <h1 id="trace-error-title">The proof packet didn&apos;t load.</h1>
        <p>The frozen receipts are still safe. Retry this page or return to the workshop.</p>
        <div className={styles.stateActions}>
          <button type="button" onClick={reset}>Retry Trace 002</button>
          <Link className="focus-ring" href="/">Return to the workshop</Link>
        </div>
      </section>
    </main>
  );
}
