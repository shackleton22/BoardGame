import { ProductTier, ProjectItemCategory, ProjectStatus } from "@prisma/client";

import { buildFallbackFaceCard } from "@/lib/ai/fallbackFaceCard";
import { buildFallbackHomeTurf } from "@/lib/ai/fallbackHomeTurf";
import { buildFallbackInsideJokeShowdown } from "@/lib/ai/fallbackInsideJokeShowdown";
import { buildFallbackLifeQuest } from "@/lib/ai/fallbackLifeQuest";
import { buildFallbackMysteryNight } from "@/lib/ai/fallbackMysteryNight";
import { normalizeLifeQuestOutput } from "@/lib/ai/fallbackLifeQuest";
import { syncCatalogData } from "@/lib/catalog/sync";
import { db } from "@/lib/db";
import { generatePreviewAssets } from "@/lib/render/assets";
import type {
  FaceCardWizardInput,
  HomeTurfWizardInput,
  InsideJokeShowdownWizardInput,
  LifeQuestWizardInput,
  MysteryNightWizardInput,
} from "@/lib/validation/project";

async function seedHomeTurf() {
  const template = await db.gameTemplate.findUnique({
    where: { slug: "home-turf" },
  });

  if (!template) {
    throw new Error("Missing home-turf template record.");
  }

  const existing = await db.project.findFirst({
    where: { templateSlug: "home-turf", recipientName: "Riley" },
  });

  if (existing) {
    return;
  }

  const input: HomeTurfWizardInput = {
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
        whyItMatters: "The block where every weekend plan starts.",
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
    avoidNotes: "Do not make it feel like a real-estate game.",
    productTier: ProductTier.digital_print_kit,
    shipping: undefined,
    customerEmail: "home@example.com",
    turnstileToken: undefined,
  };

  const output = buildFallbackHomeTurf(input);

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
          ...input.places.map((item: HomeTurfWizardInput["places"][number], index: number) => ({
            name: item.name,
            category: item.category as ProjectItemCategory,
            note: [item.whyItMatters, item.vibe, item.note].filter(Boolean).join(" | "),
            sortOrder: index,
          })),
          ...input.dealCards.map(
            (item: HomeTurfWizardInput["dealCards"][number], index: number) => ({
              name: item.name,
              category: item.category as ProjectItemCategory,
              note: [item.kind, item.prompt, item.note].filter(Boolean).join(" | "),
              sortOrder: input.places.length + index,
            }),
          ),
        ],
      },
    },
  });

  await generatePreviewAssets({
    id: project.id,
    templateSlug: "home-turf",
    recipientName: project.recipientName,
    occasion: project.occasion,
    visualStyle: project.visualStyle,
    colorMood: project.colorMood,
    outputJson: output,
  });
}

async function seedLifeQuest() {
  const template = await db.gameTemplate.findUnique({
    where: { slug: "milestone-trail" },
  });

  if (!template) {
    throw new Error("Missing milestone-trail template record.");
  }

  const existing = await db.project.findFirst({
    where: { templateSlug: "milestone-trail", recipientName: "Avery" },
  });

  if (existing) {
    return;
  }

  const input: LifeQuestWizardInput = {
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
        whyItMatters: "It is the reset button for the whole family.",
        era: "recent years",
        note: "Coffee on the dock at sunrise.",
      },
      {
        name: "Nashville trip",
        category: "travel",
        whyItMatters: "It became the trip everyone still quotes back to each other.",
        era: "young adult years",
        note: "The karaoke confidence peaked.",
      },
      {
        name: "Grandma's kitchen",
        category: "memory",
        whyItMatters: "Where every plan turned into a feast and a story.",
        era: "childhood",
        note: "Where every plan turned into a feast.",
      },
      {
        name: "Home gym",
        category: "hobby",
        whyItMatters: "A daily ritual that became part of the identity.",
        era: "recent years",
        note: "Equal parts discipline and dramatic pep talks.",
      },
      {
        name: "First apartment",
        category: "memory",
        whyItMatters: "Tiny, loud, and full of important firsts.",
        era: "young adult years",
        note: "Tiny kitchen, big dreams, unmatched playlists.",
      },
      {
        name: "Sourdough era",
        category: "inside_joke",
        whyItMatters: "A season the whole house accidentally joined.",
        era: "recent years",
        note: "A starter with its own personality.",
      },
      {
        name: "Maple the dog",
        category: "person_pet",
        whyItMatters: "Maple somehow became the center of every gathering.",
        era: "timeless",
        note: "Chief greeter and snack supervisor.",
      },
      {
        name: "Promotion day",
        category: "achievement",
        whyItMatters: "The hard work finally got the spotlight.",
        era: "recent years",
        note: "Hard work finally got the spotlight.",
      },
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
          note: [item.whyItMatters, item.era, item.note].filter(Boolean).join(" | "),
          sortOrder: index,
        })),
      },
    },
  });

  await generatePreviewAssets({
    id: project.id,
    templateSlug: "milestone-trail",
    recipientName: project.recipientName,
    occasion: project.occasion,
    visualStyle: project.visualStyle,
    colorMood: project.colorMood,
    outputJson: output,
  });
}

