import Link from "next/link";

import { AdminActionButtons } from "@/components/admin/admin-action-buttons";
import { AdminLogin } from "@/components/admin/admin-login";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { isAdminAuthenticated } from "@/lib/admin";
import { db } from "@/lib/db";
import { buildFulfillmentPlan } from "@/lib/fulfillment/plan";
import { getLaunchConfig } from "@/lib/launch/config";
import { getDisplayStatus } from "@/lib/projects";
import type { TemplateSlug } from "@/lib/templates/types";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS = [
  "draft",
  "preview_ready",
  "quote_ready",
  "paid",
  "fulfilled",
  "manual_review",
  "failed",
] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const launchConfig = getLaunchConfig();

  if (!(await isAdminAuthenticated())) {
    return (
      <>
        <SiteHeader />
        <main className="page-shell flex-1 py-16">
          <AdminLogin />
        </main>
        <SiteFooter />
      </>
    );
  }

  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      template: true,
      items: { orderBy: { sortOrder: "asc" } },
      assets: { orderBy: { createdAt: "asc" } },
      shippingQuotes: { orderBy: { createdAt: "desc" } },
      operationalEvents: { orderBy: { createdAt: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          shippingQuote: true,
          fulfillmentJobs: { orderBy: { createdAt: "desc" } },
          vendorOrder: {
            include: {
              shipments: { orderBy: { createdAt: "desc" } },
            },
          },
        },
      },
    },
  });

  const filteredProjects = projects.filter((project) => {
    const displayStatus = getDisplayStatus(project);
    return !status || displayStatus === status;
  });

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="section-label">Admin dashboard</span>
            <h1 className="heading-display mt-5 text-5xl font-semibold text-stone-950">
              Orders, projects, shipping, and vendor operations
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                !status ? "bg-[var(--brand-strong)] text-white" : "bg-white text-stone-700"
              }`}
            >
              All
            </Link>
            {FILTERS.map((filter) => (
              <Link
                key={filter}
                href={`/admin?status=${filter}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  status === filter
                    ? "bg-[var(--brand-strong)] text-white"
                    : "bg-white text-stone-700"
                }`}
              >
                {filter.replace(/_/g, " ")}
              </Link>
            ))}
          </div>
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-4">
          <div className="rounded-[1.6rem] border border-[var(--line)] bg-white p-5">
            <div className="spec-label">Launch mode</div>
            <div className="mt-3 text-lg font-semibold text-stone-950">
              {launchConfig.isSoftLaunch ? "Soft launch" : "Public launch"}
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-[var(--line)] bg-white p-5">
            <div className="spec-label">Templates live</div>
            <div className="mt-3 text-lg font-semibold text-stone-950">
              {launchConfig.enabledTemplates.length} / 5
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-[var(--line)] bg-white p-5">
            <div className="spec-label">Boxed checkout</div>
            <div className="mt-3 text-lg font-semibold text-stone-950">
              {launchConfig.physicalCheckoutEnabled ? "Enabled" : "Paused"}
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-[var(--line)] bg-white p-5">
            <div className="spec-label">Support</div>
            <div className="mt-3 truncate text-lg font-semibold text-stone-950">
              {launchConfig.supportEmail}
            </div>
          </div>
        </section>

        <div className="mt-10 space-y-8">
          {filteredProjects.map((project) => {
            const displayStatus = getDisplayStatus(project);
            const latestOrder = project.orders[0];
            const latestQuote = project.shippingQuotes[0];
            const vendorOrder = latestOrder?.vendorOrder;
            const latestShipment = vendorOrder?.shipments[0];
            const fulfillmentPlan = buildFulfillmentPlan({
              templateSlug: project.templateSlug as TemplateSlug,
              productTier: project.productTier,
            });

            return (
              <section key={project.id} className="glass-panel rounded-[2rem] p-6 sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={displayStatus} />
                      {latestOrder ? <StatusBadge status={latestOrder.status} /> : null}
                      {vendorOrder ? <StatusBadge status={vendorOrder.status} /> : null}
                      {latestShipment ? <StatusBadge status={latestShipment.status} /> : null}
                    </div>
                    <h2 className="heading-display text-4xl font-semibold text-stone-950">
                      {project.template.name} - {project.recipientName}
                    </h2>
                    <p className="text-sm leading-7 text-stone-600">
                      Buyer: {project.buyerName} - Product:{" "}
                      {project.productTier.replace(/_/g, " ")} - Created{" "}
                      {formatDate(project.createdAt)}
                    </p>
                    <p className="text-sm text-stone-500">Project ID: {project.id}</p>
                  </div>
                  <AdminActionButtons
                    projectId={project.id}
                    orderId={latestOrder?.id}
                    vendorOrderId={vendorOrder?.id}
                  />
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
                  <div className="rounded-[1.6rem] bg-white p-5">
                    <h3 className="heading-display text-2xl font-semibold">Generated files</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      {project.assets.length ? (
                        project.assets.map((asset) => (
                          <a
                            key={asset.id}
                            href={asset.url ?? "#"}
                            className="block rounded-2xl border border-[var(--line)] px-4 py-3 text-stone-700"
                          >
                            {asset.label}
                          </a>
                        ))
                      ) : (
                        <p className="text-stone-500">No generated assets yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] bg-white p-5">
                    <h3 className="heading-display text-2xl font-semibold">Shipping and vendor</h3>
                    <div className="mt-4 space-y-3 text-sm text-stone-700">
                      <div className="rounded-2xl border border-[var(--line)] px-4 py-3">
                        BOM: {fulfillmentPlan.bomVersion}
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] px-4 py-3">
                        Provider route: {fulfillmentPlan.selectedProvider}
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] px-4 py-3">
                        Latest quote:{" "}
                        {latestQuote
                          ? `${latestQuote.shippingLabel} - ${formatPrice(latestQuote.amount)}`
                          : "No quote yet"}
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] px-4 py-3">
                        Vendor cart: {vendorOrder?.providerCartId ?? "-"}
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] px-4 py-3">
                        Vendor receipt: {vendorOrder?.providerReceiptId ?? "-"}
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] px-4 py-3">
                        Vendor order number: {vendorOrder?.providerOrderNumber ?? "-"}
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] px-4 py-3">
                        Tracking: {latestShipment?.trackingNumber ?? "-"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] bg-white p-5">
                    <h3 className="heading-display text-2xl font-semibold">Timeline</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      {project.operationalEvents.slice(0, 6).map((event) => (
                        <div
                          key={event.id}
                          className="rounded-2xl border border-[var(--line)] px-4 py-3 text-stone-700"
                        >
                          <div className="font-semibold">{event.message}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.12em] text-stone-500">
                            {event.scope} - {event.eventType} - {formatDate(event.createdAt)}
                          </div>
                        </div>
                      ))}
                      {!project.operationalEvents.length ? (
                        <p className="text-stone-500">No operational events yet.</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {latestOrder ? (
                  <div className="mt-6 rounded-[1.6rem] bg-white p-5 text-sm text-stone-700">
                    <div className="font-semibold">Order snapshot</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div>Order number: {latestOrder.publicOrderNumber}</div>
                      <div>Amount: {formatPrice(latestOrder.amount)}</div>
                      <div>Email: {latestOrder.email ?? "-"}</div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[1.6rem] bg-white p-5 text-sm text-stone-700">
                    <h3 className="heading-display text-2xl font-semibold">Box contents</h3>
                    <div className="mt-4 space-y-3">
                      {fulfillmentPlan.customerFacingSummary.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-[var(--line)] px-4 py-3"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      Packout checklist
                    </h4>
                    <div className="mt-3 space-y-3">
                      {fulfillmentPlan.packoutChecklist.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-[var(--line)] px-4 py-3"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] bg-white p-5 text-sm text-stone-700">
                    <h3 className="heading-display text-2xl font-semibold">Vendor components</h3>
                    <div className="mt-4 space-y-3">
                      {fulfillmentPlan.components.map((component) => (
                        <div
                          key={component.key}
                          className="rounded-2xl border border-[var(--line)] px-4 py-3"
                        >
                          <div className="font-semibold">
                            {component.quantity}x {component.label}
                          </div>
                          <div className="mt-1 text-stone-600">{component.notes}</div>
                        </div>
                      ))}
                    </div>

                    {fulfillmentPlan.outstandingChecklist.length ? (
                      <>
                        <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                          Remaining launch checklist
                        </h4>
                        <div className="mt-3 space-y-3">
                          {fulfillmentPlan.outstandingChecklist.map((item) => (
                            <div
                              key={item}
                              className="rounded-2xl border border-[var(--line)] px-4 py-3"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}

                    {latestQuote ? (
                      <details className="mt-5 rounded-2xl border border-[var(--line)] px-4 py-3">
                        <summary className="cursor-pointer font-semibold">
                          Latest quote payload
                        </summary>
                        <pre className="mt-3 overflow-x-auto text-xs leading-6 text-stone-600">
                          {JSON.stringify(latestQuote.payloadJson, null, 2)}
                        </pre>
                      </details>
                    ) : null}

                    {vendorOrder ? (
                      <details className="mt-4 rounded-2xl border border-[var(--line)] px-4 py-3">
                        <summary className="cursor-pointer font-semibold">
                          Vendor payload
                        </summary>
                        <pre className="mt-3 overflow-x-auto text-xs leading-6 text-stone-600">
                          {JSON.stringify(vendorOrder.payloadJson, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
