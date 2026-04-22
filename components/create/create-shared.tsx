"use client";

import { ProductTier } from "@prisma/client";

import {
  COLOR_MOOD_OPTIONS,
  OCCASION_OPTIONS,
  RELATIONSHIP_OPTIONS,
  TONE_OPTIONS,
  VISUAL_STYLE_OPTIONS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export type ShippingState = {
  fullName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
};

export function StepTabs({
  steps,
  step,
  onSelect,
}: {
  steps: readonly string[];
  step: number;
  onSelect: (step: number) => void;
}) {
  return (
    <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap gap-3">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(index)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              index === step
                ? "bg-[var(--brand-strong)] text-white"
                : "bg-white text-stone-600"
            }`}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RecipientOccasionFields(props: {
  recipientName: string;
  buyerName: string;
  occasion: (typeof OCCASION_OPTIONS)[number];
  tone: (typeof TONE_OPTIONS)[number];
  relationship: (typeof RELATIONSHIP_OPTIONS)[number];
  onRecipientNameChange: (value: string) => void;
  onBuyerNameChange: (value: string) => void;
  onOccasionChange: (value: (typeof OCCASION_OPTIONS)[number]) => void;
  onToneChange: (value: (typeof TONE_OPTIONS)[number]) => void;
  onRelationshipChange: (value: (typeof RELATIONSHIP_OPTIONS)[number]) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Recipient name</span>
        <input
          value={props.recipientName}
          onChange={(event) => props.onRecipientNameChange(event.target.value)}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          placeholder="Taylor"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Buyer name</span>
        <input
          value={props.buyerName}
          onChange={(event) => props.onBuyerNameChange(event.target.value)}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          placeholder="Jamie"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Occasion</span>
        <select
          value={props.occasion}
          onChange={(event) =>
            props.onOccasionChange(event.target.value as (typeof OCCASION_OPTIONS)[number])
          }
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        >
          {OCCASION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Tone</span>
        <select
          value={props.tone}
          onChange={(event) =>
            props.onToneChange(event.target.value as (typeof TONE_OPTIONS)[number])
          }
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        >
          {TONE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-semibold text-stone-700">Relationship</span>
        <div className="grid gap-3 sm:grid-cols-3">
          {RELATIONSHIP_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => props.onRelationshipChange(option)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                props.relationship === option
                  ? "border-[var(--brand-strong)] bg-[rgba(38,70,83,0.08)]"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              <span className="font-semibold capitalize">{option}</span>
            </button>
          ))}
        </div>
      </label>
    </div>
  );
}

export function StyleFields(props: {
  visualStyle: (typeof VISUAL_STYLE_OPTIONS)[number];
  colorMood: (typeof COLOR_MOOD_OPTIONS)[number];
  titleOverride: string;
  subtitleOverride: string;
  avoidNotes: string;
  onVisualStyleChange: (value: (typeof VISUAL_STYLE_OPTIONS)[number]) => void;
  onColorMoodChange: (value: (typeof COLOR_MOOD_OPTIONS)[number]) => void;
  onTitleOverrideChange: (value: string) => void;
  onSubtitleOverrideChange: (value: string) => void;
  onAvoidNotesChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Visual style</span>
        <select
          value={props.visualStyle}
          onChange={(event) =>
            props.onVisualStyleChange(
              event.target.value as (typeof VISUAL_STYLE_OPTIONS)[number],
            )
          }
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        >
          {VISUAL_STYLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Color mood</span>
        <select
          value={props.colorMood}
          onChange={(event) =>
            props.onColorMoodChange(event.target.value as (typeof COLOR_MOOD_OPTIONS)[number])
          }
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        >
          {COLOR_MOOD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-semibold text-stone-700">Optional title override</span>
        <input
          value={props.titleOverride}
          onChange={(event) => props.onTitleOverrideChange(event.target.value)}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          placeholder="A custom title if you already have one"
        />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-semibold text-stone-700">
          Optional subtitle override
        </span>
        <input
          value={props.subtitleOverride}
          onChange={(event) => props.onSubtitleOverrideChange(event.target.value)}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          placeholder="A short secondary line for the board center"
        />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-semibold text-stone-700">Things to avoid</span>
        <textarea
          value={props.avoidNotes}
          onChange={(event) => props.onAvoidNotesChange(event.target.value)}
          className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          placeholder="Too sentimental, too formal, too much travel focus..."
        />
      </label>
    </div>
  );
}

export function ProductTierCards(props: {
  template: {
    tiers: {
      tier: ProductTier;
      label: string;
      amount: number;
      enabled: boolean;
      description: string;
      badge?: string;
    }[];
  };
  selectedTier: ProductTier;
  onSelect: (tier: ProductTier) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {props.template.tiers.map((tier) => (
        <button
          key={tier.tier}
          type="button"
          onClick={() => tier.enabled && props.onSelect(tier.tier)}
          className={`rounded-[1.8rem] border p-5 text-left transition ${
            props.selectedTier === tier.tier
              ? "border-[var(--brand-strong)] bg-[rgba(38,70,83,0.08)]"
              : "border-[var(--line)] bg-white"
          } ${tier.enabled ? "" : "cursor-not-allowed opacity-60"}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="heading-display text-2xl font-semibold">{tier.label}</div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
              {tier.enabled ? formatPrice(tier.amount) : tier.badge ?? "Coming soon"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-600">{tier.description}</p>
        </button>
      ))}
    </div>
  );
}

export function EmailField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-stone-700">Customer email</span>
      <input
        type="email"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        placeholder="for receipts and delivery"
      />
    </label>
  );
}

export function ShippingFields({
  shipping,
  onChange,
}: {
  shipping: ShippingState;
  onChange: (next: ShippingState) => void;
}) {
  const updateField = (field: keyof ShippingState, value: string) =>
    onChange({ ...shipping, [field]: value });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-semibold text-stone-700">Shipping name</span>
        <input
          value={shipping.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Company</span>
        <input
          value={shipping.company}
          onChange={(event) => updateField("company", event.target.value)}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Phone number</span>
        <input
          value={shipping.phoneNumber}
          onChange={(event) => updateField("phoneNumber", event.target.value)}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        />
      </label>
      {(
        [
          ["addressLine1", "Address line 1"],
          ["addressLine2", "Address line 2"],
          ["city", "City"],
          ["state", "State"],
          ["postalCode", "Postal code"],
          ["country", "Country"],
        ] as const
      ).map(([field, label]) => (
        <label key={field} className="space-y-2">
          <span className="text-sm font-semibold text-stone-700">{label}</span>
          <input
            value={shipping[field]}
            onChange={(event) => updateField(field, event.target.value)}
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>
      ))}
    </div>
  );
}

export function WizardFooter({
  step,
  totalSteps,
  onPrevious,
  onNext,
}: {
  step: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onPrevious}
        disabled={step === 0}
        className="rounded-full border border-[var(--line)] px-5 py-3 text-sm font-semibold text-stone-700 disabled:opacity-50"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={step === totalSteps - 1}
        className="rounded-full bg-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
