import { ProductTier } from "@prisma/client";
import { z } from "zod";

import {
  COLOR_MOOD_OPTIONS,
  ITEM_CATEGORY_OPTIONS,
  LIFE_QUEST_ERA_OPTIONS,
  MYSTERY_LOCATION_MOOD_OPTIONS,
  MYSTERY_SUSPICION_OPTIONS,
  OCCASION_OPTIONS,
  PROTECTED_REFERENCE_TERMS,
  RELATIONSHIP_OPTIONS,
  TONE_OPTIONS,
  TRIVIA_DIFFICULTY_OPTIONS,
  VISUAL_STYLE_OPTIONS,
} from "@/lib/constants";
import { sanitizePlainText } from "@/lib/utils";

const plainText = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .transform((value) => sanitizePlainText(value, max));

const optionalPlainText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => sanitizePlainText(value, max))
    .optional()
    .or(z.literal(""));

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .enum(values)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined);

const protectedTermRegex = new RegExp(
  `\\b(?:${PROTECTED_REFERENCE_TERMS.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})\\b`,
  "i",
);

function ensureNoProtectedReferences(
  values: string[],
  ctx: z.RefinementCtx,
  path: (string | number)[],
) {
  const offending = values.find((value) => protectedTermRegex.test(value));

  if (offending) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Please avoid protected board-game brands or trade dress references. Keep the gift original.",
      path,
    });
  }
}

export const shippingSchema = z.object({
  fullName: plainText(80),
  company: optionalPlainText(80).transform((value) => value || undefined),
  addressLine1: plainText(120),
  addressLine2: optionalPlainText(120).transform((value) => value || undefined),
  city: plainText(80),
  state: plainText(2).transform((value) => value.toUpperCase()),
  postalCode: plainText(20),
  country: z.literal("US").or(z.literal("United States")).transform(() => "US"),
  phoneNumber: plainText(24),
});

export const projectItemInputSchema = z.object({
  name: plainText(40),
  category: z.enum(ITEM_CATEGORY_OPTIONS),
  note: optionalPlainText(120).transform((value) => value || undefined),
});

export const lifeQuestStoryItemSchema = projectItemInputSchema.extend({
  whyItMatters: optionalPlainText(140).transform((value) => value || undefined),
  era: optionalEnum(LIFE_QUEST_ERA_OPTIONS),
});

export const mysteryNightPersonSchema = z.object({
  name: plainText(40),
  role: optionalPlainText(80).transform((value) => value || undefined),
  trait: optionalPlainText(80).transform((value) => value || undefined),
  suspicionLevel: optionalEnum(MYSTERY_SUSPICION_OPTIONS),
});

export const mysteryNightLocationSchema = projectItemInputSchema.extend({
  whyItMatters: optionalPlainText(120).transform((value) => value || undefined),
  mood: optionalEnum(MYSTERY_LOCATION_MOOD_OPTIONS),
});

export const mysteryNightClueSchema = projectItemInputSchema.extend({
  story: optionalPlainText(140).transform((value) => value || undefined),
});

export const triviaTopicSchema = projectItemInputSchema.extend({
  whyItMatters: optionalPlainText(140).transform((value) => value || undefined),
  factOne: optionalPlainText(120).transform((value) => value || undefined),
  factTwo: optionalPlainText(120).transform((value) => value || undefined),
  factThree: optionalPlainText(120).transform((value) => value || undefined),
});

export const triviaBonusRoundSchema = projectItemInputSchema.extend({
  prompt: optionalPlainText(140).transform((value) => value || undefined),
  difficulty: optionalEnum(TRIVIA_DIFFICULTY_OPTIONS),
});

export const homeTurfPlaceSchema = projectItemInputSchema.extend({
  whyItMatters: optionalPlainText(140).transform((value) => value || undefined),
  vibe: optionalPlainText(80).transform((value) => value || undefined),
});

export const homeTurfDealSchema = projectItemInputSchema.extend({
  prompt: optionalPlainText(140).transform((value) => value || undefined),
  kind: optionalEnum(["bonus", "detour", "trade", "upgrade"] as const),
});

