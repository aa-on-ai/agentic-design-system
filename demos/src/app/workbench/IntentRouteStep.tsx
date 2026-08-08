import { INTENTS, type IntentId } from "./workbenchFixture";
import styles from "./workbench.module.css";

type IntentRouteStepProps = {
  intent: IntentId | null;
  task: string;
  onIntentChange: (intent: IntentId) => void;
  onTaskChange: (task: string) => void;
};

export function IntentRouteStep(props: IntentRouteStepProps) {
  return (
    <section className={styles.questionPane} aria-labelledby="job-title">
      <div className={styles.questionInner}>
        <p className={styles.kicker}>Choose the job</p>
        <h1 id="job-title" tabIndex={-1}>What should the agent do?</h1>
        <p className={styles.intro}>
          Choose the kind of help you want, then name the exact surface. Workbench will propose a route for you to review before it creates a handoff.
        </p>

        <fieldset className={styles.jobChoices}>
          <legend className={styles.visuallyHidden}>Choose the kind of job</legend>
          {INTENTS.map((item) => (
            <label className={styles.jobOption} key={item.id}>
              <input
                type="radio"
                name="intent"
                value={item.id}
                checked={props.intent === item.id}
                onChange={() => props.onIntentChange(item.id)}
              />
              <span className={styles.radio} aria-hidden="true" />
              <span className={styles.jobOptionCopy}>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </label>
          ))}
        </fieldset>

        <label className={styles.taskField}>
          <span>
            <strong>Name the exact task</strong>
            <small id="task-help">One page, component, state, or interaction is enough.</small>
          </span>
          <textarea
            value={props.task}
            rows={3}
            aria-describedby="task-help"
            placeholder="Review the mobile checkout confirmation before merge"
            onChange={(event) => props.onTaskChange(event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
