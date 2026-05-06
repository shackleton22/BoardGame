import { ProductTier, ProjectItemCategory } from "@prisma/client";

import { generateFaceCardContent } from "@/lib/ai/generateFaceCard";
import { generateHomeTurfContent } from "@/lib/ai/generateHomeTurf";
import { generateInsideJokeShowdownContent } from "@/lib/ai/generateInsideJokeShowdown";
import { generateLifeQuestContent } from "@/lib/ai/generateLifeQuest";
import { generateMysteryNightContent } from "@/lib/ai/generateMysteryNight";
import { renderFaceCardBoardSvg } from "@/lib/render/faceCardBoardSvg";
import { renderHomeTurfBoardSvg } from "@/lib/render/homeTurfBoardSvg";
import { renderInsideJokeBoardSvg } from "@/lib/render/insideJokeBoardSvg";
import { renderLifeQuestBoardSvg } from "@/lib/render/lifeQuestBoardSvg";
import { renderMysteryNightBoardSvg } from "@/lib/render/mysteryNightBoardSvg";
import type { TemplateDefinition, TemplateSlug } from "@/lib/templates/types";
import {
  faceCardWizardSchema,
  homeTurfWizardSchema,
  insideJokeShowdownWizardSchema,
  lifeQuestWizardSchema,
  mysteryNightWizardSchema,
  type FaceCardWizardInput,
  type HomeTurfWizardInput,
  type InsideJokeShowdownWizardInput,
  type LifeQuestWizardInput,
  type MysteryNightWizardInput,
} from "@/lib/validation/project";
export type { TemplateSlug } from "@/lib/templates/types";

function joinNoteParts(...parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" | ");
}

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

const HOME_TURF_TEMPLATE: TemplateDefinition<HomeTurfWizardInput> = {
  slug: "home-turf",
  name: "Home Turf",
  shortDescription:
    "A favorite-places strategy board built from homes, restaurants, trips, routines, and local legends.",
  description:
    "Turn meaningful places into a premium map-style strategy gift with local legend cards, detour cards, stock movers, score tokens, and a retail-ready boxed kit.",
  status: "available",
  boardStyle: "journey",
  deckLabels: { primary: "Local Legend Cards", secondary: "Detour Cards" },
  tileTypeOptions: ["memory", "reward", "challenge", "shortcut", "rest", "wildcard"],
  landingBadge: "Classic-inspired place strategy",
  heroBullets: [
    "32 personalized stops on an original neighborhood-map route",
    "Board, local legend cards, detour cards, movers, die, and score tokens in the boxed kit",
    "Best for housewarmings, couples, families, hometown gifts, and friend groups",
  ],
  questionSummary: [
    {
      label: "Home map",
      description: "The places, routes, restaurants, homes, and local rituals that define the story.",
    },
    {
      label: "Detours and table moments",
      description: "Story prompts, shortcuts, votes, callbacks, and small bonus moments for the card decks.",
    },
    { label: "Style", description: "Map mood, title direction, delivery tier, and US shipping." },
  ],
  tiers: [
    { ...COMMON_TIERS.digital, amount: 4900 },
    { ...COMMON_TIERS.physical, amount: 9900 },
    { ...COMMON_TIERS.premium, amount: 15900 },
  ],
  productionWindow: { minDays: 8, maxDays: 13, quoteTtlHours: 24 },
  bomVersion: "home-turf-v1",
  componentSetSummary: [
    "1 neighborhood-map board",
    "24 Local Legend Cards + 24 Detour Cards",
    "1 rule booklet",
    "6 stock movers, 1 die, 40 score tokens",
    "1 retail-ready box",
  ],
  packoutChecklist: [
    "Place the neighborhood-map board at the base of the box.",
    "Collate the Local Legend Cards and Detour Cards into two labeled 24-card decks.",
    "Add the stock pieces kit with 6 movers, 1 die, and 40 score tokens.",
    "Place the rule booklet on top for first-open clarity.",
    "Seal the full Home Turf kit in the retail-ready box with no GameGift Studio hand assembly.",
  ],
  vendorComponents: [
    {
      componentKey: "board",
      componentLabel: "Home Turf neighborhood-map board",
      quantity: 1,
      notes: "Printed map board uploaded from final Home Turf art.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_HOME_TURF_BOARD_SKU",
    },
    {
      componentKey: "deck_primary",
      componentLabel: "Home Turf Local Legend Cards deck",
      quantity: 1,
      notes: "Primary 24-card deck for favorite places and local legends.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_HOME_TURF_DECK_PRIMARY_SKU",
    },
    {
      componentKey: "deck_secondary",
      componentLabel: "Home Turf Detour Cards deck",
      quantity: 1,
      notes: "Secondary 24-card deck for story prompts, table votes, detours, and shortcuts.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_HOME_TURF_DECK_SECONDARY_SKU",
    },
    {
      componentKey: "rulebook",
      componentLabel: "Home Turf rule booklet",
      quantity: 1,
      notes: "Printed booklet containing setup, scoring, detours, and gifting note.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_HOME_TURF_RULEBOOK_SKU",
    },
    {
      componentKey: "pieces_kit",
      componentLabel: "Home Turf stock pieces kit",
      quantity: 1,
      notes: "Stock movers, one d6, and turf point tokens packed with the printed components.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_HOME_TURF_PIECES_KIT_SKU",
    },
    {
      componentKey: "box",
      componentLabel: "Home Turf retail-ready box",
      quantity: 1,
      notes: "Standard box sized to hold the board, two decks, booklet, and stock pieces.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_HOME_TURF_BOX_SKU",
    },
  ],
  schema: homeTurfWizardSchema,
  parseInput: (raw) => homeTurfWizardSchema.parse(raw),
  buildProjectItems: (input) => [
    ...input.places.map((place: HomeTurfWizardInput["places"][number], index: number) => ({
      name: place.name,
      category: place.category as ProjectItemCategory,
      note: joinNoteParts(place.whyItMatters, place.vibe, place.note) || undefined,
      sortOrder: index,
    })),
    ...input.dealCards.map((deal: HomeTurfWizardInput["dealCards"][number], index: number) => ({
      name: deal.name,
      category: deal.category as ProjectItemCategory,
      note: joinNoteParts(deal.kind, deal.prompt, deal.note) || undefined,
      sortOrder: input.places.length + index,
    })),
  ],
  generateContent: generateHomeTurfContent,
  renderBoard: renderHomeTurfBoardSvg,
};

