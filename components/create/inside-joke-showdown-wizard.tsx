"use client";

import { ProductTier } from "@prisma/client";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import {
  BUILDER_INPUT_CLASS,
  ChoiceGrid,
  EmailField,
  FieldLabel,
  GiftBasicsFields,
  MultiChoiceGrid,
  ProductTierCards,
  QuestionCard,
  QuizExpectationPanel,
  SOFT_PANEL_CLASS,
  ShippingFields,
  StepTabs,
  WizardFooter,
  type ShippingState,
} from "@/components/create/create-shared";
import { TurnstileWidget } from "@/components/shared/turnstile-widget";
import {
  COLOR_MOOD_OPTIONS,
  OCCASION_OPTIONS,
  RELATIONSHIP_OPTIONS,
  TONE_OPTIONS,
  VISUAL_STYLE_OPTIONS,
} from "@/lib/constants";
import { getTemplateDefinition } from "@/lib/templates/registry";

type CategoryOption = {
  id: string;
  label: string;
  hint: string;
  category: "memory" | "inside_joke" | "food" | "travel" | "career" | "other";
};

type BonusOption = {
  id: string;
  label: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
};

type SignatureOption = {
  id: string;
  label: string;
  hint: string;
};

type WizardState = {
  templateSlug: "trivia-trek";
  recipientName: string;
  buyerName: string;
  occasion: (typeof OCCASION_OPTIONS)[number];
  tone: (typeof TONE_OPTIONS)[number];
  relationship: (typeof RELATIONSHIP_OPTIONS)[number];
  selectedCategories: string[];
  categoryNames: Record<string, string>;
  selectedBonusRounds: string[];
  bonusNames: Record<string, string>;
  selectedSignatures: string[];
  signatureNames: Record<string, string>;
  visualStyle: (typeof VISUAL_STYLE_OPTIONS)[number];
  colorMood: (typeof COLOR_MOOD_OPTIONS)[number];
  titleOverride: string;
  subtitleOverride: string;
  avoidNotes: string;
  productTier: ProductTier;
  customerEmail: string;
  turnstileToken: string;
  shipping: ShippingState;
};

const template = getTemplateDefinition("trivia-trek");
const steps = ["Gift basics", "Question categories", "Bonus rounds", "Look and delivery", "Review"] as const;

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: "trip-lore",
    label: "Trip lore",
    hint: "Vacations, road trips, and stories everyone keeps retelling.",
    category: "travel",
  },
  {
    id: "inside-jokes",
    label: "Inside jokes",
    hint: "Phrases, bits, and callbacks only this group would understand.",
    category: "inside_joke",
  },
  {
    id: "food-opinions",
    label: "Food opinions",
    hint: "Orders, recipes, and strong takes about what is actually good.",
    category: "food",
  },
  {
    id: "family-lore",
    label: "Family lore",
    hint: "The stories that come up at every gathering.",
    category: "memory",
  },
  {
    id: "work-chaos",
    label: "Work chaos",
    hint: "Office stories, client moments, or shared career chaos.",
    category: "career",
  },
  {
    id: "big-nights",
    label: "Big nights",
    hint: "Birthdays, weddings, concerts, or nights out no one forgot.",
    category: "memory",
  },
  {
    id: "pet-energy",
    label: "Pet energy",
    hint: "Pets, mascots, or recurring side characters in the group story.",
    category: "other",
  },
  {
    id: "college-era",
    label: "College era",
    hint: "Shared apartments, campus memories, and the old timeline.",
    category: "memory",
  },
];

const BONUS_OPTIONS: BonusOption[] = [
  {
    id: "finish-the-quote",
    label: "Finish the quote",
    hint: "Players complete a phrase exactly right or it does not count.",
    difficulty: "medium",
  },
  {
    id: "lightning-round",
    label: "Lightning round",
    hint: "Fast answers, no overthinking.",
    difficulty: "easy",
  },
  {
    id: "who-said-it",
    label: "Who said it?",
    hint: "Match the line to the right person.",
    difficulty: "medium",
  },
  {
    id: "guess-the-year",
    label: "Guess the year",
    hint: "Put the story in the right timeline.",
    difficulty: "hard",
  },
  {
    id: "most-likely-to",
    label: "Most likely to",
    hint: "A funny tie-breaker built from the group dynamic.",
    difficulty: "easy",
  },
];

