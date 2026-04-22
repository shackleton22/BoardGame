import { notFound } from "next/navigation";

import { PreviewEditor } from "@/components/preview/preview-editor";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getProjectById } from "@/lib/projects";
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

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-14">
        <PreviewEditor
          projectId={project.id}
          templateSlug={project.templateSlug as "life-quest" | "mystery-night" | "inside-joke-showdown"}
          input={project.inputJson as ProjectCreateInput}
          output={project.outputJson as ProjectOutputPayload}
          regenerationCount={project.previewRegenerationCount}
          shippingQuotes={project.shippingQuotes}
          latestOrder={project.orders[0] ?? null}
        />
      </main>
      <SiteFooter />
    </>
  );
}