async function seedFaceCard() {
  const template = await db.gameTemplate.findUnique({
    where: { slug: "face-card" },
  });

  if (!template) {
    throw new Error("Missing face-card template record.");
  }

  const existing = await db.project.findFirst({
    where: { templateSlug: "face-card", recipientName: "Parker" },
  });

  if (existing) {
    return;
  }

  const input: FaceCardWizardInput = {
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
    avoidNotes: "Keep it kind and reunion-friendly.",
    productTier: ProductTier.digital_print_kit,
    shipping: undefined,
    customerEmail: "face@example.com",
    turnstileToken: undefined,
  };

  const output = buildFallbackFaceCard(input);

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
          ...input.people.map((item: FaceCardWizardInput["people"][number], index: number) => ({
            name: item.name,
            category: ProjectItemCategory.person_pet,
            note: [item.role, item.tell, item.decoyTrait].filter(Boolean).join(" | "),
            sortOrder: index,
          })),
          ...input.cluePrompts.map(
            (item: FaceCardWizardInput["cluePrompts"][number], index: number) => ({
              name: item.name,
              category: item.category as ProjectItemCategory,
              note: [item.difficulty, item.prompt, item.note].filter(Boolean).join(" | "),
              sortOrder: input.people.length + index,
            }),
          ),
        ],
      },
    },
  });

  await generatePreviewAssets({
    id: project.id,
    templateSlug: "face-card",
    recipientName: project.recipientName,
    occasion: project.occasion,
    visualStyle: project.visualStyle,
    colorMood: project.colorMood,
    outputJson: output,
  });
}

