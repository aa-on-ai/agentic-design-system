"use client";

import React, { useMemo, useState } from "react";

type BillingCycle = "monthly" | "annual";
type UiState = "loaded" | "loading" | "empty" | "error";

type Tier = {
  name: string;
  subtitle: string;
  description: string;
  monthly: number | null;
  annualMonthlyEquivalent: number | null;
  annualNote?: string;
  cta: string;
  secondaryCta?: string;
  featured?: boolean;
  badge?: string;
  seats: string;
  compute: string;
  bandwidth: string;
  support: string;
  features: string[];
};

type ComparisonRow = {
  category: string;
  feature: string;
  hobby: string | boolean;
  pro: string | boolean;
  team: string | boolean;
  enterprise: string | boolean;
};

const tiers: Tier[] = [
  {
    name: "Hobby",
    subtitle: "For personal projects",
    description:
      "Deploy side projects, prototypes, and experiments with the same edge network used in production.",
    monthly: 0,
    annualMonthlyEquivalent: 0,
    cta: "Start for free",
    seats: "1 user",
    compute: "100 GB-hours",
    bandwidth: "100 GB included",
    support: "Community",
    features: [
      "Instant rollbacks",
      "Preview deployments",
      "Edge caching",
      "Basic analytics",
    ],
  },
  {
    name: "Pro",
    subtitle: "For shipping solo",
    description:
      "More performance, observability, and higher usage limits for developers building serious products.",
    monthly: 24,
    annualMonthlyEquivalent: 20,
    annualNote: "Billed annually at $240",
    cta: "Start Pro",
    secondaryCta: "Contact sales",
    badge: "Most popular",
    featured: true,
    seats: "1 user included",
    compute: "1,000 GB-hours",
    bandwidth: "1 TB included",
    support: "Standard",
    features: [
      "Advanced analytics",
      "Password-protected previews",
      "Deployment protection",
      "Observability included",
    ],
  },
  {
    name: "Team",
    subtitle: "For growing product teams",
    description:
      "Collaboration, governance, and production controls for teams running multiple apps and environments.",
    monthly: 89,
    annualMonthlyEquivalent: 74,
    annualNote: "Per user, billed annually",
    cta: "Start Team",
    secondaryCta: "Book a demo",
    seats: "Up to 10 users",
    compute: "5,000 GB-hours",
    bandwidth: "5 TB included",
    support: "Priority",
    features: [
      "Role-based access control",
      "Shared environments",
      "Audit logs",
      "Advanced deployment controls",
    ],
  },
  {
    name: "Enterprise",
    subtitle: "For global scale",
    description:
      "Security, compliance, dedicated support, and platform architecture support for mission-critical workloads.",
    monthly: null,
    annualMonthlyEquivalent: null,
    cta: "Talk to sales",
    secondaryCta: "View security",
    seats: "Custom",
    compute: "Custom",
    bandwidth: "Custom",
    support: "Dedicated",
    features: [
      "SAML / SSO",
      "SCIM provisioning",
      "99.99% SLA",
      "Private networking options",
    ],
  },
];

