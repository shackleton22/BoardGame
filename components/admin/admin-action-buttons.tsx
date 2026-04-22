"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminActionButtons({
  projectId,
  orderId,
  vendorOrderId,
}: {
  projectId: string;
  orderId?: string;
  vendorOrderId?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const runAction = async (
    action:
      | "generate_assets"
      | "mock_fulfill"
      | "sync_vendor"
      | "refund_order"
      | "cancel_vendor_order"
      | "expire_quotes",
    targetId?: string,
  ) => {
    setBusy(action);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetId }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Action failed.");
      }

      setMessage("Action completed.");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => runAction("generate_assets", projectId)}
          disabled={busy !== null}
          className="rounded-full border border-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-[var(--brand-strong)] disabled:opacity-60"
        >
          {busy === "generate_assets" ? "Generating..." : "Regenerate assets"}
        </button>
        {orderId ? (
          <>
            <button
              type="button"
              onClick={() => runAction("mock_fulfill", orderId)}
              disabled={busy !== null}
              className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy === "mock_fulfill" ? "Submitting..." : "Trigger mock fulfill"}
            </button>
            <button
              type="button"
              onClick={() => runAction("refund_order", orderId)}
              disabled={busy !== null}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-60"
            >
              {busy === "refund_order" ? "Refunding..." : "Refund order"}
            </button>
          </>
        ) : null}
        {vendorOrderId ? (
          <>
            <button
              type="button"
              onClick={() => runAction("sync_vendor", vendorOrderId)}
              disabled={busy !== null}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-60"
            >
              {busy === "sync_vendor" ? "Syncing..." : "Sync vendor"}
            </button>
            <button
              type="button"
              onClick={() => runAction("cancel_vendor_order", vendorOrderId)}
              disabled={busy !== null}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-60"
            >
              {busy === "cancel_vendor_order" ? "Cancelling..." : "Cancel vendor order"}
            </button>
          </>
        ) : null}
      </div>
      {message ? <div className="text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="text-sm text-rose-700">{error}</div> : null}
    </div>
  );
}
