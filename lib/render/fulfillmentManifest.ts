import { GeneratedAssetStatus, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { GENERATED_ASSET_TYPES } from "@/lib/render/assets";
import { storeGeneratedFile } from "@/lib/storage";
import type { FulfillmentPlan } from "@/lib/fulfillment/plan";

export async function createFulfillmentManifest(args: {
  projectId: string;
  templateSlug: string;
  recipientName: string;
  orderNumber?: string;
  plan: FulfillmentPlan;
  assetUrls?: Record<string, string | undefined>;
}) {
  const content = Buffer.from(
    JSON.stringify(
      {
        projectId: args.projectId,
        templateSlug: args.templateSlug,
        recipientName: args.recipientName,
        orderNumber: args.orderNumber,
        recipeLabel: args.plan.recipeLabel,
        bomVersion: args.plan.bomVersion,
        selectedProvider: args.plan.selectedProvider,
        productionWindow: args.plan.productionWindow,
        customerFacingSummary: args.plan.customerFacingSummary,
        assemblySteps: args.plan.assemblySteps,
        packoutChecklist: args.plan.packoutChecklist,
        components: args.plan.components,
        assetUrls: args.assetUrls ?? {},
      },
      null,
      2,
    ),
  );

  const stored = await storeGeneratedFile({
    projectId: args.projectId,
    fileName: "fulfillment_manifest.json",
    content,
  });

  await db.generatedAsset.upsert({
    where: {
      projectId_type: {
        projectId: args.projectId,
        type: GENERATED_ASSET_TYPES.fulfillmentManifestJson,
      },
    },
    update: {
      label: "Fulfillment manifest",
      fileName: "fulfillment_manifest.json",
      url: stored.publicUrl,
      storageKey: stored.storageKey,
      mimeType: "application/json",
      status: GeneratedAssetStatus.ready,
      metadataJson: {
        templateSlug: args.templateSlug,
        selectedProvider: args.plan.selectedProvider,
      } as Prisma.InputJsonValue,
    },
    create: {
      projectId: args.projectId,
      type: GENERATED_ASSET_TYPES.fulfillmentManifestJson,
      label: "Fulfillment manifest",
      fileName: "fulfillment_manifest.json",
      url: stored.publicUrl,
      storageKey: stored.storageKey,
      mimeType: "application/json",
      status: GeneratedAssetStatus.ready,
      metadataJson: {
        templateSlug: args.templateSlug,
        selectedProvider: args.plan.selectedProvider,
      } as Prisma.InputJsonValue,
    },
  });

  return stored;
}
