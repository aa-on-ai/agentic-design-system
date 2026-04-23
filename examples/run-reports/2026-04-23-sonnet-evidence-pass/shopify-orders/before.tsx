"use client";

import React, { useMemo, useState } from "react";

type OrderStatus = "Open" | "Archived" | "Canceled";
type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Partially refunded";
type FulfillmentStatus =
  | "Unfulfilled"
  | "Scheduled"
  | "Partial"
  | "Fulfilled"
  | "On hold";

type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: string;
  items: number;
  country: string;
  salesChannel: string;
  status: OrderStatus;
  payment: PaymentStatus;
  fulfillment: FulfillmentStatus;
  tags: string[];
  timeline: {
    label: string;
    at: string;
    done: boolean;
  }[];
};

const ordersData: Order[] = [
  {
    id: "#1048",
    customer: "Lena Hart",
    email: "lena@example.com",
    date: "2026-04-19 09:24",
    total: "$248.00",
    items: 3,
    country: "United States",
    salesChannel: "Online Store",
    status: "Open",
    payment: "Paid",
    fulfillment: "Partial",
    tags: ["VIP", "Priority"],
    timeline: [
      { label: "Order placed", at: "Apr 19, 9:24 AM", done: true },
      { label: "Payment captured", at: "Apr 19, 9:25 AM", done: true },
      { label: "Label purchased", at: "Apr 19, 2:10 PM", done: true },
      { label: "Partially fulfilled", at: "Apr 20, 8:05 AM", done: true },
      { label: "Delivered", at: "Pending", done: false },
    ],
  },
  {
    id: "#1047",
    customer: "Owen Carter",
    email: "owen@example.com",
    date: "2026-04-18 14:12",
    total: "$84.50",
    items: 1,
    country: "Canada",
    salesChannel: "Shop App",
    status: "Open",
    payment: "Pending",
    fulfillment: "Scheduled",
    tags: ["Fraud review"],
    timeline: [
      { label: "Order placed", at: "Apr 18, 2:12 PM", done: true },
      { label: "Payment pending", at: "Apr 18, 2:12 PM", done: true },
      { label: "Inventory allocated", at: "Apr 18, 2:25 PM", done: true },
      { label: "Scheduled for fulfillment", at: "Apr 19, 10:00 AM", done: true },
      { label: "Shipped", at: "Pending", done: false },
    ],
  },
  {
    id: "#1046",
    customer: "Mia Thompson",
    email: "mia@example.com",
    date: "2026-04-18 11:48",
    total: "$412.99",
    items: 5,
    country: "United Kingdom",
    salesChannel: "Online Store",
    status: "Archived",
    payment: "Paid",
    fulfillment: "Fulfilled",
    tags: ["Wholesale"],
    timeline: [
      { label: "Order placed", at: "Apr 18, 11:48 AM", done: true },
      { label: "Payment captured", at: "Apr 18, 11:49 AM", done: true },
      { label: "Packed", at: "Apr 18, 4:10 PM", done: true },
      { label: "Shipped", at: "Apr 19, 8:20 AM", done: true },
      { label: "Delivered", at: "Apr 22, 1:30 PM", done: true },
    ],
  },
  {
    id: "#1045",
    customer: "Noah Kim",
    email: "noah@example.com",
    date: "2026-04-17 16:03",
    total: "$39.00",
    items: 1,
    country: "Australia",
    salesChannel: "Draft Order",
    status: "Canceled",
    payment: "Refunded",
    fulfillment: "On hold",
    tags: ["Canceled by customer"],
    timeline: [
      { label: "Order placed", at: "Apr 17, 4:03 PM", done: true },
      { label: "Payment captured", at: "Apr 17, 4:04 PM", done: true },
      { label: "Cancellation requested", at: "Apr 17, 4:20 PM", done: true },
      { label: "Refund issued", at: "Apr 17, 4:45 PM", done: true },
      { label: "Closed", at: "Apr 17, 4:46 PM", done: true },
    ],
  },
  {
    id: "#1044",
    customer: "Ava Martinez",
    email: "ava@example.com",
    date: "2026-04-17 10:15",
    total: "$129.00",
    items: 2,
    country: "Germany",
    salesChannel: "Online Store",
    status: "Open",
    payment: "Partially refunded",
    fulfillment: "Fulfilled",
    tags: ["Exchange"],
    timeline: [
      { label: "Order placed", at: "Apr 17, 10:15 AM", done: true },
      { label: "Payment captured", at: "Apr 17, 10:16 AM", done: true },
      { label: "Shipped", at: "Apr 17, 6:30 PM", done: true },
      { label: "Delivered", at: "Apr 20, 12:40 PM", done: true },
      { label: "Partial refund", at: "Apr 21, 9:10 AM", done: true },
    ],
  },
  {
    id: "#1043",
    customer: "Ethan Walker",
    email: "ethan@example.com",
    date: "2026-04-16 08:42",
    total: "$560.00",
    items: 7,
    country: "United States",
    salesChannel: "POS",
    status: "Open",
    payment: "Paid",
    fulfillment: "Unfulfilled",
    tags: ["Local pickup"],
    timeline: [
      { label: "Order placed", at: "Apr 16, 8:42 AM", done: true },
      { label: "Payment captured", at: "Apr 16, 8:42 AM", done: true },
      { label: "Ready for pickup", at: "Pending", done: false },
      { label: "Picked up", at: "Pending", done: false },
      { label: "Completed", at: "Pending", done: false },
    ],
  },
];

