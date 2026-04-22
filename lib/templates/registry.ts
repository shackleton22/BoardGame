import { ProductTier, ProjectItemCategory } from "@prisma/client";

import { generateInsideJokeShowdownContent } from "@/lib/ai/generateInsideJokeShowdown";
import { generateLifeQuestContent } from "@/lib/ai/generateLifeQuest";
import { generateMysteryNightContent } from "@/lib/ai/generateMysteryNight";
import { renderInsideJokeBoardSvg } from "@/lib/render/insideJokeBoardSvg";
import { renderLifeQuestBoardSvg } from "@/lib/render/lifeQuestBoardSvg";
import { renderMysteryNightBoardSvg } from "@/lib/render/mysteryNightBoardSvg";
import type { TemplateDefinition, TemplateSlug } from "@/lib/templates/types";
import {
  insideJokeShowdownWizardSchema,
  lifeQuestWizardSchema,
  mysteryNightWizardSchema,
  type InsideJokeShowdownWizardInput,
  type LifeQuestWizardInput,
  type MysteryNightWizardInput,
} from "@/lib/validation/project";
export type { TemplateSlug } from "@/lib/templates/types";

const COMMON_TIERS = {
  digital: {
    tier: ProductTier.digital_print_kit,
    label: "Digital Print Kit",
    enabled: true,
    description: "Downloadable board, cards, rules, and print-ready art files.",
  },
  physical: {
    tier: ProductTier.printed_board_cards,
    label: "Retail-ready boxed game",
    enabled: true,
    description:
      "A fully assembled physical game routed through The Game Crafter after payment.",
  },
  premium: {
    tier: ProductTier.premium_gift_box,
    label: "Premium Gift Box",
    enabled: false,
    badge: "Coming soon",
    description: "Premium inserts and elevated packaging after the core boxed product is proven.",
  },
} as const;

const LIFE_QUEST_TEMPLATE: TemplateDefinition<LifeQuestWizardInput> = {
  slug: "life-quest",
  name: "Life Quest Board",
  shortDescription: "A winding keepsake journey made from memories, places, milestones, and inside jokes.",
  description:
    "Turn a life story into a premium journey board with memorable spaces, keepsake cards, and elegant print-ready artwork.",
  status: "available",
  boardStyle: "journey",
  deckLabels: { primary: "Memory Cards", secondary: "Quest Cards" },
  tileTypeOptions: ["memory", "challenge", "reward", "shortcut", "rest", "wildcard"],
  landingBadge: "Best for anniversaries, birthdays, and family milestones",
  heroBullets: [
    "32 personalized spaces on a winding journey board",
    "24 Memory Cards and 24 Quest Cards",
    "Beautifully giftable for relationships, families, and close friends",
  ],
  questionSummary: [
    { label: "Recipient", description: "Who the gift is for, the occasion, and the tone." },
    { label: "Life details", description: "Memories, places, hobbies, people, and inside jokes." },
    { label: "Style", description: "Color mood, visual style, and optional title direction." },
  ],
  tiers: [
    { ...COMMON_TIERS.digital, amount: 3900 },
    { ...COMMON_TIERS.physical, amount: 8900 },
    { ...COMMON_TIERS.premium, amount: 14900 },
  ],
  productionWindow: { minDays: 7, maxDays: 12, quoteTtlHours: 24 },
  bomVersion: "life-quest-v1",
  componentSetSummary: [
    "Folding board",
    "Two custom card decks",
    "Rule booklet",
    "Pawn set, die, score tokens",
    "Retail-ready box",
  ],
  vendorComponents: [
    {
      componentKey: "boxed_game_bundle",
      componentLabel: "Life Quest boxed game bundle",
      quantity: 1,
      notes: "Preferred one-SKU bundle for live quoting and submission.",
      mode: "bundle",
      requiredForQuotes: true,
      envKey: "TGC_TEMPLATE_LIFE_QUEST_SKU",
    },
  ],
  schema: lifeQuestWizardSchema,
  parseInput: (raw) => lifeQuestWizardSchema.parse(raw),
  buildProjectItems: (input) =>
    input.items.map((item: LifeQuestWizardInput["items"][number], index: number) => ({
      name: item.name,
      category: item.category as ProjectItemCategory,
      note: item.note,
      sortOrder: index,
    })),
  generateContent: generateLifeQuestContent,
  renderBoard: renderLifeQuestBoardSvg,
};

