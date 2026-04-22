import { ProductTier, ProjectItemCategory, ProjectStatus } from "@prisma/client";

import { buildFallbackInsideJokeShowdown } from "@/lib/ai/fallbackInsideJokeShowdown";
import { buildFallbackLifeQuest } from "@/lib/ai/fallbackLifeQuest";
import { buildFallbackMysteryNight } from "@/lib/ai/fallbackMysteryNight";
import { normalizeLifeQuestOutput } from "@/lib/ai/fallbackLifeQuest";
import { syncCatalogData } from "@/lib/catalog/sync";
import { db } from "@/lib/db";
import { generatePreviewAssets } from "@/lib/render/assets";
import type {
  InsideJokeShowdownWizardInput,
  LifeQuestWizardInput,
  MysteryNightWizardInput,
} from "@/lib/validation/project";

async function seedLifeQuest() {
  const template = await db.gameTemplate.findUnique({
    where: { slug: "life-quest" },
  });

  if (!template) {
    throw new Error("Missing life-quest template record.");
  }

  const existing = await db.project.findFirst({
    where: { templateSlug: "life-quest", recipientName: "Avery" },
  });

  if (existing) {
    return;
  }

  const input: LifeQuestWizardInput = {
    templateSlug: "life-quest",
    recipientName: "Avery",
    buyerName: "Jordan",
    occasion: "anniversary",
    tone: "heartfelt",
    relationship: "partner",
    items: [
      { name: "Lake house weekends", category: "place", note: "Coffee on the dock at sunrise." },
      { name: "Nashville trip", category: "travel", note: "The karaoke confidence peaked." },
      { name: "Grandma's kitchen", category: "memory", note: "Where every plan turned into a feast." },
      { name: "Home gym", category: "hobby", note: "Equal parts discipline and dramatic pep talks." },
      { name: "First apartment", category: "memory", note: "Tiny kitchen, big dreams, unmatched playlists." },
      { name: "Sourdough era", category: "inside_joke", note: "A starter with its own personality." },
      { name: "Maple the dog", category: "person_pet", note: "Chief greeter and snack supervisor." },
      { name: "Promotion day", category: "achievement", note: "Hard work finally got the spotlight." },
    ],
    visualStyle: "modern",
    colorMood: "warm",
    titleOverride: undefined,
    subtitleOverride: undefined,
    avoidNotes: "Anything too cheesy or overly formal.",
    productTier: ProductTier.digital_print_kit,
    shipping: undefined,
    customerEmail: "demo@example.com",
    turnstileToken: undefined,
  };

  const output = normalizeLifeQuestOutput(buildFallbackLifeQuest(input));

  const project = await db.project.create({
    data: {
      templateId: template.id,
      templateSlug: input.templateSlug,
      status: ProjectStatus.preview_ready,
      recipientName: input.recipientName,
      buyerName: input.buyerName,
      occasion: input.occasion,
      tone: input.tone,
      relationship: input.relationship,
      visualStyle: input.visualStyle,
      colorMood: input.colorMood,
      titleOverride: input.titleOverride,
      subtitleOverride: input.subtitleOverride,
      avoidNotes: input.avoidNotes,
      productTier: input.productTier,
      shippingJson: input.shipping ?? undefined,
      inputJson: input,
      outputJson: { ...output, generationSource: "fallback" },
      items: {
        create: input.items.map((item: LifeQuestWizardInput["items"][number], index: number) => ({
          name: item.name,
          category: item.category,
          note: item.note,
          sortOrder: index,
        })),
      },
    },
  });

  await generatePreviewAssets({
    id: project.id,
    templateSlug: "life-quest",
    recipientName: project.recipientName,
    occasion: project.occasion,
    visualStyle: project.visualStyle,
    colorMood: project.colorMood,
    outputJson: output,
  });
}

