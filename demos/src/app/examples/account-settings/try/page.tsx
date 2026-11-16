import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "../../../SiteHeader";
import site from "../../../DesignPractice.module.css";
import { assetRoot, modelKey, models } from "../data";
import styles from "./try.module.css";
export const metadata: Metadata = {title:"Try an account-settings example | ADS",robots:{index:false,follow:true}};
export default async function TryPage({searchParams}: {searchParams: Promise<{model?:string;variant?:string;view?:string}>}) {
 const params=await searchParams;const model=modelKey(params.model);const variant=params.variant==="ads"?"ads":"baseline";const phone=params.view==="phone";const label=variant==="ads"?"with ADS":"without ADS";
 return <div className={site.homepage}><a className={site.skip} href="#main">Skip to content</a><SiteHeader /><main id="main" className={styles.main} tabIndex={-1}><div className={`${site.wrap} ${styles.toolbar}`}><a href={`${assetRoot}?model=${model}&view=${phone?"phone":"desktop"}`}><ArrowLeft size={18} aria-hidden="true" />Back to comparison</a><h1>{models[model].name} {label}</h1><p>Synthetic account. Changes stay in this browser.</p></div><div className={`${styles.frame} ${phone?styles.phone:""}`}><iframe title={`${models[model].name} account settings ${label}`} src={`${assetRoot}/${model}-${variant}.html`} sandbox="allow-scripts allow-same-origin allow-forms" /></div></main></div>;
}
