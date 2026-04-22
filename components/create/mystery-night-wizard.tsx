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
  ITEM_CATEGORY_OPTIONS,
  MYSTERY_NIGHT_CLUE_PLACEHOLDERS,
  MYSTERY_NIGHT_LOCATION_PLACEHOLDERS,
  MYSTERY_NIGHT_SUSPECT_PLACEHOLDERS,
  OCCASION_OPTIONS,
  RELATIONSHIP_OPTIONS,
  TONE_OPTIONS,
  COLOR_MOOD_OPTIONS,
  VISUAL_STYLE_OPTIONS,
} from "@/lib/constants";
import { getTemplateDefinition } from "@/lib/templates/registry";

type ItemCategory = (typeof ITEM_CATEGORY_OPTIONS)[number];

type WizardState = {
  templateSlug: "mystery-night";
  recipientName: string;
  buyerName: string;
  occasion: (typeof OCCASION_OPTIONS)[number];
  tone: (typeof TONE_OPTIONS)[number];
  relationship: (typeof RELATIONSHIP_OPTIONS)[number];
  suspects: { name: string; role: string }[];
  locations: { name: string; category: ItemCategory; note: string }[];
  clues: { name: string; category: ItemCategory; note: string }[];
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

const STEP_TITLES = ["Recipient", "Case file", "Style", "Product", "Generate"] as const;
const ITEM_CATEGORIES: { label: string; value: ItemCategory }[] = [
  { label: "Place", value: "place" },
  { label: "Memory", value: "memory" },
  { label: "Inside joke", value: "inside_joke" },
  { label: "Travel", value: "travel" },
  { label: "Other", value: "other" },
];
const template = getTemplateDefinition("mystery-night");

export function MysteryNightWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>({
    templateSlug: "mystery-night",
    recipientName: "",
    buyerName: "",
    occasion: "birthday",
    tone: "adventurous",
    relationship: "group",
    suspects: MYSTERY_NIGHT_SUSPECT_PLACEHOLDERS.map((name) => ({ name, role: "" })),
    locations: MYSTERY_NIGHT_LOCATION_PLACEHOLDERS.map((name) => ({
      name,
      category: "place",
      note: "",
    })),
    clues: MYSTERY_NIGHT_CLUE_PLACEHOLDERS.map((name) => ({
      name,
      category: "memory",
      note: "",
    })),
    revealTwist: "",
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

  const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const updateSuspect = (index: number, key: "name" | "role", value: string) => {
    setState((current) => {
      const suspects = [...current.suspects];
      suspects[index] = { ...suspects[index], [key]: value };
      return { ...current, suspects };
    });
  };

  const updateCollection = (
    key: "locations" | "clues",
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

  const handleGenerate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          suspects: state.suspects.filter((item) => item.name.trim().length > 0),
          locations: state.locations.filter((item) => item.name.trim().length > 0),
          clues: state.clues.filter((item) => item.name.trim().length > 0),
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
            <div>
              <h3 className="heading-display text-3xl font-semibold">Build the case file</h3>
              <p className="mt-2 text-sm text-stone-600">
                Add suspects, locations, and clues pulled from the recipient’s real life.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                Suspects or featured characters
              </h4>
              {state.suspects.map((suspect, index) => (
                <div key={`${suspect.name}-${index}`} className="grid gap-3 md:grid-cols-2">
                  <input
                    value={suspect.name}
                    onChange={(event) => updateSuspect(index, "name", event.target.value)}
                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
                    placeholder={MYSTERY_NIGHT_SUSPECT_PLACEHOLDERS[index] || "Suspect"}
                  />
                  <input
                    value={suspect.role}
                    onChange={(event) => updateSuspect(index, "role", event.target.value)}
                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
                    placeholder="Optional role, habit, or motive"
                  />
                </div>
              ))}
            </div>
            {(
              [
                ["locations", "Locations", MYSTERY_NIGHT_LOCATION_PLACEHOLDERS],
                ["clues", "Clues", MYSTERY_NIGHT_CLUE_PLACEHOLDERS],
              ] as const
            ).map(([key, label, placeholders]) => (
              <div key={key} className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {label}
                </h4>
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
            <label className="space-y-2">
              <span className="text-sm font-semibold text-stone-700">Optional reveal twist</span>
              <textarea
                value={state.revealTwist}
                onChange={(event) => updateState("revealTwist", event.target.value)}
                className="min-h-24 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
                placeholder="A dramatic final reveal, callback, or group punchline"
              />
            </label>
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
                    Case cast
                  </div>
                  <div className="mt-2 text-lg font-semibold text-stone-900">
                    {state.suspects.filter((item) => item.name.trim()).length} suspects
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