const MYSTERY_NIGHT_TEMPLATE: TemplateDefinition<MysteryNightWizardInput> = {
  slug: "mystery-night",
  name: "Mystery Night",
  shortDescription: "A cooperative case-file keepsake built from suspects, scenes, and familiar clues.",
  description:
    "Turn a shared story into a dramatic evidence board with clue cards, twist cards, and a custom mystery-night presentation.",
  status: "available",
  boardStyle: "mystery",
  deckLabels: { primary: "Clue Cards", secondary: "Twist Cards" },
  tileTypeOptions: ["clue", "challenge", "alibi", "twist", "reveal", "bonus"],
  landingBadge: "Best for friend groups, reunions, and story-heavy gifts",
  heroBullets: [
    "Custom suspects, locations, and clues",
    "Cooperative mystery-night rules with giftable copy",
    "Evidence-board inspired print-ready design",
  ],
  questionSummary: [
    { label: "Case cast", description: "Suspects, featured people, and their signature roles." },
    { label: "Scenes", description: "Locations, clues, and suspicious details from real life." },
    { label: "Reveal", description: "The tone, twist direction, and visual presentation." },
  ],
  tiers: [
    { ...COMMON_TIERS.digital, amount: 4900 },
    { ...COMMON_TIERS.physical, amount: 9900 },
    { ...COMMON_TIERS.premium, amount: 15900 },
  ],
  productionWindow: { minDays: 8, maxDays: 13, quoteTtlHours: 24 },
  bomVersion: "mystery-night-v1",
  componentSetSummary: [
    "Evidence board",
    "Clue and Twist decks",
    "Rule booklet",
    "Investigation tokens and die",
    "Retail-ready box",
  ],
  vendorComponents: [
    {
      componentKey: "boxed_game_bundle",
      componentLabel: "Mystery Night boxed game bundle",
      quantity: 1,
      notes: "Preferred one-SKU bundle for live quoting and submission.",
      mode: "bundle",
      requiredForQuotes: true,
      envKey: "TGC_TEMPLATE_MYSTERY_NIGHT_SKU",
    },
  ],
  schema: mysteryNightWizardSchema,
  parseInput: (raw) => mysteryNightWizardSchema.parse(raw),
  buildProjectItems: (input) => [
    ...input.suspects.map(
      (suspect: MysteryNightWizardInput["suspects"][number], index: number) => ({
      name: suspect.name,
      category: ProjectItemCategory.person_pet,
      note: suspect.role,
      sortOrder: index,
      }),
    ),
    ...input.locations.map(
      (location: MysteryNightWizardInput["locations"][number], index: number) => ({
      name: location.name,
      category: location.category as ProjectItemCategory,
      note: location.note,
      sortOrder: input.suspects.length + index,
      }),
    ),
    ...input.clues.map((clue: MysteryNightWizardInput["clues"][number], index: number) => ({
      name: clue.name,
      category: clue.category as ProjectItemCategory,
      note: clue.note,
      sortOrder: input.suspects.length + input.locations.length + index,
    })),
  ],
  generateContent: generateMysteryNightContent,
  renderBoard: renderMysteryNightBoardSvg,
};