export const faceCardPersonSchema = z.object({
  name: plainText(40),
  role: optionalPlainText(80).transform((value) => value || undefined),
  tell: optionalPlainText(100).transform((value) => value || undefined),
  decoyTrait: optionalPlainText(100).transform((value) => value || undefined),
});

export const faceCardClueSchema = projectItemInputSchema.extend({
  prompt: optionalPlainText(140).transform((value) => value || undefined),
  difficulty: optionalEnum(TRIVIA_DIFFICULTY_OPTIONS),
});

const baseProjectFields = {
  templateSlug: z.enum(["home-turf", "milestone-trail", "face-card", "case-file", "trivia-trek"]),
  recipientName: plainText(80),
  buyerName: plainText(80),
  occasion: z.enum(OCCASION_OPTIONS),
  tone: z.enum(TONE_OPTIONS),
  relationship: z.enum(RELATIONSHIP_OPTIONS),
  visualStyle: z.enum(VISUAL_STYLE_OPTIONS),
  colorMood: z.enum(COLOR_MOOD_OPTIONS),
  titleOverride: optionalPlainText(80).transform((value) => value || undefined),
  subtitleOverride: optionalPlainText(120).transform((value) => value || undefined),
  avoidNotes: optionalPlainText(160).transform((value) => value || undefined),
  productTier: z.nativeEnum(ProductTier),
  shipping: shippingSchema.optional(),
  customerEmail: z.string().trim().email().max(120).optional().or(z.literal("")),
  turnstileToken: optionalPlainText(240).transform((value) => value || undefined),
} as const;

function withCommonChecks<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.superRefine((value: z.infer<typeof schema>, ctx: z.RefinementCtx) => {
    if (value.productTier === ProductTier.printed_board_cards && !value.shipping) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shipping details are required for physical orders.",
        path: ["shipping"],
      });
    }

    if (value.productTier === ProductTier.premium_gift_box) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Premium Gift Box is not available in the launch catalog yet.",
        path: ["productTier"],
      });
    }
  });
}

const lifeQuestWizardBaseSchema = withCommonChecks(
  z.object(baseProjectFields).extend({
    templateSlug: z.literal("milestone-trail"),
    items: z.array(lifeQuestStoryItemSchema).min(6).max(24),
  }),
);

const homeTurfWizardBaseSchema = withCommonChecks(
  z.object(baseProjectFields).extend({
    templateSlug: z.literal("home-turf"),
    places: z.array(homeTurfPlaceSchema).min(6).max(18),
    dealCards: z.array(homeTurfDealSchema).min(4).max(12),
  }),
);

export const homeTurfWizardSchema = homeTurfWizardBaseSchema.superRefine(
  (value: z.infer<typeof homeTurfWizardBaseSchema>, ctx: z.RefinementCtx) => {
    ensureNoProtectedReferences(
      [
        value.recipientName,
        value.buyerName,
        value.titleOverride ?? "",
        value.subtitleOverride ?? "",
        value.avoidNotes ?? "",
        ...value.places.flatMap((place: z.infer<typeof homeTurfPlaceSchema>) => [
          place.name,
          place.note ?? "",
          place.whyItMatters ?? "",
          place.vibe ?? "",
        ]),
        ...value.dealCards.flatMap((deal: z.infer<typeof homeTurfDealSchema>) => [
          deal.name,
          deal.note ?? "",
          deal.prompt ?? "",
          deal.kind ?? "",
        ]),
      ],
      ctx,
      ["places"],
    );
  },
);

export const lifeQuestWizardSchema = lifeQuestWizardBaseSchema.superRefine(
  (value: z.infer<typeof lifeQuestWizardBaseSchema>, ctx: z.RefinementCtx) => {
    ensureNoProtectedReferences(
      [
        value.recipientName,
        value.buyerName,
        value.titleOverride ?? "",
        value.subtitleOverride ?? "",
        value.avoidNotes ?? "",
        ...value.items.flatMap((item: z.infer<typeof lifeQuestStoryItemSchema>) => [
          item.name,
          item.note ?? "",
          item.whyItMatters ?? "",
          item.era ?? "",
        ]),
      ],
      ctx,
      ["items"],
    );
  },
);

