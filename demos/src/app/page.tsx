import { IBM_Plex_Mono, Instrument_Serif, Manrope } from "next/font/google";
import { GetStarted } from "./GetStarted";
import { Hero } from "./Hero";
import { ProcessSection } from "./ProcessSection";
import { SiteHeader } from "./SiteHeader";
import { SpecimenSection } from "./SpecimenSection";
import { SystemSection } from "./SystemSection";
import "./proof-page.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function Home() {
  return (
    <div
      className={`${manrope.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable} proof-page-shell`}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="theme-page">
        <Hero />
        <ProcessSection />
        <SpecimenSection />
        <SystemSection />
        <GetStarted />
      </main>
    </div>
  );
}
