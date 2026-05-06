"use client";

import { useState } from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

type LookupOrder = {
  status: string;
  productTier: string;
  createdAt: string;
  shippingQuote?: {
    estimatedShipDate?: string | null;
  } | null;
  project?: {
    templateSlug?: string | null;
    recipientName?: string | null;
    assets?: { type?: string | null }[];
    template?: {
      name?: string | null;
    } | null;
  } | null;
  vendorOrder?: {
    status?: string | null;
    shipments?: {
      status?: string | null;
      trackingUrl?: string | null;
    }[];
  } | null;
};

function getOrderSnapshot(order: LookupOrder) {
  const shipment = order.vendorOrder?.shipments?.[0];
  const hasDownloads = (order.project?.assets?.length ?? 0) > 0;

  if (order.productTier === "digital_print_kit") {
    if (hasDownloads || order.status === "paid") {
      return {
        badgeStatus: hasDownloads ? "asset_ready" : "paid",
        title: hasDownloads ? "Your digital files are ready" : "Your files are being prepared",
        body: hasDownloads
          ? "Your board, cards, and rules should be available from your confirmation flow and delivery email."
          : "We have your order and are finishing the final files now.",
        nextStep:
          "Keep your order email handy. That is the fastest way back to your download links.",
      };
    }

    return {
      badgeStatus: order.status,
      title: "We are still confirming this digital order",
      body: "If you recently checked out, payment confirmation may still be working its way through.",
      nextStep:
        "If nothing changes after a little while, contact support with your order number and receipt email.",
    };
  }

  if (shipment?.status === "delivered") {
    return {
      badgeStatus: "delivered",
      title: "Your boxed game has been delivered",
      body: "The shipment has been marked delivered by the carrier.",
      nextStep: "If you need anything after delivery, support can help from the order number.",
    };
  }

  if (shipment?.trackingUrl || shipment?.status === "shipped" || shipment?.status === "in_transit") {
    return {
      badgeStatus: shipment?.status === "in_transit" ? "in_transit" : "shipped",
      title: "Your boxed game is on the way",
      body: "Production is complete and the carrier has your package in motion.",
      nextStep: "Use the tracking link below for the latest transit scan.",
    };
  }

  if (order.vendorOrder?.status === "submitted") {
    return {
      badgeStatus: "processing",
      title: "Your boxed game is in production",
      body: "The approved proof has been handed off for manufacturing and packing.",
      nextStep: "Tracking appears here as soon as the shipment is created.",
    };
  }

  return {
    badgeStatus: order.status === "paid" ? "paid" : order.status,
    title: "Your order is confirmed",
    body: "We have the proof and payment, and the boxed order is moving into production routing.",
    nextStep: "You will see shipping progress here as soon as it becomes available.",
  };
}

export function OrderLookupForm({ supportEmail }: { supportEmail: string }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<LookupOrder | null>(null);

  const lookup = async () => {
    if (!orderNumber.trim() || !email.trim()) {
      setOrder(null);
      setError("Enter the order number and checkout email from your receipt.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const search = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        email: email.trim(),
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

  const summary = order ? getOrderSnapshot(order) : null;
  const trackingUrl = order?.vendorOrder?.shipments?.[0]?.trackingUrl;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="spec-label">Look up your purchase</div>
        <p className="text-sm leading-7 text-stone-600">
          Use the order number from your receipt email and the same email address used at
          checkout.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4">
          <div className="text-sm font-semibold text-stone-800">Order number</div>
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            className="mt-3 w-full rounded-[1.2rem] border border-[var(--line)] bg-[rgba(255,252,247,0.96)] px-4 py-3 outline-none"
            placeholder="GGS-20260422-12345"
          />
        </label>
        <label className="rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4">
          <div className="text-sm font-semibold text-stone-800">Checkout email</div>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-3 w-full rounded-[1.2rem] border border-[var(--line)] bg-[rgba(255,252,247,0.96)] px-4 py-3 outline-none"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={lookup}
        disabled={busy}
        className="cta-pill disabled:cursor-not-allowed disabled:opacity-45"
      >
        {busy ? "Looking up your order..." : "Look up order"}
      </button>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
          {error}
        </div>
      ) : null}

      {order && summary ? (
        <div className="paper-panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="spec-label">Current stage</div>
              <h2 className="heading-display mt-4 text-3xl font-semibold text-stone-950">
                {summary.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">{summary.body}</p>
            </div>
            <StatusBadge status={summary.badgeStatus} />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="spec-line">
              <strong>Template:</strong>{" "}
              {order.project?.template?.name ?? order.project?.templateSlug ?? "-"}
            </div>
            <div className="spec-line">
              <strong>Recipient:</strong> {order.project?.recipientName ?? "-"}
            </div>
            <div className="spec-line">
              <strong>Delivery:</strong>{" "}
              {order.productTier === "digital_print_kit" ? "Digital print kit" : "Boxed game"}
            </div>
            <div className="spec-line">
              <strong>Placed:</strong> {formatDate(order.createdAt) ?? "Recently"}
            </div>
            {order.shippingQuote?.estimatedShipDate ? (
              <div className="spec-line md:col-span-2">
                <strong>Estimated ship date:</strong>{" "}
                {formatDate(order.shippingQuote.estimatedShipDate)}
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white px-5 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              What happens next
            </div>
            <p className="mt-3 text-sm leading-7 text-stone-600">{summary.nextStep}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {trackingUrl ? (
              <a href={trackingUrl} className="cta-pill">
                Track shipment
              </a>
            ) : null}
            <a href={`mailto:${supportEmail}`} className="secondary-pill">
              Email support
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
