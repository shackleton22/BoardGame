import { ProductTier } from "@prisma/client";

import { getProductRecipe } from "@/lib/catalog/game-kits";
import { hasTheGameCrafterConfig } from "@/lib/env";
import { getTemplateDefinition, type TemplateSlug } from "@/lib/templates/registry";

export type FulfillmentPlan = {
  templateSlug: TemplateSlug;
  recipeLabel: string;
  selectedProvider: "mock" | "the_game_crafter";
  recommendedProvider: "mock" | "the_game_crafter";
  supportedProviders: Array<"mock" | "the_game_crafter">;
  customerFacingSummary: string[];
  assemblySteps: string[];
  operationalNotes: string[];
  outstandingChecklist: string[];
  productionWindow: {
    minDays: number;
    maxDays: number;
    quoteTtlHours: number;
  };
  components: {
    key: string;
    label: string;
    quantity: number;
    notes: string;
  }[];
};

export function buildFulfillmentPlan(args: {
  templateSlug: TemplateSlug;
  productTier: ProductTier;
}) {
  const template = getTemplateDefinition(args.templateSlug);
  const recipe = getProductRecipe(args);

  if (!recipe) {
    throw new Error("No fulfillment recipe found for this product.");
  }

  const recommendedProvider =
    args.productTier === ProductTier.printed_board_cards ? "the_game_crafter" : "mock";
  const selectedProvider =
    recommendedProvider === "the_game_crafter" && hasTheGameCrafterConfig()
      ? "the_game_crafter"
      : "mock";

  return {
    templateSlug: args.templateSlug,
    recipeLabel: recipe.label,
    selectedProvider,
    recommendedProvider,
    supportedProviders: ["the_game_crafter", "mock"],
    customerFacingSummary: recipe.customerFacingSummary,
    assemblySteps: recipe.assemblySteps,
    operationalNotes: recipe.operationalNotes,
    outstandingChecklist:
      selectedProvider === "mock"
        ? [
            "The Game Crafter credentials or live SKUs are not fully configured yet.",
            ...recipe.outstandingChecklist,
          ]
        : recipe.outstandingChecklist,
    productionWindow: template.productionWindow,
    components: recipe.components,
  } satisfies FulfillmentPlan;
}
