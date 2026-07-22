import { InstallCommand } from "../../InstallCommand";
import styles from "./trace-two.module.css";

export function TraceClose() {
  return (
    <section className={styles.caseClose} aria-labelledby="close-title">
      <div>
        <p className={styles.eyebrow}>Use the same loop</p>
        <h2 id="close-title">Give your coding agent<br /><em>a UI proof practice.</em></h2>
      </div>
      <div className={styles.closeAction}>
        <InstallCommand variant="strip" />
        <a className="focus-ring" href="https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/INSTALL.md">
          Choose your agent and activate ADS <span aria-hidden="true">↗</span>
        </a>
        <span>Open source · repo-local · inspectable</span>
      </div>
    </section>
  );
}
