import { InstallCommand } from "./InstallCommand";
import { ProofStage } from "./ProofStage";

export function Hero() {
  return (
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

          <ul className="hero-meta" aria-label="Project details">
            <li>MIT licensed</li>
            <li>Plain files</li>
            <li>Human judgment stays in the loop</li>
          </ul>

          <a className="hero-jump" href="#run">
            Follow the real run <span aria-hidden="true">↓</span>
          </a>
        </div>
        <ProofStage />
    </section>
  );
}
