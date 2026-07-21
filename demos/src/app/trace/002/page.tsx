import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteFooter } from "../../SiteFooter";
import { ProofGallery } from "./ProofGallery";
import { ProofReceipts } from "./ProofReceipts";
import { ProofSequence } from "./ProofSequence";
import { TRACE } from "./traceData";
import { TraceTwoHeader } from "./TraceTwoHeader";
import { TraceTwoHero } from "./TraceTwoHero";
import styles from "./trace-two.module.css";

type TraceTwoPageProps = {
  searchParams: Promise<{ theme?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Trace 002 · Agentic Design System",
  description: "Inspect the frozen ADS v1.3.1 Pawprint repair from contradictory action to rendered evidence and grader verdict.",
};

export default async function TraceTwoPage({ searchParams }: TraceTwoPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const requestedTheme = Array.isArray(params.theme) ? params.theme[0] : params.theme;
  const storedTheme = cookieStore.get("ads-theme")?.value;
  const initialTheme = requestedTheme === "light" || requestedTheme === "dark"
    ? requestedTheme
    : storedTheme === "light" || storedTheme === "dark" ? storedTheme : "light";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Trace 002: Pawprint adjacent-action repair",
    description: metadata.description,
    datePublished: "2026-07-21",
    author: { "@type": "Person", name: "Aaron Thomas" },
    about: "Agentic Design System v1.3.1 rendered regression evidence",
    isBasedOn: TRACE.receipts.frozenContract,
  };

  return (
    <main className={`theme-page ${styles.page}`} id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <TraceTwoHeader initialTheme={initialTheme} />
      <article>
        <TraceTwoHero />
        <section className={styles.contract} aria-label="Adjacent-action state contract">
          <div><span>Default</span><strong>New walk enabled</strong></div>
          <div><span>Error</span><strong>New walk unavailable</strong></div>
          <div><span>Preserved</span><strong>Retry remains active</strong></div>
        </section>
        <ProofSequence />
        <ProofGallery />
        <ProofReceipts />
        <section className={styles.close} aria-labelledby="close-title">
          <p className={styles.sectionLabel}>The standard</p>
          <h2 id="close-title">Proof is a packet.<br /> <em>Not a promise.</em></h2>
          <p>Open the source, inspect the screenshots, and recompute the lock.</p>
          <div className={styles.closeActions}>
            <a className={`${styles.primaryAction} focus-ring`} href={TRACE.receipts.rerunPacket}>
              Open the current packet <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <Link className={`${styles.secondaryAction} focus-ring`} href={TRACE.receipts.traceOne}>
              Read historical Trace 001
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter topHref="#top" assemblyHref="/#assembly-line" />
    </main>
  );
}
