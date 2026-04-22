import { ProductTier } from "@prisma/client";
import { z } from "zod";

import {
  COLOR_MOOD_OPTIONS,
  ITEM_CATEGORY_OPTIONS,
  OCCASION_OPTIONS,
  PROTECTED_REFERENCE_TERMS,
  RELATIONSHIP_OPTIONS,
  TONE_OPTIONS,
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

const protectedTermRegex = new RegExp(
  `\\b(?:${PROTECTED_REFERENCE_TERMS.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})\\b`,
  "i",
);

function ensureNoProtectedReferences(values: string[], ctx: z.RefinementCtx, path: (string | number)[]) {
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

const baseProjectFields = {
    templateSlug: z.enum(["life-quest", "mystery-night", "inside-joke-showdown"]),
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
    customerEmail: z
      .string()
      .trim()
      .email()
      .max(120)
      .optional()
      .or(z.literal("")),
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
    templateSlug: z.literal("life-quest"),
    items: z.array(projectItemInputSchema).min(8).max(24),
  }),
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
        ...value.items.flatMap((item: z.infer<typeof projectItemInputSchema>) => [
          item.name,
          item.note ?? "",
        ]),
      ],
      ctx,
      ["items"],
    );
  },
);

export const mysteryNightPersonSchema = z.object({
  name: plainText(40),
  role: optionalPlainText(80).transform((value) => value || undefined),
});

const mysteryNightWizardBaseSchema = withCommonChecks(
  z.object(baseProjectFields).extend({
    templateSlug: z.literal("mystery-night"),
    suspects: z.array(mysteryNightPersonSchema).min(4).max(8),
    locations: z.array(projectItemInputSchema).min(4).max(8),
    clues: z.array(projectItemInputSchema).min(6).max(12),
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
        ]),
        ...value.locations.flatMap((location: z.infer<typeof projectItemInputSchema>) => [
          location.name,
          location.note ?? "",
        ]),
        ...value.clues.flatMap((clue: z.infer<typeof projectItemInputSchema>) => [
          clue.name,
          clue.note ?? "",
        ]),
      ],
      ctx,
      ["suspects"],
    );
  },
);

const insideJokeShowdownWizardBaseSchema = withCommonChecks(
  z.object(baseProjectFields).extend({
    templateSlug: z.literal("inside-joke-showdown"),
    insideJokes: z.array(projectItemInputSchema).min(8).max(20),
    rapidChallenges: z.array(projectItemInputSchema).min(6).max(12),
    catchphrases: z.array(plainText(60)).min(4).max(10),
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
        ...value.insideJokes.flatMap((item: z.infer<typeof projectItemInputSchema>) => [
          item.name,
          item.note ?? "",
        ]),
        ...value.rapidChallenges.flatMap((item: z.infer<typeof projectItemInputSchema>) => [
          item.name,
          item.note ?? "",
        ]),
      ],
      ctx,
      ["insideJokes"],
    );
    },
  );

export const projectCreateSchema = z.union([
  lifeQuestWizardSchema,
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
export type MysteryNightWizardInput = z.infer<typeof mysteryNightWizardSchema>;
export type InsideJokeShowdownWizardInput = z.infer<
  typeof insideJokeShowdownWizardSchema
>;
export type ProjectCreateInput =
  | LifeQuestWizardInput
  | MysteryNightWizardInput
  | InsideJokeShowdownWizardInput;
export type LifeQuestAIOutput = z.infer<typeof lifeQuestAiSchema>;
export type ProjectOutputPayload = z.infer<typeof projectOutputEditSchema>;
