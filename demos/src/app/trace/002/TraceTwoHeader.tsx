import Link from "next/link";
import { TRACE } from "./traceData";
import styles from "./trace-two.module.css";

export function TraceTwoHeader() {
  return (
    <header className={styles.header}>
      <Link className={`wordmark focus-ring ${styles.wordmark}`} href="/" aria-label="Agentic Design System home">
        <span className="wordmark-mark" aria-hidden="true" />
        <span>Agentic Design System</span>
      </Link>
      <div className={styles.headerMeta} aria-label="Proof status">
        <span>Proof case 01</span>
        <span className={styles.status}><i aria-hidden="true" />{TRACE.grade.verdict}</span>
      </div>
    </header>
  );
}