const SIGNATURE_OPTIONS: SignatureOption[] = [
  {
    id: "group-chat-line",
    label: "Group chat line",
    hint: "A phrase that shows up all the time.",
  },
  {
    id: "running-argument",
    label: "Running argument",
    hint: "A disagreement everyone expects to come up again.",
  },
  {
    id: "favorite-order",
    label: "Favorite order",
    hint: "A drink, snack, or meal the group immediately knows.",
  },
  {
    id: "nickname",
    label: "Nickname",
    hint: "A nickname or title that belongs in the deck.",
  },
  {
    id: "canon-answer",
    label: "Canon answer",
    hint: "The answer that is always somehow correct.",
  },
  {
    id: "recurring-quote",
    label: "Recurring quote",
    hint: "A line that instantly sounds like the group.",
  },
];

function toggleSelection(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isShippingComplete(shipping: ShippingState) {
  return [
    shipping.fullName,
    shipping.addressLine1,
    shipping.city,
    shipping.state,
    shipping.postalCode,
    shipping.phoneNumber,
  ].every((value) => value.trim().length > 0);
}

export function InsideJokeShowdownWizard({
  physicalCheckoutEnabled = true,
  physicalDisabledMessage,
}: {
  physicalCheckoutEnabled?: boolean;
  physicalDisabledMessage?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>({
    templateSlug: "trivia-trek",
    recipientName: "",
    buyerName: "",
    occasion: "birthday",
    tone: "funny",
    relationship: "group",
    selectedCategories: [],
    categoryNames: {},
    selectedBonusRounds: [],
    bonusNames: {},
    selectedSignatures: [],
    signatureNames: {},
    visualStyle: "playful",
    colorMood: "bright",
    titleOverride: "",
    subtitleOverride: "",
    avoidNotes: "",
    productTier: ProductTier.digital_print_kit,
    customerEmail: "",
    turnstileToken: "",
    shipping: {
      fullName: "",
      company: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      phoneNumber: "",
    },
  });

  const categories = useMemo(
    () =>
      state.selectedCategories.map((id) => {
        const option = CATEGORY_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.categoryNames[id]?.trim() || option.label,
          category: option.category,
          whyItMatters: option.hint,
          factOne: option.hint,
          factTwo: undefined,
          factThree: undefined,
          note: option.hint,
        };
      }),
    [state.selectedCategories, state.categoryNames],
  );

  const bonusRounds = useMemo(
    () =>
      state.selectedBonusRounds.map((id) => {
        const option = BONUS_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.bonusNames[id]?.trim() || option.label,
          category: "other" as const,
          prompt: option.hint,
          difficulty: option.difficulty,
          note: option.hint,
        };
      }),
    [state.selectedBonusRounds, state.bonusNames],
  );

  const signatures = useMemo(
    () =>
      state.selectedSignatures.map((id) => {
        const option = SIGNATURE_OPTIONS.find((item) => item.id === id)!;
        return state.signatureNames[id]?.trim() || option.label;
      }),
    [state.selectedSignatures, state.signatureNames],
  );

  const currentStep = Math.min(step, steps.length - 1);
  const reviewStep = steps.length - 1;

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const updateNameMap = (
    key: "categoryNames" | "bonusNames" | "signatureNames",
    id: string,
    value: string,
  ) => {
    setState((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [id]: value,
      },
    }));
  };

  const canContinue =
    currentStep === 0
      ? state.recipientName.trim().length > 0 && state.buyerName.trim().length > 0
      : currentStep === 1
        ? state.selectedCategories.length >= 4
        : currentStep === 2
          ? state.selectedBonusRounds.length >= 2 && state.selectedSignatures.length >= 3
          : currentStep === 3
            ? (state.customerEmail.trim().length === 0 ||
                isValidEmail(state.customerEmail)) &&
              (state.productTier === ProductTier.digital_print_kit ||
                isShippingComplete(state.shipping))
            : true;

  const handleGenerate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: state.templateSlug,
          recipientName: state.recipientName,
          buyerName: state.buyerName,
          occasion: state.occasion,
          tone: state.tone,
          relationship: state.relationship,
          insideJokes: categories,
          rapidChallenges: bonusRounds,
          catchphrases: signatures,
          visualStyle: state.visualStyle,
          colorMood: state.colorMood,
          titleOverride: state.titleOverride || undefined,
          subtitleOverride: state.subtitleOverride || undefined,
          avoidNotes: state.avoidNotes || undefined,
          productTier: state.productTier,
          shipping:
            state.productTier === ProductTier.printed_board_cards ? state.shipping : undefined,
          customerEmail: state.customerEmail || undefined,
          turnstileToken: state.turnstileToken || undefined,
        }),
      });

      const data = (await response.json()) as { projectId?: string; error?: string };

      if (!response.ok || !data.projectId) {
        throw new Error(data.error || "We couldn't generate your preview right now.");
      }

      startTransition(() => router.push(`/preview/${data.projectId}`));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We couldn't generate your preview right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="builder-surface space-y-6">
      <StepTabs steps={steps} step={currentStep} />

      {currentStep === 0 ? (
        <QuestionCard
          eyebrow="Step 1"
          title="Who is this trivia gift for?"
          description="Start with names and three quick choices. Then we will build the categories, bonus rounds, and signature answers."
        >
          <QuizExpectationPanel
            templateName="Trivia Trek"
            summary="We will ask for trivia categories, bonus rounds, signature answers, and delivery."
            checkpoints={[
              "Pick 4+ categories",
              "Pick bonus rounds",
              "Review a proof before paying",
            ]}
          />
          <GiftBasicsFields
            recipientName={state.recipientName}
            buyerName={state.buyerName}
            occasion={state.occasion}
            relationship={state.relationship}
            tone={state.tone}
            onRecipientNameChange={(value) => updateState("recipientName", value)}
            onBuyerNameChange={(value) => updateState("buyerName", value)}
            onOccasionChange={(value) => updateState("occasion", value)}
            onRelationshipChange={(value) => updateState("relationship", value)}
            onToneChange={(value) => updateState("tone", value)}
          />
        </QuestionCard>
      ) : null}

      {currentStep === 1 ? (
        <QuestionCard
          eyebrow="Step 2"
          title="Pick the question categories"
          description="Choose the kinds of stories that should drive the game, then swap in the real category names if you want."
        >
          <MultiChoiceGrid
            options={CATEGORY_OPTIONS}
            selected={state.selectedCategories}
            onToggle={(id) =>
              updateState("selectedCategories", toggleSelection(state.selectedCategories, id))
            }
            columnsClass="sm:grid-cols-2 xl:grid-cols-2"
          />

          {state.selectedCategories.length > 0 ? (
            <div className="space-y-4">
              {state.selectedCategories.map((id) => {
                const option = CATEGORY_OPTIONS.find((item) => item.id === id)!;

                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Leave blank to use the category label.`}
                    />
                    <input
                      value={state.categoryNames[id] ?? ""}
                      onChange={(event) => updateNameMap("categoryNames", id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Example: Nashville trip or Family vacations"
                    />
                  </label>
                );
              })}
            </div>
          ) : null}
        </QuestionCard>
      ) : null}

      {currentStep === 2 ? (
        <QuestionCard
          eyebrow="Step 3"
          title="Pick the bonus rounds and signature answers"
          description="This is where the game gets fun. Choose the challenge types and the running phrases that belong in the deck."
        >
          <div className="space-y-4">
            <FieldLabel title="Bonus rounds" hint="Pick at least 2." />
            <MultiChoiceGrid
              options={BONUS_OPTIONS}
              selected={state.selectedBonusRounds}
              onToggle={(id) =>
                updateState("selectedBonusRounds", toggleSelection(state.selectedBonusRounds, id))
              }
              columnsClass="sm:grid-cols-2 xl:grid-cols-2"
            />
          </div>

          {state.selectedBonusRounds.length > 0 ? (
            <div className="space-y-4">
              {state.selectedBonusRounds.map((id) => {
                const option = BONUS_OPTIONS.find((item) => item.id === id)!;

                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Leave blank to use the bonus-round label.`}
                    />
                    <input
                      value={state.bonusNames[id] ?? ""}
                      onChange={(event) => updateNameMap("bonusNames", id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Rename this round if you want"
                    />
                  </label>
                );
              })}
            </div>
          ) : null}

          <div className="space-y-4">
            <FieldLabel title="Signature answers" hint="Pick at least 3." />
            <MultiChoiceGrid
              options={SIGNATURE_OPTIONS}
              selected={state.selectedSignatures}
              onToggle={(id) =>
                updateState("selectedSignatures", toggleSelection(state.selectedSignatures, id))
              }
              columnsClass="sm:grid-cols-2 xl:grid-cols-3"
            />
          </div>

          {state.selectedSignatures.length > 0 ? (
            <div className="space-y-4">
              {state.selectedSignatures.map((id) => {
                const option = SIGNATURE_OPTIONS.find((item) => item.id === id)!;

                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Leave blank to use the signature label.`}
                    />
                    <input
                      value={state.signatureNames[id] ?? ""}
                      onChange={(event) =>
                        updateNameMap("signatureNames", id, event.target.value)
                      }
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Example: Absolutely not"
                    />
                  </label>
                );
              })}
            </div>
          ) : null}
        </QuestionCard>
      ) : null}

      {currentStep === 3 ? (
        <QuestionCard
          eyebrow="Step 4"
          title="Pick the final look"
          description="Choose the visual direction, then tell us where to send the proof."
        >
          <div className="space-y-4">
            <FieldLabel title="Visual style" />
            <ChoiceGrid
              value={state.visualStyle}
              options={VISUAL_STYLE_OPTIONS}
              columnsClass="sm:grid-cols-2 xl:grid-cols-4"
              onSelect={(value) => updateState("visualStyle", value)}
            />
          </div>

          <div className="space-y-4">
            <FieldLabel title="Color mood" />
            <ChoiceGrid
              value={state.colorMood}
              options={COLOR_MOOD_OPTIONS}
              columnsClass="sm:grid-cols-2 xl:grid-cols-3"
              onSelect={(value) => updateState("colorMood", value)}
            />
          </div>

          <ProductTierCards
            template={template}
            selectedTier={state.productTier}
            onSelect={(tier) => updateState("productTier", tier)}
            physicalCheckoutEnabled={physicalCheckoutEnabled}
            physicalDisabledMessage={physicalDisabledMessage}
          />

          <EmailField
            value={state.customerEmail}
            onChange={(value) => updateState("customerEmail", value)}
          />

          {state.productTier === ProductTier.printed_board_cards ? (
            <ShippingFields
              shipping={state.shipping}
              onChange={(next) => updateState("shipping", next)}
            />
          ) : null}
        </QuestionCard>
      ) : null}

      {currentStep === reviewStep ? (
        <QuestionCard
          eyebrow="Step 5"
          title="Generate the proof"
          description="We'll draft the board and decks now. You can still edit the text before checkout."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="spec-line">
              <strong>Recipient:</strong> {state.recipientName}
            </div>
            <div className="spec-line">
              <strong>Occasion:</strong> {state.occasion}
            </div>
            <div className="spec-line">
              <strong>Categories:</strong> {categories.length}
            </div>
            <div className="spec-line">
              <strong>Bonus rounds:</strong> {bonusRounds.length}
            </div>
            <div className="spec-line">
              <strong>Signature answers:</strong> {signatures.length}
            </div>
            <div className="spec-line">
              <strong>Format:</strong>{" "}
              {template.tiers.find((tier) => tier.tier === state.productTier)?.label}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              isSubmitting ||
              state.selectedCategories.length < 4 ||
              state.selectedBonusRounds.length < 2 ||
              state.selectedSignatures.length < 3
            }
            className="cta-pill disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? "Generating preview..." : "Generate my preview"}
          </button>

          <TurnstileWidget
            value={state.turnstileToken}
            onChange={(token) => updateState("turnstileToken", token)}
          />

          {state.selectedCategories.length < 4 ||
          state.selectedBonusRounds.length < 2 ||
          state.selectedSignatures.length < 3 ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Pick at least 4 categories, 2 bonus rounds, and 3 signature answers to
              generate the proof.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </QuestionCard>
      ) : null}

      <WizardFooter
        step={currentStep}
        totalSteps={steps.length}
        disableNext={!canContinue}
        onPrevious={() => setStep(Math.max(currentStep - 1, 0))}
        onNext={() => setStep(Math.min(currentStep + 1, steps.length - 1))}
      />
    </div>
  );
}
