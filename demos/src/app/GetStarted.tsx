import { InstallCommand } from "./InstallCommand";

export function GetStarted() {
  return (
    <>
      <section className="cta-section">
        <div className="cta-inner">
          <p className="eyebrow">Get started</p>
          <h2>See how it fits your setup.</h2>
          <p>
            The kit is plain markdown, scripts, and templates. Use the whole thing, or copy one
            useful piece into your repo. Open source, MIT.
          </p>
          <div className="cta-actions">
            <InstallCommand variant="strip" />
            <a
              href="https://github.com/aa-on-ai/agentic-design-system"
              className="cta-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Review on GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span className="site-footer-mark">Agentic Design System · 2026</span>
        <span className="site-footer-trust">
          <a href="https://github.com/aa-on-ai/agentic-design-system/blob/main/LICENSE">MIT</a>
          <span aria-hidden="true">·</span>
          <a href="https://github.com/aa-on-ai/agentic-design-system">GitHub</a>
        </span>
        <span className="site-footer-author">
          Built by{" "}
          <a
            href="https://github.com/aa-on-ai"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Aaron Thomas
          </a>
        </span>
      </footer>
    </>
  );
}
