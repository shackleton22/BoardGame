import {
  FulfillmentStatus,
  Prisma,
  ProjectStatus,
  type GeneratedAsset,
  type Project,
} from "@prisma/client";

import { syncCatalogData } from "@/lib/catalog/sync";
import { db } from "@/lib/db";
import { generateBoardArtwork } from "@/lib/ai/generateBoardArtwork";
import { sendTransactionalEmail } from "@/lib/email";
import { submitMockFulfillment } from "@/lib/fulfillment/mockProvider";
import { buildFulfillmentPlan } from "@/lib/fulfillment/plan";
import {
  assertProductTierLaunchEnabled,
  assertTemplateLaunchEnabled,
} from "@/lib/launch/config";
import {
  createLocalPreviewProject,
  getLocalPreviewProject,
  regenerateLocalPreviewProject,
  updateLocalPreviewProjectOutput,
} from "@/lib/local-preview-store";
import { captureServerError } from "@/lib/monitoring";
import { recordOperationalEvent } from "@/lib/operations";
import { generateFinalAssets, generatePreviewAssets } from "@/lib/render/assets";
import { createFulfillmentManifest } from "@/lib/render/fulfillmentManifest";
import {
  getTemplateDefinition,
  type TemplateSlug,
} from "@/lib/templates/registry";
import {
  projectCreateSchema,
  projectOutputEditSchema,
  type ProjectCreateInput,
} from "@/lib/validation/project";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function getTemplateRecord(slug: TemplateSlug) {
  await syncCatalogData();
  const template = await db.gameTemplate.findUnique({
    where: { slug },
  });

  if (!template) {
    throw new Error(`Template ${slug} is not available.`);
  }

  return template;
}

export async function createProject(rawInput: unknown) {
  const input = projectCreateSchema.parse(rawInput) as ProjectCreateInput;
  assertTemplateLaunchEnabled(input.templateSlug);
  assertProductTierLaunchEnabled(input.productTier);

  const template = getTemplateDefinition(input.templateSlug);

  if (!hasDatabaseUrl()) {
    const { output, source } = await template.generateContent(input as never);
    const localProject = await createLocalPreviewProject({ input, output, source });

    if (output.artPrompt) {
      await generateBoardArtwork({
        projectId: localProject.id,
        prompt: output.artPrompt,
        templateSlug: input.templateSlug,
        recipientName: input.recipientName,
        occasion: input.occasion,
        output,
        inputJson: input,
      });
    }

    return localProject;
  }

  const templateRecord = await getTemplateRecord(input.templateSlug);

  const project = await db.project.create({
    data: {
      templateId: templateRecord.id,
      templateSlug: input.templateSlug,
      status: ProjectStatus.generating,
      recipientName: input.recipientName,
      buyerName: input.buyerName,
      occasion: input.occasion,
      tone: input.tone,
      relationship: input.relationship,
      visualStyle: input.visualStyle,
      colorMood: input.colorMood,
      titleOverride: input.titleOverride,
      subtitleOverride: input.subtitleOverride,
      avoidNotes: input.avoidNotes,
      productTier: input.productTier,
      shippingJson: input.shipping ?? undefined,
      inputJson: input,
      items: {
        create: template.buildProjectItems(input as never),
      },
    },
  });

  try {
    const { output, source } = await template.generateContent(input as never);

    const updatedProject = await db.project.update({
      where: { id: project.id },
      data: {
        status: ProjectStatus.preview_ready,
        outputJson: {
          ...output,
          generationSource: source,
        },
        errorMessage: null,
      },
    });

    await generatePreviewAssets({
      id: updatedProject.id,
      templateSlug: updatedProject.templateSlug as TemplateSlug,
      recipientName: updatedProject.recipientName,
      occasion: updatedProject.occasion,
      visualStyle: updatedProject.visualStyle,
      colorMood: updatedProject.colorMood,
      inputJson: updatedProject.inputJson,
      outputJson: updatedProject.outputJson,
    });

    await recordOperationalEvent({
      projectId: project.id,
      scope: "project",
      eventType: "preview_ready",
      message: "Preview generated successfully.",
      metadata: {
        templateSlug: project.templateSlug,
        generationSource: source,
      },
    });

    const customerEmail = input.customerEmail || undefined;

    if (customerEmail) {
      await sendTransactionalEmail({
        template: "preview_created",
        to: customerEmail,
        payload: {
          templateName: template.name,
          previewUrl: `/preview/${project.id}`,
        },
      });
    }

    return updatedProject;
  } catch (error) {
    await captureServerError(error, {
      projectId: project.id,
      templateSlug: project.templateSlug,
      stage: "create_project",
    });
    await db.project.update({
      where: { id: project.id },
      data: {
        status: ProjectStatus.failed,
        errorMessage:
          error instanceof Error ? error.message : "Preview generation failed.",
      },
    });

    await recordOperationalEvent({
      projectId: project.id,
      scope: "project",
      eventType: "preview_failed",
      message: error instanceof Error ? error.message : "Preview generation failed.",
    });

    throw error;
  }
}

