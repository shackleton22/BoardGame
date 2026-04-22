import Link from "next/link";

import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSupportEmail } from "@/lib/env";
import { findOrderForSuccessPage } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const order = await findOrderForSuccessPage(session_id);
  const supportEmail = getSupportEmail();

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-16">
        <div className="glass-panel max-w-5xl rounded-[2rem] p-8 sm:p-10">
          <span className="section-label">Order confirmed</span>
          <h1 className="heading-display mt-5 text-5xl font-semibold text-stone-950">
            Your custom game is officially in motion
          </h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">
            {order
              ? `Thanks for ordering a personalized gift for ${order.project.recipientName}.`
              : "Thanks for your purchase. We’re lining up the final files and production steps now."}
          </p>

          {order ? (
            <div className="mt-6 rounded-[1.6rem] bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Order number
              </div>
              <div className="mt-2 text-2xl font-semibold text-stone-950">
                {order.publicOrderNumber}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={order?.status ?? "pending"} />
            {order?.vendorOrder ? <StatusBadge status={order.vendorOrder.status} /> : null}
            {order?.vendorOrder?.shipments[0] ? (
              <StatusBadge status={order.vendorOrder.shipments[0].status} />
            ) : null}
          </div>

          {order?.productTier === "digital_print_kit" ? (
            <div className="mt-8 rounded-[1.8rem] bg-white p-6">
              <h2 className="heading-display text-3xl font-semibold">Downloads</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {order.project.assets
                  .filter((asset) =>
                    [
                      "board_final_pdf",
                      "board_final_png",
                      "deck_primary_pdf",
                      "deck_secondary_pdf",
                      "rules_pdf",
                    ].includes(asset.type),
                  )
                  .map((asset) => (
                    <a
                      key={asset.id}
                      href={asset.url ?? "#"}
                      className="rounded-2xl border border-[var(--line)] px-4 py-4 text-sm font-semibold text-stone-700"
                    >
                      {asset.label}
                    </a>
                  ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[1.8rem] bg-white p-6">
              <h2 className="heading-display text-3xl font-semibold">Production update</h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                We’re preparing your custom game for production through The Game Crafter. If
                your vendor setup is incomplete, the order stays visible in admin as manual
                review instead of getting lost.
              </p>
              {order?.vendorOrder?.shipments[0]?.trackingUrl ? (
                <a
                  href={order.vendorOrder.shipments[0].trackingUrl ?? "#"}
                  className="mt-5 inline-flex rounded-full border border-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-[var(--brand-strong)]"
                >
                  Track shipment
                </a>
              ) : null}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            {order ? (
              <Link
                href={`/preview/${order.projectId}`}
                className="rounded-full border border-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-[var(--brand-strong)]"
              >
                View preview again
              </Link>
            ) : null}
            <Link
              href="/order/lookup"
              className="rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold text-stone-700"
            >
              Look up an order
            </Link>
            <a
              href={`mailto:${supportEmail}`}
              className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
            >
              Contact support
            </a>
          </div>
          <p className="mt-6 text-sm text-stone-500">{supportEmail}</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
