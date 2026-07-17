import Image from "next/image";
import { Github } from "lucide-react";
import { AssemblyLineClimber } from "./AssemblyLineClimber";
import { InstallCommand } from "./InstallCommand";
import { SiteFooter } from "./SiteFooter";
import { ThemeToggle } from "./ThemeToggle";

type ArtifactStage = "intent" | "baseline" | "rubric" | "evidence" | "release";

const orders = [
  { id: "#4821", customer: "Mara Chen", destination: "Portland", total: "$184.00", state: "Delayed" },
  { id: "#4819", customer: "Field Notes Co.", destination: "Austin", total: "$96.50", state: "Packing" },
  { id: "#4816", customer: "Owen Bell", destination: "Chicago", total: "$242.00", state: "Shipped" },
];

function InspectionLamp({ label, tone = "amber" }: { label: string; tone?: "amber" | "green" | "red" }) {
  return (
    <span className={`inspection-lamp inspection-lamp--${tone}`}>
      <span className="inspection-lamp-bulb" aria-hidden="true" />
      {label}
    </span>
  );
}

function OrderRows({ selected = false }: { selected?: boolean }) {
  return (
    <div className="order-rows" role="table" aria-label="Recent orders">
      <div className="order-row order-row--head" role="row">
        <span role="columnheader">Order</span>
        <span role="columnheader">Customer</span>
        <span className="order-destination" role="columnheader">Destination</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Total</span>
      </div>
      {orders.map((order, index) => (
        <div className={`order-row ${selected && index === 0 ? "order-row--selected" : ""}`} role="row" key={order.id}>
          <strong role="cell">{order.id}</strong>
          <span role="cell">{order.customer}</span>
          <span className="order-destination" role="cell">{order.destination}</span>
          <span role="cell"><span className={`status status--${order.state.toLowerCase()}`}>{order.state}</span></span>
          <span role="cell">{order.total}</span>
        </div>
      ))}
    </div>
  );
}

function ProductStateContactSheet() {
  return (
    <div className="state-contact-sheet" aria-label="Required loading, empty, and error screen fixtures">
      <div className="state-card state-card--loading">
        <strong>Loading</strong>
        <span className="state-skeleton state-skeleton--wide" aria-hidden="true" />
        <span className="state-skeleton" aria-hidden="true" />
        <span className="state-skeleton state-skeleton--short" aria-hidden="true" />
      </div>
      <div className="state-card state-card--empty">
        <strong>Empty</strong>
        <span className="state-empty-box" aria-hidden="true">0</span>
        <small>No orders match</small>
      </div>
      <div className="state-card state-card--error">
        <strong>Error</strong>
        <span className="state-error-mark" aria-hidden="true">!</span>
        <small>Retry available</small>
      </div>
    </div>
  );
}

function EvidenceWorkbench() {
  return (
    <div className="evidence-workbench" aria-label="Desktop and mobile order screen renders under inspection">
      <div className="evidence-desktop-shot">
        <span className="evidence-shot-label">1280 / repaired</span>
        <OrderRows selected />
      </div>
      <div className="evidence-phone-shot" aria-hidden="true">
        <div className="evidence-phone-top"><strong>Orders</strong><span>03</span></div>
        <div className="evidence-phone-summary"><span>At risk</span><strong>3</strong></div>
        <div className="evidence-phone-order evidence-phone-order--risk"><b>#4821</b><span>Delayed</span></div>
        <div className="evidence-phone-order"><b>#4819</b><span>Packing</span></div>
      </div>
    </div>
  );
}