async function seedMysteryNight() {
  const template = await db.gameTemplate.findUnique({
    where: { slug: "case-file" },
  });

  if (!template) {
    throw new Error("Missing case-file template record.");
  }

  const existing = await db.project.findFirst({
    where: { templateSlug: "case-file", recipientName: "Morgan" },
  });

  if (existing) {
    return;
  }

  const input: MysteryNightWizardInput = {
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
        trait: "Suddenly helpful when evidence is edible.",
        suspicionLevel: "high",
      },
      {
        name: "The playlist captain",
        role: "Claims innocence, controls the aux.",
        trait: "Too calm for someone with that much power.",
        suspicionLevel: "medium",
      },
      {
        name: "The last-minute planner",
        role: "Somehow still blameless.",
        trait: "Always arrives with a dramatic new theory.",
        suspicionLevel: "medium",
      },
      {
        name: "The trivia assassin",
        role: "Knows too much to ignore.",
        trait: "Remembers details nobody else noticed.",
        suspicionLevel: "high",
      },
    ],
    locations: [
      {
        name: "The lake cabin",
        category: "place",
        whyItMatters: "It is where the suspicious timeline begins.",
        mood: "nostalgic",
        note: "Where the suspicious timeline begins.",
      },
      {
        name: "The favorite diner booth",
        category: "memory",
        whyItMatters: "Every theory always returns here.",
        mood: "cozy",
        note: "Every theory returns here.",
      },
      {
        name: "The office break room",
        category: "place",
        whyItMatters: "Coffee, clues, and gossip all live here.",
        mood: "chaotic",
        note: "Coffee, clues, and gossip.",
      },
      {
        name: "The overpacked road trip car",
        category: "travel",
        whyItMatters: "Nobody remembers the same version of what happened in that car.",
        mood: "dramatic",
        note: "A mobile evidence locker.",
      },
    ],
    clues: [
      {
        name: "A glittery receipt",
        category: "memory",
        story: "It proves someone visited a place they definitely denied visiting.",
        note: "Proof that somebody lied.",
      },
      {
        name: "A suspicious coffee order",
        category: "food",
        story: "The milk choice narrows the suspect list immediately.",
        note: "The wrong milk gave it away.",
      },
      {
        name: "A scribbled to-do list",
        category: "career",
        story: "Half motive, half confession, and absolutely written in a hurry.",
        note: "Half motive, half confession.",
      },
      {
        name: "A photo booth strip",
        category: "memory",
        story: "The background tells on someone even more than the smiles do.",
        note: "Caught in 4 suspicious frames.",
      },
      {
        name: "A mystery keychain",
        category: "inside_joke",
        story: "Nobody remembers where it came from, which makes it worse.",
        note: "Nobody remembers where it came from.",
      },
      {
        name: "A half-finished playlist",
        category: "inside_joke",
        story: "The song choices point to one very specific person.",
        note: "Too specific to be random.",
      },
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
            note: [item.role, item.trait, item.suspicionLevel].filter(Boolean).join(" | "),
            sortOrder: index,
            }),
          ),
          ...input.locations.map(
            (item: MysteryNightWizardInput["locations"][number], index: number) => ({
            name: item.name,
            category: item.category as ProjectItemCategory,
            note: [item.whyItMatters, item.mood, item.note].filter(Boolean).join(" | "),
            sortOrder: input.suspects.length + index,
            }),
          ),
          ...input.clues.map((item: MysteryNightWizardInput["clues"][number], index: number) => ({
            name: item.name,
            category: item.category as ProjectItemCategory,
            note: [item.story, item.note].filter(Boolean).join(" | "),
            sortOrder: input.suspects.length + input.locations.length + index,
          })),
        ],
      },
    },
  });

  await generatePreviewAssets({
    id: project.id,
    templateSlug: "case-file",
    recipientName: project.recipientName,
    occasion: project.occasion,
    visualStyle: project.visualStyle,
    colorMood: project.colorMood,
    outputJson: output,
  });
}