const LIFE_QUEST_TEMPLATE: TemplateDefinition<LifeQuestWizardInput> = {
  slug: "milestone-trail",
  name: "Milestone Trail",
  shortDescription: "A life-journey board built from memories, milestones, favorite places, and signature stories.",
  description:
    "Turn a life story into a premium classic-inspired journey board with memorable spaces, stock movers, two custom decks, and elegant print-ready artwork.",
  status: "available",
  boardStyle: "journey",
  deckLabels: { primary: "Moment Cards", secondary: "Milestone Cards" },
  tileTypeOptions: ["memory", "challenge", "reward", "shortcut", "rest", "wildcard"],
  landingBadge: "Classic-inspired life journey",
  heroBullets: [
    "32 personalized spaces on a winding milestone trail",
    "Board, custom decks, die, movers, and score tokens in the boxed kit",
    "Best for anniversaries, birthdays, retirement, and family milestones",
  ],
  questionSummary: [
    { label: "Recipient", description: "Who the gift is for, the occasion, and the tone." },
    {
      label: "Story chapters",
      description: "Milestones, eras, and meaningful details that make the life journey feel personal.",
    },
    { label: "Style", description: "Color mood, visual style, and optional title direction." },
  ],
  tiers: [
    { ...COMMON_TIERS.digital, amount: 3900 },
    { ...COMMON_TIERS.physical, amount: 8900 },
    { ...COMMON_TIERS.premium, amount: 14900 },
  ],
  productionWindow: { minDays: 7, maxDays: 12, quoteTtlHours: 24 },
  bomVersion: "milestone-trail-v1",
  componentSetSummary: [
    "1 folding board",
    "24 Moment Cards + 24 Milestone Cards",
    "1 rule booklet",
    "6 stock pawns, 1 die, 24 score tokens",
    "1 retail-ready box",
  ],
  packoutChecklist: [
    "Place the folding board flat at the base of the box.",
    "Collate the Moment Cards and Milestone Cards as two labeled 24-card decks.",
    "Insert the stock pieces kit with 6 pawns, 1 die, and 24 score tokens.",
    "Place the rule booklet on top for first-open presentation.",
    "Seal the full kit in the retail-ready box with no hand assembly by GameGift Studio.",
  ],
  vendorComponents: [
    {
      componentKey: "board",
      componentLabel: "Milestone Trail folding board",
      quantity: 1,
      notes: "Printed folding board uploaded from final board art.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_MILESTONE_TRAIL_BOARD_SKU",
    },
    {
      componentKey: "deck_primary",
      componentLabel: "Milestone Trail Moment Cards deck",
      quantity: 1,
      notes: "Primary 24-card deck for personalized moment prompts.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_MILESTONE_TRAIL_DECK_PRIMARY_SKU",
    },
    {
      componentKey: "deck_secondary",
      componentLabel: "Milestone Trail Milestone Cards deck",
      quantity: 1,
      notes: "Secondary 24-card deck for milestone and reward prompts.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_MILESTONE_TRAIL_DECK_SECONDARY_SKU",
    },
    {
      componentKey: "rulebook",
      componentLabel: "Milestone Trail rule booklet",
      quantity: 1,
      notes: "Printed booklet containing setup, play flow, and gifting note.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_MILESTONE_TRAIL_RULEBOOK_SKU",
    },
    {
      componentKey: "pieces_kit",
      componentLabel: "Milestone Trail stock pieces kit",
      quantity: 1,
      notes: "Stock pawns, one d6, and score tokens packed with the printed components.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_MILESTONE_TRAIL_PIECES_KIT_SKU",
    },
    {
      componentKey: "box",
      componentLabel: "Milestone Trail retail-ready box",
      quantity: 1,
      notes: "Standard box sized to hold the board, decks, booklet, and pieces kit.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_MILESTONE_TRAIL_BOX_SKU",
    },
  ],
  schema: lifeQuestWizardSchema,
  parseInput: (raw) => lifeQuestWizardSchema.parse(raw),
  buildProjectItems: (input) =>
    input.items.map((item: LifeQuestWizardInput["items"][number], index: number) => {
      const note = joinNoteParts(item.whyItMatters, item.era, item.note);
      return {
        name: item.name,
        category: item.category as ProjectItemCategory,
        note: note || undefined,
        sortOrder: index,
      };
    }),
  generateContent: generateLifeQuestContent,
  renderBoard: renderLifeQuestBoardSvg,
};

