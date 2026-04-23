"use client";

import React, { useMemo, useState } from "react";

type ViewKey = "all" | "unfulfilled" | "paid" | "highRisk" | "open";
type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  relativeDate: string;
  items: number;
  total: string;
  channel: string;
  tags: string[];
  financialStatus: "Paid" | "Pending" | "Refunded" | "Partially refunded" | "Authorized";
  fulfillmentStatus: "Unfulfilled" | "In progress" | "Fulfilled" | "Scheduled" | "On hold";
  orderStatus: "Open" | "Archived" | "Canceled" | "Flagged";
  risk: "Low" | "Medium" | "High";
  paymentMethod: string;
  fulfillmentTimeline: { label: string; at: string; done: boolean }[];
};

const orders: Order[] = [
  {
    id: "#48192",
    customer: "Maya Chen",
    email: "maya.chen@northstarstudio.co",
    date: "Apr 23, 2026",
    relativeDate: "12 min ago",
    items: 3,
    total: "$184.00",
    channel: "Online Store",
    tags: ["VIP", "Express"],
    financialStatus: "Paid",
    fulfillmentStatus: "In progress",
    orderStatus: "Open",
    risk: "Low",
    paymentMethod: "Shop Pay",
    fulfillmentTimeline: [
      { label: "Order placed", at: "9:14 AM", done: true },
      { label: "Payment captured", at: "9:15 AM", done: true },
      { label: "Picking items", at: "9:31 AM", done: true },
      { label: "Label purchased", at: "Pending", done: false },
    ],
  },
  {
    id: "#48191",
    customer: "Jonas Alvarez",
    email: "jonas@fieldnotes.fm",
    date: "Apr 23, 2026",
    relativeDate: "28 min ago",
    items: 1,
    total: "$62.00",
    channel: "POS",
    tags: ["In-store pickup"],
    financialStatus: "Paid",
    fulfillmentStatus: "Scheduled",
    orderStatus: "Open",
    risk: "Low",
    paymentMethod: "Visa •••• 1184",
    fulfillmentTimeline: [
      { label: "Order placed", at: "8:58 AM", done: true },
      { label: "Payment captured", at: "8:58 AM", done: true },
      { label: "Ready for pickup", at: "Today, 2:00 PM", done: false },
      { label: "Picked up", at: "Pending", done: false },
    ],
  },
  {
    id: "#48188",
    customer: "Avery Thompson",
    email: "avery@daybreakgoods.com",
    date: "Apr 23, 2026",
    relativeDate: "1 hr ago",
    items: 5,
    total: "$412.50",
    channel: "Online Store",
    tags: ["Wholesale"],
    financialStatus: "Authorized",
    fulfillmentStatus: "On hold",
    orderStatus: "Flagged",
    risk: "High",
    paymentMethod: "Amex •••• 4402",
    fulfillmentTimeline: [
      { label: "Order placed", at: "8:11 AM", done: true },
      { label: "Payment authorized", at: "8:12 AM", done: true },
      { label: "Fraud review", at: "In review", done: false },
      { label: "Fulfillment released", at: "Blocked", done: false },
    ],
  },
  {
    id: "#48184",
    customer: "Leila Haddad",
    email: "leila@softterrain.io",
    date: "Apr 22, 2026",
    relativeDate: "Yesterday",
    items: 2,
    total: "$98.00",
    channel: "Draft order",
    tags: ["Manual invoice"],
    financialStatus: "Pending",
    fulfillmentStatus: "Unfulfilled",
    orderStatus: "Open",
    risk: "Medium",
    paymentMethod: "Bank transfer",
    fulfillmentTimeline: [
      { label: "Draft converted", at: "4:42 PM", done: true },
      { label: "Invoice sent", at: "4:44 PM", done: true },
      { label: "Payment due", at: "Tomorrow", done: false },
      { label: "Fulfillment started", at: "Waiting on payment", done: false },
    ],
  },
  {
    id: "#48180",
    customer: "Noah Patel",
    email: "noah@afterglow.club",
    date: "Apr 22, 2026",
    relativeDate: "Yesterday",
    items: 4,
    total: "$236.00",
    channel: "Instagram",
    tags: ["Gift", "Priority"],
    financialStatus: "Paid",
    fulfillmentStatus: "Fulfilled",
    orderStatus: "Archived",
    risk: "Low",
    paymentMethod: "Mastercard •••• 5521",
    fulfillmentTimeline: [
      { label: "Order placed", at: "11:03 AM", done: true },
      { label: "Payment captured", at: "11:03 AM", done: true },
      { label: "Shipped", at: "3:26 PM", done: true },
      { label: "Delivered", at: "Today, 8:17 AM", done: true },
    ],
  },
  {
    id: "#48177",
    customer: "Priya Raman",
    email: "priya@kineticpaper.com",
    date: "Apr 21, 2026",
    relativeDate: "2 days ago",
    items: 2,
    total: "$144.00",
    channel: "Online Store",
    tags: ["Address check"],
    financialStatus: "Partially refunded",
    fulfillmentStatus: "Fulfilled",
    orderStatus: "Open",
    risk: "Medium",
    paymentMethod: "PayPal",
    fulfillmentTimeline: [
      { label: "Order placed", at: "2:18 PM", done: true },
      { label: "Partially refunded", at: "4:07 PM", done: true },
      { label: "Shipped", at: "6:12 PM", done: true },
      { label: "Delivered", at: "Apr 22, 10:05 AM", done: true },
    ],
  },
];

