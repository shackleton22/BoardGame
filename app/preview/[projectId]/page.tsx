import { notFound } from "next/navigation";

import { PreviewEditor } from "@/components/preview/preview-editor";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getExistingBoardArtwork } from "@/lib/ai/generateBoardArtwork";
import { getProductRecipe, getRecipeReadinessLabel } from "@/lib/catalog/game-kits";
import { getLaunchConfig } from "@/lib/launch/config";
import { getProjectById } from "@/lib/projects";
import type { TemplateSlug } from "@/lib/templates/types";
import type { ProjectCreateInput, ProjectOutputPayload } from "@/lib/validation/project";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project || !project.outputJson) {
    notFound();
  }

  const launchConfig = getLaunchConfig();
  const physicalRecipe = getProductRecipe({
    templateSlug: project.templateSlug as TemplateSlug,
    productTier: project.productTier,
  });
  const existingArtwork = await getExistingBoardArtwork(project.id);

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-14">
        <PreviewEditor
          projectId={project.id}
          templateSlug={project.templateSlug as TemplateSlug}
          input={project.inputJson as ProjectCreateInput}
          output={project.outputJson as ProjectOutputPayload}
          backgroundArtUrl={existingArtwork?.publicUrl}
          regenerationCount={project.previewRegenerationCount}
          shippingQuotes={project.shippingQuotes}
          latestOrder={project.orders[0] ?? null}
          boxContents={physicalRecipe?.customerFacingSummary ?? []}
          bomVersion={physicalRecipe?.bomVersion}
          recipeReadiness={physicalRecipe ? getRecipeReadinessLabel(physicalRecipe) : undefined}
          physicalCheckoutEnabled={launchConfig.physicalCheckoutEnabled}
          physicalDisabledMessage={launchConfig.physicalDisabledMessage}
          productionEtaCopy={launchConfig.productionEtaCopy}
          shippingEtaCopy={launchConfig.shippingEtaCopy}
        />
      </main>
      <SiteFooter />
    </>
  );
}
