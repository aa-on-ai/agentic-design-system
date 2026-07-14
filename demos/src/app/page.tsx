import { GetStarted } from "./GetStarted";
import { Hero } from "./Hero";
import { ProcessSection } from "./ProcessSection";
import { SpecimenSection } from "./SpecimenSection";
import { SystemSection } from "./SystemSection";

export default function Home() {
  return (
    <main className="theme-page">
      <Hero />
      <ProcessSection />
      <SpecimenSection />
      <SystemSection />
      <GetStarted />
    </main>
  );
}
