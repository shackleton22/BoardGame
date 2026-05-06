"use client";

import { ProductTier } from "@prisma/client";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import {
  BUILDER_INPUT_CLASS,
  BUILDER_SELECT_CLASS,
  ChoiceGrid,
  EmailField,
  FieldLabel,
  MultiChoiceGrid,
  ProductTierCards,
  QuestionCard,
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

type StoryOption = {
  id: string;
  label: string;
  hint: string;
  category:
    | "place"
    | "travel"
    | "person_pet"
    | "memory"
    | "achievement"
    | "inside_joke"
    | "food"
    | "hobby"
    | "career";
};

type WizardState = {
  templateSlug: "milestone-trail";
  recipientName: string;
  buyerName: string;
  occasion: (typeof OCCASION_OPTIONS)[number];
  tone: (typeof TONE_OPTIONS)[number];
  relationship: (typeof RELATIONSHIP_OPTIONS)[number];
  selectedMoments: string[];
  momentNames: Record<string, string>;
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

const template = getTemplateDefinition("milestone-trail");
const steps = ["Gift basics", "Story moments", "Look and feel", "Delivery", "Review"] as const;

const STORY_OPTIONS: StoryOption[] = [
  {
    id: "home-base",
    label: "Home base",
    hint: "A house, cabin, apartment, or place that feels like the center of the story.",
    category: "place",
  },
  {
    id: "big-trip",
    label: "Big trip",
    hint: "A vacation, honeymoon, road trip, or getaway everyone remembers.",
    category: "travel",
  },
  {
    id: "favorite-person",
    label: "Favorite person or pet",
    hint: "A sidekick, pet, or person who has to be in the game.",
    category: "person_pet",
  },
  {
    id: "milestone",
    label: "Major milestone",
    hint: "A graduation, promotion, retirement, wedding, or big win.",
    category: "achievement",
  },
  {
    id: "inside-joke",
    label: "Inside joke",
    hint: "Something that makes immediate sense only to your people.",
    category: "inside_joke",
  },
  {
    id: "food-era",
    label: "Food era",
    hint: "A recipe obsession, coffee order, sourdough phase, or favorite meal.",
    category: "food",
  },
  {
    id: "hobby",
    label: "Favorite hobby",
    hint: "Something they always come back to for fun.",
    category: "hobby",
  },
  {
    id: "career-chapter",
    label: "Career chapter",
    hint: "A job, office, client phase, or work milestone.",
    category: "career",
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

export function LifeQuestWizard({
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
    templateSlug: "milestone-trail",
    recipientName: "",
    buyerName: "",
    occasion: "birthday",
    tone: "heartfelt",
    relationship: "partner",
    selectedMoments: [],
    momentNames: {},
    visualStyle: "modern",
    colorMood: "warm",
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

  const storyItems = useMemo(
    () =>
      state.selectedMoments.map((id) => {
        const option = STORY_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.momentNames[id]?.trim() || option.label,
          category: option.category,
          note: option.hint,
          whyItMatters: option.hint,
          era: undefined,
        };
      }),
    [state.selectedMoments, state.momentNames],
  );

  const currentStep = Math.min(step, steps.length - 1);
  const reviewStep = steps.length - 1;

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const updateMomentName = (id: string, value: string) => {
    setState((current) => ({
      ...current,
      momentNames: {
        ...current.momentNames,
        [id]: value,
      },
    }));
  };

  const canContinue =
    currentStep === 0
      ? state.recipientName.trim().length > 0 && state.buyerName.trim().length > 0
      : currentStep === 1
        ? state.selectedMoments.length >= 6
        : currentStep === 2
          ? true
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
          items: storyItems,
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
          title="Who is this gift for?"
          description="Start with the basics, then we'll build the story from there."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className={SOFT_PANEL_CLASS}>
              <FieldLabel title="Recipient name" />
              <input
                value={state.recipientName}
                onChange={(event) => updateState("recipientName", event.target.value)}
                className={`${BUILDER_INPUT_CLASS} mt-4`}
                placeholder="Taylor"
              />
            </label>

            <label className={SOFT_PANEL_CLASS}>
              <FieldLabel title="Your name" />
              <input
                value={state.buyerName}
                onChange={(event) => updateState("buyerName", event.target.value)}
                className={`${BUILDER_INPUT_CLASS} mt-4`}
                placeholder="Jamie"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className={SOFT_PANEL_CLASS}>
              <FieldLabel title="Occasion" />
              <select
                value={state.occasion}
                onChange={(event) =>
                  updateState("occasion", event.target.value as (typeof OCCASION_OPTIONS)[number])
                }
                className={`${BUILDER_SELECT_CLASS} mt-4`}
              >
                {OCCASION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/\b\w/g, (character) => character.toUpperCase())}
                  </option>
                ))}
              </select>
            </label>

            <label className={SOFT_PANEL_CLASS}>
              <FieldLabel title="Relationship" />
              <select
                value={state.relationship}
                onChange={(event) =>
                  updateState(
                    "relationship",
                    event.target.value as (typeof RELATIONSHIP_OPTIONS)[number],
                  )
                }
                className={`${BUILDER_SELECT_CLASS} mt-4`}
              >
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/\b\w/g, (character) => character.toUpperCase())}
                  </option>
                ))}
              </select>
            </label>

            <label className={SOFT_PANEL_CLASS}>
              <FieldLabel title="Tone" />
              <select
                value={state.tone}
                onChange={(event) =>
                  updateState("tone", event.target.value as (typeof TONE_OPTIONS)[number])
                }
                className={`${BUILDER_SELECT_CLASS} mt-4`}
              >
                {TONE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/\b\w/g, (character) => character.toUpperCase())}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </QuestionCard>
      ) : null}

      {currentStep === 1 ? (
        <QuestionCard
          eyebrow="Step 2"
          title="Pick the moments that belong on the board"
          description="Choose the chapters that fit this person's story. Then swap in the real details if you want."
        >
          <MultiChoiceGrid
            options={STORY_OPTIONS}
            selected={state.selectedMoments}
            onToggle={(id) => updateState("selectedMoments", toggleSelection(state.selectedMoments, id))}
            columnsClass="sm:grid-cols-2 xl:grid-cols-2"
          />

          {state.selectedMoments.length > 0 ? (
            <div className="space-y-4">
              {state.selectedMoments.map((id) => {
                const option = STORY_OPTIONS.find((item) => item.id === id)!;

                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Leave blank to use the category label.`}
                    />
                    <input
                      value={state.momentNames[id] ?? ""}
                      onChange={(event) => updateMomentName(id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Example: Lake house weekends or Maple the dog"
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
          title="Pick the final feel"
          description="Choose the emotional tone and visual direction for the proof."
        >
          <div className="space-y-4">
            <FieldLabel title="Tone" />
            <ChoiceGrid
              value={state.tone}
              options={TONE_OPTIONS}
              columnsClass="sm:grid-cols-2 xl:grid-cols-3"
              onSelect={(value) => updateState("tone", value)}
            />
          </div>

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
        </QuestionCard>
      ) : null}

      {currentStep === 3 ? (
        <QuestionCard
          eyebrow="Step 4"
          title="How should we deliver it?"
          description="Pick the format, then tell us where to send the proof and any boxed order updates."
        >
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
          description="We'll create the first draft now. You'll still be able to edit the text before checkout."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="spec-line">
              <strong>Recipient:</strong> {state.recipientName}
            </div>
            <div className="spec-line">
              <strong>Occasion:</strong> {state.occasion}
            </div>
            <div className="spec-line">
              <strong>Story moments:</strong> {storyItems.length}
            </div>
            <div className="spec-line">
              <strong>Format:</strong>{" "}
              {template.tiers.find((tier) => tier.tier === state.productTier)?.label}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSubmitting || state.selectedMoments.length < 6}
            className="cta-pill disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? "Generating preview..." : "Generate my preview"}
          </button>

          <TurnstileWidget
            value={state.turnstileToken}
            onChange={(token) => updateState("turnstileToken", token)}
          />

          {state.selectedMoments.length < 6 ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Pick at least 6 story moments to generate the proof.
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
