import type { IntentId } from "./workbenchFixture";
import type { WorkbenchRoute } from "./workbenchRouting";
import styles from "./workbench.module.css";

export function RoutePreview({
  intent,
  route,
  reviewed,
  onReviewedChange,
}: {
  intent: IntentId | null;
  route: WorkbenchRoute | null;
  reviewed: boolean;
  onReviewedChange: (reviewed: boolean) => void;
}) {
  const state = !intent ? "Waiting for your choice" : route?.status === "ready" ? "Ready to review" : "Needs one detail";

  return (
    <aside className={styles.previewPane} aria-labelledby="route-preview-title">
      <div className={styles.previewWrap}>
        <header className={styles.previewHeader}>
          <p>Proposed route</p>
          <span>{state}</span>
        </header>

        <section className={styles.routeSheet} data-status={route?.status ?? "empty"}>
          {!intent || !route ? (
            <div className={styles.routeEmpty}>
              <span>Your decision stays in control</span>
              <h2 id="route-preview-title">Your choice sets the route.</h2>
              <p>Workbench will explain what the agent receives, what stays out of scope, and where the route comes from.</p>
            </div>
          ) : route.status === "needs-clarification" ? (
            <div className={styles.routeEmpty}>
              <span>Routing paused</span>
              <h2 id="route-preview-title">Name one concrete target.</h2>
              <p>{route.reason}</p>
              <strong>{route.clarification}</strong>
              <small>No handoff is created while the task is ambiguous.</small>
            </div>
          ) : (
            <>
              <header className={styles.routeSheetHeader}>
                <span>Recommended workflow</span>
                <h2 id="route-preview-title">{route.label}</h2>
                <p>{route.reason}</p>
              </header>
              <div className={styles.routePath}>
                <span>Canonical source</span>
                <code>{route.canonicalPath}</code>
              </div>
              <div className={styles.routeColumns}>
                <section>
                  <h3>What turns on</h3>
                  <ul>{route.activates.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                  <h3>What stays off</h3>
                  <ul>{route.skipped.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
              </div>
              <p className={styles.routeBoundary}>You can revise the job before Workbench creates the exact handoff.</p>
              <label className={styles.routeReviewCheck}>
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={(event) => onReviewedChange(event.target.checked)}
                />
                <span>
                  <strong>I reviewed this route</strong>
                  <small>The handoff will activate only what is shown above.</small>
                </span>
              </label>
            </>
          )}
        </section>
      </div>
    </aside>
  );
}
