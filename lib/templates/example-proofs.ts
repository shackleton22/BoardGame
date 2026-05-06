import { ProductTier } from "@prisma/client";

import { buildFallbackFaceCard } from "@/lib/ai/fallbackFaceCard";
import { buildFallbackHomeTurf } from "@/lib/ai/fallbackHomeTurf";
import { buildFallbackInsideJokeShowdown } from "@/lib/ai/fallbackInsideJokeShowdown";
import { buildFallbackLifeQuest, normalizeLifeQuestOutput } from "@/lib/ai/fallbackLifeQuest";
import { buildFallbackMysteryNight } from "@/lib/ai/fallbackMysteryNight";
import { getTemplateDefinition } from "@/lib/templates/registry";
import { renderTemplateShowcaseSvg } from "@/lib/templates/showcase-board-art";
import type { TemplateSlug } from "@/lib/templates/types";
import {
  faceCardWizardSchema,
  homeTurfWizardSchema,
  insideJokeShowdownWizardSchema,
  lifeQuestWizardSchema,
  mysteryNightWizardSchema,
  type ProjectOutputPayload,
} from "@/lib/validation/project";

type ExampleCard = ProjectOutputPayload["deckPrimary"][number];

export type TemplateExampleProof = {
  slug: TemplateSlug;
  templateName: string;
  scenario: string;
  recipientName: string;
  occasion: string;
  inputJson: unknown;
  boardSvg: string;
  showcaseSvg: string;
  output: ProjectOutputPayload;
  primaryLabel: string;
  secondaryLabel: string;
  primaryCard: ExampleCard;
  secondaryCard: ExampleCard;
};

type ExampleInputSummary = {
  recipientName: string;
  occasion: string;
  visualStyle: string;
  colorMood: string;
};

function buildExampleProof(
  slug: TemplateSlug,
  input: ExampleInputSummary,
  output: ProjectOutputPayload,
  scenario: string,
): TemplateExampleProof {
  const template = getTemplateDefinition(slug);

  const boardSvg = template.renderBoard({
    output,
    project: {
      recipientName: input.recipientName,
      occasion: input.occasion,
      visualStyle: input.visualStyle,
      colorMood: input.colorMood,
    },
    mode: "preview",
  });

  return {
    slug,
    templateName: template.name,
    scenario,
    recipientName: input.recipientName,
    occasion: input.occasion,
    inputJson: input,
    boardSvg,
    showcaseSvg: renderTemplateShowcaseSvg({
      slug,
      templateName: template.name,
      recipientName: input.recipientName,
      occasion: input.occasion,
      inputJson: input,
      output,
    }),
    output,
    primaryLabel: output.deckPrimaryLabel,
    secondaryLabel: output.deckSecondaryLabel,
    primaryCard: output.deckPrimary[0],
    secondaryCard: output.deckSecondary[0],
  };
}

