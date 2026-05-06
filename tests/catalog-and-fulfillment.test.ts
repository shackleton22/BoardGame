import { afterEach, describe, expect, test } from "vitest";
import { ProductTier } from "@prisma/client";

import { buildFulfillmentPlan } from "@/lib/fulfillment/plan";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { getProductRecipe } from "@/lib/catalog/game-kits";
import {
  assertProductTierLaunchEnabled,
  getLaunchConfig,
  isTemplateLaunchEnabled,
} from "@/lib/launch/config";
import { getTemplateExampleProofs } from "@/lib/templates/example-proofs";
import { getTemplateDefinition, listTemplateDefinitions } from "@/lib/templates/registry";
import { generatedGameOutputSchema } from "@/lib/validation/project";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("catalog and fulfillment selection", () => {
  test("launch catalog exposes the five planned templates", () => {
    expect(getTemplateDefinition("home-turf").name).toBe("Home Turf");
    expect(getTemplateDefinition("milestone-trail").name).toBe("Milestone Trail");
    expect(getTemplateDefinition("face-card").name).toBe("Face Card");
    expect(getTemplateDefinition("case-file").name).toBe("Case File");
    expect(getTemplateDefinition("trivia-trek").name).toBe("Trivia Trek");
  });

  test("every launch template has usable example output and a complete boxed kit", () => {
    const examples = getTemplateExampleProofs();

    expect(examples.map((example) => example.slug)).toEqual([
      "home-turf",
      "milestone-trail",
      "face-card",
      "case-file",
      "trivia-trek",
    ]);

    for (const template of listTemplateDefinitions()) {
      const example = examples.find((item) => item.slug === template.slug);
      const digitalTier = template.tiers.find(
        (tier) => tier.tier === ProductTier.digital_print_kit,
      );
      const boxedTier = template.tiers.find(
        (tier) => tier.tier === ProductTier.printed_board_cards,
      );
      const premiumTier = template.tiers.find(
        (tier) => tier.tier === ProductTier.premium_gift_box,
      );
      const recipe = getProductRecipe({
        templateSlug: template.slug,
        productTier: ProductTier.printed_board_cards,
      });

      expect(example).toBeDefined();
      expect(generatedGameOutputSchema.parse(example?.output).tiles).toHaveLength(32);
      expect(example?.showcaseSvg).toContain("<svg");
      expect(example?.showcaseSvg.length).toBeGreaterThan(8000);
      expect(digitalTier?.enabled).toBe(true);
      expect(boxedTier?.enabled).toBe(true);
      expect(premiumTier?.enabled).toBe(false);
      expect(recipe?.customerFacingSummary.length).toBeGreaterThanOrEqual(4);
      expect(recipe?.components.map((component) => component.key)).toEqual([
        "board",
        "deck_primary",
        "deck_secondary",
        "rulebook",
        "pieces_kit",
        "box",
      ]);
    }
  });

  test("launch config defaults to all templates and physical checkout on", () => {
    delete process.env.LAUNCH_ENABLED_TEMPLATES;
    delete process.env.PHYSICAL_CHECKOUT_ENABLED;

    expect(getLaunchConfig().enabledTemplates).toEqual([
      "home-turf",
      "milestone-trail",
      "face-card",
      "case-file",
      "trivia-trek",
    ]);
    expect(getLaunchConfig().physicalCheckoutEnabled).toBe(true);
  });

  test("launch config can hide templates and pause boxed checkout", () => {
    process.env.LAUNCH_ENABLED_TEMPLATES = "milestone-trail,trivia-trek";
    process.env.PHYSICAL_CHECKOUT_ENABLED = "false";

    expect(isTemplateLaunchEnabled("case-file")).toBe(false);
    expect(isTemplateLaunchEnabled("trivia-trek")).toBe(true);
    expect(() =>
      assertProductTierLaunchEnabled(ProductTier.printed_board_cards),
    ).toThrow(/temporarily paused/);
    expect(() =>
      assertProductTierLaunchEnabled(ProductTier.digital_print_kit),
    ).not.toThrow();
  });

  test("physical checkout does not use mock fulfillment when mock physical checkout is disabled", () => {
    process.env.LAUNCH_ENABLED_TEMPLATES = "case-file";
    process.env.PHYSICAL_CHECKOUT_ENABLED = "true";
    process.env.ALLOW_MOCK_PHYSICAL_CHECKOUT = "false";
    delete process.env.TGC_API_KEY_ID;
    delete process.env.TGC_USERNAME;
    delete process.env.TGC_PASSWORD;

    expect(getLaunchConfig().physicalCheckoutEnabled).toBe(false);
    expect(() =>
      assertProductTierLaunchEnabled(ProductTier.printed_board_cards),
    ).toThrow(/manufacturing credentials/);
  });

  test("defaults to mock when The Game Crafter env vars are missing", () => {
    delete process.env.TGC_API_KEY_ID;
    delete process.env.TGC_USERNAME;
    delete process.env.TGC_PASSWORD;
    delete process.env.TGC_MILESTONE_TRAIL_BOARD_SKU;
    delete process.env.TGC_MILESTONE_TRAIL_DECK_PRIMARY_SKU;
    delete process.env.TGC_MILESTONE_TRAIL_DECK_SECONDARY_SKU;
    delete process.env.TGC_MILESTONE_TRAIL_RULEBOOK_SKU;
    delete process.env.TGC_MILESTONE_TRAIL_PIECES_KIT_SKU;
    delete process.env.TGC_MILESTONE_TRAIL_BOX_SKU;

    const plan = buildFulfillmentPlan({
      templateSlug: "milestone-trail",
      productTier: ProductTier.printed_board_cards,
    });

    expect(plan.selectedProvider).toBe("mock");
    expect(getFulfillmentProvider()).toBe("mock");
  });

  test("uses The Game Crafter when the launch provider is configured", () => {
    process.env.TGC_API_KEY_ID = "tgc-key";
    process.env.TGC_USERNAME = "demo";
    process.env.TGC_PASSWORD = "secret";
    process.env.TGC_CASE_FILE_BOARD_SKU = "sku-board";
    process.env.TGC_CASE_FILE_DECK_PRIMARY_SKU = "sku-deck-primary";
    process.env.TGC_CASE_FILE_DECK_SECONDARY_SKU = "sku-deck-secondary";
    process.env.TGC_CASE_FILE_RULEBOOK_SKU = "sku-rulebook";
    process.env.TGC_CASE_FILE_PIECES_KIT_SKU = "sku-pieces";
    process.env.TGC_CASE_FILE_BOX_SKU = "sku-box";

    const plan = buildFulfillmentPlan({
      templateSlug: "case-file",
      productTier: ProductTier.printed_board_cards,
    });

    expect(plan.selectedProvider).toBe("the_game_crafter");
    expect(getFulfillmentProvider()).toBe("the_game_crafter");
  });
});