function OrderArtifact({ stage }: { stage: ArtifactStage }) {
  const isIntent = stage === "intent";
  const isBaseline = stage === "baseline";
  const isRubric = stage === "rubric";
  const isEvidence = stage === "evidence";
  const isRelease = stage === "release";

  return (
    <div className={`order-artifact order-artifact--${stage}`}>
      <div className="artifact-registration" aria-hidden="true">
        <i /><i /><i /><i />
      </div>

      {isIntent && (
        <div className="intent-ticket">
          <span>Job 4821-A</span>
          <strong>Spot delayed orders before they miss dispatch.</strong>
        </div>
      )}

      {isBaseline && (
        <div className="baseline-tape" aria-label="Required screen states">
          <span>Loading</span><span>Empty</span><span>Error</span><span>390px</span>
        </div>
      )}

      <div className="orders-window">
        <div className="orders-browserbar" aria-hidden="true">
          <span /><span /><span />
          <small>northstar / admin / orders</small>
        </div>
        <div className="orders-ui">
          <div className="orders-sidebar" aria-hidden="true">
            <b>NS</b>
            <small>Workspace</small>
            <span>Overview</span>
            <span className="orders-side-active">Orders</span>
            <span>Shipments</span>
          </div>
          <div className="orders-main">
            <div className="orders-titlebar">
              <div>
                <span className="orders-kicker">Operations</span>
                <h3>Orders</h3>
              </div>
              {!isIntent && <button type="button" className="new-order-button">New order</button>}
            </div>

            {isIntent && (
              <p className="orders-raw-note">A working first draft. No priority, no recovery states, no mobile decision.</p>
            )}

            {(isRubric || isEvidence || isRelease) && (
              <div className="orders-summary" aria-label="Order summary">
                <div><strong>12</strong><span>open</span></div>
                <div><strong>03</strong><span>at risk</span></div>
                <div className="summary-deadline"><strong>2h 14m</strong><span>dispatch closes</span></div>
              </div>
            )}

            {isBaseline && <ProductStateContactSheet />}
            {isEvidence ? <EvidenceWorkbench /> : !isBaseline && <OrderRows selected={isRubric || isRelease} />}

            {isRubric && (
              <div className="rubric-overlay" aria-hidden="true">
                <span className="measure measure--target">48</span>
                <span className="measure measure--gutter">24</span>
                <span className="rubric-flag">at-risk orders lead</span>
              </div>
            )}

            {isEvidence && (
              <div className="viewport-proof" aria-label="Viewport evidence">
                <span><b>390</b> no overflow</span>
                <span><b>768</b> touch clear</span>
                <span><b>1280</b> axe clean</span>
              </div>
            )}

            {isRelease && (
              <div className="release-detail">
                <span><b>Order #4821</b> requires dispatch review</span>
                <button type="button">Review delay</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isIntent && <span className="draft-stamp" aria-hidden="true">Rough / v0</span>}
      {isBaseline && <span className="context-tag" aria-hidden="true">Context loaded</span>}
      {isRubric && <span className="caliper" aria-hidden="true"><i /><b>Pass line</b><i /></span>}
      {isEvidence && (
        <div className="inspection-stamps" aria-hidden="true">
          <span className="stamp-fail">Fail 01</span>
          <span className="stamp-fixed">Repaired</span>
        </div>
      )}
      {isRelease && <span className="release-seal" aria-hidden="true">Release<br />cleared</span>}
    </div>
  );
}

type StationProps = {
  number: string;
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  proof: string;
  notes: string[];
  stage: ArtifactStage;
  side: "left" | "right";
  lamp: string;
  lampTone?: "amber" | "green" | "red";
  machineLabel: string;
};

function Station({ number, id, eyebrow, title, description, proof, notes, stage, side, lamp, lampTone, machineLabel }: StationProps) {
  return (
    <section className={`station station--${side} station--${stage}`} aria-labelledby={id}>
      <div className="station-index" aria-hidden="true">
        <span>{number}</span>
      </div>
      <div className="station-copy">
        <p className="station-eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        <p className="station-description">{description}</p>
        <div className="station-proof">
          <span className="station-proof-mark" aria-hidden="true">+</span>
          <div>
            <p>New on this screen</p>
            <strong>{proof}</strong>
            <span>{notes.join(" · ")}</span>
          </div>
        </div>
      </div>
      <div className="machine-bay">
        <div className="machine-header">
          <span>{machineLabel}</span>
          <InspectionLamp label={lamp} tone={lampTone} />
        </div>
        <div className="artifact-cart">
          <span className="cart-handle cart-handle--left" aria-hidden="true" />
          <OrderArtifact stage={stage} />
          <span className="cart-handle cart-handle--right" aria-hidden="true" />
          <span className="cart-wheel cart-wheel--left" aria-hidden="true" />
          <span className="cart-wheel cart-wheel--right" aria-hidden="true" />
        </div>
        <div className="machine-footer" aria-hidden="true">
          <span>ADS / {number}</span><i /><span>Line 01</span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="theme-page sm:min-h-screen">
      <p className="sr-only">
        This demonstration includes loaded, loading, empty, and error states, keyboard focus, and mobile behavior.
      </p>

      <section className="hero-section" aria-labelledby="hero-title">
        <header className="site-header">
          <a className="wordmark focus-ring" href="#top" aria-label="Agentic Design System home">
            <span className="wordmark-mark" aria-hidden="true">A</span>
            <span>Agentic Design System</span>
          </a>
          <nav className="hero-toolbar" aria-label="Primary navigation">
            <a
              href="https://github.com/aa-on-ai/agentic-design-system"
              aria-label="Agentic Design System on GitHub"
              className="hero-pill hero-pill--icon focus-ring focus-visible:outline"
            >
              <Github size={18} strokeWidth={2.1} aria-hidden="true" />
            </a>
            <ThemeToggle />
          </nav>
        </header>

        <div className="hero-workshop" id="top">
          <div className="hero-media" aria-hidden="true">
            <Image src="/hero/creative-pipeline-light.png" alt="" width={1536} height={1024} priority className="hero-image hero-image-light" />
            <Image src="/hero/creative-pipeline-dark.png" alt="" width={1536} height={1024} priority className="hero-image hero-image-dark" />
          </div>
          <div className="hero-scrim" aria-hidden="true" />

          <div className="hero-copy">
            <p className="hero-kicker"><span>Open source</span> UI quality workshop</p>
            <h1 id="hero-title">Your agent can build.<br /><em>ADS runs inspection.</em></h1>
            <p className="hero-lede">
              A design system your coding agent reads while it works. Put one screen through intent,
              context, rubric, evidence, and review until the pixels are ready to release.
            </p>
            <div className="hero-actions">
              <InstallCommand variant="strip" />
              <a className="tour-link focus-ring" href="#assembly-line">Tour the line <span aria-hidden="true">↓</span></a>
            </div>
          </div>

          <div className="hero-job-ticket" aria-hidden="true">
            <span>Live job</span><b>Orders / admin</b><small>5 stations · 1 artifact</small>
          </div>
          <div className="hero-track-mouth" aria-hidden="true"><i /><i /></div>
        </div>
      </section>

      <div className="factory-floor" id="assembly-line">
        <div className="continuous-track" aria-hidden="true"><span /></div>
        <AssemblyLineClimber />

        <div className="line-intro">
          <p>The ADS line / 01–05</p>
          <h2>Watch the same screen<br />earn its release.</h2>
          <span>Scroll to advance the job</span>
        </div>

        <Station
          number="01"
          id="station-intent"
          eyebrow="Job ticket / intent"
          title="Name the job before shaping the screen."
          description="The first draft works, but it cannot tell urgent from ordinary. The job ticket locks one outcome: surface delayed orders before dispatch closes."
          proof="One job. One visible outcome."
          notes={["One user outcome", "One operational priority"]}
          stage="intent"
          side="left"
          lamp="ticketed"
          machineLabel="Intake press"
        />

        <Station
          number="02"
          id="station-baseline"
          eyebrow="Fixture rack / baseline"
          title="Load context and every state."
          description="Real nouns, constraints, references, and edge cases arrive before polish. Loading, empty, error, focus, and mobile become required."
          proof="Five required states before polish."
          notes={["Project context attached", "Recovery states packed"]}
          stage="baseline"
          side="right"
          lamp="context on"
          machineLabel="Baseline fixture"
        />

        <Station
          number="03"
          id="station-rubric"
          eyebrow="Tolerance bench / rubric"
          title="Set the pass line for this screen."
          description="The rubric turns taste into screen-specific thresholds: at-risk orders lead, targets stay generous, and the dispatch deadline remains visible."
          proof="A visible, measurable pass line."
          notes={["At-risk orders lead", "48px controls · 24px gutters"]}
          stage="rubric"
          side="left"
          lamp="within spec"
          machineLabel="Optical caliper"
        />

        <Station
          number="04"
          id="station-evidence"
          eyebrow="Light table / evidence"
          title="Inspect pixels, not promises."
          description="Phone, tablet, and desktop renders expose a failed mobile edge. ADS repairs and recaptures it before the artifact moves."
          proof="Three rendered viewports, one repaired failure."
          notes={["390 / 768 / 1280 captured", "Axe · overflow · touch checked"]}
          stage="evidence"
          side="right"
          lamp="recapture clear"
          lampTone="green"
          machineLabel="Tri-view light table"
        />

        <Station
          number="05"
          id="station-release"
          eyebrow="Release gate / review"
          title="Release it, or send it around again."
          description="A separate review compares the rendered artifact with the job ticket. It clears release or sends the screen back."
          proof="A human verdict: release or revise."
          notes={["Human judgment stays in the loop", "Revision remains a valid outcome"]}
          stage="release"
          side="left"
          lamp="release cleared"
          lampTone="green"
          machineLabel="Final release bay"
        />

        <div className="track-end" aria-hidden="true"><span>End of line</span></div>
      </div>

      <section className="release-bay" aria-labelledby="release-title">
        <div className="release-door" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="release-copy">
          <p>Start a run / MIT licensed</p>
          <h2 id="release-title">Put your next screen<br />on the line.</h2>
          <span>Plain markdown, scripts, and templates. Use the full workshop or borrow one station.</span>
        </div>
        <div className="release-actions">
          <div className="release-primary-action">
            <span>Primary action / install all 10 skills</span>
            <InstallCommand variant="strip" />
            <small>One command copies the full workshop into your agent&apos;s project.</small>
          </div>
          <a className="release-github focus-ring" href="https://github.com/aa-on-ai/agentic-design-system">
            <Github size={18} aria-hidden="true" /> Prefer to inspect first? View the source
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
