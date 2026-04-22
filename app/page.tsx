import Link from "next/link";

import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { listTemplateDefinitions } from "@/lib/templates/registry";
import { formatPrice } from "@/lib/utils";

export default function HomePage() {
  const templates = listTemplateDefinitions();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="page-shell grid gap-12 py-16 lg:grid-cols-[1.04fr_0.96fr] lg:py-24">
          <div className="space-y-8">
            <span className="section-label">US-only launch · Ships from a US manufacturer</span>
            <div className="space-y-6">
              <h1 className="heading-display max-w-4xl text-6xl leading-none font-semibold text-stone-950 sm:text-7xl">
                Turn your life, relationship, family, or friend group into a custom board
                game.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-600">
                GameGift Studio turns memories, milestones, and inside jokes into premium,
                giftable board games with editable previews, digital downloads, and boxed
                physical delivery.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/create"
                className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(202,111,75,0.22)]"
              >
                Create your game
              </Link>
              <Link
                href="/order/lookup"
                className="rounded-full border border-[var(--brand-strong)] px-6 py-3 text-sm font-semibold text-[var(--brand-strong)]"
              >
                Look up an order
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Tell us about the recipient"],
                ["2", "Preview and fine-tune your custom game"],
                ["3", "Download it or ship the boxed version"],
              ].map(([step, label]) => (
                <div key={step} className="glass-panel rounded-[1.7rem] p-5">
                  <div className="heading-display text-4xl font-semibold text-[var(--brand)]">
                    {step}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="gradient-border rounded-[2.2rem]">
            <div className="soft-grid glass-panel relative overflow-hidden rounded-[2.2rem] p-8">
              <div className="absolute -top-16 right-0 h-40 w-40 rounded-full bg-[rgba(232,200,137,0.45)] blur-3xl" />
              <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[rgba(38,70,83,0.18)] blur-3xl" />
              <div className="relative space-y-5">
                {templates.map((template) => (
                  <div
                    key={template.slug}
                    className="rounded-[1.8rem] border border-[rgba(38,70,83,0.12)] bg-[rgba(255,255,255,0.88)] p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                          {template.landingBadge}
                        </div>
                        <h2 className="heading-display mt-2 text-3xl font-semibold text-stone-950">
                          {template.name}
                        </h2>
                      </div>
                      <Link
                        href={`/create/${template.slug}`}
                        className="rounded-full bg-[var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Customize
                      </Link>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-600">
                      {template.shortDescription}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {template.heroBullets.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-stone-600"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-8">
          <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="section-label">Launch catalog</span>
                <h2 className="heading-display mt-4 text-4xl font-semibold">
                  Three customizable templates, two sellable tiers
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-7 text-stone-600">
                Launch pricing is before shipping and tax. Physical orders collect a live
                shipping quote before checkout and route through The Game Crafter.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white">
              <div className="grid grid-cols-[1.2fr,0.8fr,0.8fr] border-b border-[var(--line)] bg-stone-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                <div>Template</div>
                <div>Digital</div>
                <div>Boxed physical</div>
              </div>
              {templates.map((template) => {
                const digital = template.tiers.find((tier) => tier.tier === "digital_print_kit");
                const physical = template.tiers.find(
                  (tier) => tier.tier === "printed_board_cards",
                );

                return (
                  <div
                    key={template.slug}
                    className="grid grid-cols-[1.2fr,0.8fr,0.8fr] gap-4 border-b border-[var(--line)] px-6 py-5 text-sm text-stone-700 last:border-b-0"
                  >
                    <div>
                      <div className="heading-display text-2xl font-semibold text-stone-950">
                        {template.name}
                      </div>
                      <p className="mt-2 max-w-md leading-7 text-stone-600">
                        {template.description}
                      </p>
                    </div>
                    <div className="font-semibold text-stone-900">
                      {digital ? formatPrice(digital.amount) : "—"}
                    </div>
                    <div className="font-semibold text-stone-900">
                      {physical ? formatPrice(physical.amount) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="page-shell py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Guest checkout",
                body: "No account required. Create, preview, edit, and buy in one flow.",
              },
              {
                title: "Deterministic print files",
                body: "All visible titles, card copy, labels, and rules are rendered as real text for clean print output.",
              },
              {
                title: "Original game formats",
                body: "Every template is built to feel premium and distinct without cloning protected board-game brands or trade dress.",
              },
            ].map((card) => (
              <div key={card.title} className="glass-panel rounded-[1.8rem] p-6">
                <h3 className="heading-display text-3xl font-semibold">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-stone-600">{card.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
