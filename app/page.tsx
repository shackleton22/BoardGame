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
                <span>Digital from $39 | Boxed from $79</span>
              </div>

              <h1 className="heading-display mt-7 max-w-4xl text-5xl leading-[0.92] font-semibold text-stone-950 sm:text-7xl">
                Turn their people, places, and inside jokes into a real board game.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
                Choose a game style, answer a playful quiz, and get an editable proof
                with the board, cards, and rules already written for them. Download the
                print kit or ship a boxed game with sourced pieces included.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/#formats" className="cta-pill">
                  Choose a game style
                </Link>
                <Link href="/#examples" className="secondary-pill">
                  See sample boards
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["Fun quiz", "Mostly multiple choice"],
                  ["Proof first", "Edit before checkout"],
                  ["Ready to play", "Board, cards, rules, pieces"],
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
            <span className="section-label">Start here</span>
            <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950 sm:text-5xl">
              Pick the game that fits their story
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Every format has its own quiz, sample proof, card decks, box contents,
              and price. Start with the closest fit; we handle the custom copy and files.
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
                title: "Take the quick quiz",
                body: "Pick the people, places, jokes, and tone. Type only the details that make the gift feel personal.",
              },
              {
                step: "02",
                title: "Review the proof",
                body: "See the board, cards, and rules before payment. All important words are editable real text.",
              },
              {
                step: "03",
                title: "Download or ship it",
                body: "Digital files unlock after checkout. Boxed games are produced in the US with pieces included.",
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
              <span className="section-label">What they receive</span>
              <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950">
                Everything needed to open the box and play.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">
                No hunting for dice, pawns, card sleeves, or instructions. The boxed
                tier is designed as a complete gift, not a craft project.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Custom board art and editable text",
                "Two personalized card decks",
                "Clear rules booklet for 2-6 players",
                "Stock pieces, die, and tokens in boxed games",
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
        Customize {template.name}
      </Link>
    </article>
  );
}