const FACE_CARD_TEMPLATE: TemplateDefinition<FaceCardWizardInput> = {
  slug: "face-card",
  name: "Face Card",
  shortDescription:
    "A people-guessing board built from familiar faces, tells, decoys, habits, roles, and group lore.",
  description:
    "Turn a family, team, or friend group into a premium social guessing game with character cards, hint cards, stock tokens, markers, and a retail-ready boxed kit.",
  status: "available",
  boardStyle: "party",
  deckLabels: { primary: "Hint Cards", secondary: "Reveal Cards" },
  tileTypeOptions: ["clue", "challenge", "bonus", "twist", "reveal", "wildcard"],
  landingBadge: "Classic-inspired people guessing",
  heroBullets: [
    "Personalized cast, traits, tells, and decoy hints",
    "Board, hint/reveal decks, markers, die, and reveal tokens in the boxed kit",
    "Best for families, teams, reunions, friend groups, and inside-joke gifts",
  ],
  questionSummary: [
    {
      label: "The cast",
      description: "People, roles, pets, habits, catchphrases, and recognizable tells.",
    },
    {
      label: "Hints",
      description: "Question categories, decoy traits, reveal style, and group-specific prompts.",
    },
    { label: "Style", description: "Visual tone, delivery tier, and US shipping details." },
  ],
  tiers: [
    { ...COMMON_TIERS.digital, amount: 4900 },
    { ...COMMON_TIERS.physical, amount: 9900 },
    { ...COMMON_TIERS.premium, amount: 15900 },
  ],
  productionWindow: { minDays: 8, maxDays: 13, quoteTtlHours: 24 },
  bomVersion: "face-card-v1",
  componentSetSummary: [
    "1 identity board",
    "24 Hint Cards + 24 Reveal Cards",
    "1 rule booklet",
    "6 stock markers, 24 guess tokens, 1 die",
    "1 retail-ready box",
  ],
  packoutChecklist: [
    "Place the identity board at the base of the box.",
    "Collate the Hint Cards and Reveal Cards into two labeled 24-card decks.",
    "Add the stock pieces kit with markers, guess tokens, and one d6.",
    "Insert the rule booklet above the decks and pieces.",
    "Seal the full Face Card kit in the retail-ready box with no GameGift Studio hand fulfillment.",
  ],
  vendorComponents: [
    {
      componentKey: "board",
      componentLabel: "Face Card identity board",
      quantity: 1,
      notes: "Printed board uploaded from final Face Card art.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_FACE_CARD_BOARD_SKU",
    },
    {
      componentKey: "deck_primary",
      componentLabel: "Face Card Hint Cards deck",
      quantity: 1,
      notes: "Primary 24-card deck for hint prompts and yes/no categories.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_FACE_CARD_DECK_PRIMARY_SKU",
    },
    {
      componentKey: "deck_secondary",
      componentLabel: "Face Card Reveal Cards deck",
      quantity: 1,
      notes: "Secondary 24-card deck for reveal prompts, decoys, and final guesses.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_FACE_CARD_DECK_SECONDARY_SKU",
    },
    {
      componentKey: "rulebook",
      componentLabel: "Face Card rule booklet",
      quantity: 1,
      notes: "Printed booklet with setup, hint asking, elimination, and reveal scoring.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_FACE_CARD_RULEBOOK_SKU",
    },
    {
      componentKey: "pieces_kit",
      componentLabel: "Face Card stock pieces kit",
      quantity: 1,
      notes: "Stock markers, guess tokens, and one d6 packed with the printed components.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_FACE_CARD_PIECES_KIT_SKU",
    },
    {
      componentKey: "box",
      componentLabel: "Face Card retail-ready box",
      quantity: 1,
      notes: "Standard box sized for the board, decks, booklet, and stock pieces.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_FACE_CARD_BOX_SKU",
    },
  ],
  schema: faceCardWizardSchema,
  parseInput: (raw) => faceCardWizardSchema.parse(raw),
  buildProjectItems: (input) => [
    ...input.people.map((person: FaceCardWizardInput["people"][number], index: number) => ({
      name: person.name,
      category: ProjectItemCategory.person_pet,
      note: joinNoteParts(person.role, person.tell, person.decoyTrait) || undefined,
      sortOrder: index,
    })),
    ...input.cluePrompts.map(
      (clue: FaceCardWizardInput["cluePrompts"][number], index: number) => ({
        name: clue.name,
        category: clue.category as ProjectItemCategory,
        note: joinNoteParts(clue.difficulty, clue.prompt, clue.note) || undefined,
        sortOrder: input.people.length + index,
      }),
    ),
  ],
  generateContent: generateFaceCardContent,
  renderBoard: renderFaceCardBoardSvg,
};

