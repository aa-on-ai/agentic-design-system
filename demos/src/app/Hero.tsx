import { InstallCommand } from "./InstallCommand";
import { ProofStage } from "./ProofStage";
import { SiteHeader } from "./SiteHeader";

export function Hero() {
  return (
    <>
      <SiteHeader />
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="hero-kicker">Open-source design QA for coding agents</p>
          <h1 id="hero-title">Make your agent prove the UI got better.</h1>
          <p className="hero-lede">
            Agentic Design System turns taste into an inspectable loop: set intent, capture the
            rendered UI, critique it, revise it, and return a verdict with receipts.
          </p>

          <div className="hero-install" role="group" aria-label="Install Agentic Design System">
            <p className="hero-install-label">Install the workflow</p>
            <InstallCommand variant="strip" />
          </div>

          <div className="hero-meta" aria-label="Project details">
            <span>MIT licensed</span>
            <span>Plain files</span>
            <span>Human judgment stays in the loop</span>
          </div>

          <a className="hero-jump" href="#run">
            Follow the real run <span aria-hidden="true">↓</span>
          </a>
        </div>
        <ProofStage />
      </section>
    </>
  );
}
