import { describe, expect, test } from "vitest";

import { buildFulfillmentPlan } from "@/lib/fulfillment/plan";
import {
  faceCardWizardSchema,
  homeTurfWizardSchema,
  insideJokeShowdownWizardSchema,
  lifeQuestWizardSchema,
  mysteryNightWizardSchema,
} from "@/lib/validation/project";

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
  test("milestone trail physical payload requires shipping", () => {
    expect(() =>
      lifeQuestWizardSchema.parse({
        templateSlug: "milestone-trail",
        recipientName: "Taylor",
        buyerName: "Jamie",
        occasion: "birthday",
        tone: "funny",
        relationship: "friend",
        items: Array.from({ length: 8 }, (_, index) => ({
          name: `Memory ${index + 1}`,
          category: "memory",
          whyItMatters: `Why it matters ${index + 1}`,
          era: "recent years",
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

  test("case file accepts a valid physical payload", () => {
    expect(() =>
      mysteryNightWizardSchema.parse({
        templateSlug: "case-file",
        recipientName: "Morgan",
        buyerName: "Casey",
        occasion: "friendship",
        tone: "adventurous",
        relationship: "group",
        suspects: Array.from({ length: 4 }, (_, index) => ({
          name: `Suspect ${index + 1}`,
          role: `Role ${index + 1}`,
          trait: `Trait ${index + 1}`,
          suspicionLevel: "medium",
        })),
        locations: Array.from({ length: 4 }, (_, index) => ({
          name: `Location ${index + 1}`,
          category: "place",
          whyItMatters: `Scene ${index + 1} matters`,
          mood: "cozy",
          note: `Scene ${index + 1}`,
        })),
        clues: Array.from({ length: 6 }, (_, index) => ({
          name: `Hint ${index + 1}`,
          category: "memory",
          story: `Story ${index + 1}`,
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

  test("home turf accepts a valid digital payload", () => {
    expect(() =>
      homeTurfWizardSchema.parse({
        templateSlug: "home-turf",
        recipientName: "Riley",
        buyerName: "Morgan",
        occasion: "birthday",
        tone: "funny",
        relationship: "friend",
        places: Array.from({ length: 6 }, (_, index) => ({
          name: `Place ${index + 1}`,
          category: "place",
          whyItMatters: `Place ${index + 1} matters`,
          vibe: "local favorite",
          note: `Context ${index + 1}`,
        })),
        dealCards: Array.from({ length: 4 }, (_, index) => ({
          name: `Deal ${index + 1}`,
          category: "inside_joke",
          prompt: `Prompt ${index + 1}`,
          kind: "bonus",
          note: `Deal ${index + 1}`,
        })),
        visualStyle: "modern",
        colorMood: "neutral",
        titleOverride: "",
        subtitleOverride: "",
        avoidNotes: "",
        productTier: "digital_print_kit",
        customerEmail: "home@example.com",
      }),
    ).not.toThrow();
  });

  test("face card accepts a valid digital payload", () => {
    expect(() =>
      faceCardWizardSchema.parse({
        templateSlug: "face-card",
        recipientName: "Parker",
        buyerName: "Alex",
        occasion: "family reunion",
        tone: "family-friendly",
        relationship: "family",
        people: Array.from({ length: 6 }, (_, index) => ({
          name: `Person ${index + 1}`,
          role: `Role ${index + 1}`,
          tell: `Tell ${index + 1}`,
          decoyTrait: `Decoy ${index + 1}`,
        })),
        cluePrompts: Array.from({ length: 4 }, (_, index) => ({
          name: `Hint ${index + 1}`,
          category: "inside_joke",
          prompt: `Prompt ${index + 1}`,
          difficulty: "medium",
          note: `Hint ${index + 1}`,
        })),
        revealMode: "Ask hints and reveal the face.",
        visualStyle: "playful",
        colorMood: "bright",
        titleOverride: "",
        subtitleOverride: "",
        avoidNotes: "",
        productTier: "digital_print_kit",
        customerEmail: "face@example.com",
      }),
    ).not.toThrow();
  });

  test("trivia trek accepts a valid physical payload", () => {
    expect(() =>
      insideJokeShowdownWizardSchema.parse({
        templateSlug: "trivia-trek",
        recipientName: "Sam",
        buyerName: "Taylor",
        occasion: "birthday",
        tone: "funny",
        relationship: "group",
        insideJokes: Array.from({ length: 4 }, (_, index) => ({
          name: `Category ${index + 1}`,
          category: "inside_joke",
          whyItMatters: `Story ${index + 1}`,
          factOne: `Fact one ${index + 1}`,
          factTwo: `Fact two ${index + 1}`,
          factThree: `Fact three ${index + 1}`,
          note: `Note ${index + 1}`,
        })),
        rapidChallenges: Array.from({ length: 2 }, (_, index) => ({
          name: `Bonus ${index + 1}`,
          category: "other",
          prompt: `Prompt ${index + 1}`,
          difficulty: "medium",
          note: `Note ${index + 1}`,
        })),
        catchphrases: ["One quick stop", "We have snacks", "Absolutely not"],
        visualStyle: "playful",
        colorMood: "bright",
        titleOverride: "",
        subtitleOverride: "",
        avoidNotes: "",
        productTier: "printed_board_cards",
        shipping: baseShipping,
        customerEmail: "sam@example.com",
      }),
    ).not.toThrow();
  });

  test("fulfillment plan exposes a production window for shipping quotes", () => {
    const plan = buildFulfillmentPlan({
      templateSlug: "trivia-trek",
      productTier: "printed_board_cards",
    });

    expect(plan.productionWindow.quoteTtlHours).toBeGreaterThan(0);
    expect(plan.productionWindow.maxDays).toBeGreaterThanOrEqual(
      plan.productionWindow.minDays,
    );
  });
});
