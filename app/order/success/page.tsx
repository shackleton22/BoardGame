import Link from "next/link";

import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getProductRecipe } from "@/lib/catalog/game-kits";
import { getLaunchConfig } from "@/lib/launch/config";
import { findOrderForSuccessPage } from "@/lib/orders";
import type { TemplateSlug } from "@/lib/templates/types";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SuccessOrder = NonNullable<Awaited<ReturnType<typeof findOrderForSuccessPage>>>;

const DOWNLOADABLE_TYPES = [
  "board_final_pdf",
  "board_final_png",
  "deck_primary_pdf",
  "deck_secondary_pdf",
  "rules_pdf",
] as const;

function getCustomerState(order: SuccessOrder) {
  const shipment = order.vendorOrder?.shipments[0];
  const hasDownloads = order.project.assets.some((asset) =>
    DOWNLOADABLE_TYPES.includes(asset.type as (typeof DOWNLOADABLE_TYPES)[number]),
  );

  if (order.productTier === "digital_print_kit") {
    if (hasDownloads) {
      return {
        badgeStatus: "asset_ready",
        title: "Your digital files are ready",
        body: "The board, card sheets, and rules are ready to open from this page and your confirmation email.",
        milestones: [
          "Payment confirmed",
          "Proof locked for final files",
          "Downloads ready",
        ],
        nextSteps: [
          "Open the PDFs on desktop for the cleanest print workflow.",
          "Use the PNG if you want a quick preview or print-shop reference image.",
          "Keep the order email for easy access later.",
        ],
      };
    }

    return {
      badgeStatus: "paid",
      title: "Your digital files are being prepared",
      body: "We have your payment and approved proof. The final files are being packaged now.",
      milestones: ["Payment confirmed", "Final files in progress", "Delivery email next"],
      nextSteps: [
        "Stay on the confirmation flow or check your receipt email shortly.",
        "If you need help, contact support with your order number.",
      ],
    };
  }

  if (shipment?.status === "delivered") {
    return {
      badgeStatus: "delivered",
      title: "Your boxed game has been delivered",
      body: "The carrier has marked your package as delivered.",
      milestones: ["Payment confirmed", "Production complete", "Delivered"],
      nextSteps: [
        "If you need anything after delivery, support can help from the order number.",
      ],
    };
  }

  if (shipment?.trackingUrl || shipment?.status === "in_transit") {
    return {
      badgeStatus: shipment?.status === "in_transit" ? "in_transit" : "shipped",
      title: "Your boxed game is on the way",
      body: "Production is complete and the carrier has your gift in transit.",
      milestones: ["Payment confirmed", "Production complete", "Shipment in transit"],
      nextSteps: [
        "Use the tracking link on this page for the latest carrier scan.",
        "Guest order lookup will keep showing the newest shipment status.",
      ],
    };
  }

  if (order.vendorOrder?.status === "submitted") {
    return {
      badgeStatus: "processing",
      title: "Your boxed game is in production",
      body: "The approved proof has been handed off for manufacturing, packing, and release to the carrier.",
      milestones: ["Payment confirmed", "Proof released to production", "Tracking appears next"],
      nextSteps: [
        "Tracking will appear here as soon as the shipment is created.",
        "If you ordered for a specific date, keep an eye on the estimated ship window below.",
      ],
    };
  }

  return {
    badgeStatus: "paid",
    title: "Your order is confirmed",
    body: "We have your payment and approved proof, and the boxed order is moving into production routing.",
    milestones: ["Payment confirmed", "Proof approved", "Production routing underway"],
    nextSteps: [
      "We will keep this page updated as the order moves toward shipment.",
      "You can also return through guest order lookup any time.",
    ],
  };
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const order = await findOrderForSuccessPage(session_id);
  const launchConfig = getLaunchConfig();
  const supportEmail = launchConfig.supportEmail;
  const recipe = order
    ? getProductRecipe({
        templateSlug: order.templateSlug as TemplateSlug,
        productTier: order.productTier,
      })
    : undefined;
  const customerState = order ? getCustomerState(order) : null;
  const shipment = order?.vendorOrder?.shipments[0];
  const downloads =
    order?.project.assets.filter((asset) =>
      DOWNLOADABLE_TYPES.includes(asset.type as (typeof DOWNLOADABLE_TYPES)[number]),
    ) ?? [];

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-16">
        <div className="launch-note">
          <span>Order confirmed</span>
          <span>Proof locked for production</span>
          <span>Guest order lookup available anytime</span>
        </div>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="paper-panel rounded-[2.3rem] p-8 sm:p-10">
            <span className="section-label">Thank you</span>
            <h1 className="heading-display mt-5 text-5xl font-semibold text-stone-950">
              {customerState?.title ?? "Your custom game is officially in motion"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
              {order
                ? `Thanks for ordering a personalized gift for ${order.project.recipientName}. ${customerState?.body ?? ""}`
                : "Thanks for your purchase. We are lining up the final files and production steps now."}
            </p>

            {order ? (
              <div className="mt-6 rounded-[1.7rem] border border-[var(--line)] bg-white px-5 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Order number
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-950">
                  {order.publicOrderNumber}
                </div>
              </div>
            ) : null}

            {customerState ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <StatusBadge status={customerState.badgeStatus} />
                {shipment?.status && shipment.status !== customerState.badgeStatus ? (
                  <StatusBadge status={shipment.status} />
                ) : null}
              </div>
            ) : null}

            {customerState ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {customerState.milestones.map((item) => (
                  <div key={item} className="rounded-[1.6rem] border border-[var(--line)] bg-white px-4 py-4 text-sm font-semibold text-stone-700">
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="ink-panel rounded-[2.3rem] p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,244,230,0.72)]">
              What happens next
            </div>
            <h2 className="heading-display mt-4 text-4xl font-semibold text-[var(--paper-ink)]">
              A clean handoff from proof to delivery
            </h2>
            <div className="mt-6 space-y-3">
              {(customerState?.nextSteps ?? [
                "Keep your order email handy for the fastest return path.",
                "Use guest order lookup any time you want the latest status.",
                launchConfig.supportPromiseCopy,
              ]).map((step) => (
                <div
                  key={step}
                  className="rounded-[1.4rem] border border-[rgba(255,244,230,0.14)] bg-[rgba(255,244,230,0.06)] px-4 py-4 text-sm leading-7 text-[rgba(255,244,230,0.86)]"
                >
                  {step}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[rgba(255,244,230,0.72)]">
              {launchConfig.supportPromiseCopy}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {order ? (
                <Link href={`/preview/${order.projectId}`} className="secondary-pill secondary-pill-on-dark">
                  Review approved proof
                </Link>
              ) : null}
              <Link href="/order/lookup" className="secondary-pill secondary-pill-on-dark">
                Look up an order
              </Link>
            </div>

            <a
              href={`mailto:${supportEmail}`}
              className="mt-5 inline-flex rounded-full border border-[rgba(255,244,230,0.18)] bg-[rgba(255,244,230,0.08)] px-5 py-3 text-sm font-semibold text-[var(--paper-ink)]"
            >
              {supportEmail}
            </a>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {order?.productTier === "digital_print_kit" ? (
            <div className="paper-panel rounded-[2rem] p-6 sm:p-8">
              <div className="spec-label">Downloads</div>
              <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950">
                Your files
              </h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Download the finished board, card sheets, and rules from the links below.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {downloads.map((asset) => (
                  <a
                    key={asset.id}
                    href={asset.url ?? "#"}
                    className="rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4 text-sm font-semibold text-stone-700"
                  >
                    {asset.label}
                  </a>
                ))}
                {!downloads.length ? (
                  <div className="rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-7 text-stone-600 sm:col-span-2">
                    Your final files are still being prepared. Stay on this page or check your
                    email again shortly.
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="paper-panel rounded-[2rem] p-6 sm:p-8">
              <div className="spec-label">Production and shipping</div>
              <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950">
                Boxed gift status
              </h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Boxed orders move from approved proof into production, then into carrier tracking.
              </p>
              <div className="mt-6 space-y-3">
                {order?.shippingQuote?.estimatedShipDate ? (
                  <div className="spec-line">
                    Estimated ship date: {formatDate(order.shippingQuote.estimatedShipDate)}
                  </div>
                ) : null}
                <div className="spec-line">
                  Delivery method: {order?.shippingQuote?.shippingLabel ?? "Boxed game shipment"}
                </div>
                <div className="spec-line">
                  Ordered: {order ? formatDate(order.createdAt) ?? "Recently" : "Recently"}
                </div>
              </div>
              {shipment?.trackingUrl ? (
                <a href={shipment.trackingUrl} className="cta-pill mt-6">
                  Track shipment
                </a>
              ) : null}
            </div>
          )}

          <div className="paper-panel rounded-[2rem] p-6 sm:p-8">
            <div className="spec-label">
              {order?.productTier === "digital_print_kit" ? "Need this later?" : "What ships in the box"}
            </div>
            {order?.productTier === "digital_print_kit" ? (
              <>
                <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950">
                  Save the essentials
                </h2>
                <div className="mt-6 space-y-3">
                  <div className="spec-line">
                    Order number: {order?.publicOrderNumber ?? "Available in your receipt"}
                  </div>
                  <div className="spec-line">
                    Use the same checkout email in guest order lookup if you need to return.
                  </div>
                </div>
              </>
            ) : recipe?.customerFacingSummary.length ? (
              <>
                <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950">
                  Included with the boxed game
                </h2>
                <div className="mt-6 space-y-3">
                  {recipe.customerFacingSummary.map((item) => (
                    <div key={item} className="spec-line">
                      {item}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950">
                  Need to return later?
                </h2>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  Use your receipt email or guest order lookup to get back to the latest
                  status and delivery details.
                </p>
              </>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
