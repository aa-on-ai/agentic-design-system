import Link from "next/link";
import { BrandLockup } from "../../BrandLockup";
import { TRACE } from "./traceData";
import styles from "./trace-two.module.css";

export function TraceTwoHeader() {
  return (
    <header className={styles.header}>
      <Link className={`brand-lockup focus-ring ${styles.wordmark}`} href="/" aria-label="Agentic Design System home">
        <BrandLockup />
      </Link>
      <div className={styles.headerMeta} aria-label="Proof status">
        <span>Proof case 01</span>
        <span className={styles.status}><i aria-hidden="true" />{TRACE.grade.verdict}</span>
      </div>
    </header>
  );
}