const faceCardWizardBaseSchema = withCommonChecks(
  z.object(baseProjectFields).extend({
    templateSlug: z.literal("face-card"),
    people: z.array(faceCardPersonSchema).min(6).max(24),
    cluePrompts: z.array(faceCardClueSchema).min(4).max(12),
    revealMode: optionalPlainText(120).transform((value) => value || undefined),
  }),
);

export const faceCardWizardSchema = faceCardWizardBaseSchema.superRefine(
  (value: z.infer<typeof faceCardWizardBaseSchema>, ctx: z.RefinementCtx) => {
    ensureNoProtectedReferences(
      [
        value.recipientName,
        value.buyerName,
        value.revealMode ?? "",
        value.titleOverride ?? "",
        value.subtitleOverride ?? "",
        value.avoidNotes ?? "",
        ...value.people.flatMap((person: z.infer<typeof faceCardPersonSchema>) => [
          person.name,
          person.role ?? "",
          person.tell ?? "",
          person.decoyTrait ?? "",
        ]),
        ...value.cluePrompts.flatMap((clue: z.infer<typeof faceCardClueSchema>) => [
          clue.name,
          clue.note ?? "",
          clue.prompt ?? "",
          clue.difficulty ?? "",
        ]),
      ],
      ctx,
      ["people"],
    );
  },
);

const mysteryNightWizardBaseSchema = withCommonChecks(
  z.object(baseProjectFields).extend({
    templateSlug: z.literal("case-file"),
    suspects: z.array(mysteryNightPersonSchema).min(4).max(8),
    locations: z.array(mysteryNightLocationSchema).min(3).max(8),
    clues: z.array(mysteryNightClueSchema).min(4).max(12),
    revealTwist: optionalPlainText(160).transform((value) => value || undefined),
  }),
);

export const mysteryNightWizardSchema = mysteryNightWizardBaseSchema.superRefine(
  (value: z.infer<typeof mysteryNightWizardBaseSchema>, ctx: z.RefinementCtx) => {
    ensureNoProtectedReferences(
      [
        value.recipientName,
        value.buyerName,
        value.revealTwist ?? "",
        ...value.suspects.flatMap((suspect: z.infer<typeof mysteryNightPersonSchema>) => [
          suspect.name,
          suspect.role ?? "",
          suspect.trait ?? "",
          suspect.suspicionLevel ?? "",
        ]),
        ...value.locations.flatMap((location: z.infer<typeof mysteryNightLocationSchema>) => [
          location.name,
          location.note ?? "",
          location.whyItMatters ?? "",
          location.mood ?? "",
        ]),
        ...value.clues.flatMap((clue: z.infer<typeof mysteryNightClueSchema>) => [
          clue.name,
          clue.note ?? "",
          clue.story ?? "",
        ]),
      ],
      ctx,
      ["suspects"],
    );
  },
);

const insideJokeShowdownWizardBaseSchema = withCommonChecks(
  z.object(baseProjectFields).extend({
    templateSlug: z.literal("trivia-trek"),
    insideJokes: z.array(triviaTopicSchema).min(4).max(12),
    rapidChallenges: z.array(triviaBonusRoundSchema).min(2).max(10),
    catchphrases: z.array(plainText(60)).min(3).max(10),
  }),
);

export const insideJokeShowdownWizardSchema =
  insideJokeShowdownWizardBaseSchema.superRefine(
    (value: z.infer<typeof insideJokeShowdownWizardBaseSchema>, ctx: z.RefinementCtx) => {
      ensureNoProtectedReferences(
        [
          value.recipientName,
          value.buyerName,
          ...value.catchphrases,
          ...value.insideJokes.flatMap((item: z.infer<typeof triviaTopicSchema>) => [
            item.name,
            item.note ?? "",
            item.whyItMatters ?? "",
            item.factOne ?? "",
            item.factTwo ?? "",
            item.factThree ?? "",
          ]),
          ...value.rapidChallenges.flatMap((item: z.infer<typeof triviaBonusRoundSchema>) => [
            item.name,
            item.note ?? "",
            item.prompt ?? "",
            item.difficulty ?? "",
          ]),
        ],
        ctx,
        ["insideJokes"],
      );
    },
  );

