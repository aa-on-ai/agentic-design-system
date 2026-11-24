import type { Metadata } from "next";
import Image from "next/image";
import { MissingPath } from "./MissingPath";
import styles from "./NotFound.module.css";
import { SITE_NAME } from "./site";

export const metadata: Metadata = {
  title: `Page not found / ${SITE_NAME}`,
  robots: { index: false, follow: true },
};

const routes = [
  { href: "/", label: "Home", detail: "The practice and one complete review loop" },
  { href: "/trace/002", label: "Decision trace", detail: "A rendered repair case with frozen evidence" },
  { href: "/mcp", label: "MCP lab", detail: "The optional local evidence tools" },
  { href: "/workbench", label: "Workbench", detail: "Run the loop on your own brief" },
];

export default function NotFound() {
  return (
    <main className={styles.page} aria-labelledby="not-found-title">
      <div className={styles.card}>
        <Image
          className={styles.ember}
          src="/characters/ember-peek.png"
          alt=""
          width={512}
          height={512}
          sizes="120px"
          priority
        />
        <p className={styles.label}>404 / not found</p>
        <h1 id="not-found-title" className={styles.title}>
          Nothing on this bench.
        </h1>
        <p className={styles.body}>
          The link may be out of date, or the page moved. <MissingPath /> Here is where the work lives now.
        </p>

        <nav aria-label="Pages that exist">
          <ul className={styles.routes}>
            {routes.map((route) => (
              <li key={route.href}>
                <a className={`${styles.route} focus-ring`} href={route.href}>
                  <span className={styles.routeLabel}>{route.label}</span>
                  <span className={styles.routeDetail}>{route.detail}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className={styles.footnote}>
          Followed a broken link from somewhere?{" "}
          <a
            className="focus-ring"
            href="https://github.com/aa-on-ai/agentic-design-system/issues/new?title=Broken%20link"
          >
            Report it on GitHub
          </a>
        </p>
      </div>
    </main>
  );
}
