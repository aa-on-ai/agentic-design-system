import Link from "next/link";
import { BrandLockup } from "../../BrandLockup";
import { SystemNav } from "../../SystemNav";
import { TRACE } from "./traceData";
import styles from "./trace-two.module.css";

export function TraceTwoHeader() {
  return (
    <header className={styles.header}>
      <Link className={`brand-lockup focus-ring ${styles.wordmark}`} href="/" aria-label="Agentic Design System home">
        <BrandLockup />
      </Link>
      <SystemNav current="proof" />
      <div className={styles.headerMeta} aria-label="Proof status">
        <span>Proof case 01, rendered</span>
        <span className={styles.status}>
          <i aria-hidden="true" />
          <span className={styles.statusLong}>Review verdict, {TRACE.grade.verdict}</span>
          <span className={styles.statusShort}>{TRACE.grade.verdict}</span>
        </span>
      </div>
    </header>
  );
}