export const projectCreateSchema = z.union([
  homeTurfWizardSchema,
  lifeQuestWizardSchema,
  faceCardWizardSchema,
  mysteryNightWizardSchema,
  insideJokeShowdownWizardSchema,
]);

export const projectTileSchema = z.object({
  name: plainText(28),
  type: z.enum([
    "memory",
    "challenge",
    "reward",
    "shortcut",
    "rest",
    "wildcard",
    "clue",
    "twist",
    "alibi",
    "reveal",
    "bonus",
    "double_down",
  ]),
  caption: plainText(90),
  points: z.number().int().min(-5).max(12),
});

export const projectCardSchema = z.object({
  title: plainText(40),
  body: plainText(180),
  effect: plainText(80),
});

export const projectRulesSchema = z.object({
  objective: plainText(200),
  setup: z.array(plainText(140)).min(3).max(8),
  turn: z.array(plainText(140)).min(3).max(8),
  winning: plainText(180),
});

export const generatedGameOutputSchema = z.object({
  title: plainText(80),
  subtitle: plainText(140),
  themeSummary: plainText(220),
  centerKicker: optionalPlainText(120).transform((value) => value || undefined),
  boardSections: z.array(
    z.object({
      label: plainText(32),
      description: plainText(120),
    }),
  ),
  tiles: z.array(projectTileSchema).length(32),
  deckPrimaryLabel: plainText(40),
  deckSecondaryLabel: plainText(40),
  deckPrimary: z.array(projectCardSchema).length(24),
  deckSecondary: z.array(projectCardSchema).length(24),
  rules: projectRulesSchema,
  artPrompt: plainText(400),
  boardStyle: z.enum(["journey", "mystery", "party"]),
});

export const projectOutputEditSchema = generatedGameOutputSchema.extend({
  generationSource: z.enum(["ai", "fallback"]).optional(),
});

export const lifeQuestAiSchema = z.object({
  title: plainText(80),
  subtitle: plainText(140),
  themeSummary: plainText(220),
  boardSections: z.array(
    z.object({
      label: plainText(32),
      description: plainText(120),
    }),
  ),
  tiles: z.array(projectTileSchema).length(32),
  memoryCards: z.array(projectCardSchema).length(24),
  questCards: z.array(projectCardSchema).length(24),
  rules: projectRulesSchema,
  artPrompt: plainText(400),
});

export const checkoutRequestSchema = z.object({
  projectId: z.string().cuid(),
  email: z.string().trim().email().max(120).optional(),
  shippingQuoteId: z.string().cuid().optional(),
});

export const shippingQuoteRequestSchema = z.object({
  projectId: z.string().cuid(),
});

export const orderLookupSchema = z.object({
  orderNumber: plainText(24),
  email: z.string().trim().email().max(120),
});

export type LifeQuestWizardInput = z.infer<typeof lifeQuestWizardSchema>;
export type HomeTurfWizardInput = z.infer<typeof homeTurfWizardSchema>;
export type FaceCardWizardInput = z.infer<typeof faceCardWizardSchema>;
export type MysteryNightWizardInput = z.infer<typeof mysteryNightWizardSchema>;
export type InsideJokeShowdownWizardInput = z.infer<
  typeof insideJokeShowdownWizardSchema
>;
export type ProjectCreateInput =
  | HomeTurfWizardInput
  | LifeQuestWizardInput
  | FaceCardWizardInput
  | MysteryNightWizardInput
  | InsideJokeShowdownWizardInput;
export type LifeQuestAIOutput = z.infer<typeof lifeQuestAiSchema>;
export type ProjectOutputPayload = z.infer<typeof projectOutputEditSchema>;