async function seedMysteryNight() {
  const template = await db.gameTemplate.findUnique({
    where: { slug: "mystery-night" },
  });

  if (!template) {
    throw new Error("Missing mystery-night template record.");
  }

  const existing = await db.project.findFirst({
    where: { templateSlug: "mystery-night", recipientName: "Morgan" },
  });

  if (existing) {
    return;
  }

  const input: MysteryNightWizardInput = {
    templateSlug: "mystery-night",
    recipientName: "Morgan",
    buyerName: "Casey",
    occasion: "friendship",
    tone: "adventurous",
    relationship: "group",
    suspects: [
      { name: "The snack thief", role: "Always near the chips." },
      { name: "The playlist captain", role: "Claims innocence, controls the aux." },
      { name: "The last-minute planner", role: "Somehow still blameless." },
      { name: "The trivia assassin", role: "Knows too much to ignore." },
    ],
    locations: [
      { name: "The lake cabin", category: "place", note: "Where the suspicious timeline begins." },
      { name: "The favorite diner booth", category: "memory", note: "Every theory returns here." },
      { name: "The office break room", category: "place", note: "Coffee, clues, and gossip." },
      { name: "The overpacked road trip car", category: "travel", note: "A mobile evidence locker." },
    ],
    clues: [
      { name: "A glittery receipt", category: "memory", note: "Proof that somebody lied." },
      { name: "A suspicious coffee order", category: "food", note: "The wrong milk gave it away." },
      { name: "A scribbled to-do list", category: "career", note: "Half motive, half confession." },
      { name: "A photo booth strip", category: "memory", note: "Caught in 4 suspicious frames." },
      { name: "A mystery keychain", category: "inside_joke", note: "Nobody remembers where it came from." },
      { name: "A half-finished playlist", category: "inside_joke", note: "Too specific to be random." },
    ],
    revealTwist: "The culprit was really the group's bad memory all along.",
    visualStyle: "vintage",
    colorMood: "muted",
    titleOverride: undefined,
    subtitleOverride: undefined,
    avoidNotes: "Nothing too dark or mean-spirited.",
    productTier: ProductTier.digital_print_kit,
    shipping: undefined,
    customerEmail: "mystery@example.com",
    turnstileToken: undefined,
  };

  const output = buildFallbackMysteryNight(input);

  const project = await db.project.create({
    data: {
      templateId: template.id,
      templateSlug: input.templateSlug,
      status: ProjectStatus.preview_ready,
      recipientName: input.recipientName,
      buyerName: input.buyerName,
      occasion: input.occasion,
      tone: input.tone,
      relationship: input.relationship,
      visualStyle: input.visualStyle,
      colorMood: input.colorMood,
      titleOverride: input.titleOverride,
      subtitleOverride: input.subtitleOverride,
      avoidNotes: input.avoidNotes,
      productTier: input.productTier,
      inputJson: input,
      outputJson: { ...output, generationSource: "fallback" },
      items: {
        create: [
          ...input.suspects.map(
            (item: MysteryNightWizardInput["suspects"][number], index: number) => ({
            name: item.name,
            category: ProjectItemCategory.person_pet,
            note: item.role,
            sortOrder: index,
            }),
          ),
          ...input.locations.map(
            (item: MysteryNightWizardInput["locations"][number], index: number) => ({
            name: item.name,
            category: item.category as ProjectItemCategory,
            note: item.note,
            sortOrder: input.suspects.length + index,
            }),
          ),
          ...input.clues.map((item: MysteryNightWizardInput["clues"][number], index: number) => ({
            name: item.name,
            category: item.category as ProjectItemCategory,
            note: item.note,
            sortOrder: input.suspects.length + input.locations.length + index,
          })),
        ],
      },
    },
  });

  await generatePreviewAssets({
    id: project.id,
    templateSlug: "mystery-night",
    recipientName: project.recipientName,
    occasion: project.occasion,
    visualStyle: project.visualStyle,
    colorMood: project.colorMood,
    outputJson: output,
  });
}

async function seedInsideJokeShowdown() {
  const template = await db.gameTemplate.findUnique({
    where: { slug: "inside-joke-showdown" },
  });

  if (!template) {
    throw new Error("Missing inside-joke-showdown template record.");
  }

  const existing = await db.project.findFirst({
    where: { templateSlug: "inside-joke-showdown", recipientName: "Sam" },
  });

  if (existing) {
    return;
  }

  const input: InsideJokeShowdownWizardInput = {
    templateSlug: "inside-joke-showdown",
    recipientName: "Sam",
    buyerName: "Taylor",
    occasion: "birthday",
    tone: "funny",
    relationship: "group",
    insideJokes: [
      { name: "The cursed group chat idea", category: "inside_joke", note: "It should never have been typed." },
      { name: "The dramatic birthday toast", category: "memory", note: "Oscar-worthy sincerity." },
      { name: "The road trip snack debate", category: "food", note: "Still unresolved." },
      { name: "The fake rivalry", category: "inside_joke", note: "Completely manufactured and somehow real." },
      { name: "The impossible parking story", category: "travel", note: "Nobody agrees on the details." },
      { name: "The one phrase everyone repeats", category: "inside_joke", note: "Always louder than necessary." },
      { name: "The accidental karaoke solo", category: "memory", note: "A legacy performance." },
      { name: "The emergency coffee run", category: "food", note: "Necessary, dramatic, and expensive." },
    ],
    rapidChallenges: [
      { name: "Act it out in ten seconds", category: "other", note: "Maximum commitment, minimum preparation." },
      { name: "Tell the origin story", category: "memory", note: "Fast version only." },
      { name: "Chaos rating from 1 to 10", category: "other", note: "No neutral answers." },
      { name: "Pick who started it", category: "inside_joke", note: "The group must decide." },
      { name: "Rank the overreaction", category: "other", note: "Someone always deserved it." },
      { name: "Give it a sequel", category: "other", note: "Invent the next disastrous chapter." },
    ],
    catchphrases: [
      "That's going in the group chat",
      "Legendary behavior",
      "Absolutely not",
      "The council has decided",
    ],
    visualStyle: "playful",
    colorMood: "bright",
    titleOverride: undefined,
    subtitleOverride: undefined,
    avoidNotes: "Nothing that feels mean-spirited.",
    productTier: ProductTier.digital_print_kit,
    shipping: undefined,
    customerEmail: "showdown@example.com",
    turnstileToken: undefined,
  };

  const output = buildFallbackInsideJokeShowdown(input);

  const project = await db.project.create({
    data: {
      templateId: template.id,
      templateSlug: input.templateSlug,
      status: ProjectStatus.preview_ready,
      recipientName: input.recipientName,
      buyerName: input.buyerName,
      occasion: input.occasion,
      tone: input.tone,
      relationship: input.relationship,
      visualStyle: input.visualStyle,
      colorMood: input.colorMood,
      titleOverride: input.titleOverride,
      subtitleOverride: input.subtitleOverride,
      avoidNotes: input.avoidNotes,
      productTier: input.productTier,
      inputJson: input,
      outputJson: { ...output, generationSource: "fallback" },
      items: {
        create: [
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
      },
    },
  });

  await generatePreviewAssets({
    id: project.id,
    templateSlug: "inside-joke-showdown",
    recipientName: project.recipientName,
    occasion: project.occasion,
    visualStyle: project.visualStyle,
    colorMood: project.colorMood,
    outputJson: output,
  });
}

async function main() {
  await syncCatalogData();
  await seedLifeQuest();
  await seedMysteryNight();
  await seedInsideJokeShowdown();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
