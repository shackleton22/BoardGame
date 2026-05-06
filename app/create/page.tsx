import Link from "next/link";

import { ExampleBoardImage } from "@/components/shared/example-board-image";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getLaunchConfig, isTemplateLaunchEnabled } from "@/lib/launch/config";
import { getTemplateMarketing } from "@/lib/marketing";
import { getTemplateExampleProofs } from "@/lib/templates/example-proofs";
import { listTemplateDefinitions } from "@/lib/templates/registry";
import { formatPrice } from "@/lib/utils";

export default function CreatePage() {
  const launchConfig = getLaunchConfig();
  const templates = listTemplateDefinitions().filter((template) =>
    isTemplateLaunchEnabled(template.slug),
  );
  const examples = getTemplateExampleProofs();

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-label">Choose your format</span>
          <h1 className="heading-display mt-5 text-5xl leading-none font-semibold text-stone-950 sm:text-6xl">
            Pick the game style. We&apos;ll guide the rest.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-stone-600">
            Start with the format that fits the gift. Each quiz is multiple-choice
            first, then you can customize names and details where it matters.
          </p>
          <div className="launch-note mt-6 justify-center">
            <span>{launchConfig.bannerCopy}</span>
            <span>{launchConfig.shippingEtaCopy}</span>
          </div>
          <Link href="/#examples" className="secondary-pill mt-6">
            See sample proofs
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const marketing = getTemplateMarketing(template.slug);
            const digital = template.tiers.find((tier) => tier.tier === "digital_print_kit");
            const physical = template.tiers.find(
              (tier) => tier.tier === "printed_board_cards",
            );
            const example = examples.find((item) => item.slug === template.slug);

            return (
              <article key={template.slug} className="format-card">
                <div className="mb-4 overflow-hidden rounded-[1.1rem] border border-[var(--line)] bg-white">
                  {example ? (
                    <ExampleBoardImage
                      example={example}
                      alt={`${template.name} exact example board`}
                    />
                  ) : null}
                </div>

                <div className="format-eyebrow">
                  {marketing.eyebrow}
                </div>
                <h2 className="heading-display mt-3 text-3xl font-semibold leading-none text-stone-950">
                  {template.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">{marketing.leadLine}</p>

                <div className="mt-5 space-y-2">
                  {marketing.idealFor.slice(0, 3).map((item) => (
                    <span key={item} className="mini-pill">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="compact-price">
                    <span>Digital</span>
                    <strong>{digital ? formatPrice(digital.amount) : "-"}</strong>
                  </div>
                  <div className="compact-price">
                    <span>Boxed</span>
                    <strong>{physical ? formatPrice(physical.amount) : "-"}</strong>
                  </div>
                </div>

                <Link
                  href={`/create/${template.slug}`}
                  className="catalog-cta mt-7"
                >
                  Start {template.name}
                </Link>
              </article>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
