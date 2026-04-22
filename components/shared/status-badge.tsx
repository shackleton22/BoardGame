import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-stone-100 text-stone-700",
  generating: "bg-amber-100 text-amber-800",
  preview_ready: "bg-sky-100 text-sky-800",
  quote_ready: "bg-cyan-100 text-cyan-800",
  paid: "bg-emerald-100 text-emerald-800",
  asset_ready: "bg-emerald-100 text-emerald-800",
  fulfilled: "bg-teal-100 text-teal-800",
  manual_review: "bg-orange-100 text-orange-800",
  failed: "bg-rose-100 text-rose-800",
  pending: "bg-stone-100 text-stone-700",
  processing: "bg-indigo-100 text-indigo-800",
  submitted: "bg-indigo-100 text-indigo-800",
  shipped: "bg-teal-100 text-teal-800",
  in_transit: "bg-cyan-100 text-cyan-800",
  delivered: "bg-teal-100 text-teal-800",
  refunded: "bg-stone-100 text-stone-700",
  cancelled: "bg-stone-100 text-stone-700",
  submitted_mock: "bg-orange-100 text-orange-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
        STATUS_STYLES[status] ?? "bg-stone-100 text-stone-700",
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
