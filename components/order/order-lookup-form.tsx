"use client";

import { useState } from "react";

import { formatDate } from "@/lib/utils";

type LookupOrder = {
  status: string;
  productTier: string;
  createdAt: string;
  project?: {
    templateSlug?: string | null;
    recipientName?: string | null;
  } | null;
  vendorOrder?: {
    shipments?: {
      trackingUrl?: string | null;
    }[];
  } | null;
};

export function OrderLookupForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<LookupOrder | null>(null);

  const lookup = async () => {
    setBusy(true);
    setError(null);

    try {
      const search = new URLSearchParams({
        orderNumber,
        email,
      });
      const response = await fetch(`/api/orders/lookup?${search.toString()}`);
      const data = (await response.json()) as { error?: string; order?: LookupOrder };

      if (!response.ok || !data.order) {
        throw new Error(data.error || "Order not found.");
      }

      setOrder(data.order);
    } catch (requestError) {
      setOrder(null);
      setError(requestError instanceof Error ? requestError.message : "Order not found.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-stone-700">Order number</span>
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
            placeholder="GGS-20260422-12345"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-stone-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={lookup}
        disabled={busy}
        className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {busy ? "Looking up..." : "Look up order"}
      </button>
      {error ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}
      {order ? (
        <div className="rounded-[1.8rem] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Order status
              </div>
              <div className="mt-2 text-2xl font-semibold text-stone-950">
                {order.status}
              </div>
            </div>
            <div className="text-sm text-stone-500">
              Created {formatDate(order.createdAt) ?? "recently"}
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-stone-700">
            <div>Template: {order.project?.templateSlug ?? "-"}</div>
            <div>Recipient: {order.project?.recipientName ?? "-"}</div>
            <div>
              Delivery:{" "}
              {order.productTier === "digital_print_kit" ? "Digital download" : "Boxed physical"}
            </div>
            {order.vendorOrder?.shipments?.[0]?.trackingUrl ? (
              <a
                href={order.vendorOrder.shipments[0].trackingUrl}
                className="font-semibold text-[var(--brand-strong)]"
              >
                Track shipment
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