const INSIDE_JOKE_TEMPLATE: TemplateDefinition<InsideJokeShowdownWizardInput> = {
  slug: "inside-joke-showdown",
  name: "Inside Joke Showdown",
  shortDescription: "A party-night keepsake packed with callbacks, fast challenges, and signature lines.",
  description:
    "Turn your group's best bits into a lively printable party board with callout cards, challenge cards, and a high-energy showdown finish.",
  status: "available",
  boardStyle: "party",
  deckLabels: { primary: "Callout Cards", secondary: "Challenge Cards" },
  tileTypeOptions: ["bonus", "challenge", "double_down", "reward", "shortcut", "wildcard"],
  landingBadge: "Best for birthdays, friendships, and group gifts",
  heroBullets: [
    "Built for fast laughs and replayable group energy",
    "Personalized callout cards and party challenges",
    "Modern, bright, gift-worthy board presentation",
  ],
  questionSummary: [
    { label: "Best bits", description: "Inside jokes, recurring moments, and shared catchphrases." },
    { label: "Challenges", description: "Quick prompts and mini-dares for the table." },
    { label: "Style", description: "Party energy, visual direction, and title framing." },
  ],
  tiers: [
    { ...COMMON_TIERS.digital, amount: 3900 },
    { ...COMMON_TIERS.physical, amount: 7900 },
    { ...COMMON_TIERS.premium, amount: 14900 },
  ],
  productionWindow: { minDays: 7, maxDays: 11, quoteTtlHours: 24 },
  bomVersion: "inside-joke-showdown-v1",
  componentSetSummary: [
    "Party board / score track",
    "Callout and Challenge decks",
    "Rule booklet",
    "Tokens, die, and score markers",
    "Retail-ready box",
  ],
  vendorComponents: [
    {
      componentKey: "boxed_game_bundle",
      componentLabel: "Inside Joke Showdown boxed game bundle",
      quantity: 1,
      notes: "Preferred one-SKU bundle for live quoting and submission.",
      mode: "bundle",
      requiredForQuotes: true,
      envKey: "TGC_TEMPLATE_INSIDE_JOKE_SHOWDOWN_SKU",
    },
  ],
  schema: insideJokeShowdownWizardSchema,
  parseInput: (raw) => insideJokeShowdownWizardSchema.parse(raw),
  buildProjectItems: (input) => [
    ...input.insideJokes.map(
      (item: InsideJokeShowdownWizardInput["insideJokes"][number], index: number) => ({
      name: item.name,
      category: item.category as ProjectItemCategory,
      note: item.note,
      sortOrder: index,
      }),
    ),
    ...input.rapidChallenges.map(
      (item: InsideJokeShowdownWizardInput["rapidChallenges"][number], index: number) => ({
      name: item.name,
      category: item.category as ProjectItemCategory,
      note: item.note,
      sortOrder: input.insideJokes.length + index,
      }),
    ),
    ...input.catchphrases.map((phrase: string, index: number) => ({
      name: phrase,
      category: ProjectItemCategory.inside_joke,
      note: "Signature line",
      sortOrder: input.insideJokes.length + input.rapidChallenges.length + index,
    })),
  ],
  generateContent: generateInsideJokeShowdownContent,
  renderBoard: renderInsideJokeBoardSvg,
};

export const TEMPLATE_REGISTRY = {
  "life-quest": LIFE_QUEST_TEMPLATE,
  "mystery-night": MYSTERY_NIGHT_TEMPLATE,
  "inside-joke-showdown": INSIDE_JOKE_TEMPLATE,
} as const;

export function getTemplateDefinition(slug: TemplateSlug) {
  return TEMPLATE_REGISTRY[slug];
}

export function listTemplateDefinitions() {
  return [
    TEMPLATE_REGISTRY["life-quest"],
    TEMPLATE_REGISTRY["mystery-night"],
    TEMPLATE_REGISTRY["inside-joke-showdown"],
  ];
}

export function getTemplateTierDetails(slug: TemplateSlug, tier: ProductTier) {
  return getTemplateDefinition(slug).tiers.find((entry) => entry.tier === tier);
}

export function buildTemplateSkuSeed(slug: TemplateSlug) {
  return getTemplateDefinition(slug).vendorComponents.map((component) => ({
    provider: "the_game_crafter" as const,
    productTier: ProductTier.printed_board_cards,
    componentKey: component.componentKey,
    componentLabel: component.componentLabel,
    quantity: component.quantity,
    sku:
      (component.envKey ? process.env[component.envKey]?.trim() : undefined) ||
      `MISSING_${slug.toUpperCase().replace(/-/g, "_")}_${component.componentKey.toUpperCase()}`,
    metadataJson: {
      notes: component.notes,
      mode: component.mode,
      requiredForQuotes: component.requiredForQuotes ?? false,
      envKey: component.envKey,
    },
  }));
}
