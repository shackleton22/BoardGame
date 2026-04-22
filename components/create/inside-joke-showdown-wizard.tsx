"use client";

import { ProductTier } from "@prisma/client";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import {
  EmailField,
  ProductTierCards,
  RecipientOccasionFields,
  ShippingFields,
  StepTabs,
  StyleFields,
  type ShippingState,
  WizardFooter,
} from "@/components/create/create-shared";
import { TurnstileWidget } from "@/components/shared/turnstile-widget";
import {
  INSIDE_JOKE_CHALLENGE_PLACEHOLDERS,
  INSIDE_JOKE_PLACEHOLDERS,
  ITEM_CATEGORY_OPTIONS,
  OCCASION_OPTIONS,
  RELATIONSHIP_OPTIONS,
  TONE_OPTIONS,
  COLOR_MOOD_OPTIONS,
  VISUAL_STYLE_OPTIONS,
} from "@/lib/constants";
import { getTemplateDefinition } from "@/lib/templates/registry";

type ItemCategory = (typeof ITEM_CATEGORY_OPTIONS)[number];

type WizardState = {
  templateSlug: "inside-joke-showdown";
  recipientName: string;
  buyerName: string;
  occasion: (typeof OCCASION_OPTIONS)[number];
  tone: (typeof TONE_OPTIONS)[number];
  relationship: (typeof RELATIONSHIP_OPTIONS)[number];
  insideJokes: { name: string; category: ItemCategory; note: string }[];
  rapidChallenges: { name: string; category: ItemCategory; note: string }[];
  catchphrases: string[];
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

const STEP_TITLES = ["Recipient", "Group lore", "Style", "Product", "Generate"] as const;
const ITEM_CATEGORIES: { label: string; value: ItemCategory }[] = [
  { label: "Inside joke", value: "inside_joke" },
  { label: "Memory", value: "memory" },
  { label: "Food", value: "food" },
  { label: "Travel", value: "travel" },
  { label: "Other", value: "other" },
];
const template = getTemplateDefinition("inside-joke-showdown");

export function InsideJokeShowdownWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>({
    templateSlug: "inside-joke-showdown",
    recipientName: "",
    buyerName: "",
    occasion: "birthday",
    tone: "funny",
    relationship: "group",
    insideJokes: INSIDE_JOKE_PLACEHOLDERS.map((name) => ({
      name,
      category: "inside_joke",
      note: "",
    })),
    rapidChallenges: INSIDE_JOKE_CHALLENGE_PLACEHOLDERS.map((name) => ({
      name,
      category: "other",
      note: "",
    })),
    catchphrases: [
      "Absolutely not",
      "That's going in the group chat",
      "Legendary behavior",
      "The council has decided",
    ],
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

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const updateCollection = (
    key: "insideJokes" | "rapidChallenges",
    index: number,
    field: "name" | "category" | "note",
    value: string,
  ) => {
    setState((current) => {
      const next = [...current[key]];
      next[index] = { ...next[index], [field]: value } as (typeof next)[number];
      return { ...current, [key]: next };
    });
  };

  const updateCatchphrase = (index: number, value: string) => {
    setState((current) => {
      const catchphrases = [...current.catchphrases];
      catchphrases[index] = value;
      return { ...current, catchphrases };
    });
  };

  const handleGenerate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          insideJokes: state.insideJokes.filter((item) => item.name.trim().length > 0),
          rapidChallenges: state.rapidChallenges.filter(
            (item) => item.name.trim().length > 0,
          ),
          catchphrases: state.catchphrases.filter((phrase) => phrase.trim().length > 0),
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
    <div className="space-y-8">
      <StepTabs steps={STEP_TITLES} step={step} onSelect={setStep} />

      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        {step === 0 ? (
          <RecipientOccasionFields
            recipientName={state.recipientName}
            buyerName={state.buyerName}
            occasion={state.occasion}
            tone={state.tone}
            relationship={state.relationship}
            onRecipientNameChange={(value) => updateState("recipientName", value)}
            onBuyerNameChange={(value) => updateState("buyerName", value)}
            onOccasionChange={(value) => updateState("occasion", value)}
            onToneChange={(value) => updateState("tone", value)}
            onRelationshipChange={(value) => updateState("relationship", value)}
          />
        ) : null}

        {step === 1 ? (
          <div className="space-y-8">
            {(
              [
                ["insideJokes", "Inside jokes", INSIDE_JOKE_PLACEHOLDERS],
                ["rapidChallenges", "Rapid challenges", INSIDE_JOKE_CHALLENGE_PLACEHOLDERS],
              ] as const
            ).map(([key, label, placeholders]) => (
              <div key={key} className="space-y-4">
                <h3 className="heading-display text-3xl font-semibold">{label}</h3>
                {state[key].map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="grid gap-3 md:grid-cols-[1.5fr,0.9fr,1.3fr]"
                  >
                    <input
                      value={item.name}
                      onChange={(event) =>
                        updateCollection(key, index, "name", event.target.value)
                      }
                      className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
                      placeholder={placeholders[index] || label}
                    />
                    <select
                      value={item.category}
                      onChange={(event) =>
                        updateCollection(key, index, "category", event.target.value)
                      }
                      className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
                    >
                      {ITEM_CATEGORIES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={item.note}
                      onChange={(event) =>
                        updateCollection(key, index, "note", event.target.value)
                      }
                      className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
                      placeholder="Optional context"
                    />
                  </div>
                ))}
              </div>
            ))}
            <div className="space-y-4">
              <h3 className="heading-display text-3xl font-semibold">Catchphrases</h3>
              {state.catchphrases.map((phrase, index) => (
                <input
                  key={`${phrase}-${index}`}
                  value={phrase}
                  onChange={(event) => updateCatchphrase(index, event.target.value)}
                  className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
                  placeholder="Signature line"
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <StyleFields
            visualStyle={state.visualStyle}
            colorMood={state.colorMood}
            titleOverride={state.titleOverride}
            subtitleOverride={state.subtitleOverride}
            avoidNotes={state.avoidNotes}
            onVisualStyleChange={(value) => updateState("visualStyle", value as "playful")}
            onColorMoodChange={(value) => updateState("colorMood", value as "bright")}
            onTitleOverrideChange={(value) => updateState("titleOverride", value)}
            onSubtitleOverrideChange={(value) => updateState("subtitleOverride", value)}
            onAvoidNotesChange={(value) => updateState("avoidNotes", value)}
          />
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <ProductTierCards
              template={template}
              selectedTier={state.productTier}
              onSelect={(tier) => updateState("productTier", tier)}
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
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-5">
            <h3 className="heading-display text-3xl font-semibold">Ready to generate</h3>
            <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Recipient
                  </div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">
                    {state.recipientName || "Add a recipient name"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Group lore
                  </div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">
                    {state.insideJokes.filter((item) => item.name.trim()).length} inside jokes
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isSubmitting}
              className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(202,111,75,0.25)] disabled:opacity-70"
            >
              {isSubmitting ? "Generating preview..." : "Generate my preview"}
            </button>
            <TurnstileWidget
              value={state.turnstileToken}
              onChange={(token) => updateState("turnstileToken", token)}
            />
            {error ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <WizardFooter
        step={step}
        totalSteps={STEP_TITLES.length}
        onPrevious={() => setStep((current) => Math.max(current - 1, 0))}
        onNext={() => setStep((current) => Math.min(current + 1, STEP_TITLES.length - 1))}
      />
    </div>
  );
}
