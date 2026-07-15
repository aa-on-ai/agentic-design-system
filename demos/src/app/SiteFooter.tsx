export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <a className="footer-wordmark focus-ring" href="#top" aria-label="Back to the top">
          <span className="footer-wordmark-mark" aria-hidden="true">A</span>
          <span>
            <strong>Agentic Design System</strong>
            <small>Open-source design governance</small>
          </span>
        </a>
        <p>Design judgment, made repeatable for coding agents.</p>
      </div>

      <nav className="footer-links" aria-label="Footer navigation">
        <div>
          <span>Explore</span>
          <a className="focus-ring" href="#assembly-line">The assembly line</a>
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
