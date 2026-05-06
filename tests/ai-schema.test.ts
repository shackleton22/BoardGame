import { describe, expect, test } from "vitest";

import { buildFallbackFaceCard } from "@/lib/ai/fallbackFaceCard";
import { buildFallbackHomeTurf } from "@/lib/ai/fallbackHomeTurf";
import { buildFallbackInsideJokeShowdown } from "@/lib/ai/fallbackInsideJokeShowdown";
import { buildFallbackLifeQuest } from "@/lib/ai/fallbackLifeQuest";
import { buildFallbackMysteryNight } from "@/lib/ai/fallbackMysteryNight";
import { buildBoardArtworkPrompt } from "@/lib/ai/boardArtworkPrompt";
import { isBoardArtworkReviewPassable } from "@/lib/ai/boardArtworkReview";
import { generatedGameOutputSchema, lifeQuestAiSchema } from "@/lib/validation/project";
import type {
  FaceCardWizardInput,
  HomeTurfWizardInput,
  InsideJokeShowdownWizardInput,
  LifeQuestWizardInput,
  MysteryNightWizardInput,
} from "@/lib/validation/project";

const lifeQuestInput: LifeQuestWizardInput = {
  templateSlug: "milestone-trail",
  recipientName: "Avery",
  buyerName: "Jordan",
  occasion: "anniversary",
  tone: "heartfelt",
  relationship: "partner",
  items: [
    {
      name: "Lake house weekends",
      category: "place",
      whyItMatters: "It is the place where everyone slows down and reconnects.",
      era: "recent years",
      note: "Coffee on the dock.",
    },
    {
      name: "Nashville trip",
      category: "travel",
      whyItMatters: "It became the trip everyone still quotes back to each other.",
      era: "young adult years",
      note: "The karaoke win.",
    },
    {
      name: "Grandma's kitchen",
      category: "memory",
      whyItMatters: "Every plan seems to start around that table.",
      era: "childhood",
      note: "Recipes and stories.",
    },
    {
      name: "Home gym",
      category: "hobby",
      whyItMatters: "It represents discipline and the routine that stuck.",
      era: "recent years",
      note: "Sunrise workouts.",
    },
    {
      name: "First apartment",
      category: "memory",
      whyItMatters: "It was cramped, loud, and full of firsts.",
      era: "young adult years",
      note: "Tiny but ours.",
    },
    {
      name: "Sourdough era",
      category: "inside_joke",
      whyItMatters: "The whole household was suddenly orbiting the starter.",
      era: "recent years",
      note: "The starter had a name.",
    },
    {
      name: "Maple",
      category: "person_pet",
      whyItMatters: "Maple became the unofficial host of every gathering.",
      era: "timeless",
      note: "The dog runs the house.",
    },
    {
      name: "Promotion day",
      category: "achievement",
      whyItMatters: "It marked a big turning point after years of effort.",
      era: "recent years",
      note: "Hard work paid off.",
    },
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

const homeTurfInput: HomeTurfWizardInput = {
  templateSlug: "home-turf",
  recipientName: "Riley",
  buyerName: "Morgan",
  occasion: "birthday",
  tone: "funny",
  relationship: "friend",
  places: [
    {
      name: "Maple Street",
      category: "place",
      whyItMatters: "The block where every weekend plan seems to start.",
      vibe: "home base",
      note: "Porch hangs and dog walks.",
    },
    {
      name: "The diner booth",
      category: "food",
      whyItMatters: "The booth has hosted too many post-game debates.",
      vibe: "local legend",
      note: "Fries for the table.",
    },
    {
      name: "Lake cabin",
      category: "travel",
      whyItMatters: "The annual reset spot for the whole crew.",
      vibe: "nostalgic",
      note: "Dock coffee.",
    },
    {
      name: "First apartment",
      category: "memory",
      whyItMatters: "Tiny kitchen, huge lore.",
      vibe: "scrappy",
      note: "The couch barely fit.",
    },
    {
      name: "Sunday market",
      category: "hobby",
      whyItMatters: "A ritual that stuck.",
      vibe: "cozy",
      note: "Flowers and coffee.",
    },
    {
      name: "The parking saga",
      category: "inside_joke",
      whyItMatters: "Nobody agrees where the car was.",
      vibe: "chaotic",
      note: "Still unresolved.",
    },
  ],
  dealCards: [
    {
      name: "Secret shortcut",
      category: "memory",
      prompt: "Take the back way and skip one challenge.",
      kind: "detour",
      note: "The route only locals know.",
    },
    {
      name: "Trade favors",
      category: "inside_joke",
      prompt: "Swap one card with another player.",
      kind: "trade",
      note: "Negotiations encouraged.",
    },
    {
      name: "Upgrade the stop",
      category: "other",
      prompt: "Make one favorite place worth more.",
      kind: "upgrade",
      note: "A bigger memory payout.",
    },
    {
      name: "Home-field advantage",
      category: "inside_joke",
      prompt: "Gain points for telling the local story best.",
      kind: "bonus",
      note: "Lore matters.",
    },
  ],
  visualStyle: "modern",
  colorMood: "neutral",
  titleOverride: undefined,
  subtitleOverride: undefined,
  avoidNotes: undefined,
  productTier: "digital_print_kit",
  shipping: undefined,
  customerEmail: "home@example.com",
  turnstileToken: undefined,
};

const faceCardInput: FaceCardWizardInput = {
  templateSlug: "face-card",
  recipientName: "Parker",
  buyerName: "Alex",
  occasion: "family reunion",
  tone: "family-friendly",
  relationship: "family",
  people: [
    {
      name: "Aunt Lisa",
      role: "planner",
      tell: "Always asks if everyone has eaten.",
      decoyTrait: "Knows every arrival time.",
    },
    {
      name: "Uncle Rob",
      role: "comedian",
      tell: "Cannot resist the obvious joke.",
      decoyTrait: "Laughs before finishing the sentence.",
    },
    {
      name: "Mia",
      role: "memory keeper",
      tell: "Remembers exact outfits from years ago.",
      decoyTrait: "Has photo evidence.",
    },
    {
      name: "Ben",
      role: "wildcard",
      tell: "Somehow starts side quests.",
      decoyTrait: "Impossible to predict.",
    },
    {
      name: "Grandpa Joe",
      role: "storyteller",
      tell: "Begins with one more quick story.",
      decoyTrait: "Knows the long version.",
    },
    {
      name: "Waffles",
      role: "family dog",
      tell: "Appears when snacks open.",
      decoyTrait: "Cute enough to avoid blame.",
    },
  ],
  cluePrompts: [
    {
      name: "Catchphrase",
      category: "inside_joke",
      prompt: "Ask if this person would say the signature line.",
      difficulty: "easy",
      note: "Everybody knows the voice.",
    },
    {
      name: "Favorite order",
      category: "memory",
      prompt: "Use a food or drink order to narrow the face.",
      difficulty: "medium",
      note: "Coffee gives it away.",
    },
    {
      name: "Signature tell",
      category: "person_pet",
      prompt: "Name the habit that gives them away.",
      difficulty: "medium",
      note: "The reaction is the clue.",
    },
    {
      name: "Decoy detail",
      category: "other",
      prompt: "Choose a trait that sounds like multiple people.",
      difficulty: "hard",
      note: "Careful with this one.",
    },
  ],
  revealMode: "Ask yes-or-no clues, eliminate decoys, then reveal the face.",
  visualStyle: "playful",
  colorMood: "bright",
  titleOverride: undefined,
  subtitleOverride: undefined,
  avoidNotes: undefined,
  productTier: "digital_print_kit",
  shipping: undefined,
  customerEmail: "face@example.com",
  turnstileToken: undefined,
};

const mysteryNightInput: MysteryNightWizardInput = {
  templateSlug: "case-file",
  recipientName: "Morgan",
  buyerName: "Casey",
  occasion: "friendship",
  tone: "adventurous",
  relationship: "group",
  suspects: [
    {
      name: "The snack thief",
      role: "Always near the chips.",
      trait: "Cannot resist hovering near the evidence.",
      suspicionLevel: "high",
    },
    {
      name: "The playlist captain",
      role: "Controls the aux.",
      trait: "Too calm for someone with that much power.",
      suspicionLevel: "medium",
    },
    {
      name: "The last-minute planner",
      role: "Still suspicious.",
      trait: "Always arrives with a dramatic new theory.",
      suspicionLevel: "medium",
    },
    {
      name: "The trivia assassin",
      role: "Knows too much.",
      trait: "Remembers details nobody else noticed.",
      suspicionLevel: "high",
    },
  ],
  locations: [
    {
      name: "The lake cabin",
      category: "place",
      whyItMatters: "It is where every suspicious timeline begins.",
      mood: "nostalgic",
      note: "Where the timeline starts.",
    },
    {
      name: "The diner booth",
      category: "memory",
      whyItMatters: "The strongest theories always end up here.",
      mood: "cozy",
      note: "The best theories happen here.",
    },
    {
      name: "The office break room",
      category: "place",
      whyItMatters: "Coffee, gossip, and accidental confessions all happen here.",
      mood: "chaotic",
      note: "Coffee and gossip.",
    },
    {
      name: "The road trip car",
      category: "travel",
      whyItMatters: "Everyone remembers a different version of what happened in that car.",
      mood: "dramatic",
      note: "A mobile evidence locker.",
    },
  ],
  clues: [
    {
      name: "A glittery receipt",
      category: "memory",
      story: "It proves someone went somewhere they definitely denied visiting.",
      note: "It changes everything.",
    },
    {
      name: "A suspicious coffee order",
      category: "food",
      story: "The milk choice instantly narrows the suspect list.",
      note: "Wrong milk, wrong story.",
    },
    {
      name: "A scribbled to-do list",
      category: "career",
      story: "Half motive, half confession, written in a hurry.",
      note: "Half motive, half confession.",
    },
    {
      name: "A photo booth strip",
      category: "memory",
      story: "The background gives away more than the smiles do.",
      note: "Caught in four frames.",
    },
    {
      name: "A mystery keychain",
      category: "inside_joke",
      story: "Nobody remembers it, which makes it worse.",
      note: "Nobody remembers it.",
    },
    {
      name: "A half-finished playlist",
      category: "inside_joke",
      story: "The song choices point to one very specific person.",
      note: "Too specific to ignore.",
    },
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
  templateSlug: "trivia-trek",
  recipientName: "Sam",
  buyerName: "Taylor",
  occasion: "birthday",
  tone: "funny",
  relationship: "group",
  insideJokes: Array.from({ length: 8 }, (_, index) => ({
    name: `Category ${index + 1}`,
    category: "inside_joke" as const,
    whyItMatters: `This category always kicks off a debate ${index + 1}.`,
    factOne: `Fact one ${index + 1}`,
    factTwo: `Fact two ${index + 1}`,
    factThree: `Fact three ${index + 1}`,
    note: `Answer anchor ${index + 1}`,
  })),
  rapidChallenges: Array.from({ length: 6 }, (_, index) => ({
    name: `Bonus round ${index + 1}`,
    category: "other" as const,
    prompt: `Prompt ${index + 1}`,
    difficulty: index % 2 === 0 ? "medium" : "hard",
    note: `Anchor ${index + 1}`,
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
  test("home turf fallback output matches the generic schema", () => {
    const parsed = generatedGameOutputSchema.parse(buildFallbackHomeTurf(homeTurfInput));

    expect(parsed.tiles).toHaveLength(32);
    expect(parsed.deckPrimary).toHaveLength(24);
    expect(parsed.deckSecondary).toHaveLength(24);
  });

  test("milestone trail fallback output matches the strict schema", () => {
    const output = buildFallbackLifeQuest(lifeQuestInput);
    const parsed = lifeQuestAiSchema.parse(output);

    expect(parsed.tiles).toHaveLength(32);
    expect(parsed.memoryCards).toHaveLength(24);
    expect(parsed.questCards).toHaveLength(24);
  });

  test("face card fallback output matches the generic schema", () => {
    const parsed = generatedGameOutputSchema.parse(buildFallbackFaceCard(faceCardInput));

    expect(parsed.tiles).toHaveLength(32);
    expect(parsed.deckPrimary).toHaveLength(24);
    expect(parsed.deckSecondary).toHaveLength(24);
  });

  test("case file fallback output matches the generic schema", () => {
    const parsed = generatedGameOutputSchema.parse(buildFallbackMysteryNight(mysteryNightInput));

    expect(parsed.tiles).toHaveLength(32);
    expect(parsed.deckPrimary).toHaveLength(24);
    expect(parsed.deckSecondary).toHaveLength(24);
  });

  test("trivia trek fallback output matches the generic schema", () => {
    const parsed = generatedGameOutputSchema.parse(
      buildFallbackInsideJokeShowdown(insideJokeInput),
    );

    expect(parsed.tiles).toHaveLength(32);
    expect(parsed.deckPrimary).toHaveLength(24);
    expect(parsed.deckSecondary).toHaveLength(24);
  });

  test("board artwork prompt carries user inputs and QA revision notes", () => {
    const output = buildFallbackHomeTurf(homeTurfInput);
    const prompt = buildBoardArtworkPrompt({
      templateSlug: "home-turf",
      recipientName: homeTurfInput.recipientName,
      occasion: homeTurfInput.occasion,
      inputJson: homeTurfInput,
      output,
      revisionPrompt: "Make the full perimeter path visibly connected.",
    });

    expect(prompt).toContain("Maple Street");
    expect(prompt).toContain("Make the full perimeter path visibly connected.");
    expect(prompt).toContain("do not render readable words");
  });

  test("board artwork QA gate rejects broken gameplay or contradicted personalization", () => {
    const gameplay = {
      verdict: "pass" as const,
      score: 88,
      criteria: {
        boardLooksFinished: 5,
        playableStructure: 5,
        completePathOrPlayArea: 5,
        componentCompleteness: 5,
        textOverlayReadiness: 4,
        noReadableTextOrIpRisk: 5,
      },
      blockingIssues: [],
      suggestedPromptAdditions: [],
      summary: "Complete board.",
    };
    const personalization = {
      verdict: "pass" as const,
      score: 86,
      requiredSignals: [
        {
          inputPath: "places[0].name",
          expected: "Maple Street",
          reflected: "clear" as const,
          evidence: "Neighborhood tile motifs are present.",
        },
      ],
      criteria: {
        recipientOccasion: 5,
        templateSpecificInputs: 5,
        styleAndMood: 4,
        titleSubtitleAlignment: 4,
        avoidNotesCompliance: 5,
        noReadableTextOrIpRisk: 5,
      },
      blockingIssues: [],
      suggestedPromptAdditions: [],
      summary: "Personalized.",
    };

    expect(isBoardArtworkReviewPassable({ gameplay, personalization })).toBe(true);
    expect(
      isBoardArtworkReviewPassable({
        gameplay: {
          ...gameplay,
          verdict: "needs_revision",
          blockingIssues: ["The board path is visibly disconnected."],
        },
        personalization,
      }),
    ).toBe(false);
    expect(
      isBoardArtworkReviewPassable({
        gameplay,
        personalization: {
          ...personalization,
          requiredSignals: [
            {
              inputPath: "avoidNotes",
              expected: "Avoid pets",
              reflected: "contradicted",
              evidence: "A dog is shown as a centerpiece.",
            },
          ],
        },
      }),
    ).toBe(false);
  });
});
