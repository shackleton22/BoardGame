import { describe, expect, test } from "vitest";

import { buildFulfillmentPlan } from "@/lib/fulfillment/plan";
import { lifeQuestWizardSchema, mysteryNightWizardSchema } from "@/lib/validation/project";

const baseShipping = {
  fullName: "Taylor Example",
  company: "",
  addressLine1: "123 Main St",
  addressLine2: "",
  city: "Austin",
  state: "TX",
  postalCode: "78701",
  country: "US",
  phoneNumber: "555-555-5555",
};

describe("wizard validation and shipping windows", () => {
  test("life quest physical payload requires shipping", () => {
    expect(() =>
      lifeQuestWizardSchema.parse({
        templateSlug: "life-quest",
        recipientName: "Taylor",
        buyerName: "Jamie",
        occasion: "birthday",
        tone: "funny",
        relationship: "friend",
        items: Array.from({ length: 8 }, (_, index) => ({
          name: `Memory ${index + 1}`,
          category: "memory",
          note: `Context ${index + 1}`,
        })),
        visualStyle: "modern",
        colorMood: "warm",
        titleOverride: "",
        subtitleOverride: "",
        avoidNotes: "",
        productTier: "printed_board_cards",
        customerEmail: "friend@example.com",
      }),
    ).toThrow(/Shipping details are required/);
  });

  test("mystery night accepts a valid physical payload", () => {
    expect(() =>
      mysteryNightWizardSchema.parse({
        templateSlug: "mystery-night",
        recipientName: "Morgan",
        buyerName: "Casey",
        occasion: "friendship",
        tone: "adventurous",
        relationship: "group",
        suspects: Array.from({ length: 4 }, (_, index) => ({
          name: `Suspect ${index + 1}`,
          role: `Role ${index + 1}`,
        })),
        locations: Array.from({ length: 4 }, (_, index) => ({
          name: `Location ${index + 1}`,
          category: "place",
          note: `Scene ${index + 1}`,
        })),
        clues: Array.from({ length: 6 }, (_, index) => ({
          name: `Hint ${index + 1}`,
          category: "memory",
          note: `Hint ${index + 1}`,
        })),
        revealTwist: "",
        visualStyle: "vintage",
        colorMood: "muted",
        titleOverride: "",
        subtitleOverride: "",
        avoidNotes: "",
        productTier: "printed_board_cards",
        shipping: baseShipping,
        customerEmail: "group@example.com",
      }),
    ).not.toThrow();
  });

  test("fulfillment plan exposes a production window for shipping quotes", () => {
    const plan = buildFulfillmentPlan({
      templateSlug: "inside-joke-showdown",
      productTier: "printed_board_cards",
    });

    expect(plan.productionWindow.quoteTtlHours).toBeGreaterThan(0);
    expect(plan.productionWindow.maxDays).toBeGreaterThanOrEqual(
      plan.productionWindow.minDays,
    );
  });
});
