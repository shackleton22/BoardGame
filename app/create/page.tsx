import Link from "next/link";
import { ProductTier } from "@prisma/client";

import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getProductRecipe, getRecipeReadinessLabel } from "@/lib/catalog/game-kits";
import { listTemplateDefinitions } from "@/lib/templates/registry";
import { formatPrice } from "@/lib/utils";

export default function CreatePage() {
  const templates = listTemplateDefinitions();

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-16">
        <div className="max-w-3xl">
          <span className="section-label">Choose a template</span>
          <h1 className="heading-display mt-5 text-6xl font-semibold text-stone-950">
            Start with the format that fits the story
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            Each launch template has its own questionnaire, price book, component set, and
            vendor routing so the customer experience stays polished instead of generic.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {templates.map((template) => {
            const physicalRecipe = getProductRecipe({
              templateSlug: template.slug,
              productTier: ProductTier.printed_board_cards,
            });
            const digital = template.tiers.find((tier) => tier.tier === "digital_print_kit");
            const physical = template.tiers.find(
              (tier) => tier.tier === "printed_board_cards",
            );

            return (
              <div key={template.slug} className="glass-panel rounded-[2rem] p-8">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="heading-display text-4xl font-semibold">{template.name}</h2>
                  <span className="rounded-full bg-stone-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
                    {template.status === "available" ? "Available now" : "Coming soon"}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-600">{template.description}</p>
                <div className="mt-6 space-y-3">
                  {template.heroBullets.map((feature) => (
                    <div
                      key={feature}
                      className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-stone-700"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      Digital
                    </div>
                    <div className="mt-2 text-lg font-semibold text-stone-900">
                      {digital ? formatPrice(digital.amount) : "—"}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      Boxed
                    </div>
                    <div className="mt-2 text-lg font-semibold text-stone-900">
                      {physical ? formatPrice(physical.amount) : "—"}
                    </div>
                  </div>
                </div>
                {physicalRecipe ? (
                  <div className="mt-6 rounded-[1.6rem] bg-white p-5 text-sm text-stone-700">
                    <div className="font-semibold">Physical readiness</div>
                    <div className="mt-2">
                      {getRecipeReadinessLabel(physicalRecipe)} · {template.componentSetSummary.join(", ")}
                    </div>
                  </div>
                ) : null}
                <Link
                  href={`/create/${template.slug}`}
                  className="mt-8 inline-flex rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Start {template.name}
                </Link>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
