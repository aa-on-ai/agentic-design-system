import type { Metadata } from "next";
import { AccountSettingsExamples } from "./Examples";
import { modelKey } from "./data";
export const metadata: Metadata = { title: "Account-settings examples | Agentic Design System", description: "Compare six account-settings prototypes, built with and without ADS by Astra, Fable and Opus. Try the results and inspect the process.", alternates: { canonical: "/examples/account-settings" } };
export default async function Page({searchParams}: {searchParams: Promise<{model?: string; view?: string}>}) {
  const params = await searchParams;
  return <AccountSettingsExamples initialModel={modelKey(params.model)} initialView={params.view === "phone" ? "phone" : "desktop"} />;
}