async function seedInsideJokeShowdown() {
  const template = await db.gameTemplate.findUnique({
    where: { slug: "trivia-trek" },
  });

  if (!template) {
    throw new Error("Missing trivia-trek template record.");
  }

  const existing = await db.project.findFirst({
    where: { templateSlug: "trivia-trek", recipientName: "Sam" },
  });

  if (existing) {
    return;
  }

  const input: InsideJokeShowdownWizardInput = {
    templateSlug: "trivia-trek",
    recipientName: "Sam",
    buyerName: "Taylor",
    occasion: "birthday",
    tone: "funny",
    relationship: "group",
    insideJokes: [
      {
        name: "The cursed group chat idea",
        category: "inside_joke",
        whyItMatters: "It still gets brought up whenever anyone has a terrible suggestion.",
        factOne: "Everyone remembers who said it first.",
        factTwo: "Nobody agrees on why it sounded smart at the time.",
        factThree: "It became a standing warning label in the chat.",
        note: "It should never have been typed.",
      },
      {
        name: "The dramatic birthday toast",
        category: "memory",
        whyItMatters: "It crossed the line from heartfelt to legendary.",
        factOne: "Somebody cried for real.",
        factTwo: "Someone else immediately made it worse.",
        factThree: "The final line is still quoted back.",
        note: "Oscar-worthy sincerity.",
      },
      {
        name: "The road trip snack debate",
        category: "food",
        whyItMatters: "Nobody treats this like a small disagreement.",
        factOne: "The preferred snack order is still contested.",
        factTwo: "Everyone claims they were the reasonable one.",
        factThree: "It comes up on every trip now.",
        note: "Still unresolved.",
      },
      {
        name: "The fake rivalry",
        category: "inside_joke",
        whyItMatters: "A joke feud somehow became part of the group's identity.",
        factOne: "No one remembers the original cause.",
        factTwo: "Both sides claim they won years ago.",
        factThree: "The rivalry returns on command.",
        note: "Completely manufactured and somehow real.",
      },
      {
        name: "The impossible parking story",
        category: "travel",
        whyItMatters: "Every retelling adds another impossible detail.",
        factOne: "Nobody agrees where the car actually was.",
        factTwo: "The timeline makes less sense each year.",
        factThree: "It always ends with somebody overacting.",
        note: "Nobody agrees on the details.",
      },
      {
        name: "The one phrase everyone repeats",
        category: "inside_joke",
        whyItMatters: "It shows up in person, in texts, and in the wrong contexts.",
        factOne: "It never sounds quieter with age.",
        factTwo: "Someone always says it at the worst possible time.",
        factThree: "Everybody can do the exact delivery.",
        note: "Always louder than necessary.",
      },
      {
        name: "The accidental karaoke solo",
        category: "memory",
        whyItMatters: "No one planned it and now no one can escape it.",
        factOne: "The wrong verse was sung with total confidence.",
        factTwo: "The crowd reaction is still debated.",
        factThree: "It somehow improved the legend.",
        note: "A legacy performance.",
      },
      {
        name: "The emergency coffee run",
        category: "food",
        whyItMatters: "A tiny errand became a group saga.",
        factOne: "The order was too complicated for the situation.",
        factTwo: "The receipt became evidence.",
        factThree: "The story gets told like a survival tale.",
        note: "Necessary, dramatic, and expensive.",
      },
    ],
    rapidChallenges: [
      {
        name: "Act it out in ten seconds",
        category: "other",
        prompt: "Reenact the moment in ten seconds or less.",
        difficulty: "hard",
        note: "Maximum commitment, minimum preparation.",
      },
      {
        name: "Tell the origin story",
        category: "memory",
        prompt: "Give the fastest possible version of how it started.",
        difficulty: "medium",
        note: "Fast version only.",
      },
      {
        name: "Chaos rating from 1 to 10",
        category: "other",
        prompt: "Rate the chaos and defend your number instantly.",
        difficulty: "easy",
        note: "No neutral answers.",
      },
      {
        name: "Pick who started it",
        category: "inside_joke",
        prompt: "The group has to decide who really started the whole thing.",
        difficulty: "medium",
        note: "The group must decide.",
      },
      {
        name: "Rank the overreaction",
        category: "other",
        prompt: "Rank the biggest overreaction from mild to legendary.",
        difficulty: "medium",
        note: "Someone always deserved it.",
      },
      {
        name: "Give it a sequel",
        category: "other",
        prompt: "Invent the next disastrous chapter in one sentence.",
        difficulty: "hard",
        note: "Invent the next disastrous chapter.",
      },
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
            note: [item.whyItMatters, item.factOne, item.factTwo, item.factThree, item.note]
              .filter(Boolean)
              .join(" | "),
            sortOrder: index,
            }),
          ),
          ...input.rapidChallenges.map(
            (item: InsideJokeShowdownWizardInput["rapidChallenges"][number], index: number) => ({
            name: item.name,
            category: item.category as ProjectItemCategory,
            note: [item.prompt, item.difficulty, item.note].filter(Boolean).join(" | "),
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
    templateSlug: "trivia-trek",
    recipientName: project.recipientName,
    occasion: project.occasion,
    visualStyle: project.visualStyle,
    colorMood: project.colorMood,
    outputJson: output,
  });
}

async function main() {
  await syncCatalogData();
  await seedHomeTurf();
  await seedLifeQuest();
  await seedFaceCard();
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
