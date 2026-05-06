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

type PlaceOption = {
  id: string;
  label: string;
  hint: string;
  category: "place" | "travel" | "food" | "memory" | "inside_joke" | "hobby";
  vibe: string;
};

type DealOption = {
  id: string;
  label: string;
  hint: string;
  category: "inside_joke" | "memory" | "other" | "food" | "travel" | "place";
  kind: "bonus" | "detour" | "trade" | "upgrade";
};

type WizardState = {
  templateSlug: "home-turf";
  recipientName: string;
  buyerName: string;
  occasion: (typeof OCCASION_OPTIONS)[number];
  tone: (typeof TONE_OPTIONS)[number];
  relationship: (typeof RELATIONSHIP_OPTIONS)[number];
  selectedPlaces: string[];
  placeNames: Record<string, string>;
  selectedDeals: string[];
  dealNames: Record<string, string>;
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

const template = getTemplateDefinition("home-turf");
const steps = ["Gift basics", "Home map", "Detour cards", "Look and delivery", "Review"] as const;

const PLACE_OPTIONS: PlaceOption[] = [
  {
    id: "home-base",
    label: "Home base",
    hint: "The house, apartment, cabin, or neighborhood that anchors everything.",
    category: "place",
    vibe: "central and sentimental",
  },
  {
    id: "favorite-restaurant",
    label: "Favorite restaurant",
    hint: "The table, takeout order, or meal everyone associates with them.",
    category: "food",
    vibe: "warm and social",
  },
  {
    id: "big-trip",
    label: "Big trip",
    hint: "A vacation, road trip, honeymoon, or chaos route worth replaying.",
    category: "travel",
    vibe: "adventurous",
  },
  {
    id: "old-neighborhood",
    label: "Old neighborhood",
    hint: "A childhood block, college town, or place they used to haunt.",
    category: "place",
    vibe: "nostalgic",
  },
  {
    id: "local-legend",
    label: "Local legend",
    hint: "The spot tied to a ridiculous story or recurring group myth.",
    category: "inside_joke",
    vibe: "funny and specific",
  },
  {
    id: "work-stop",
    label: "Work stop",
    hint: "Office, commute, client stop, or place tied to a career chapter.",
    category: "memory",
    vibe: "hard-earned",
  },
  {
    id: "weekend-ritual",
    label: "Weekend ritual",
    hint: "Coffee walk, gym, market, sports field, or Sunday routine.",
    category: "hobby",
    vibe: "everyday favorite",
  },
  {
    id: "celebration-spot",
    label: "Celebration spot",
    hint: "Where birthdays, promotions, reunions, or wins tend to happen.",
    category: "memory",
    vibe: "celebratory",
  },
];

const DEAL_OPTIONS: DealOption[] = [
  {
    id: "tell-the-story",
    label: "Tell the story",
    hint: "Land here and share the real story behind one place on the board.",
    category: "memory",
    kind: "bonus",
  },
  {
    id: "guess-the-order",
    label: "Guess the order",
    hint: "Reward the player who knows the favorite meal, coffee, snack, or usual order.",
    category: "food",
    kind: "bonus",
  },
  {
    id: "scenic-route",
    label: "Take the scenic route",
    hint: "Move to any travel, weekend, or favorite-route space and explain why it matters.",
    category: "travel",
    kind: "detour",
  },
  {
    id: "local-vote",
    label: "Local vote",
    hint: "Everyone votes on the best memory from a place; the winner gains a point.",
    category: "inside_joke",
    kind: "bonus",
  },
  {
    id: "wrong-turn",
    label: "Wrong turn",
    hint: "A tiny setback: move back one space, then tell a funny detour story.",
    category: "travel",
    kind: "detour",
  },
  {
    id: "host-bonus",
    label: "Host bonus",
    hint: "Give a point to the player who best explains why this place feels like home.",
    category: "place",
    kind: "bonus",
  },
  {
    id: "photo-evidence",
    label: "Photo evidence",
    hint: "Describe or show a photo tied to a board space to gain a point.",
    category: "memory",
    kind: "bonus",
  },
  {
    id: "shortcut-home",
    label: "Shortcut home",
    hint: "Jump to a home-base or favorite-place space after naming the route there.",
    category: "inside_joke",
    kind: "detour",
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

export function HomeTurfWizard({
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
    templateSlug: "home-turf",
    recipientName: "",
    buyerName: "",
    occasion: "birthday",
    tone: "funny",
    relationship: "friend",
    selectedPlaces: [],
    placeNames: {},
    selectedDeals: [],
    dealNames: {},
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

  const places = useMemo(
    () =>
      state.selectedPlaces.map((id) => {
        const option = PLACE_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.placeNames[id]?.trim() || option.label,
          category: option.category,
          whyItMatters: option.hint,
          vibe: option.vibe,
          note: option.hint,
        };
      }),
    [state.selectedPlaces, state.placeNames],
  );

  const dealCards = useMemo(
    () =>
      state.selectedDeals.map((id) => {
        const option = DEAL_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.dealNames[id]?.trim() || option.label,
          category: option.category,
          prompt: option.hint,
          kind: option.kind,
          note: option.hint,
        };
      }),
    [state.selectedDeals, state.dealNames],
  );

  const currentStep = Math.min(step, steps.length - 1);
  const reviewStep = steps.length - 1;

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const updateMapValue = (
    key: "placeNames" | "dealNames",
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
        ? state.selectedPlaces.length >= 6
        : currentStep === 2
          ? state.selectedDeals.length >= 4
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
          places,
          dealCards,
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
          title="Whose map are we making?"
          description="Start with names and three quick choices. After this, you will mostly tap categories and rename the ones that matter."
        >
          <QuizExpectationPanel
            templateName="Home Turf"
            summary="We will ask for favorite places, simple detour-card ideas, style, and delivery."
            checkpoints={[
              "Pick 6+ places",
              "Pick 4+ game moments",
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
          title="Pick 6+ places that belong on the map"
          description="Tap the categories that fit, then rename them with real places if you want."
        >
          <MultiChoiceGrid
            options={PLACE_OPTIONS}
            selected={state.selectedPlaces}
            onToggle={(id) => updateState("selectedPlaces", toggleSelection(state.selectedPlaces, id))}
            columnsClass="sm:grid-cols-2 xl:grid-cols-2"
          />
          {state.selectedPlaces.length > 0 ? (
            <div className="space-y-4">
              {state.selectedPlaces.map((id) => {
                const option = PLACE_OPTIONS.find((item) => item.id === id)!;
                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Leave blank to use the category label.`}
                    />
                    <input
                      value={state.placeNames[id] ?? ""}
                      onChange={(event) => updateMapValue("placeNames", id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Example: Maple Street, Primo's Pizza, or lake cabin"
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
          title="Pick 4+ things that can happen during the game"
          description="These become Detour Cards: simple prompts that make players tell stories, take shortcuts, earn small bonuses, or vote on favorite memories."
        >
          <MultiChoiceGrid
            options={DEAL_OPTIONS}
            selected={state.selectedDeals}
            onToggle={(id) => updateState("selectedDeals", toggleSelection(state.selectedDeals, id))}
            columnsClass="sm:grid-cols-2 xl:grid-cols-2"
          />
          {state.selectedDeals.length > 0 ? (
            <div className="space-y-4">
              {state.selectedDeals.map((id) => {
                const option = DEAL_OPTIONS.find((item) => item.id === id)!;
                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Rename it only if your group has a better version.`}
                    />
                    <input
                      value={state.dealNames[id] ?? ""}
                      onChange={(event) => updateMapValue("dealNames", id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Example: Taco patio vote or Dad's back-road shortcut"
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
          title="Pick the final look and delivery"
          description="Choose the map feel, then tell us where to send the proof."
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
          description="We'll draft the map, cards, and rules now. You can still edit text before checkout."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="spec-line">
              <strong>Recipient:</strong> {state.recipientName}
            </div>
            <div className="spec-line">
              <strong>Places:</strong> {places.length}
            </div>
            <div className="spec-line">
              <strong>Detour cards:</strong> {dealCards.length}
            </div>
            <div className="spec-line">
              <strong>Format:</strong>{" "}
              {template.tiers.find((tier) => tier.tier === state.productTier)?.label}
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSubmitting || places.length < 6 || dealCards.length < 4}
            className="cta-pill disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? "Generating preview..." : "Generate my preview"}
          </button>
          <TurnstileWidget
            value={state.turnstileToken}
            onChange={(token) => updateState("turnstileToken", token)}
          />
          {places.length < 6 || dealCards.length < 4 ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Pick at least 6 places and 4 detour cards to generate the proof.
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
