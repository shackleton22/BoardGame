import { notFound } from "next/navigation";

import { InsideJokeShowdownWizard } from "@/components/create/inside-joke-showdown-wizard";
import { LifeQuestWizard } from "@/components/create/life-quest-wizard";
import { MysteryNightWizard } from "@/components/create/mystery-night-wizard";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getTemplateDefinition, type TemplateSlug } from "@/lib/templates/registry";

const WIZARDS = {
  "life-quest": LifeQuestWizard,
  "mystery-night": MysteryNightWizard,
  "inside-joke-showdown": InsideJokeShowdownWizard,
} as const;

export default async function TemplateCreatePage({
  params,
}: {
  params: Promise<{ templateSlug: TemplateSlug }>;
}) {
  const { templateSlug } = await params;
  const wizardKey = templateSlug as keyof typeof WIZARDS;
  const template = WIZARDS[wizardKey] ? getTemplateDefinition(templateSlug) : null;

  if (!template) {
    notFound();
  }

  const Wizard = WIZARDS[wizardKey];

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-16">
        <div className="max-w-4xl">
          <span className="section-label">{template.name}</span>
          <h1 className="heading-display mt-5 text-6xl font-semibold text-stone-950">
            Build a premium personalized board-game gift
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">{template.description}</p>
        </div>
        <div className="mt-12">
          <Wizard />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
