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
  TRIVIA_DIFFICULTY_OPTIONS,
  VISUAL_STYLE_OPTIONS,
} from "@/lib/constants";
import { getTemplateDefinition } from "@/lib/templates/registry";

type PersonOption = {
  id: string;
  label: string;
  hint: string;
  role: string;
  decoyTrait: string;
};

type ClueOption = {
  id: string;
  label: string;
  hint: string;
  category: "inside_joke" | "memory" | "person_pet" | "other";
  difficulty: (typeof TRIVIA_DIFFICULTY_OPTIONS)[number];
};

type WizardState = {
  templateSlug: "face-card";
  recipientName: string;
  buyerName: string;
  occasion: (typeof OCCASION_OPTIONS)[number];
  tone: (typeof TONE_OPTIONS)[number];
  relationship: (typeof RELATIONSHIP_OPTIONS)[number];
  selectedPeople: string[];
  peopleNames: Record<string, string>;
  selectedClues: string[];
  clueNames: Record<string, string>;
  revealMode: string;
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

const template = getTemplateDefinition("face-card");
const steps = ["Gift basics", "Cast", "Hints", "Look and delivery", "Review"] as const;

const PERSON_OPTIONS: PersonOption[] = [
  {
    id: "planner",
    label: "The planner",
    hint: "Always has the schedule, backup plan, and suspicious confidence.",
    role: "planner",
    decoyTrait: "Looks too organized to be innocent",
  },
  {
    id: "comedian",
    label: "The comedian",
    hint: "Can derail any serious moment with one line.",
    role: "comedian",
    decoyTrait: "Cannot resist the obvious joke",
  },
  {
    id: "snack-guardian",
    label: "The snack guardian",
    hint: "Knows exactly who touched the good chips.",
    role: "snack guardian",
    decoyTrait: "Always near the food",
  },
  {
    id: "memory-keeper",
    label: "The memory keeper",
    hint: "Remembers old details no one else could prove.",
    role: "memory keeper",
    decoyTrait: "Knows too much",
  },
  {
    id: "pet-or-kid",
    label: "Pet or kid chaos",
    hint: "The tiny main character everyone talks about.",
    role: "chaos mascot",
    decoyTrait: "Cute enough to escape questioning",
  },
  {
    id: "late-arrival",
    label: "The late arrival",
    hint: "Somehow enters at the exact wrong time.",
    role: "late arrival",
    decoyTrait: "Always has a traffic story",
  },
  {
    id: "host",
    label: "The host",
    hint: "Controls the room, the music, the seating, or the snacks.",
    role: "host",
    decoyTrait: "Too much power over the room",
  },
  {
    id: "wildcard",
    label: "The wildcard",
    hint: "Capable of anything and usually proud of it.",
    role: "wildcard",
    decoyTrait: "Impossible to predict",
  },
];

const CLUE_OPTIONS: ClueOption[] = [
  {
    id: "catchphrase",
    label: "Catchphrase",
    hint: "Ask about the exact line everyone can hear in their voice.",
    category: "inside_joke",
    difficulty: "easy",
  },
  {
    id: "favorite-order",
    label: "Favorite order",
    hint: "Food, drink, coffee, or snack hints that narrow the field.",
    category: "memory",
    difficulty: "medium",
  },
  {
    id: "signature-tell",
    label: "Signature tell",
    hint: "A habit, face, gesture, or reaction that gives them away.",
    category: "person_pet",
    difficulty: "medium",
  },
  {
    id: "group-role",
    label: "Group role",
    hint: "The job this person always ends up doing in the group.",
    category: "inside_joke",
    difficulty: "easy",
  },
  {
    id: "decoy-detail",
    label: "Decoy detail",
    hint: "A misleading trait that sounds like multiple people.",
    category: "other",
    difficulty: "hard",
  },
  {
    id: "story-proof",
    label: "Story proof",
    hint: "A past moment that proves or disproves a guess.",
    category: "memory",
    difficulty: "hard",
  },
];

const REVEAL_OPTIONS = [
  "Ask yes-or-no hints, eliminate decoys, then reveal the face",
  "Everyone writes a secret face, then defends hints out loud",
  "Teams race to identify the face with the fewest hints",
  "Wrong guesses become funny penalties instead of harsh setbacks",
] as const;

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

export function FaceCardWizard({
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
    templateSlug: "face-card",
    recipientName: "",
    buyerName: "",
    occasion: "birthday",
    tone: "funny",
    relationship: "group",
    selectedPeople: [],
    peopleNames: {},
    selectedClues: [],
    clueNames: {},
    revealMode: REVEAL_OPTIONS[0],
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

  const people = useMemo(
    () =>
      state.selectedPeople.map((id) => {
        const option = PERSON_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.peopleNames[id]?.trim() || option.label,
          role: option.role,
          tell: option.hint,
          decoyTrait: option.decoyTrait,
        };
      }),
    [state.selectedPeople, state.peopleNames],
  );

  const cluePrompts = useMemo(
    () =>
      state.selectedClues.map((id) => {
        const option = CLUE_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.clueNames[id]?.trim() || option.label,
          category: option.category,
          prompt: option.hint,
          difficulty: option.difficulty,
          note: option.hint,
        };
      }),
    [state.selectedClues, state.clueNames],
  );

  const currentStep = Math.min(step, steps.length - 1);
  const reviewStep = steps.length - 1;

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const updateMapValue = (
    key: "peopleNames" | "clueNames",
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
        ? state.selectedPeople.length >= 6
        : currentStep === 2
          ? state.selectedClues.length >= 4
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
          people,
          cluePrompts,
          revealMode: state.revealMode,
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
          title="Who is this cast for?"
          description="Start with names and three quick choices. Then we will build the cast and hint deck."
        >
          <QuizExpectationPanel
            templateName="Face Card"
            summary="We will ask for people, hints, reveal style, and delivery."
            checkpoints={[
              "Pick 6+ people",
              "Pick 4+ hint styles",
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
          title="Pick 6+ people types"
          description="Tap roles that fit your group, then rename them with the real people or pets."
        >
          <MultiChoiceGrid
            options={PERSON_OPTIONS}
            selected={state.selectedPeople}
            onToggle={(id) => updateState("selectedPeople", toggleSelection(state.selectedPeople, id))}
            columnsClass="sm:grid-cols-2 xl:grid-cols-2"
          />
          {state.selectedPeople.length > 0 ? (
            <div className="space-y-4">
              {state.selectedPeople.map((id) => {
                const option = PERSON_OPTIONS.find((item) => item.id === id)!;
                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Leave blank to keep the role label.`}
                    />
                    <input
                      value={state.peopleNames[id] ?? ""}
                      onChange={(event) => updateMapValue("peopleNames", id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Example: Aunt Lisa, Ben, or Waffles the dog"
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
          title="Pick 4+ hint styles"
          description="These become the cards players use to narrow down the mystery face."
        >
          <MultiChoiceGrid
            options={CLUE_OPTIONS}
            selected={state.selectedClues}
            onToggle={(id) => updateState("selectedClues", toggleSelection(state.selectedClues, id))}
            columnsClass="sm:grid-cols-2 xl:grid-cols-2"
          />
          {state.selectedClues.length > 0 ? (
            <div className="space-y-4">
              {state.selectedClues.map((id) => {
                const option = CLUE_OPTIONS.find((item) => item.id === id)!;
                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Rename it for a specific running joke if needed.`}
                    />
                    <input
                      value={state.clueNames[id] ?? ""}
                      onChange={(event) => updateMapValue("clueNames", id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Example: Coffee order, eyebrow raise, or group chat voice"
                    />
                  </label>
                );
              })}
            </div>
          ) : null}
          <div className="space-y-4">
            <FieldLabel title="Reveal style" />
            <ChoiceGrid
              value={state.revealMode}
              options={REVEAL_OPTIONS}
              onSelect={(value) => updateState("revealMode", value)}
              columnsClass="sm:grid-cols-2"
            />
          </div>
        </QuestionCard>
      ) : null}

      {currentStep === 3 ? (
        <QuestionCard
          eyebrow="Step 4"
          title="Pick the final look and delivery"
          description="Choose the personality of the board, then tell us where to send the proof."
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
          description="We'll create the board, hint cards, reveal cards, and rules. You can edit text before checkout."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="spec-line">
              <strong>Recipient:</strong> {state.recipientName}
            </div>
            <div className="spec-line">
              <strong>Cast:</strong> {people.length}
            </div>
            <div className="spec-line">
              <strong>Hint styles:</strong> {cluePrompts.length}
            </div>
            <div className="spec-line">
              <strong>Format:</strong>{" "}
              {template.tiers.find((tier) => tier.tier === state.productTier)?.label}
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSubmitting || people.length < 6 || cluePrompts.length < 4}
            className="cta-pill disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? "Generating preview..." : "Generate my preview"}
          </button>
          <TurnstileWidget
            value={state.turnstileToken}
            onChange={(token) => updateState("turnstileToken", token)}
          />
          {people.length < 6 || cluePrompts.length < 4 ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Pick at least 6 people and 4 hint styles to generate the proof.
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