const MYSTERY_NIGHT_TEMPLATE: TemplateDefinition<MysteryNightWizardInput> = {
  slug: "case-file",
  name: "Case File",
  shortDescription: "A personalized mystery board built from suspects, scenes, evidence, and familiar story beats.",
  description:
    "Turn a shared story into a premium classic-inspired mystery board with evidence cards, twist cards, suspect markers, and a boxed physical kit.",
  status: "available",
  boardStyle: "mystery",
  deckLabels: { primary: "Evidence Cards", secondary: "Twist Cards" },
  tileTypeOptions: ["clue", "challenge", "alibi", "twist", "reveal", "bonus"],
  landingBadge: "Classic-inspired mystery deduction",
  heroBullets: [
    "Custom suspects, locations, and clues",
    "Board, evidence decks, suspect markers, and die in the boxed kit",
    "Story-forward mystery rules with giftable copy",
  ],
  questionSummary: [
    {
      label: "Case cast",
      description: "Suspects, signature traits, and how suspicious each familiar face feels.",
    },
    {
      label: "Scenes",
      description: "Important locations, evidence, and why each detail belongs in the mystery.",
    },
    { label: "Reveal", description: "The twist direction, tone, and board presentation." },
  ],
  tiers: [
    { ...COMMON_TIERS.digital, amount: 4900 },
    { ...COMMON_TIERS.physical, amount: 9900 },
    { ...COMMON_TIERS.premium, amount: 15900 },
  ],
  productionWindow: { minDays: 8, maxDays: 13, quoteTtlHours: 24 },
  bomVersion: "case-file-v1",
  componentSetSummary: [
    "1 evidence board",
    "24 Evidence Cards + 24 Twist Cards",
    "1 detective booklet",
    "6 suspect markers, 18 investigation tokens, 1 die",
    "1 retail-ready box",
  ],
  packoutChecklist: [
    "Place the evidence board at the base of the box.",
    "Collate the Evidence Cards and Twist Cards into two labeled 24-card decks.",
    "Add the suspect markers, investigation tokens, and die as one stock pieces kit.",
    "Insert the detective booklet above the decks and pieces.",
    "Seal the full mystery kit in the retail-ready box with no GameGift Studio repacking.",
  ],
  vendorComponents: [
    {
      componentKey: "board",
      componentLabel: "Case File evidence board",
      quantity: 1,
      notes: "Printed board uploaded from the final evidence-board layout.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_CASE_FILE_BOARD_SKU",
    },
    {
      componentKey: "deck_primary",
      componentLabel: "Case File Evidence Cards deck",
      quantity: 1,
      notes: "Primary 24-card evidence deck.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_CASE_FILE_DECK_PRIMARY_SKU",
    },
    {
      componentKey: "deck_secondary",
      componentLabel: "Case File Twist Cards deck",
      quantity: 1,
      notes: "Secondary 24-card twist deck.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_CASE_FILE_DECK_SECONDARY_SKU",
    },
    {
      componentKey: "rulebook",
      componentLabel: "Case File detective booklet",
      quantity: 1,
      notes: "Printed booklet with setup, investigation rules, and final reveal flow.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_CASE_FILE_RULEBOOK_SKU",
    },
    {
      componentKey: "pieces_kit",
      componentLabel: "Case File stock pieces kit",
      quantity: 1,
      notes: "Stock suspect markers, investigation tokens, and one d6.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_CASE_FILE_PIECES_KIT_SKU",
    },
    {
      componentKey: "box",
      componentLabel: "Case File retail-ready box",
      quantity: 1,
      notes: "Standard box sized for the evidence board, decks, booklet, and stock pieces.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_CASE_FILE_BOX_SKU",
    },
  ],
  schema: mysteryNightWizardSchema,
  parseInput: (raw) => mysteryNightWizardSchema.parse(raw),
  buildProjectItems: (input) => [
    ...input.suspects.map(
      (suspect: MysteryNightWizardInput["suspects"][number], index: number) => ({
      name: suspect.name,
      category: ProjectItemCategory.person_pet,
      note:
        joinNoteParts(
          suspect.role,
          suspect.trait,
          suspect.suspicionLevel ? `${suspect.suspicionLevel} suspicion` : undefined,
        ) || undefined,
      sortOrder: index,
      }),
    ),
    ...input.locations.map(
      (location: MysteryNightWizardInput["locations"][number], index: number) => ({
      name: location.name,
      category: location.category as ProjectItemCategory,
      note: joinNoteParts(location.whyItMatters, location.mood, location.note) || undefined,
      sortOrder: input.suspects.length + index,
      }),
    ),
    ...input.clues.map((clue: MysteryNightWizardInput["clues"][number], index: number) => ({
      name: clue.name,
      category: clue.category as ProjectItemCategory,
      note: joinNoteParts(clue.story, clue.note) || undefined,
      sortOrder: input.suspects.length + input.locations.length + index,
    })),
  ],
  generateContent: generateMysteryNightContent,
  renderBoard: renderMysteryNightBoardSvg,
};

