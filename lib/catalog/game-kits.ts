import { ProductTier } from "@prisma/client";

import { getTemplateDefinition, type TemplateSlug } from "@/lib/templates/registry";

export type ProductRecipe = {
  templateSlug: TemplateSlug;
  productTier: ProductTier;
  label: string;
  includesPhysicalKit: boolean;
  sourcingStatus: "catalog_defined" | "vendor_validated" | "live";
  deliveryStatus: "digital_ready" | "manual_vendor_handoff" | "api_automated";
  customerFacingSummary: string[];
  assemblySteps: string[];
  operationalNotes: string[];
  outstandingChecklist: string[];
  components: {
    key: string;
    label: string;
    quantity: number;
    notes: string;
  }[];
};

export function getProductRecipe(args: {
  templateSlug: TemplateSlug;
  productTier: ProductTier;
}): ProductRecipe | undefined {
  const template = getTemplateDefinition(args.templateSlug);
  const tier = template.tiers.find((entry) => entry.tier === args.productTier);

  if (!tier) {
    return undefined;
  }

  if (args.productTier === ProductTier.digital_print_kit) {
    return {
      templateSlug: args.templateSlug,
      productTier: args.productTier,
      label: `${template.name} Digital Print Kit`,
      includesPhysicalKit: false,
      sourcingStatus: "live",
      deliveryStatus: "digital_ready",
      customerFacingSummary: [
        "Printable board PDF and PNG",
        `${template.deckLabels.primary} PDF sheets`,
        `${template.deckLabels.secondary} PDF sheets`,
        "Rules PDF",
      ],
      assemblySteps: [],
      operationalNotes: ["Digital delivery is generated and fulfilled automatically after payment."],
      outstandingChecklist: [],
      components: [],
    };
  }

  if (args.productTier !== ProductTier.printed_board_cards) {
    return undefined;
  }

  return {
    templateSlug: args.templateSlug,
    productTier: args.productTier,
    label: `${template.name} Retail-ready boxed game`,
    includesPhysicalKit: true,
    sourcingStatus: "catalog_defined",
    deliveryStatus: "manual_vendor_handoff",
    customerFacingSummary: template.componentSetSummary,
    assemblySteps: [
      "Generate the final customer print assets and vendor-ready manifest.",
      "Use the template-specific The Game Crafter SKU map to request a live shipping quote.",
      "After payment, submit the vendor order or fall back to manual review if vendor credentials or SKUs are incomplete.",
    ],
    operationalNotes: [
      "The product is treated as a fixed customizable game format with its own bill of materials.",
      "The boxed product is designed for a full-service manufacturer workflow rather than self-storage or hand assembly.",
    ],
    outstandingChecklist: [
      "Set the live The Game Crafter SKU env vars for this template.",
      "Run one successful physical production order using your real merchant account.",
      "Confirm production timing, shipping cost ranges, and packaging fit for this template.",
    ],
    components: template.vendorComponents.map((component) => ({
      key: component.componentKey,
      label: component.componentLabel,
      quantity: component.quantity,
      notes: component.notes,
    })),
  };
}

export function getRecipeReadinessLabel(recipe: ProductRecipe) {
  if (recipe.deliveryStatus === "api_automated") {
    return "live";
  }

  if (recipe.deliveryStatus === "digital_ready") {
    return "digital ready";
  }

  if (recipe.deliveryStatus === "manual_vendor_handoff") {
    return "manual vendor handoff";
  }

  return "in progress";
}