export function getTemplateExampleProofs(): TemplateExampleProof[] {
  const homeTurfInput = homeTurfWizardSchema.parse({
    templateSlug: "home-turf",
    recipientName: "Rachel",
    buyerName: "Jordan",
    occasion: "birthday",
    tone: "funny",
    relationship: "friend",
    visualStyle: "modern",
    colorMood: "warm",
    productTier: ProductTier.digital_print_kit,
    places: [
      {
        name: "Maple Street House",
        category: "place",
        whyItMatters: "Where every dinner somehow became a late-night hangout.",
        vibe: "home-base cozy",
      },
      {
        name: "The Taco Patio",
        category: "food",
        whyItMatters: "The unofficial headquarters after long weeks.",
        vibe: "bright and chaotic",
      },
      {
        name: "Lake Weekend",
        category: "travel",
        whyItMatters: "Sunburns, boat snacks, and one very dramatic cooler rescue.",
        vibe: "summer legend",
      },
      {
        name: "Dog Park Loop",
        category: "place",
        whyItMatters: "A peaceful route with maximum neighborhood gossip.",
        vibe: "easy Sunday",
      },
      {
        name: "Bookstore Corner",
        category: "hobby",
        whyItMatters: "The place where quick errands become two-hour visits.",
        vibe: "quiet favorite",
      },
      {
        name: "Backyard Fire Pit",
        category: "memory",
        whyItMatters: "The best stories always showed up after the second marshmallow.",
        vibe: "golden hour",
      },
    ],
    dealCards: [
      {
        name: "Tell the Story",
        category: "memory",
        prompt: "Share the real story behind one stop on the map and gain one turf point.",
        kind: "bonus",
      },
      {
        name: "Guess the Order",
        category: "food",
        prompt: "Name the favorite order, snack, or drink tied to a place. Closest answer gains a point.",
        kind: "bonus",
      },
      {
        name: "Scenic Route",
        category: "travel",
        prompt: "Move to a travel or weekend space and explain why it belongs on the map.",
        kind: "detour",
      },
      {
        name: "Local Vote",
        category: "inside_joke",
        prompt: "Everyone votes on the best memory from a place. The winner gains a point.",
        kind: "bonus",
      },
    ],
  });

  const milestoneTrailInput = lifeQuestWizardSchema.parse({
    templateSlug: "milestone-trail",
    recipientName: "Avery",
    buyerName: "Maya",
    occasion: "anniversary",
    tone: "heartfelt",
    relationship: "partner",
    visualStyle: "cozy",
    colorMood: "warm",
    productTier: ProductTier.digital_print_kit,
    items: [
      {
        name: "First Apartment",
        category: "place",
        whyItMatters: "Tiny kitchen, huge plans, and the first place that felt like ours.",
        era: "young adult years",
      },
      {
        name: "Rainy Proposal Walk",
        category: "memory",
        whyItMatters: "The weather did not cooperate, which somehow made it perfect.",
        era: "recent years",
      },
      {
        name: "Sunday Pancakes",
        category: "food",
        whyItMatters: "A small ritual that became the week's soft landing.",
        era: "timeless",
      },
      {
        name: "Blue Ridge Trip",
        category: "travel",
        whyItMatters: "Wrong turn, best overlook, unforgettable photo.",
        era: "recent years",
      },
      {
        name: "New Job Toast",
        category: "achievement",
        whyItMatters: "A big win celebrated with cheap champagne and big relief.",
        era: "recent years",
      },
      {
        name: "Movie Blanket Era",
        category: "inside_joke",
        whyItMatters: "The blanket is apparently not communal. This is still debated.",
        era: "timeless",
      },
    ],
  });

  const faceCardInput = faceCardWizardSchema.parse({
    templateSlug: "face-card",
    recipientName: "Parker",
    buyerName: "Nina",
    occasion: "family reunion",
    tone: "chaotic/funny",
    relationship: "family",
    visualStyle: "playful",
    colorMood: "bright",
    productTier: ProductTier.digital_print_kit,
    people: [
      {
        name: "Aunt Lena",
        role: "Dessert commander",
        tell: "Always knows who skipped breakfast.",
        decoyTrait: "Pretends the recipe is casual.",
      },
      {
        name: "Uncle Rob",
        role: "Grill philosopher",
        tell: "Says five minutes when he means twenty.",
        decoyTrait: "Claims he is not competitive.",
      },
      {
        name: "Cousin Tess",
        role: "Group photographer",
        tell: "Makes everyone retake the candid.",
        decoyTrait: "Acts shy until karaoke starts.",
      },
      {
        name: "Grandpa Joe",
        role: "Story archivist",
        tell: "Begins every tale with one quick thing.",
        decoyTrait: "Knows exactly where the good snacks are hidden.",
      },
      {
        name: "Milo",
        role: "Snack inspector",
        tell: "Appears when cheese opens.",
        decoyTrait: "Technically a dog, emotionally a mayor.",
      },
      {
        name: "Bea",
        role: "Playlist boss",
        tell: "Can identify a song in two notes.",
        decoyTrait: "Denies starting the dance circle.",
      },
    ],
    cluePrompts: [
      {
        name: "Snack Habits",
        category: "food",
        prompt: "Ask whether this person has a signature snack move.",
        difficulty: "easy",
      },
      {
        name: "Vacation Energy",
        category: "travel",
        prompt: "Ask whether this person packs light, overpacks, or forgets something vital.",
        difficulty: "medium",
      },
      {
        name: "Party Role",
        category: "memory",
        prompt: "Ask what role this person naturally takes at a gathering.",
        difficulty: "easy",
      },
      {
        name: "Secret Tell",
        category: "inside_joke",
        prompt: "Ask for one hint based on a habit only the group would know.",
        difficulty: "hard",
      },
    ],
    revealMode: "Final guesses should feel like a family roast with manners.",
  });

  const caseFileInput = mysteryNightWizardSchema.parse({
    templateSlug: "case-file",
    recipientName: "Morgan",
    buyerName: "Alex",
    occasion: "friendship",
    tone: "funny",
    relationship: "friend",
    visualStyle: "vintage",
    colorMood: "muted",
    productTier: ProductTier.digital_print_kit,
    suspects: [
      {
        name: "Jamie",
        role: "Playlist keeper",
        trait: "Suspiciously good memory",
        suspicionLevel: "medium",
      },
      {
        name: "Dev",
        role: "Snack runner",
        trait: "Always vanishes at the key moment",
        suspicionLevel: "high",
      },
      {
        name: "Priya",
        role: "Calendar wizard",
        trait: "Knows everyone's alibi too quickly",
        suspicionLevel: "medium",
      },
      {
        name: "Leo",
        role: "Camera roll witness",
        trait: "Has photographic evidence but never enough storage",
        suspicionLevel: "low",
      },
    ],
    locations: [
      {
        name: "Cabin Kitchen",
        category: "place",
        whyItMatters: "Every trip begins here and every mystery ends near the snacks.",
        mood: "cozy",
      },
      {
        name: "Photo Booth",
        category: "memory",
        whyItMatters: "The scene of three props, four poses, and one missing hat.",
        mood: "dramatic",
      },
      {
        name: "Last Table",
        category: "food",
        whyItMatters: "The group's usual table where receipts become evidence.",
        mood: "nostalgic",
      },
    ],
    clues: [
      {
        name: "Glitter Receipt",
        category: "other",
        story: "Found folded in a jacket after the holiday party.",
      },
      {
        name: "Half Playlist",
        category: "hobby",
        story: "Stops right before the song everyone remembers.",
      },
      {
        name: "Mystery Keychain",
        category: "travel",
        story: "Nobody admits buying it, but everyone knows the trip.",
      },
      {
        name: "Coffee Order",
        category: "food",
        story: "Too specific to be innocent.",
      },
    ],
    revealTwist: "The culprit is whoever can tell the funniest true version of the story.",
  });

  const triviaTrekInput = insideJokeShowdownWizardSchema.parse({
    templateSlug: "trivia-trek",
    recipientName: "Sam",
    buyerName: "Taylor",
    occasion: "birthday",
    tone: "funny",
    relationship: "group",
    visualStyle: "modern",
    colorMood: "bold",
    productTier: ProductTier.digital_print_kit,
    insideJokes: [
      {
        name: "Road Trip Rules",
        category: "travel",
        whyItMatters: "The driver controls music, but snack votes can overrule.",
        factOne: "The cooler must be accessible.",
        factTwo: "Nobody trusts the scenic route anymore.",
        factThree: "The gas station sunglasses were worth it.",
      },
      {
        name: "Brunch Lore",
        category: "food",
        whyItMatters: "Reservations are a theory, not a guarantee.",
        factOne: "Sam always orders for the table.",
      },
      {
        name: "Pet Chaos",
        category: "person_pet",
        whyItMatters: "Every gathering includes at least one animal subplot.",
        factOne: "Milo stole a roll and became a legend.",
      },
      {
        name: "Karaoke Night",
        category: "memory",
        whyItMatters: "A birthday classic with fearless performances and selective memory.",
        factOne: "Power ballads score double.",
      },
    ],
    rapidChallenges: [
      {
        name: "Finish the Quote",
        category: "inside_joke",
        prompt: "Complete the line exactly as Sam says it.",
        difficulty: "medium",
      },
      {
        name: "Guess the Year",
        category: "memory",
        prompt: "Name the year of the trip, dinner, or group photo.",
        difficulty: "hard",
      },
      {
        name: "Name the Culprit",
        category: "other",
        prompt: "Vote on who started the recurring joke.",
        difficulty: "easy",
      },
    ],
    catchphrases: ["Absolutely not", "One quick stop", "We have snacks"],
  });

  return [
    buildExampleProof(
      "home-turf",
      homeTurfInput,
      buildFallbackHomeTurf(homeTurfInput),
      "Favorite places, rituals, routes, and home-field jokes become a map game.",
    ),
    buildExampleProof(
      "milestone-trail",
      milestoneTrailInput,
      normalizeLifeQuestOutput(buildFallbackLifeQuest(milestoneTrailInput)),
      "Life chapters, wins, trips, and little rituals become a keepsake journey.",
    ),
    buildExampleProof(
      "face-card",
      faceCardInput,
      buildFallbackFaceCard(faceCardInput),
      "People, pets, tells, decoys, and family roles become a guessing game.",
    ),
    buildExampleProof(
      "case-file",
      caseFileInput,
      buildFallbackMysteryNight(caseFileInput),
      "Familiar suspects, scenes, and evidence become a personalized mystery.",
    ),
    buildExampleProof(
      "trivia-trek",
      triviaTrekInput,
      buildFallbackInsideJokeShowdown(triviaTrekInput),
      "Group lore, callback facts, and bonus rounds become personal trivia.",
    ),
  ];
}