const savedViews = [
  "All orders",
  "Unfulfilled",
  "Paid",
  "High value",
  "International",
  "Returns & refunds",
];

function chipClasses(kind: "status" | "payment" | "fulfillment", value: string) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap";
  const map: Record<string, string> = {
    Open: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Archived: "border-slate-200 bg-slate-100 text-slate-700",
    Canceled: "border-rose-200 bg-rose-50 text-rose-700",

    Paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Refunded: "border-rose-200 bg-rose-50 text-rose-700",
    "Partially refunded": "border-orange-200 bg-orange-50 text-orange-700",

    Unfulfilled: "border-slate-200 bg-slate-100 text-slate-700",
    Scheduled: "border-sky-200 bg-sky-50 text-sky-700",
    Partial: "border-violet-200 bg-violet-50 text-violet-700",
    Fulfilled: "border-emerald-200 bg-emerald-50 text-emerald-700",
    "On hold": "border-amber-200 bg-amber-50 text-amber-700",
  };

  return `${base} ${map[value] || "border-slate-200 bg-slate-50 text-slate-700"}`;
}

export default function OrdersAdminPage() {
  const [activeView, setActiveView] = useState("All orders");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(ordersData[0].id);

  const filteredOrders = useMemo(() => {
    let list = [...ordersData];

    if (activeView === "Unfulfilled") {
      list = list.filter(
        (o) =>
          o.fulfillment === "Unfulfilled" ||
          o.fulfillment === "Scheduled" ||
          o.fulfillment === "On hold"
      );
    }

    if (activeView === "Paid") {
      list = list.filter((o) => o.payment === "Paid");
    }

    if (activeView === "High value") {
      list = list.filter((o) => Number(o.total.replace(/[^0-9.]/g, "")) >= 200);
    }

    if (activeView === "International") {
      list = list.filter((o) => o.country !== "United States");
    }

    if (activeView === "Returns & refunds") {
      list = list.filter(
        (o) => o.payment === "Refunded" || o.payment === "Partially refunded"
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.country.toLowerCase().includes(q) ||
          o.salesChannel.toLowerCase().includes(q) ||
          o.tags.join(" ").toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeView, search]);

  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedId) || filteredOrders[0] || null;

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Commerce / Orders</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage orders, payment state, and fulfillment from one admin view.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              Export
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              More actions
            </button>
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
              Create order
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {savedViews.map((view) => {
                      const active = activeView === view;
                      return (
                        <button
                          key={view}
                          onClick={() => setActiveView(view)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                            active
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {view}
                        </button>
                      );
                    })}
                    <button className="rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      + Save current view
                    </button>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl">
                    <div className="relative flex-1">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      >
                        <path
                          d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search orders, customer, email, tag, or channel"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300"
                      />
                    </div>
                    <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      Filters
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Orders
                    </p>
                    <p className="mt-1 text-xl font-semibold">{filteredOrders.length}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Paid
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {filteredOrders.filter((o) => o.payment === "Paid").length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Unfulfilled
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {
                        filteredOrders.filter((o) =>
                          ["Unfulfilled", "Scheduled", "On hold"].includes(o.fulfillment)
                        ).length
                      }
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Gross sales
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      $
                      {filteredOrders
                        .reduce(
                          (sum, o) => sum + Number(o.total.replace(/[^0-9.]/g, "")),
                          0
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50/80">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Fulfillment</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Channel</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const active = selectedOrder?.id === order.id;
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedId(order.id)}
                          className={`cursor-pointer border-b border-slate-200 last:border-0 transition hover:bg-slate-50 ${
                            active ? "bg-slate-50" : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                                {order.id.replace("#", "")}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{order.id}</div>
                                <div className="mt-1 text-sm text-slate-500">
                                  {order.items} item{order.items > 1 ? "s" : ""} • {order.country}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="font-medium">{order.customer}</div>
                            <div className="mt-1 text-sm text-slate-500">{order.email}</div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {order.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className={chipClasses("status", order.status)}>
                              {order.status}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className={chipClasses("payment", order.payment)}>
                              {order.payment}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className={chipClasses("fulfillment", order.fulfillment)}>
                              {order.fulfillment}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="font-medium">{order.total}</div>
                          </td>

                          <td className="px-4 py-4 align-top text-sm text-slate-600">
                            {order.salesChannel}
                          </td>

                          <td className="px-4 py-4 align-top text-sm text-slate-600">
                            {order.date}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-16 text-center">
                          <div className="mx-auto max-w-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                              <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                className="h-6 w-6 text-slate-400"
                              >
                                <path
                                  d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                              No orders found
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Try changing your search or selecting another saved view.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                <p>
                  Showing <span className="font-medium text-slate-700">{filteredOrders.length}</span>{" "}
                  result{filteredOrders.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
                    Previous
                  </button>
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedOrder ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Selected order</p>
                    <h2 className="mt-1 text-xl font-semibold">{selectedOrder.id}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedOrder.customer} • {selectedOrder.email}
                    </p>
                  </div>
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    View
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Summary
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={chipClasses("status", selectedOrder.status)}>
                        {selectedOrder.status}
                      </span>
                      <span className={chipClasses("payment", selectedOrder.payment)}>
                        {selectedOrder.payment}
                      </span>
                      <span className={chipClasses("fulfillment", selectedOrder.fulfillment)}>
                        {selectedOrder.fulfillment}
                      </span>
                    </div>
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Total</dt>
                        <dd className="font-medium text-slate-900">{selectedOrder.total}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Items</dt>
                        <dd className="font-medium text-slate-900">{selectedOrder.items}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Market</dt>
                        <dd className="font-medium text-slate-900">{selectedOrder.country}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Channel</dt>
                        <dd className="font-medium text-slate-900">
                          {selectedOrder.salesChannel}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Fulfillment timeline
                      </p>
                      <span className="text-xs text-slate-400">
                        {selectedOrder.timeline.filter((t) => t.done).length}/
                        {selectedOrder.timeline.length} complete
                      </span>
                    </div>

                    <ol className="mt-4 space-y-4">
                      {selectedOrder.timeline.map((event, idx) => (
                        <li key={`${event.label}-${idx}`} className="relative flex gap-3">
                          <div className="relative flex flex-col items-center">
                            <div
                              className={`z-10 mt-0.5 h-3.5 w-3.5 rounded-full border-2 ${
                                event.done
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-slate-300 bg-white"
                              }`}
                            />
                            {idx < selectedOrder.timeline.length - 1 && (
                              <div className="mt-1 h-10 w-px bg-slate-200" />
                            )}
                          </div>
                          <div className="min-w-0 pb-1">
                            <p
                              className={`text-sm font-medium ${
                                event.done ? "text-slate-900" : "text-slate-500"
                              }`}
                            >
                              {event.label}
                            </p>
                            <p className="text-xs text-slate-500">{event.at}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tags
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedOrder.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                      Capture payment
                    </button>
                    <button className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      Mark fulfilled
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center">
                <div className="rounded-2xl bg-slate-100 p-3">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-slate-400">
                    <path
                      d="M4 7.5H20M7 4.5H17M6.8 19.5H17.2C18.8802 19.5 19.7202 19.5 20.362 19.173C20.9265 18.8854 21.3854 18.4265 21.673 17.862C22 17.2202 22 16.3802 22 14.7V10.3C22 8.61984 22 7.77976 21.673 7.13803C21.3854 6.57354 20.9265 6.1146 20.362 5.82698C19.7202 5.5 18.8802 5.5 17.2 5.5H6.8C5.11984 5.5 4.27976 5.5 3.63803 5.82698C3.07354 6.1146 2.6146 6.57354 2.32698 7.13803C2 7.77976 2 8.61984 2 10.3V14.7C2 16.3802 2 17.2202 2.32698 17.862C2.6146 18.4265 3.07354 18.8854 3.63803 19.173C4.27976 19.5 5.11984 19.5 6.8 19.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">No order selected</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Select an order from the table to view its fulfillment timeline.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
