import { DecisionSections } from "./DecisionSections";
import { FoundationSections } from "./FoundationSections";
import { GetStarted } from "./GetStarted";
import { Hero } from "./Hero";
import { ProofSection } from "./ProofSection";

export default function Home() {
  return (
    <main className="theme-page min-h-screen selection:bg-[var(--accent-strong)] selection:text-[var(--accent-text)]">
      <Hero />
      <ProofSection />
      <FoundationSections />
      <DecisionSections />
      <GetStarted />
    </main>
  );
}
