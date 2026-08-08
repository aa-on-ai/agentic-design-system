import type { Metadata } from "next";
import { loadWorkbenchSession } from "./loadWorkbenchSession";
import { loadProjectIdentityState } from "./projectIdentity.server";
import { WorkbenchJourney } from "./WorkbenchJourney";
import styles from "./workbench.module.css";

export const metadata: Metadata = {
  title: "Workbench | Agentic Design System",
  description: "Use the optional ADS control layer to clarify project identity, route one design job, and approve the exact agent handoff.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WorkbenchPage() {
  const session = await loadWorkbenchSession();
  const identityState = await loadProjectIdentityState(session);

  return (
    <main className={styles.page} aria-label="Agentic Design Workbench" data-workbench-session>
      <WorkbenchJourney session={session} identityState={identityState} />
    </main>
  );
}
