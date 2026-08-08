import Link from "next/link";
import { BrandLockup } from "./BrandLockup";
import { FooterEmber } from "./FooterEmber";

type SiteFooterProps = {
  topHref?: string;
  assemblyHref?: string;
};

export function SiteFooter({
  topHref = "#top",
  assemblyHref = "#assembly-line",
}: SiteFooterProps = {}) {
  return (
    <footer className="site-footer">
      <FooterEmber />
      <div className="footer-brand">
        <Link
          className="brand-lockup footer-wordmark focus-ring"
          href={topHref}
          aria-label="Back to the top"
        >
          <BrandLockup />
        </Link>
        <p>Design judgment, made repeatable for coding agents.</p>
      </div>

      <nav className="footer-links" aria-label="Footer navigation">
        <div>
          <span>Explore</span>
          <Link className="focus-ring" href="/#system-map">System map</Link>
          <Link className="focus-ring" href="/workbench">Workbench</Link>
          <Link className="focus-ring" href="/mcp">Evidence tools</Link>
        </div>
        <div>
          <span>Evidence</span>
          <Link className="focus-ring" href="/trace/002">Proof case</Link>
          <Link className="focus-ring" href="/trace">Decision trace</Link>
          <a className="focus-ring" href="https://github.com/aa-on-ai/agentic-design-system">GitHub</a>
        </div>
        <div>
          <span>Project</span>
          <a className="focus-ring" href="https://github.com/aa-on-ai/agentic-design-system#readme">Documentation</a>
          <a className="focus-ring" href="https://github.com/aa-on-ai/agentic-design-system/blob/main/LICENSE">Open source license</a>
          <Link className="focus-ring" href={assemblyHref}>One interface run</Link>
        </div>
      </nav>

      <div className="footer-meta">
        <span>Built by <a className="focus-ring" href="https://github.com/aa-on-ai">Aaron Thomas</a></span>
        <span>© 2026 Agentic Design System</span>
      </div>
    </footer>
  );
}
