import Link from "next/link";
import { FooterEmber } from "./FooterEmber";

type SiteFooterProps = {
  topHref?: string;
  assemblyHref?: string;
};

export function SiteFooter({ topHref = "#top", assemblyHref = "#assembly-line" }: SiteFooterProps = {}) {
  return (
    <footer className="site-footer">
      <FooterEmber />
      <div className="footer-brand">
        <Link className="footer-wordmark focus-ring" href={topHref} aria-label="Back to the top">
          <span className="footer-wordmark-mark" aria-hidden="true" />
          <span>
            <strong>Agentic Design System</strong>
            <small>Open-source design governance</small>
          </span>
        </Link>
        <p>Design judgment, made repeatable for coding agents.</p>
      </div>

      <nav className="footer-links" aria-label="Footer navigation">
        <div>
          <span>Explore</span>
          <Link className="focus-ring" href={assemblyHref}>The assembly line</Link>
          <Link className="focus-ring" href="/trace/002">Decision trace</Link>
          <a className="focus-ring" href="https://github.com/aa-on-ai/agentic-design-system">GitHub</a>
        </div>
        <div>
          <span>Project</span>
          <a className="focus-ring" href="https://github.com/aa-on-ai/agentic-design-system#readme">Documentation</a>
          <a className="focus-ring" href="https://github.com/aa-on-ai/agentic-design-system/blob/main/LICENSE">MIT license</a>
        </div>
      </nav>

      <div className="footer-meta">
        <span>Built by <a className="focus-ring" href="https://github.com/aa-on-ai">Aaron Thomas</a></span>
        <span>© 2026 ADS</span>
      </div>
    </footer>
  );
}
