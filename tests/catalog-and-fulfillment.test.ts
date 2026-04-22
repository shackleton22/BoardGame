import { afterEach, describe, expect, test } from "vitest";
import { ProductTier } from "@prisma/client";

import { buildFulfillmentPlan } from "@/lib/fulfillment/plan";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { getTemplateDefinition } from "@/lib/templates/registry";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("catalog and fulfillment selection", () => {
  test("launch catalog exposes the three planned templates", () => {
    expect(getTemplateDefinition("life-quest").name).toBe("Life Quest Board");
    expect(getTemplateDefinition("mystery-night").name).toBe("Mystery Night");
    expect(getTemplateDefinition("inside-joke-showdown").name).toBe(
      "Inside Joke Showdown",
    );
  });

  test("defaults to mock when The Game Crafter env vars are missing", () => {
    delete process.env.TGC_API_KEY_ID;
    delete process.env.TGC_USERNAME;
    delete process.env.TGC_PASSWORD;

    const plan = buildFulfillmentPlan({
      templateSlug: "life-quest",
      productTier: ProductTier.printed_board_cards,
    });

    expect(plan.selectedProvider).toBe("mock");
    expect(getFulfillmentProvider()).toBe("mock");
  });

  test("uses The Game Crafter when the launch provider is configured", () => {
    process.env.TGC_API_KEY_ID = "tgc-key";
    process.env.TGC_USERNAME = "demo";
    process.env.TGC_PASSWORD = "secret";

    const plan = buildFulfillmentPlan({
      templateSlug: "mystery-night",
      productTier: ProductTier.printed_board_cards,
    });

    expect(plan.selectedProvider).toBe("the_game_crafter");
    expect(getFulfillmentProvider()).toBe("the_game_crafter");
  });
});