const views: {
  key: ViewKey;
  label: string;
  description: string;
}[] = [
  { key: "all", label: "All orders", description: "Every open and archived order" },
  { key: "unfulfilled", label: "Unfulfilled", description: "Needs picking, packing, or shipping" },
  { key: "paid", label: "Paid", description: "Captured or settled payments" },
  { key: "highRisk", label: "High risk", description: "Orders flagged for review" },
  { key: "open", label: "Open", description: "Active orders not archived or canceled" },
];

function chipClasses(tone: StatusTone) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors";
  const map: Record<StatusTone, string> = {
    neutral: "border-zinc-200 bg-white text-zinc-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
  };
  return `${base} ${map[tone]}`;
}

function toneForFinancial(status: Order["financialStatus"]): StatusTone {
  if (status === "Paid") return "success";
  if (status === "Pending" || status === "Authorized") return "warning";
  if (status === "Refunded" || status === "Partially refunded") return "info";
  return "neutral";
}

function toneForFulfillment(status: Order["fulfillmentStatus"]): StatusTone {
  if (status === "Fulfilled") return "success";
  if (status === "In progress" || status === "Scheduled") return "info";
  if (status === "On hold") return "danger";
  return "warning";
}

function toneForOrderStatus(status: Order["orderStatus"]): StatusTone {
  if (status === "Open") return "info";
  if (status === "Archived") return "neutral";
  if (status === "Flagged" || status === "Canceled") return "danger";
  return "neutral";
}

