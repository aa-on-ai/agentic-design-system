import { InstallCommand } from "./InstallCommand";

export function GetStarted() {
  return (
    <>
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-copy">
            <p className="section-kicker">Your next build is the test</p>
            <h2>Install the loop. Keep the judgment.</h2>
            <p>
              Start with one page. Give the agent the context, make it attach rendered evidence,
              and decide from the receipts instead of the confidence of its final message.
            </p>
          </div>
          <div className="cta-actions">
            <InstallCommand variant="strip" />
            <a
              href="https://github.com/aa-on-ai/agentic-design-system"
              className="cta-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Inspect the repository <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span className="site-footer-mark">Agentic Design System</span>
        <span className="site-footer-author">
          Built by{" "}
          <a
            href="https://github.com/aa-on-ai"
          >
            Aaron Thomas
          </a>
        </span>
        <span className="site-footer-trust">
          <a href="https://github.com/aa-on-ai/agentic-design-system/blob/main/LICENSE">MIT</a>
          <a href="https://github.com/aa-on-ai/agentic-design-system">GitHub</a>
        </span>
      </footer>
    </>
  );
}
