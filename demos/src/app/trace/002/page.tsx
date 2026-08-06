import type { Metadata } from "next";
import { BrandLockup } from "../../BrandLockup";
import { ProofGallery } from "./ProofGallery";
import { ProofReceipts } from "./ProofReceipts";
import { ProofResult } from "./ProofResult";
import { ProofSequence } from "./ProofSequence";
import { TRACE } from "./traceData";
import { TraceClose } from "./TraceClose";
import { TraceTwoHeader } from "./TraceTwoHeader";
import { TraceTwoHero } from "./TraceTwoHero";
import styles from "./trace-two.module.css";

export const metadata: Metadata = {
  title: "Pawprint repair proof | Agentic Design System",
  description: "See how ADS caught one contradictory action, repaired it, and proved every unrelated Pawprint state stayed untouched.",
};

export default function TraceTwoPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Pawprint dispatch: one consequential UI repair",
    description: metadata.description,
    datePublished: "2026-07-21",
    author: { "@type": "Person", name: "Aaron Thomas" },
    about: "Agentic Design System v1.3.1 rendered regression evidence",
    isBasedOn: TRACE.receipts.frozenContract,
  };

  return (
    <main className={styles.page} id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <TraceTwoHeader />
      <article>
        <TraceTwoHero />
        <ProofGallery />
        <ProofSequence />
        <ProofResult />
        <ProofReceipts />
        <TraceClose />
      </article>
      <footer className={styles.footer}>
        <a className={`brand-lockup focus-ring ${styles.wordmark}`} href="#top" aria-label="Back to top">
          <BrandLockup />
        </a>
        <span>Pawprint proof case, frozen ADS version 1.3.1 evidence</span>
      </footer>
    </main>
  );
}
