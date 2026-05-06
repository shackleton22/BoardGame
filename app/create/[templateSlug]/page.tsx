import Link from "next/link";
import { ProductTier } from "@prisma/client";
import { notFound } from "next/navigation";

import { FaceCardWizard } from "@/components/create/face-card-wizard";
import { HomeTurfWizard } from "@/components/create/home-turf-wizard";
import { InsideJokeShowdownWizard } from "@/components/create/inside-joke-showdown-wizard";
import { LifeQuestWizard } from "@/components/create/life-quest-wizard";
import { MysteryNightWizard } from "@/components/create/mystery-night-wizard";
import { APP_NAME } from "@/lib/constants";
import { getLaunchConfig, isTemplateLaunchEnabled } from "@/lib/launch/config";
import { getTemplateMarketing } from "@/lib/marketing";
import { getTemplateDefinition, type TemplateSlug } from "@/lib/templates/registry";
import { formatPrice } from "@/lib/utils";

const WIZARDS = {
  "home-turf": HomeTurfWizard,
  "milestone-trail": LifeQuestWizard,
  "face-card": FaceCardWizard,
  "case-file": MysteryNightWizard,
  "trivia-trek": InsideJokeShowdownWizard,
} as const;

export default async function TemplateCreatePage({
  params,
}: {
  params: Promise<{ templateSlug: TemplateSlug }>;
}) {
  const { templateSlug } = await params;
  const wizardKey = templateSlug as keyof typeof WIZARDS;
  const template = WIZARDS[wizardKey] ? getTemplateDefinition(templateSlug) : null;
  const launchConfig = getLaunchConfig();

  if (!template || !isTemplateLaunchEnabled(templateSlug)) {
    notFound();
  }

  const Wizard = WIZARDS[wizardKey];
  const digital = template.tiers.find((tier) => tier.tier === ProductTier.digital_print_kit);
  const physical = template.tiers.find(
    (tier) => tier.tier === ProductTier.printed_board_cards,
  );
  const marketing = getTemplateMarketing(template.slug);

  return (
    <main className="page-shell flex-1 py-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="brand-mark h-11 w-11 text-[0.72rem]">
              <span>GG</span>
            </div>
            <div>
              <div className="heading-display text-xl font-semibold text-stone-950">{APP_NAME}</div>
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Custom board-game gifts
              </div>
            </div>
          </Link>

          <Link href="/#formats" className="text-sm font-semibold text-stone-600 hover:text-stone-950">
            Change format
          </Link>
        </div>

        <div className="mt-10">
          <span className="section-label">{marketing.eyebrow}</span>
          <h1 className="heading-display mt-5 text-5xl font-semibold text-stone-950 sm:text-6xl">
            {template.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">{marketing.leadLine}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="price-chip">
            <span>Digital</span>
            <strong>{digital ? formatPrice(digital.amount) : "-"}</strong>
          </div>
          <div className="price-chip">
            <span>Boxed</span>
            <strong>{physical ? formatPrice(physical.amount) : "-"}</strong>
          </div>
          <div className="price-chip min-w-[14rem]">
            <span>Flow</span>
            <strong className="text-base">5 quick steps</strong>
          </div>
        </div>
        <div className="launch-note mt-5">
          <span>{launchConfig.productionEtaCopy}</span>
          <span>{launchConfig.supportPromiseCopy}</span>
        </div>

        <div className="mt-8">
          <Wizard
            physicalCheckoutEnabled={launchConfig.physicalCheckoutEnabled}
            physicalDisabledMessage={launchConfig.physicalDisabledMessage}
          />
        </div>
      </div>
    </main>
  );
}