const comparisonRows: ComparisonRow[] = [
  { category: "Platform", feature: "Concurrent deployments", hobby: "1", pro: "3", team: "10", enterprise: "Unlimited" },
  { category: "Platform", feature: "Preview deployments", hobby: true, pro: true, team: true, enterprise: true },
  { category: "Platform", feature: "Instant rollbacks", hobby: true, pro: true, team: true, enterprise: true },
  { category: "Platform", feature: "Custom environments", hobby: false, pro: false, team: true, enterprise: true },

  { category: "Observability", feature: "Web analytics", hobby: "Basic", pro: "Advanced", team: "Advanced", enterprise: "Advanced" },
  { category: "Observability", feature: "Runtime logs", hobby: "1 day", pro: "7 days", team: "30 days", enterprise: "90 days" },
  { category: "Observability", feature: "Tracing", hobby: false, pro: true, team: true, enterprise: true },

  { category: "Security", feature: "Password-protected previews", hobby: false, pro: true, team: true, enterprise: true },
  { category: "Security", feature: "Audit logs", hobby: false, pro: false, team: true, enterprise: true },
  { category: "Security", feature: "SAML / SSO", hobby: false, pro: false, team: false, enterprise: true },
  { category: "Security", feature: "SCIM", hobby: false, pro: false, team: false, enterprise: true },

  { category: "Support", feature: "Community support", hobby: true, pro: true, team: true, enterprise: true },
  { category: "Support", feature: "Priority support", hobby: false, pro: false, team: true, enterprise: true },
  { category: "Support", feature: "Dedicated success", hobby: false, pro: false, team: false, enterprise: true },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Price({
  tier,
  cycle,
}: {
  tier: Tier;
  cycle: BillingCycle;
}) {
  const value =
    cycle === "monthly" ? tier.monthly : tier.annualMonthlyEquivalent;

  if (value === null) {
    return (
      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
          Custom
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5">
      <span className="text-sm text-neutral-500">$</span>
      <span className="text-4xl font-semibold tracking-tight text-neutral-950 [font-variant-numeric:tabular-nums] sm:text-5xl">
        {value}
      </span>
      <span className="pb-1 text-sm text-neutral-500">/mo</span>
    </div>
  );
}

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 text-white"
        aria-label="Included"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M6.6 11.4 3.5 8.3l-1 1 4.1 4.1L13.5 6.5l-1-1z" />
        </svg>
      </span>
    ) : (
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"
        aria-label="Not included"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 stroke-current" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4 4 12" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-neutral-800 [font-variant-numeric:tabular-nums]">
      {value}
    </span>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("annual");
  const [uiState, setUiState] = useState<UiState>("loaded");

  const groupedRows = useMemo(() => {
    return comparisonRows.reduce<Record<string, ComparisonRow[]>>((acc, row) => {
      if (!acc[row.category]) acc[row.category] = [];
      acc[row.category].push(row);
      return acc;
    }, {});
  }, []);

  const yearlySavings = useMemo(() => {
    const pro = (tiers[1].monthly ?? 0) * 12 - (tiers[1].annualMonthlyEquivalent ?? 0) * 12;
    const team = (tiers[2].monthly ?? 0) * 12 - (tiers[2].annualMonthlyEquivalent ?? 0) * 12;
    return { pro, team };
  }, []);

  const renderContent = () => {
    if (uiState === "loading") {
      return (
        <div className="space-y-10" aria-live="polite" aria-busy="true">
          <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_rgba(0,0,0,0.04)] sm:p-8">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <div className="mx-auto h-4 w-24 animate-pulse rounded-full bg-neutral-200" />
              <div className="mx-auto h-12 w-3/4 animate-pulse rounded-2xl bg-neutral-200" />
              <div className="mx-auto h-5 w-2/3 animate-pulse rounded-full bg-neutral-200" />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_24px_rgba(0,0,0,0.04)]"
              >
                <div className="space-y-4">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-neutral-200" />
                  <div className="h-10 w-32 animate-pulse rounded-2xl bg-neutral-200" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-neutral-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded-full bg-neutral-100" />
                </div>
                <div className="mt-8 space-y-3">
                  {Array.from({ length: 5 }).map((__, row) => (
                    <div key={row} className="h-4 animate-pulse rounded-full bg-neutral-100" />
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_rgba(0,0,0,0.04)] sm:p-8">
            <div className="h-6 w-48 animate-pulse rounded-full bg-neutral-200" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 8 }).map((_, row) => (
                <div key={row} className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((__, cell) => (
                    <div key={cell} className="h-10 animate-pulse rounded-xl bg-neutral-100" />
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (uiState === "error") {
      return (
        <section
          className="rounded-[28px] border border-red-200 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_rgba(0,0,0,0.04)]"
          aria-live="assertive"
        >
          <div className="max-w-xl space-y-4">
            <div className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
              Pricing unavailable
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 [text-wrap:balance]">
                We couldn&apos;t load current plan details
              </h2>
              <p className="text-sm leading-6 text-neutral-600 [text-wrap:pretty]">
                The pricing service didn&apos;t respond. Try again, or contact sales if you need a quote for enterprise volume.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setUiState("loaded")}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition-transform duration-150 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]"
              >
                Try again
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-800 transition-colors duration-150 hover:border-neutral-400 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]"
              >
                Contact sales
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (uiState === "empty") {
      return (
        <section className="rounded-[28px] border border-neutral-200 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_rgba(0,0,0,0.04)]">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm font-medium text-neutral-700">
              No plans published
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 [text-wrap:balance]">
                Pricing plans will appear here once they&apos;re configured
              </h2>
              <p className="text-sm leading-6 text-neutral-600 [text-wrap:pretty]">
                Publish your plans to show self-serve pricing, seat limits, and feature comparisons.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUiState("loaded")}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white transition-transform duration-150 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]"
            >
              Load sample plans
            </button>
          </div>
        </section>
      );
    }

    return (
      <div className="space-y-12 sm:space-y-16">
        <section className="rounded-[32px] border border-neutral-200/80 bg-white px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_48px_rgba(0,0,0,0.05)] sm:px-8 sm:py-10">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm font-medium text-neutral-700">
              Developer platform pricing
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl [text-wrap:balance]">
                Ship faster on infrastructure built for modern web apps
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg [text-wrap:pretty]">
                From side projects to globally distributed products, choose a plan with the compute, collaboration, and controls your team needs.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
              <div
                className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1"
                role="tablist"
                aria-label="Billing cycle"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "monthly"}
                  onClick={() => setBilling("monthly")}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]",
                    billing === "monthly"
                      ? "bg-white text-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                      : "text-neutral-600 hover:text-neutral-950"
                  )}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "annual"}
                  onClick={() => setBilling("annual")}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]",
                    billing === "annual"
                      ? "bg-white text-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                      : "text-neutral-600 hover:text-neutral-950"
                  )}
                >
                  Annual
                  <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Save up to 17%
                  </span>
                </button>
              </div>

              <p className="text-sm text-neutral-500 [text-wrap:pretty]">
                Pro saves ${yearlySavings.pro}/year. Team saves ${yearlySavings.team} per seat/year on annual billing.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Pricing tiers" className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={cn(
                "relative flex h-full flex-col rounded-[28px] border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-7",
                tier.featured
                  ? "border-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_40px_rgba(0,0,0,0.08)]"
                  : "border-neutral-200"
              )}
            >
              <div className="min-h-[32px]">
                {tier.badge ? (
                  <div className="inline-flex rounded-full border border-neutral-950 bg-neutral-950 px-3 py-1 text-xs font-medium text-white">
                    {tier.badge}
                  </div>
                ) : null}
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                    {tier.name}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">{tier.subtitle}</p>
                </div>

                <Price tier={tier} cycle={billing} />

                <div className="min-h-[44px]">
                  {billing === "annual" && tier.annualNote ? (
                    <p className="text-sm text-neutral-500">{tier.annualNote}</p>
                  ) : (
                    <p className="text-sm text-neutral-500">
                      {tier.monthly === 0
                        ? "No credit card required"
                        : tier.monthly === null
                        ? "Usage-based pricing and volume discounts"
                        : "Plus usage beyond included limits"}
                    </p>
                  )}
                </div>

                <p className="text-sm leading-6 text-neutral-600 [text-wrap:pretty]">
                  {tier.description}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium transition-[background-color,color,transform,border-color] duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]",
                    tier.featured
                      ? "bg-neutral-950 text-white hover:bg-neutral-800"
                      : "border border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50"
                  )}
                >
                  {tier.cta}
                </button>

                {tier.secondaryCta ? (
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]"
                  >
                    {tier.secondaryCta}
                  </button>
                ) : (
                  <div className="min-h-12" aria-hidden="true" />
                )}
              </div>

              <div className="mt-8 space-y-5 border-t border-neutral-200 pt-6">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-neutral-500">Seats</dt>
                    <dd className="font-medium text-neutral-900">{tier.seats}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-neutral-500">Compute</dt>
                    <dd className="font-medium text-neutral-900">{tier.compute}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-neutral-500">Bandwidth</dt>
                    <dd className="font-medium text-neutral-900">{tier.bandwidth}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-neutral-500">Support</dt>
                    <dd className="font-medium text-neutral-900">{tier.support}</dd>
                  </div>
                </dl>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-neutral-900">Included</h3>
                  <ul className="space-y-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-neutral-600">
                        <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                            <path d="M6.6 11.4 3.5 8.3l-1 1 4.1 4.1L13.5 6.5l-1-1z" />
                          </svg>
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_40px_rgba(0,0,0,0.05)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 [text-wrap:balance]">
                Compare plans in detail
              </h2>
              <p className="text-sm leading-6 text-neutral-600 [text-wrap:pretty]">
                All plans include global edge delivery, automatic HTTPS, preview URLs, and Git-based deployments. Upgrade as your traffic, team size, and security requirements grow.
              </p>
            </div>
            <p className="text-sm text-neutral-500">
              Need higher limits? <span className="font-medium text-neutral-900">Enterprise plans support custom usage commitments.</span>
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[24px] border border-neutral-200">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse">
                <caption className="sr-only">Pricing plan comparison table</caption>
                <thead className="bg-neutral-50">
                  <tr className="text-left">
                    <th scope="col" className="px-4 py-4 text-sm font-medium text-neutral-500 sm:px-6">
                      Feature
                    </th>
                    <th scope="col" className="px-4 py-4 text-sm font-medium text-neutral-900 sm:px-6">
                      Hobby
                    </th>
                    <th scope="col" className="px-4 py-4 text-sm font-medium text-neutral-900 sm:px-6">
                      Pro
                    </th>
                    <th scope="col" className="px-4 py-4 text-sm font-medium text-neutral-900 sm:px-6">
                      Team
                    </th>
                    <th scope="col" className="px-4 py-4 text-sm font-medium text-neutral-900 sm:px-6">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedRows).map(([category, rows]) => (
                    <React.Fragment key={category}>
                      <tr className="border-y border-neutral-200 bg-white">
                        <th
                          scope="colgroup"
                          colSpan={5}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 sm:px-6"
                        >
                          {category}
                        </th>
                      </tr>
                      {rows.map((row) => (
                        <tr
                          key={row.feature}
                          className="border-b border-neutral-200 bg-white last:border-b-0"
                        >
                          <th
                            scope="row"
                            className="px-4 py-4 text-left text-sm font-medium text-neutral-800 sm:px-6"
                          >
                            {row.feature}
                          </th>
                          <td className="px-4 py-4 sm:px-6">
                            <FeatureValue value={row.hobby} />
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <FeatureValue value={row.pro} />
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <FeatureValue value={row.team} />
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <FeatureValue value={row.enterprise} />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-neutral-200 bg-neutral-950 px-6 py-8 text-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_50px_rgba(0,0,0,0.14)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-medium text-neutral-300">Enterprise</p>
              <h2 className="text-3xl font-semibold tracking-tight [text-wrap:balance]">
                Need procurement, compliance, or platform architecture support?
              </h2>
              <p className="text-sm leading-6 text-neutral-300 [text-wrap:pretty]">
                Work with our team on migration planning, security reviews, custom limits, and dedicated support for globally distributed applications.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-neutral-950 transition-[background-color,transform] duration-150 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 active:scale-[0.97]"
              >
                Talk to sales
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-medium text-white transition-[background-color,border-color,transform] duration-150 hover:border-white/30 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 active:scale-[0.97]"
              >
                Read the docs
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#fafaf9] text-neutral-950 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-8 flex flex-col gap-4 rounded-[24px] border border-neutral-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white outline outline-1 outline-black/5">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12 4 4.5 18h15L12 4Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-950">Velocity Cloud</p>
              <p className="text-sm text-neutral-500">Pricing</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Page state controls">
            <button
              type="button"
              onClick={() => setUiState("loaded")}
              aria-pressed={uiState === "loaded"}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-xs font-medium transition-[background-color,color,transform] duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]",
                uiState === "loaded"
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              )}
            >
              Loaded
            </button>
            <button
              type="button"
              onClick={() => setUiState("loading")}
              aria-pressed={uiState === "loading"}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-xs font-medium transition-[background-color,color,transform] duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]",
                uiState === "loading"
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              )}
            >
              Loading
            </button>
            <button
              type="button"
              onClick={() => setUiState("empty")}
              aria-pressed={uiState === "empty"}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-xs font-medium transition-[background-color,color,transform] duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]",
                uiState === "empty"
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              )}
            >
              Empty
            </button>
            <button
              type="button"
              onClick={() => setUiState("error")}
              aria-pressed={uiState === "error"}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-xs font-medium transition-[background-color,color,transform] duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 active:scale-[0.97]",
                uiState === "error"
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              )}
            >
              Error
            </button>
          </div>
        </header>

        {renderContent()}
      </div>
    </main>
  );
}
