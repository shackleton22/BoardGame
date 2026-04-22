"use client";

import { ProductTier } from "@prisma/client";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

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
  ITEM_CATEGORY_OPTIONS,
  LIFE_QUEST_PLACEHOLDERS,
  OCCASION_OPTIONS,
  RELATIONSHIP_OPTIONS,
  TONE_OPTIONS,
  COLOR_MOOD_OPTIONS,
  VISUAL_STYLE_OPTIONS,
} from "@/lib/constants";
import { getTemplateDefinition } from "@/lib/templates/registry";

type ItemCategory = (typeof ITEM_CATEGORY_OPTIONS)[number];

type WizardState = {
  templateSlug: "life-quest";
  recipientName: string;
  buyerName: string;
  occasion: (typeof OCCASION_OPTIONS)[number];
  tone: (typeof TONE_OPTIONS)[number];
  relationship: (typeof RELATIONSHIP_OPTIONS)[number];
  items: { name: string; category: ItemCategory; note: string }[];
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

const STEP_TITLES = ["Recipient", "Life details", "Style", "Product", "Generate"] as const;

const DEFAULT_ITEMS: WizardState["items"] = LIFE_QUEST_PLACEHOLDERS.map((placeholder, index) => ({
  name: placeholder,
  category:
    index === 0 || index === 2
      ? "place"
      : index === 1
        ? "travel"
        : index === 5
          ? "inside_joke"
          : "memory",
  note: "",
}));

const ITEM_CATEGORIES: { label: string; value: ItemCategory }[] = [
  { label: "Place", value: "place" },
  { label: "Hobby", value: "hobby" },
  { label: "Memory", value: "memory" },
  { label: "Person / pet", value: "person_pet" },
  { label: "Achievement", value: "achievement" },
  { label: "Inside joke", value: "inside_joke" },
  { label: "Travel", value: "travel" },
  { label: "Food", value: "food" },
  { label: "Career", value: "career" },
  { label: "Other", value: "other" },
];

const template = getTemplateDefinition("life-quest");

export function LifeQuestWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>({
    templateSlug: "life-quest",
    recipientName: "",
    buyerName: "",
    occasion: "birthday",
    tone: "heartfelt",
    relationship: "partner",
    items: DEFAULT_ITEMS,
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

  const itemCount = useMemo(
    () => state.items.filter((item) => item.name.trim().length > 0).length,
    [state.items],
  );

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const updateItem = (
    index: number,
    key: keyof WizardState["items"][number],
    value: string,
  ) => {
    setState((current) => {
      const nextItems = [...current.items];
      nextItems[index] = { ...nextItems[index], [key]: value };
      return { ...current, items: nextItems };
    });
  };

  const addItem = () => {
    if (state.items.length >= 24) {
      return;
    }
    updateState("items", [...state.items, { name: "", category: "memory", note: "" }]);
  };

  const removeItem = (index: number) => {
    if (state.items.length <= 8) {
      return;
    }
    updateState(
      "items",
      state.items.filter((_, currentIndex) => currentIndex !== index),
    );
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
          items: state.items.filter((item) => item.name.trim().length > 0),
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
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="heading-display text-3xl font-semibold">
                  Add the memories, places, hobbies, and inside jokes
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  Include 8 to 24 details. The generator turns them into a 32-space
                  personal journey.
                </p>
              </div>
              <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                {itemCount} / 24 details
              </div>
            </div>

            <div className="space-y-4">
              {state.items.map((item, index) => (
                <div
                  key={`${index}-${item.name}`}
                  className="rounded-[1.6rem] border border-[var(--line)] bg-white p-4"
                >
                  <div className="grid gap-3 md:grid-cols-[1.7fr,1fr,1.4fr,auto]">
                    <input
                      value={item.name}
                      onChange={(event) => updateItem(index, "name", event.target.value)}
                      className="rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                      placeholder={LIFE_QUEST_PLACEHOLDERS[index] || "Favorite memory"}
                    />
                    <select
                      value={item.category}
                      onChange={(event) =>
                        updateItem(index, "category", event.target.value)
                      }
                      className="rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                    >
                      {ITEM_CATEGORIES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={item.note}
                      onChange={(event) => updateItem(index, "note", event.target.value)}
                      className="rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                      placeholder="Optional note or context"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-stone-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="rounded-full border border-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-[var(--brand-strong)]"
            >
              Add another detail
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <StyleFields
            visualStyle={state.visualStyle}
            colorMood={state.colorMood}
            titleOverride={state.titleOverride}
            subtitleOverride={state.subtitleOverride}
            avoidNotes={state.avoidNotes}
            onVisualStyleChange={(value) => updateState("visualStyle", value)}
            onColorMoodChange={(value) => updateState("colorMood", value)}
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
                    Product
                  </div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">
                    {template.tiers.find((tier) => tier.tier === state.productTier)?.label}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Style
                  </div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">
                    {state.visualStyle} / {state.colorMood}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Personal details
                  </div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">{itemCount}</div>
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