export async function getProjectById(projectId: string) {
  if (!hasDatabaseUrl()) {
    return getLocalPreviewProject(projectId);
  }

  return db.project.findUnique({
    where: { id: projectId },
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
}

export async function updateProjectOutput(projectId: string, rawInput: unknown) {
  if (!hasDatabaseUrl()) {
    const nextOutput = projectOutputEditSchema.parse(rawInput);
    return updateLocalPreviewProjectOutput(projectId, nextOutput);
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      orders: {
        where: {
          status: "paid",
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (
    project.orders.length > 0 ||
    ["paid", "asset_ready", "fulfilled"].includes(project.status)
  ) {
    throw new Error("This proof is locked after checkout.");
  }

  const nextOutput = projectOutputEditSchema.parse(rawInput);

  const updated = await db.project.update({
    where: { id: projectId },
    data: {
      outputJson: {
        ...(project.outputJson as object),
        ...nextOutput,
      },
      status:
        project.status === ProjectStatus.failed
          ? ProjectStatus.preview_ready
          : project.status,
      errorMessage: null,
    },
  });

  await generatePreviewAssets({
    id: updated.id,
    templateSlug: updated.templateSlug as TemplateSlug,
    recipientName: updated.recipientName,
    occasion: updated.occasion,
    visualStyle: updated.visualStyle,
    colorMood: updated.colorMood,
    inputJson: updated.inputJson,
    outputJson: updated.outputJson,
  });

  await recordOperationalEvent({
    projectId,
    scope: "project",
    eventType: "preview_edited",
    message: "Preview copy saved.",
  });

  return updated;
}

export async function regenerateProjectOutput(projectId: string) {
  if (!hasDatabaseUrl()) {
    const project = await getLocalPreviewProject(projectId);

    if (!project) {
      throw new Error("Project not found.");
    }

    if (project.previewRegenerationCount >= 1) {
      throw new Error("This preview has already been regenerated once.");
    }

    const template = getTemplateDefinition(project.templateSlug as TemplateSlug);
    const input = template.parseInput(project.inputJson);
    const { output, source } = await template.generateContent(input as never);

    return regenerateLocalPreviewProject({ projectId, output, source });
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      orders: {
        where: {
          status: "paid",
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (
    project.orders.length > 0 ||
    ["paid", "asset_ready", "fulfilled"].includes(project.status)
  ) {
    throw new Error("This proof is locked after checkout.");
  }

  if (project.previewRegenerationCount >= 1) {
    throw new Error("This preview has already been regenerated once.");
  }

  const template = getTemplateDefinition(project.templateSlug as TemplateSlug);
  const input = template.parseInput(project.inputJson);
  const { output, source } = await template.generateContent(input as never);

  const updated = await db.project.update({
    where: { id: projectId },
    data: {
      outputJson: {
        ...output,
        generationSource: source,
      },
      previewRegenerationCount: {
        increment: 1,
      },
      status: ProjectStatus.preview_ready,
      errorMessage: null,
    },
  });

  await generatePreviewAssets({
    id: updated.id,
    templateSlug: updated.templateSlug as TemplateSlug,
    recipientName: updated.recipientName,
    occasion: updated.occasion,
    visualStyle: updated.visualStyle,
    colorMood: updated.colorMood,
    inputJson: updated.inputJson,
    outputJson: updated.outputJson,
    forceRegenerateArtwork: true,
  });

  await recordOperationalEvent({
    projectId,
    scope: "project",
    eventType: "preview_regenerated",
    message: "Preview regenerated.",
    metadata: { generationSource: source },
  });

  return updated;
}

export async function ensureFinalAssets(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const existingAssets = await db.generatedAsset.findMany({
    where: { projectId },
  });

  const hasAllFinalAssets = [
    "board_final_png",
    "board_final_pdf",
    "deck_primary_pdf",
    "deck_secondary_pdf",
    "rules_pdf",
  ].every((type) => existingAssets.some((asset) => asset.type === type));

  if (!hasAllFinalAssets) {
    return generateFinalAssets(project as Project & { templateSlug: string });
  }

  return existingAssets;
}

export async function createManualFulfillment(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      project: true,
      shippingQuote: true,
      fulfillmentJobs: true,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.fulfillmentJobs.some((job) => job.provider === "mock")) {
    return order.fulfillmentJobs[0];
  }

  const assets = await db.generatedAsset.findMany({
    where: { projectId: order.projectId },
  });
  const fulfillmentPlan = buildFulfillmentPlan({
    templateSlug: order.templateSlug as TemplateSlug,
    productTier: order.productTier,
  });
  const fulfillmentManifest = await createFulfillmentManifest({
    projectId: order.projectId,
    templateSlug: order.templateSlug,
    recipientName: order.project.recipientName,
    orderNumber: order.publicOrderNumber,
    plan: fulfillmentPlan,
    assetUrls: {
      boardPdfUrl:
        assets.find((asset) => asset.type === "board_final_pdf")?.url ?? undefined,
      boardPngUrl:
        assets.find((asset) => asset.type === "board_final_png")?.url ?? undefined,
      deckPrimaryPdfUrl:
        assets.find((asset) => asset.type === "deck_primary_pdf")?.url ?? undefined,
      deckSecondaryPdfUrl:
        assets.find((asset) => asset.type === "deck_secondary_pdf")?.url ?? undefined,
      rulesPdfUrl: assets.find((asset) => asset.type === "rules_pdf")?.url ?? undefined,
    },
  });

  const result = await submitMockFulfillment({
    orderId: order.id,
    publicOrderNumber: order.publicOrderNumber,
    projectId: order.projectId,
    recipientName: order.project.recipientName,
    productTier: order.productTier,
    templateSlug: order.templateSlug as TemplateSlug,
    shipping: (order.project.shippingJson as Record<string, unknown> | null) as never,
    shippingQuote: order.shippingQuote
      ? {
          providerCartId: order.shippingQuote.providerCartId ?? undefined,
          shippingMethod: order.shippingQuote.shippingMethod,
          shippingLabel: order.shippingQuote.shippingLabel,
          amount: order.shippingQuote.amount,
          currency: order.shippingQuote.currency,
          payload: (order.shippingQuote.payloadJson as Record<string, unknown>) ?? {},
        }
      : null,
    email: order.email ?? undefined,
    assets: {
      boardPdfUrl: assets.find((asset) => asset.type === "board_final_pdf")?.url ?? undefined,
      boardPngUrl: assets.find((asset) => asset.type === "board_final_png")?.url ?? undefined,
      deckPrimaryPdfUrl:
        assets.find((asset) => asset.type === "deck_primary_pdf")?.url ?? undefined,
      deckSecondaryPdfUrl:
        assets.find((asset) => asset.type === "deck_secondary_pdf")?.url ?? undefined,
      rulesPdfUrl: assets.find((asset) => asset.type === "rules_pdf")?.url ?? undefined,
      fulfillmentManifestUrl: fulfillmentManifest.publicUrl,
    },
    fulfillmentPlan,
  });

  const job = await db.fulfillmentJob.create({
    data: {
      orderId: order.id,
      provider: "mock",
      status: result.status as FulfillmentStatus,
      payloadJson: result.payload as Prisma.InputJsonValue,
      responseJson: result.response as Prisma.InputJsonValue | undefined,
    },
  });

  await recordOperationalEvent({
    orderId: order.id,
    projectId: order.projectId,
    scope: "fulfillment",
    eventType: "mock_fulfillment_created",
    message: "Mock fulfillment job created.",
  });

  return job;
}

export function getDisplayStatus(project: {
  status: Project["status"];
  orders: {
    status: string;
    fulfillmentJobs: { status: FulfillmentStatus }[];
    vendorOrder?: {
      status: string;
      shipments: { status: string }[];
    } | null;
  }[];
}) {
  const fulfillmentStatuses = project.orders.flatMap((order) =>
    order.fulfillmentJobs.map((job) => job.status),
  );

  if (
    project.status === ProjectStatus.failed ||
    project.orders.some((order) => order.status === "failed") ||
    fulfillmentStatuses.includes(FulfillmentStatus.failed)
  ) {
    return "failed";
  }

  if (fulfillmentStatuses.includes(FulfillmentStatus.manual_review)) {
    return "manual_review";
  }

  if (
    project.orders.some((order) => order.vendorOrder?.status === "shipped") ||
    project.orders.some((order) =>
      order.vendorOrder?.shipments.some((shipment) => shipment.status === "in_transit"),
    )
  ) {
    return "fulfilled";
  }

  if (
    project.status === ProjectStatus.fulfilled ||
    fulfillmentStatuses.includes(FulfillmentStatus.shipped) ||
    fulfillmentStatuses.includes(FulfillmentStatus.submitted)
  ) {
    return "fulfilled";
  }

  if (
    project.status === ProjectStatus.asset_ready ||
    project.status === ProjectStatus.paid ||
    project.orders.some((order) => order.status === "paid")
  ) {
    return "paid";
  }

  return project.status;
}

export type ProjectWithRelations = Awaited<ReturnType<typeof getProjectById>>;
export type ProjectRecord = NonNullable<ProjectWithRelations>;
export type ProjectAsset = GeneratedAsset;
export type ProjectInputPayload = ProjectCreateInput;
