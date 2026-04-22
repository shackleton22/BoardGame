import { describe, expect, test } from "vitest";

import { buildFallbackInsideJokeShowdown } from "@/lib/ai/fallbackInsideJokeShowdown";
import { buildFallbackLifeQuest } from "@/lib/ai/fallbackLifeQuest";
import { buildFallbackMysteryNight } from "@/lib/ai/fallbackMysteryNight";
import { generatedGameOutputSchema, lifeQuestAiSchema } from "@/lib/validation/project";
import type {
  InsideJokeShowdownWizardInput,
  LifeQuestWizardInput,
  MysteryNightWizardInput,
} from "@/lib/validation/project";

const lifeQuestInput: LifeQuestWizardInput = {
  templateSlug: "life-quest",
  recipientName: "Avery",
  buyerName: "Jordan",
  occasion: "anniversary",
  tone: "heartfelt",
  relationship: "partner",
  items: [
    { name: "Lake house weekends", category: "place", note: "Coffee on the dock." },
    { name: "Nashville trip", category: "travel", note: "The karaoke win." },
    { name: "Grandma's kitchen", category: "memory", note: "Recipes and stories." },
    { name: "Home gym", category: "hobby", note: "Sunrise workouts." },
    { name: "First apartment", category: "memory", note: "Tiny but ours." },
    { name: "Sourdough era", category: "inside_joke", note: "The starter had a name." },
    { name: "Maple", category: "person_pet", note: "The dog runs the house." },
    { name: "Promotion day", category: "achievement", note: "Hard work paid off." },
  ],
  visualStyle: "modern",
  colorMood: "warm",
  titleOverride: undefined,
  subtitleOverride: undefined,
  avoidNotes: undefined,
  productTier: "digital_print_kit",
  shipping: undefined,
  customerEmail: "demo@example.com",
  turnstileToken: undefined,
};

const mysteryNightInput: MysteryNightWizardInput = {
  templateSlug: "mystery-night",
  recipientName: "Morgan",
  buyerName: "Casey",
  occasion: "friendship",
  tone: "adventurous",
  relationship: "group",
  suspects: [
    { name: "The snack thief", role: "Always near the chips." },
    { name: "The playlist captain", role: "Controls the aux." },
    { name: "The last-minute planner", role: "Still suspicious." },
    { name: "The trivia assassin", role: "Knows too much." },
  ],
  locations: [
    { name: "The lake cabin", category: "place", note: "Where the timeline starts." },
    { name: "The diner booth", category: "memory", note: "The best theories happen here." },
    { name: "The office break room", category: "place", note: "Coffee and gossip." },
    { name: "The road trip car", category: "travel", note: "A mobile evidence locker." },
  ],
  clues: [
    { name: "A glittery receipt", category: "memory", note: "It changes everything." },
    { name: "A suspicious coffee order", category: "food", note: "Wrong milk, wrong story." },
    { name: "A scribbled to-do list", category: "career", note: "Half motive, half confession." },
    { name: "A photo booth strip", category: "memory", note: "Caught in four frames." },
    { name: "A mystery keychain", category: "inside_joke", note: "Nobody remembers it." },
    { name: "A half-finished playlist", category: "inside_joke", note: "Too specific to ignore." },
  ],
  revealTwist: "The culprit was the group's bad memory.",
  visualStyle: "vintage",
  colorMood: "muted",
  titleOverride: undefined,
  subtitleOverride: undefined,
  avoidNotes: undefined,
  productTier: "digital_print_kit",
  shipping: undefined,
  customerEmail: "mystery@example.com",
  turnstileToken: undefined,
};

const insideJokeInput: InsideJokeShowdownWizardInput = {
  templateSlug: "inside-joke-showdown",
  recipientName: "Sam",
  buyerName: "Taylor",
  occasion: "birthday",
  tone: "funny",
  relationship: "group",
  insideJokes: Array.from({ length: 8 }, (_, index) => ({
    name: `Inside joke ${index + 1}`,
    category: "inside_joke" as const,
    note: `Callback ${index + 1}`,
  })),
  rapidChallenges: Array.from({ length: 6 }, (_, index) => ({
    name: `Challenge ${index + 1}`,
    category: "other" as const,
    note: `Chaos ${index + 1}`,
  })),
  catchphrases: ["Absolutely not", "Legendary behavior", "The council has decided", "Group chat energy"],
  visualStyle: "playful",
  colorMood: "bright",
  titleOverride: undefined,
  subtitleOverride: undefined,
  avoidNotes: undefined,
  productTier: "digital_print_kit",
  shipping: undefined,
  customerEmail: "showdown@example.com",
  turnstileToken: undefined,
};

describe("AI schema fallbacks", () => {
  test("life quest fallback output matches the strict schema", () => {
    const output = buildFallbackLifeQuest(lifeQuestInput);
    const parsed = lifeQuestAiSchema.parse(output);

    expect(parsed.tiles).toHaveLength(32);
    expect(parsed.memoryCards).toHaveLength(24);
    expect(parsed.questCards).toHaveLength(24);
  });

  test("mystery night fallback output matches the generic schema", () => {
    const parsed = generatedGameOutputSchema.parse(buildFallbackMysteryNight(mysteryNightInput));

    expect(parsed.tiles).toHaveLength(32);
    expect(parsed.deckPrimary).toHaveLength(24);
    expect(parsed.deckSecondary).toHaveLength(24);
  });

  test("inside joke showdown fallback output matches the generic schema", () => {
    const parsed = generatedGameOutputSchema.parse(
      buildFallbackInsideJokeShowdown(insideJokeInput),
    );

    expect(parsed.tiles).toHaveLength(32);
    expect(parsed.deckPrimary).toHaveLength(24);
    expect(parsed.deckSecondary).toHaveLength(24);
  });
});