const INSIDE_JOKE_TEMPLATE: TemplateDefinition<InsideJokeShowdownWizardInput> = {
  slug: "trivia-trek",
  name: "Trivia Trek",
  shortDescription: "A personalized trivia board built from stories, categories, callbacks, and signature answers.",
  description:
    "Turn family lore, relationship stories, or friend-group history into a premium classic-inspired trivia board with question cards, bonus cards, movers, and a boxed physical kit.",
  status: "available",
  boardStyle: "party",
  deckLabels: { primary: "Question Cards", secondary: "Bonus Cards" },
  tileTypeOptions: ["bonus", "challenge", "double_down", "reward", "shortcut", "wildcard"],
  landingBadge: "Classic-inspired trivia challenge",
  heroBullets: [
    "Custom categories, question cards, and bonus rounds",
    "Board, question decks, movers, and score tokens in the boxed kit",
    "Best for reunions, couples, birthdays, and family game night",
  ],
  questionSummary: [
    {
      label: "Question themes",
      description: "Trivia categories, answer anchors, and the facts that make each category real.",
    },
    {
      label: "Bonus rounds",
      description: "Tie-breakers, speed rounds, and signature answers only this group would know.",
    },
    { label: "Style", description: "Quiz-night energy, visual direction, and title framing." },
  ],
  tiers: [
    { ...COMMON_TIERS.digital, amount: 3900 },
    { ...COMMON_TIERS.physical, amount: 7900 },
    { ...COMMON_TIERS.premium, amount: 14900 },
  ],
  productionWindow: { minDays: 7, maxDays: 11, quoteTtlHours: 24 },
  bomVersion: "trivia-trek-v1",
  componentSetSummary: [
    "1 trivia board / score track",
    "24 Question Cards + 24 Bonus Cards",
    "1 rule booklet",
    "6 stock movers, 1 die, 36 score markers",
    "1 retail-ready box",
  ],
  packoutChecklist: [
    "Place the trivia board / score track at the base of the box.",
    "Collate the Question Cards and Bonus Cards into two labeled 24-card decks.",
    "Add the stock pieces kit with 6 movers, 1 die, and 36 score markers.",
    "Place the rule booklet on top as the first-read insert.",
    "Seal the full trivia kit in the retail-ready box without GameGift Studio hand fulfillment.",
  ],
  vendorComponents: [
    {
      componentKey: "board",
      componentLabel: "Trivia Trek score-track board",
      quantity: 1,
      notes: "Printed board uploaded from the final trivia track layout.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_TRIVIA_TREK_BOARD_SKU",
    },
    {
      componentKey: "deck_primary",
      componentLabel: "Trivia Trek Question Cards deck",
      quantity: 1,
      notes: "Primary 24-card question deck.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_TRIVIA_TREK_DECK_PRIMARY_SKU",
    },
    {
      componentKey: "deck_secondary",
      componentLabel: "Trivia Trek Bonus Cards deck",
      quantity: 1,
      notes: "Secondary 24-card bonus and tie-breaker deck.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_TRIVIA_TREK_DECK_SECONDARY_SKU",
    },
    {
      componentKey: "rulebook",
      componentLabel: "Trivia Trek rule booklet",
      quantity: 1,
      notes: "Printed booklet with setup, scoring, and round structure.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_TRIVIA_TREK_RULEBOOK_SKU",
    },
    {
      componentKey: "pieces_kit",
      componentLabel: "Trivia Trek stock pieces kit",
      quantity: 1,
      notes: "Stock movers, one d6, and score markers packed with the printed set.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_TRIVIA_TREK_PIECES_KIT_SKU",
    },
    {
      componentKey: "box",
      componentLabel: "Trivia Trek retail-ready box",
      quantity: 1,
      notes: "Standard box sized for the board, decks, booklet, and stock pieces.",
      mode: "component",
      requiredForQuotes: true,
      envKey: "TGC_TRIVIA_TREK_BOX_SKU",
    },
  ],
  schema: insideJokeShowdownWizardSchema,
  parseInput: (raw) => insideJokeShowdownWizardSchema.parse(raw),
  buildProjectItems: (input) => [
    ...input.insideJokes.map(
      (item: InsideJokeShowdownWizardInput["insideJokes"][number], index: number) => ({
      name: item.name,
      category: item.category as ProjectItemCategory,
      note:
        joinNoteParts(
          item.whyItMatters,
          item.factOne,
          item.factTwo,
          item.factThree,
          item.note,
        ) || undefined,
      sortOrder: index,
      }),
    ),
    ...input.rapidChallenges.map(
      (item: InsideJokeShowdownWizardInput["rapidChallenges"][number], index: number) => ({
      name: item.name,
      category: item.category as ProjectItemCategory,
      note: joinNoteParts(item.prompt, item.difficulty, item.note) || undefined,
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
  "home-turf": HOME_TURF_TEMPLATE,
  "milestone-trail": LIFE_QUEST_TEMPLATE,
  "face-card": FACE_CARD_TEMPLATE,
  "case-file": MYSTERY_NIGHT_TEMPLATE,
  "trivia-trek": INSIDE_JOKE_TEMPLATE,
} as const;

export function getTemplateDefinition(slug: TemplateSlug) {
  return TEMPLATE_REGISTRY[slug];
}

export function listTemplateDefinitions() {
  return [
    TEMPLATE_REGISTRY["home-turf"],
    TEMPLATE_REGISTRY["milestone-trail"],
    TEMPLATE_REGISTRY["face-card"],
    TEMPLATE_REGISTRY["case-file"],
    TEMPLATE_REGISTRY["trivia-trek"],
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
