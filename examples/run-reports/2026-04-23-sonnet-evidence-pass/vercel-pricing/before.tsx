import React from "react";

type Tier = "Free" | "Pro" | "Enterprise" | "Team";
type BillingPeriod = "monthly" | "yearly";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: BillingPeriod;
  features: string[];
  cta?: string;
  highlighted?: boolean;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "19",
    period: "month",
    features: [
      "10 users included",
      "Core analytics",
      "1 GB SSD storage",
      "24/7 email support"
    ],
    highlighted: false,
    cta: "For individuals or very small projects"
  },
  {
    id: "standard",
    name: "Standard",
    price: "49",
    period: "month",
    features: [
      "50 users included",
      "Advanced analytics",
      "5 GB SSD storage",
      "Priority phone support"
    ],
    highlighted: true,
    cta: "For growing teams"
  },
  {
    id: "premium",
    name: "Premium",
    price: "99",
    period: "month",
    features: [
      "Unlimited users",
      "Full-stack analytics",
      "20 GB SSD storage",
      "Dedicated account manager"
    ],
    highlighted: false,
    cta: "For large organizations"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "199",
    period: "month",
    features: [
      "Custom contract",
      "Enterprise-grade analytics",
      "100 GB SSD storage",
      "White-glove onboarding"
    ],
    highlighted: true,
    cta: "For hyperscale deployments"
  }
];

const comparison = [
  "A true free plan for individuals or tiny experiments.",
  "More resources and scalability for production workloads.",
  "Best for mission-critical applications with high traffic.",
  "Maximum performance and support for complex organizations."
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-100 py-10">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Pricing
        </h1>
        <p className="mt-2 text-lg text-neutral-600">
          Choose the plan that best fits your needs.
        </p>
      </header>

      <section aria-labelledby="pricing-table-heading" className="mb-12">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-neutral-300 bg-white shadow-md rounded-lg">
            <caption className="py-4 text-left text-sm font-semibold text-neutral-700">
              Available Plans
            </caption>
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Features
                </th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className={plan.highlighted ? "bg-yellow-50" : ""}>
                  <td className="border px-6 py-4 text-sm">{plan.name}</td>
                  <td className="border px-6 py-4 text-sm">{plan.price}</td>
                  <td className="border px-6 py-4 text-sm">
                    <ul className="list-disc space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-neutral-700">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center text-sm text-neutral-500">
          {comparison.map((line, idx) => (
            <p key={idx} className="mb-1">
              {line}
            </p>
          ))}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-xs text-neutral-500">
            Prices shown in USD. Terms and conditions may apply.
          </p>
        </footer>
      </section>
    </div>
  );
}