function toneForRisk(risk: Order["risk"]): StatusTone {
  if (risk === "High") return "danger";
  if (risk === "Medium") return "warning";
  return "success";
}

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: StatusTone;
}) {
  return (
    <span className={chipClasses(tone)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:grid-cols-[1.2fr_0.7fr_0.8fr_0.9fr_1.3fr] md:items-center md:gap-4">
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-48 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
      <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-100" />
      <div className="h-6 w-28 animate-pulse rounded-full bg-zinc-100" />
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export default function OrdersAdminPage() {
  const [activeView, setActiveView] = useState<ViewKey>("all");
  const [query, setQuery] = useState("");
  const [uiState, setUiState] = useState<"loaded" | "loading" | "empty" | "error">("loaded");
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0].id);

  const filteredOrders = useMemo(() => {
    let next = [...orders];

    if (activeView === "unfulfilled") {
      next = next.filter(
        (o) => o.fulfillmentStatus === "Unfulfilled" || o.fulfillmentStatus === "In progress" || o.fulfillmentStatus === "Scheduled"
      );
    }

    if (activeView === "paid") {
      next = next.filter((o) => o.financialStatus === "Paid");
    }

    if (activeView === "highRisk") {
      next = next.filter((o) => o.risk === "High" || o.orderStatus === "Flagged");
    }

    if (activeView === "open") {
      next = next.filter((o) => o.orderStatus === "Open");
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      next = next.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.channel.toLowerCase().includes(q) ||
          o.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (uiState === "empty") return [];
    return next;
  }, [activeView, query, uiState]);

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ??
    filteredOrders[0] ??
    null;

  const metrics = useMemo(() => {
    const paid = orders.filter((o) => o.financialStatus === "Paid").length;
    const unfulfilled = orders.filter(
      (o) => o.fulfillmentStatus === "Unfulfilled" || o.fulfillmentStatus === "In progress" || o.fulfillmentStatus === "Scheduled"
    ).length;
    const flagged = orders.filter((o) => o.orderStatus === "Flagged" || o.risk === "High").length;
    return [
      { label: "Open orders", value: "124", note: "+8 since yesterday" },
      { label: "Awaiting fulfillment", value: String(unfulfilled).padStart(2, "0"), note: "Across online and POS" },
      { label: "Captured payments", value: String(paid).padStart(2, "0"), note: "Updated 2 min ago" },
      { label: "Needs review", value: String(flagged).padStart(2, "0"), note: "Fraud and hold states" },
    ];
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-zinc-950 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-[28px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
                Orders
                <span className="text-zinc-400">/</span>
                <span className="text-zinc-500">Admin</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                  Orders
                </h1>
                <p className="max-w-2xl text-pretty text-sm leading-6 text-zinc-600 sm:text-[15px]">
                  Track payment state, fulfillment progress, and flagged orders in one place. Saved views keep the queue focused for support, warehouse, and finance teams.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <label className="relative block">
                <span className="sr-only">Search orders</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                >
                  <path
                    d="M13.5 13.5L17 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="8.75"
                    cy="8.75"
                    r="5.75"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="search"
                  placeholder="Search by order, customer, email, or tag"
                  className="h-12 w-full min-w-[280px] rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-400 focus:border-zinc-400 focus:shadow-[0_0_0_4px_rgba(24,24,27,0.06)]"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUiState("loading")}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-[transform,background-color,border-color] duration-150 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 active:scale-[0.97]"
                >
                  Loading
                </button>
                <button
                  type="button"
                  onClick={() => setUiState("empty")}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-[transform,background-color,border-color] duration-150 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 active:scale-[0.97]"
                >
                  Empty
                </button>
                <button
                  type="button"
                  onClick={() => setUiState("error")}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-[transform,background-color,border-color] duration-150 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 active:scale-[0.97]"
                >
                  Error
                </button>
                <button
                  type="button"
                  onClick={() => setUiState("loaded")}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-[transform,opacity] duration-150 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-zinc-300 active:scale-[0.97]"
                >
                  Loaded
                </button>
              </div>
            </div>
          </div>

          <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-zinc-200 bg-[#fcfbf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              >
                <p className="text-sm font-medium text-zinc-600">{metric.label}</p>
                <p
                  className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{metric.note}</p>
              </div>
            ))}
          </section>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
          <div className="rounded-[28px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-5">
            <div className="flex flex-col gap-4 border-b border-zinc-200 pb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Saved views</h2>
                  <p className="text-sm text-zinc-500">Switch between operational queues without rebuilding filters.</p>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-[transform,background-color] duration-150 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 active:scale-[0.97]"
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-[transform,opacity] duration-150 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-zinc-300 active:scale-[0.97]"
                  >
                    Create order
                  </button>
                </div>
              </div>

              <div
                className="flex gap-2 overflow-x-auto pb-1"
                role="tablist"
                aria-label="Saved order views"
              >
                {views.map((view) => {
                  const active = activeView === view.key;
                  return (
                    <button
                      key={view.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveView(view.key)}
                      className={[
                        "min-h-12 rounded-2xl border px-4 py-3 text-left transition-[transform,background-color,border-color,color] duration-150 focus:outline-none focus:ring-4 focus:ring-zinc-200 active:scale-[0.98]",
                        active
                          ? "border-zinc-900 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-[#fcfbf8] text-zinc-700 hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      <div className="whitespace-nowrap text-sm font-medium">{view.label}</div>
                      <div className={`whitespace-nowrap text-xs ${active ? "text-zinc-300" : "text-zinc-500"}`}>
                        {view.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              {uiState === "loading" ? (
                <div className="space-y-3" aria-live="polite" aria-busy="true">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-950">Loading orders</h3>
                      <p className="text-sm text-zinc-500">Fetching the latest payment and fulfillment updates.</p>
                    </div>
                  </div>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : uiState === "error" ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6">
                  <div className="max-w-xl space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                        <path
                          d="M10 6.25V10.25"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <circle cx="10" cy="13.75" r="1" fill="currentColor" />
                        <path
                          d="M8.671 3.354L2.522 14.021C1.752 15.357 2.716 17 4.26 17H15.74C17.284 17 18.248 15.357 17.478 14.021L11.329 3.354C10.557 2.016 9.443 2.016 8.671 3.354Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-zinc-950">We couldn&apos;t load orders</h3>
                      <p className="text-sm leading-6 text-zinc-600">
                        The orders service didn&apos;t respond in time. Retry to fetch the latest queue, or come back in a moment if the outage continues.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setUiState("loaded")}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-[transform,opacity] duration-150 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-zinc-300 active:scale-[0.97]"
                      >
                        Try again
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-[transform,background-color] duration-150 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 active:scale-[0.97]"
                      >
                        View incident status
                      </button>
                    </div>
                  </div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-3xl border border-zinc-200 bg-[#fcfbf8] p-6 sm:p-8">
                  <div className="max-w-xl space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                        <path
                          d="M4.5 5.5H15.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M4.5 10H15.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M4.5 14.5H10.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-zinc-950">No orders match this view</h3>
                      <p className="text-sm leading-6 text-zinc-600">
                        Try a broader search, switch to another saved view, or create a new order to start filling this queue.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setActiveView("all");
                          setUiState("loaded");
                        }}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition-[transform,opacity] duration-150 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-zinc-300 active:scale-[0.97]"
                      >
                        Clear filters
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-[transform,background-color] duration-150 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 active:scale-[0.97]"
                      >
                        Create order
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-950">
                        {views.find((v) => v.key === activeView)?.label}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {filteredOrders.length} results{query ? ` for “${query}”` : ""}.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-[#fcfbf8] px-3 py-1.5 text-xs font-medium text-zinc-600">
                      Synced
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Updated 2 min ago
                    </div>
                  </div>

                  <div className="hidden rounded-2xl border border-zinc-200 bg-[#fcfbf8] px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500 md:grid md:grid-cols-[1.2fr_0.7fr_0.8fr_0.9fr_1.3fr] md:gap-4">
                    <div>Order</div>
                    <div>Amount</div>
                    <div>Payment</div>
                    <div>Fulfillment</div>
                    <div>Timeline</div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {filteredOrders.map((order) => {
                      const selected = selectedOrder?.id === order.id;
                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => setSelectedOrderId(order.id)}
                          className={[
                            "grid w-full grid-cols-1 gap-3 rounded-2xl border p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-[transform,background-color,border-color,box-shadow] duration-150 hover:-translate-y-[1px] hover:border-zinc-300 focus:ring-4 focus:ring-zinc-200 active:scale-[0.995] md:grid-cols-[1.2fr_0.7fr_0.8fr_0.9fr_1.3fr] md:items-center md:gap-4",
                            selected
                              ? "border-zinc-900 bg-zinc-50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.05)]"
                              : "border-zinc-200 bg-white",
                          ].join(" ")}
                          aria-pressed={selected}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-zinc-950">{order.id}</span>
                              <StatusChip label={order.orderStatus} tone={toneForOrderStatus(order.orderStatus)} />
                              <StatusChip label={`${order.risk} risk`} tone={toneForRisk(order.risk)} />
                            </div>
                            <div className="mt-2 min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-800">{order.customer}</p>
                              <p className="truncate text-sm text-zinc-500">{order.email}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                              <span>{order.date}</span>
                              <span className="text-zinc-300">•</span>
                              <span>{order.relativeDate}</span>
                              <span className="text-zinc-300">•</span>
                              <span>{order.channel}</span>
                            </div>
                            {order.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {order.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex rounded-full border border-zinc-200 bg-[#fcfbf8] px-2.5 py-1 text-xs font-medium text-zinc-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="md:self-start">
                            <p
                              className="text-lg font-semibold tracking-tight text-zinc-950"
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {order.total}
                            </p>
                            <p className="mt-1 text-sm text-zinc-500">
                              {order.items} item{order.items > 1 ? "s" : ""}
                            </p>
                          </div>

                          <div className="md:self-start">
                            <StatusChip label={order.financialStatus} tone={toneForFinancial(order.financialStatus)} />
                            <p className="mt-2 text-sm text-zinc-500">{order.paymentMethod}</p>
                          </div>

                          <div className="md:self-start">
                            <StatusChip
                              label={order.fulfillmentStatus}
                              tone={toneForFulfillment(order.fulfillmentStatus)}
                            />
                            <p className="mt-2 text-sm text-zinc-500">
                              {order.fulfillmentTimeline.filter((step) => step.done).length}/
                              {order.fulfillmentTimeline.length} steps complete
                            </p>
                          </div>

                          <div className="space-y-2 md:self-start">
                            {order.fulfillmentTimeline.slice(0, 2).map((step) => (
                              <div key={step.label} className="flex items-start gap-2.5">
                                <span
                                  className={`mt-1 h-2 w-2 rounded-full ${step.done ? "bg-zinc-950" : "bg-zinc-300"}`}
                                  aria-hidden="true"
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-sm text-zinc-700">{step.label}</p>
                                  <p className="text-xs text-zinc-500">{step.at}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="rounded-[28px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Fulfillment timeline</h2>
                <p className="text-sm text-zinc-500">
                  {selectedOrder ? `Latest progress for ${selectedOrder.id}` : "Select an order to inspect fulfillment details."}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-700 transition-[transform,background-color] duration-150 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 active:scale-[0.97]"
              >
                More
              </button>
            </div>

            {!selectedOrder || uiState === "loading" || uiState === "error" || filteredOrders.length === 0 ? (
              <div className="py-8">
                <div className="rounded-2xl border border-zinc-200 bg-[#fcfbf8] p-5">
                  <p className="text-sm font-medium text-zinc-700">No order selected</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Choose an order from the list to review payment details, fulfillment steps, and next actions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pt-5">
                <div className="rounded-2xl border border-zinc-200 bg-[#fcfbf8] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">{selectedOrder.customer}</p>
                      <p className="mt-1 text-sm text-zinc-500">{selectedOrder.email}</p>
                    </div>
                    <p
                      className="text-lg font-semibold tracking-tight text-zinc-950"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {selectedOrder.total}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusChip
                      label={selectedOrder.financialStatus}
                      tone={toneForFinancial(selectedOrder.financialStatus)}
                    />
                    <StatusChip
                      label={selectedOrder.fulfillmentStatus}
                      tone={toneForFulfillment(selectedOrder.fulfillmentStatus)}
                    />
                    <StatusChip label={`${selectedOrder.risk} risk`} tone={toneForRisk(selectedOrder.risk)} />
                  </div>
                </div>

                <ol className="space-y-4" aria-label="Fulfillment steps">
                  {selectedOrder.fulfillmentTimeline.map((step, index) => (
                    <li key={step.label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={[
                            "mt-1 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                            step.done
                              ? "border-zinc-900 bg-zinc-950 text-white"
                              : "border-zinc-200 bg-white text-zinc-500",
                          ].join(" ")}
                        >
                          {index + 1}
                        </span>
                        {index < selectedOrder.fulfillmentTimeline.length - 1 && (
                          <span className="mt-2 h-full w-px bg-zinc-200" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{step.label}</p>
                            <p className="mt-1 text-sm text-zinc-500">{step.at}</p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              step.done
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {step.done ? "Done" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-800">Next recommended action</p>
                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    {selectedOrder.fulfillmentStatus === "On hold"
                      ? "Review risk signals before releasing this order to fulfillment."
                      : selectedOrder.fulfillmentStatus === "Fulfilled"
                      ? "No action needed. Shipment is complete and tracking has been sent."
                      : selectedOrder.financialStatus === "Pending"
                      ? "Wait for payment to clear before starting fulfillment."
                      : "Purchase a shipping label and move the order to packing."}
                  </p>
                </div>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
