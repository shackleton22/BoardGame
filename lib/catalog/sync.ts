import { ProductTier } from "@prisma/client";

import { db } from "@/lib/db";
import {
  buildTemplateSkuSeed,
  listTemplateDefinitions,
} from "@/lib/templates/registry";

let syncingPromise: Promise<void> | null = null;

async function syncCatalogDataInternal() {
  const templates = listTemplateDefinitions();

  for (const [index, template] of templates.entries()) {
    const record = await db.gameTemplate.upsert({
      where: { slug: template.slug },
      update: {
        name: template.name,
        description: template.description,
        shortDescription: template.shortDescription,
        status: template.status,
        sortOrder: index,
        metadataJson: {
          landingBadge: template.landingBadge,
          heroBullets: template.heroBullets,
          questionSummary: template.questionSummary,
          componentSetSummary: template.componentSetSummary,
          packoutChecklist: template.packoutChecklist,
          bomVersion: template.bomVersion,
        },
      },
      create: {
        slug: template.slug,
        name: template.name,
        description: template.description,
        shortDescription: template.shortDescription,
        status: template.status,
        sortOrder: index,
        metadataJson: {
          landingBadge: template.landingBadge,
          heroBullets: template.heroBullets,
          questionSummary: template.questionSummary,
          componentSetSummary: template.componentSetSummary,
          packoutChecklist: template.packoutChecklist,
          bomVersion: template.bomVersion,
        },
      },
    });

    for (const tier of template.tiers) {
      await db.templatePriceBook.upsert({
        where: {
          templateId_productTier: {
            templateId: record.id,
            productTier: tier.tier,
          },
        },
        update: {
          amount: tier.amount,
          active: tier.enabled,
          shippingNote:
            tier.tier === ProductTier.printed_board_cards
              ? "Live shipping quote required before checkout."
              : "Digital delivery after payment.",
          productionMinDays: template.productionWindow.minDays,
          productionMaxDays: template.productionWindow.maxDays,
          metadataJson: {
            label: tier.label,
            description: tier.description,
            badge: tier.badge,
          },
        },
        create: {
          templateId: record.id,
          productTier: tier.tier,
          amount: tier.amount,
          active: tier.enabled,
          shippingNote:
            tier.tier === ProductTier.printed_board_cards
              ? "Live shipping quote required before checkout."
              : "Digital delivery after payment.",
          productionMinDays: template.productionWindow.minDays,
          productionMaxDays: template.productionWindow.maxDays,
          metadataJson: {
            label: tier.label,
            description: tier.description,
            badge: tier.badge,
          },
        },
      });
    }

    for (const skuSeed of buildTemplateSkuSeed(template.slug)) {
      await db.vendorSkuMap.upsert({
        where: {
          templateId_provider_productTier_componentKey: {
            templateId: record.id,
            provider: skuSeed.provider,
            productTier: skuSeed.productTier,
            componentKey: skuSeed.componentKey,
          },
        },
        update: {
          componentLabel: skuSeed.componentLabel,
          quantity: skuSeed.quantity,
          sku: skuSeed.sku,
          active: true,
          metadataJson: skuSeed.metadataJson,
        },
        create: {
          templateId: record.id,
          provider: skuSeed.provider,
          productTier: skuSeed.productTier,
          componentKey: skuSeed.componentKey,
          componentLabel: skuSeed.componentLabel,
          quantity: skuSeed.quantity,
          sku: skuSeed.sku,
          active: true,
          metadataJson: skuSeed.metadataJson,
        },
      });
    }
  }
}

export async function syncCatalogData() {
  syncingPromise ??= syncCatalogDataInternal().finally(() => {
    syncingPromise = null;
  });

  return syncingPromise;
}
