import Link from "next/link";

import {
  ExampleProofGallery,
  FeaturedProofCard,
} from "@/components/shared/example-proof-gallery";
import { ExampleBoardImage } from "@/components/shared/example-board-image";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getLaunchConfig, isTemplateLaunchEnabled } from "@/lib/launch/config";
import { getTemplateMarketing } from "@/lib/marketing";
import {
  getTemplateExampleProofs,
  type TemplateExampleProof,
} from "@/lib/templates/example-proofs";
import { listTemplateDefinitions } from "@/lib/templates/registry";
import type { TemplateCatalogTier, TemplateSlug } from "@/lib/templates/types";
import { formatPrice } from "@/lib/utils";

type TemplateCardDefinition = {
  name: string;
  tiers: TemplateCatalogTier[];
};

export default function HomePage() {
  const launchConfig = getLaunchConfig();
  const templates = listTemplateDefinitions().filter((template) =>
    isTemplateLaunchEnabled(template.slug),
  );
  const examples = getTemplateExampleProofs();
  const featuredExample =
    examples.find((example) => example.slug === "milestone-trail") ?? examples[0];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="hero-section">
          <div className="page-shell grid items-center gap-10 py-12 lg:grid-cols-[0.94fr_1.06fr] lg:py-18">
            <div>
              <div className="launch-note">
                <span>{launchConfig.bannerCopy}</span>
                <span>US-only boxed launch</span>
              </div>

              <h1 className="heading-display mt-7 max-w-4xl text-5xl leading-[0.92] font-semibold text-stone-950 sm:text-7xl">
                A custom board game they&apos;ll actually want to play.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
                Pick a familiar game style, answer a short guided quiz, approve the proof,
                then download it or ship the boxed version with the board, cards, rules,
                and pieces included.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/#formats" className="cta-pill">
                  Create your game
                </Link>
                <Link href="/#examples" className="secondary-pill">
                  See examples
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["2-minute quiz", "Multiple-choice first"],
                  ["Editable proof", "Review before checkout"],
                  ["Boxed or digital", "No DIY sourcing"],
                ].map(([title, body]) => (
                  <div key={title} className="trust-chip">
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </div>
                ))}
              </div>
            </div>

            {featuredExample ? <FeaturedProofCard example={featuredExample} /> : null}
          </div>
        </section>

        <section className="page-shell py-12" id="formats">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-label">Choose a format</span>
            <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950 sm:text-5xl">
              Five gift-ready game styles
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Each format has its own questionnaire, proof renderer, card decks, box
              contents, pricing, and fulfillment recipe.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.slug}
                template={template}
                slug={template.slug}
                example={examples.find((example) => example.slug === template.slug)}
                productionEtaCopy={launchConfig.productionEtaCopy}
              />
            ))}
          </div>
        </section>

        <section className="page-shell py-8">
          <div className="process-panel">
            {[
              {
                step: "01",
                title: "Answer the quiz",
                body: "Choose people, places, jokes, categories, and tone. Add custom text only where it helps.",
              },
              {
                step: "02",
                title: "Approve the proof",
                body: "We generate the board, cards, and rules as editable real text, not unreliable text inside images.",
              },
              {
                step: "03",
                title: "Download or ship",
                body: "Digital kits unlock after payment. Boxed games route to a US manufacturer with sourced pieces.",
              },
            ].map((item) => (
              <div key={item.step} className="process-step">
                <div className="process-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <ExampleProofGallery examples={examples} />

        <section className="page-shell py-12">
          <div className="launch-ready-panel">
            <div>
              <span className="section-label">What ships</span>
              <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950">
                A finished game kit, not a printout and a prayer.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Printed board or digital board file",
                "Two personalized card decks",
                "Playable rules booklet",
                "Stock pieces, die, and tokens for boxed games",
                "Guest checkout and order lookup",
                launchConfig.supportPromiseCopy,
              ].map((item) => (
                <div key={item} className="spec-line">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function TemplateCard({
  template,
  slug,
  productionEtaCopy,
  example,
}: {
  template: TemplateCardDefinition;
  slug: TemplateSlug;
  productionEtaCopy: string;
  example?: TemplateExampleProof;
}) {
  const marketing = getTemplateMarketing(slug);
  const digital = template.tiers.find((tier) => tier.tier === "digital_print_kit");
  const physical = template.tiers.find((tier) => tier.tier === "printed_board_cards");

  return (
    <article className="format-card">
      <div className="mb-4 overflow-hidden rounded-[1.1rem] border border-[var(--line)] bg-white">
        {example ? (
          <ExampleBoardImage example={example} alt={`${template.name} exact example board`} />
        ) : null}
      </div>

      <div>
        <div className="format-eyebrow">{marketing.eyebrow}</div>
        <h3 className="heading-display mt-3 text-3xl font-semibold leading-none text-stone-950">
          {template.name}
        </h3>
        <p className="mt-3 text-sm leading-6 text-stone-600">{marketing.leadLine}</p>
      </div>

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

      <p className="mt-4 text-xs leading-5 text-stone-500">{productionEtaCopy}</p>

      <Link href={`/create/${slug}`} className="catalog-cta mt-5">
        Start
      </Link>
    </article>
  );
}
