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

type SuspectOption = {
  id: string;
  label: string;
  hint: string;
  suspicionLevel: "low" | "medium" | "high";
};

type SceneOption = {
  id: string;
  label: string;
  hint: string;
  category: "place" | "memory" | "travel" | "inside_joke";
  mood: "cozy" | "dramatic" | "chaotic" | "nostalgic" | "glamorous";
};

type ClueOption = {
  id: string;
  label: string;
  hint: string;
  category: "memory" | "food" | "career" | "inside_joke" | "other";
};

type WizardState = {
  templateSlug: "case-file";
  recipientName: string;
  buyerName: string;
  occasion: (typeof OCCASION_OPTIONS)[number];
  tone: (typeof TONE_OPTIONS)[number];
  relationship: (typeof RELATIONSHIP_OPTIONS)[number];
  selectedSuspects: string[];
  suspectNames: Record<string, string>;
  selectedScenes: string[];
  sceneNames: Record<string, string>;
  selectedClues: string[];
  clueNames: Record<string, string>;
  revealTwist: string;
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

const template = getTemplateDefinition("case-file");
const steps = ["Gift basics", "Cast", "Scenes and clues", "Look and delivery", "Review"] as const;

const SUSPECT_OPTIONS: SuspectOption[] = [
  {
    id: "planner",
    label: "The planner",
    hint: "Always knows the schedule and the backup plan.",
    suspicionLevel: "medium",
  },
  {
    id: "host",
    label: "The host",
    hint: "Controls the room, the snacks, or both.",
    suspicionLevel: "medium",
  },
  {
    id: "wildcard",
    label: "The wildcard",
    hint: "Capable of anything and proud of it.",
    suspicionLevel: "high",
  },
  {
    id: "historian",
    label: "The historian",
    hint: "Remembers every detail and every old story.",
    suspicionLevel: "high",
  },
  {
    id: "late-arrival",
    label: "The late arrival",
    hint: "Always shows up with the worst timing.",
    suspicionLevel: "medium",
  },
  {
    id: "snack-thief",
    label: "The snack thief",
    hint: "Cannot be trusted near the evidence table.",
    suspicionLevel: "high",
  },
  {
    id: "aux-captain",
    label: "The aux captain",
    hint: "Too calm for someone with this much control.",
    suspicionLevel: "medium",
  },
  {
    id: "peacekeeper",
    label: "The peacekeeper",
    hint: "Pretends to stay out of it, which is suspicious.",
    suspicionLevel: "low",
  },
];

const SCENE_OPTIONS: SceneOption[] = [
  {
    id: "home-base",
    label: "Home base",
    hint: "The place everyone ends up returning to.",
    category: "place",
    mood: "cozy",
  },
  {
    id: "trip-spot",
    label: "Trip spot",
    hint: "A trip or getaway the group still talks about.",
    category: "travel",
    mood: "nostalgic",
  },
  {
    id: "favorite-table",
    label: "Favorite table",
    hint: "A booth, patio, or table tied to a lot of lore.",
    category: "place",
    mood: "cozy",
  },
  {
    id: "work-scene",
    label: "Work scene",
    hint: "Break room, office, or workplace chaos.",
    category: "place",
    mood: "chaotic",
  },
  {
    id: "inside-joke-scene",
    label: "Inside-joke scene",
    hint: "A place that only means something to this group.",
    category: "inside_joke",
    mood: "dramatic",
  },
  {
    id: "special-event",
    label: "Big event",
    hint: "Wedding, reunion, birthday, or milestone setting.",
    category: "memory",
    mood: "glamorous",
  },
];

const CLUE_OPTIONS: ClueOption[] = [
  {
    id: "receipt",
    label: "Suspicious receipt",
    hint: "Proof that someone was somewhere they denied visiting.",
    category: "memory",
  },
  {
    id: "photo",
    label: "Photo evidence",
    hint: "A picture that gives away more than it should.",
    category: "memory",
  },
  {
    id: "playlist",
    label: "Playlist clue",
    hint: "Music choices that point to one very specific person.",
    category: "inside_joke",
  },
  {
    id: "food-order",
    label: "Wrong food order",
    hint: "A coffee or meal detail that cracks the case.",
    category: "food",
  },
  {
    id: "text-thread",
    label: "Text thread",
    hint: "Messages that sound innocent until they absolutely do not.",
    category: "inside_joke",
  },
  {
    id: "work-item",
    label: "Work artifact",
    hint: "Badge, note, spreadsheet, or meeting clue.",
    category: "career",
  },
  {
    id: "souvenir",
    label: "Trip souvenir",
    hint: "An object that ties the whole timeline together.",
    category: "other",
  },
  {
    id: "snack-wrapper",
    label: "Snack wrapper",
    hint: "Small, ridiculous, and somehow devastating evidence.",
    category: "food",
  },
];

const TWIST_OPTIONS = [
  "Everyone remembers the story differently",
  "The clue was in plain sight the whole time",
  "The wrong suspect looked too obvious",
  "The real culprit was group chaos",
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

export function MysteryNightWizard({
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
    templateSlug: "case-file",
    recipientName: "",
    buyerName: "",
    occasion: "birthday",
    tone: "adventurous",
    relationship: "group",
    selectedSuspects: [],
    suspectNames: {},
    selectedScenes: [],
    sceneNames: {},
    selectedClues: [],
    clueNames: {},
    revealTwist: TWIST_OPTIONS[0],
    visualStyle: "modern",
    colorMood: "muted",
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

  const suspects = useMemo(
    () =>
      state.selectedSuspects.map((id) => {
        const option = SUSPECT_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.suspectNames[id]?.trim() || option.label,
          role: option.label,
          trait: option.hint,
          suspicionLevel: option.suspicionLevel,
        };
      }),
    [state.selectedSuspects, state.suspectNames],
  );

  const locations = useMemo(
    () =>
      state.selectedScenes.map((id) => {
        const option = SCENE_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.sceneNames[id]?.trim() || option.label,
          category: option.category,
          whyItMatters: option.hint,
          mood: option.mood,
          note: option.hint,
        };
      }),
    [state.selectedScenes, state.sceneNames],
  );

  const clues = useMemo(
    () =>
      state.selectedClues.map((id) => {
        const option = CLUE_OPTIONS.find((item) => item.id === id)!;
        return {
          name: state.clueNames[id]?.trim() || option.label,
          category: option.category,
          story: option.hint,
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
    key: "suspectNames" | "sceneNames" | "clueNames",
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
        ? state.selectedSuspects.length >= 4
        : currentStep === 2
          ? state.selectedScenes.length >= 3 && state.selectedClues.length >= 4
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
          suspects,
          locations,
          clues,
          revealTwist: state.revealTwist,
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
          title="Who is this mystery for?"
          description="Start with names and three quick choices. Then we will cast the suspects, scenes, and evidence."
        >
          <QuizExpectationPanel
            templateName="Case File"
            summary="We will ask for suspects, scenes, clues, the twist, and delivery."
            checkpoints={[
              "Pick 4+ suspects",
              "Pick scenes and clues",
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
          title="Pick the cast"
          description="Choose the people-types that belong in this mystery. Then swap in the real names if you want."
        >
          <MultiChoiceGrid
            options={SUSPECT_OPTIONS}
            selected={state.selectedSuspects}
            onToggle={(id) => updateState("selectedSuspects", toggleSelection(state.selectedSuspects, id))}
            columnsClass="sm:grid-cols-2 xl:grid-cols-2"
          />

          {state.selectedSuspects.length > 0 ? (
            <div className="space-y-4">
              {state.selectedSuspects.map((id) => {
                const option = SUSPECT_OPTIONS.find((item) => item.id === id)!;

                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Leave blank to use the role name as-is.`}
                    />
                    <input
                      value={state.suspectNames[id] ?? ""}
                      onChange={(event) => updateMapValue("suspectNames", id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Add the real person's name"
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
          title="Pick the scenes and clues"
          description="This is the fun part. Choose the places and evidence types that match the group's lore."
        >
          <div className="space-y-4">
            <FieldLabel title="Scenes" hint="Pick at least 3." />
            <MultiChoiceGrid
              options={SCENE_OPTIONS}
              selected={state.selectedScenes}
              onToggle={(id) => updateState("selectedScenes", toggleSelection(state.selectedScenes, id))}
              columnsClass="sm:grid-cols-2 xl:grid-cols-3"
            />
          </div>

          {state.selectedScenes.length > 0 ? (
            <div className="space-y-4">
              {state.selectedScenes.map((id) => {
                const option = SCENE_OPTIONS.find((item) => item.id === id)!;

                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Leave blank to use the scene label.`}
                    />
                    <input
                      value={state.sceneNames[id] ?? ""}
                      onChange={(event) => updateMapValue("sceneNames", id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Example: Lake cabin or Grandma's kitchen"
                    />
                  </label>
                );
              })}
            </div>
          ) : null}

          <div className="space-y-4">
            <FieldLabel title="Evidence" hint="Pick at least 4." />
            <MultiChoiceGrid
              options={CLUE_OPTIONS}
              selected={state.selectedClues}
              onToggle={(id) => updateState("selectedClues", toggleSelection(state.selectedClues, id))}
              columnsClass="sm:grid-cols-2 xl:grid-cols-2"
            />
          </div>

          {state.selectedClues.length > 0 ? (
            <div className="space-y-4">
              {state.selectedClues.map((id) => {
                const option = CLUE_OPTIONS.find((item) => item.id === id)!;

                return (
                  <label key={id} className={SOFT_PANEL_CLASS}>
                    <FieldLabel
                      title={option.label}
                      hint={`${option.hint} Leave blank to use the clue label.`}
                    />
                    <input
                      value={state.clueNames[id] ?? ""}
                      onChange={(event) => updateMapValue("clueNames", id, event.target.value)}
                      className={`${BUILDER_INPUT_CLASS} mt-4`}
                      placeholder="Example: glittery receipt or cursed playlist"
                    />
                  </label>
                );
              })}
            </div>
          ) : null}

          <div className="space-y-4">
            <FieldLabel title="Reveal style" />
            <ChoiceGrid
              value={state.revealTwist}
              options={TWIST_OPTIONS}
              onSelect={(value) => updateState("revealTwist", value)}
              columnsClass="sm:grid-cols-2"
            />
          </div>
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
          description="We'll draft the mystery board and cards now. You can still edit the proof before checkout."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="spec-line">
              <strong>Recipient:</strong> {state.recipientName}
            </div>
            <div className="spec-line">
              <strong>Occasion:</strong> {state.occasion}
            </div>
            <div className="spec-line">
              <strong>Cast:</strong> {suspects.length}
            </div>
            <div className="spec-line">
              <strong>Scenes:</strong> {locations.length}
            </div>
            <div className="spec-line">
              <strong>Evidence:</strong> {clues.length}
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
              isSubmitting || state.selectedSuspects.length < 4 || state.selectedScenes.length < 3 || state.selectedClues.length < 4
            }
            className="cta-pill disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? "Generating preview..." : "Generate my preview"}
          </button>

          <TurnstileWidget
            value={state.turnstileToken}
            onChange={(token) => updateState("turnstileToken", token)}
          />

          {state.selectedSuspects.length < 4 ||
          state.selectedScenes.length < 3 ||
          state.selectedClues.length < 4 ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Pick at least 4 cast roles, 3 scenes, and 4 clues to generate the proof.
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
