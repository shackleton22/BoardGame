"use client";

import { ProductTier } from "@prisma/client";

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

export const BUILDER_INPUT_CLASS =
  "w-full rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.96)] px-4 py-3.5 text-[15px] text-stone-900 outline-none transition focus:border-[rgba(25,46,58,0.26)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(25,46,58,0.06)]";
export const BUILDER_SELECT_CLASS = `${BUILDER_INPUT_CLASS} pr-10`;
export const BUILDER_TEXTAREA_CLASS = `${BUILDER_INPUT_CLASS} min-h-40`;
export const SOFT_PANEL_CLASS =
  "rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.9)] p-5 shadow-[0_14px_34px_rgba(22,22,22,0.035)]";

function humanizeLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function splitTextareaLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function splitLineValue(line: string) {
  const match = line.match(/^(.*?)(?:\s[-:]\s(.+))?$/);

  return {
    name: match?.[1]?.trim() ?? line.trim(),
    note: match?.[2]?.trim() || undefined,
  };
}

export function StepTabs({
  steps,
  step,
}: {
  steps: readonly string[];
  step: number;
}) {
  const total = steps.length;
  const current = steps[step] ?? steps[0] ?? "Build";
  const progressWidth = `${Math.max(12, ((step + 1) / total) * 100)}%`;

  return (
    <div className="rounded-[1.7rem] border border-[var(--line)] bg-[rgba(255,255,255,0.84)] px-5 py-4 shadow-[0_14px_34px_rgba(22,22,22,0.035)] sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Build your gift
          </div>
          <div className="mt-2 text-lg font-semibold text-stone-950">{current}</div>
        </div>
        <div className="text-sm font-semibold text-stone-500">
          Step {step + 1} of {total}
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[rgba(20,20,20,0.08)]">
        <div
          className="h-full rounded-full bg-[var(--brand-strong)] transition-[width] duration-300"
          style={{ width: progressWidth }}
        />
      </div>
    </div>
  );
}

export function QuestionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,253,249,0.96)] p-6 shadow-[0_24px_60px_rgba(22,22,22,0.045)] sm:p-8">
      <div className="max-w-2xl">
        {eyebrow ? (
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="heading-display mt-3 text-4xl leading-tight font-semibold text-stone-950 sm:text-[3.25rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-stone-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-8 space-y-5">{children}</div>
    </section>
  );
}

export function ChoiceGrid<T extends string>({
  value,
  options,
  onSelect,
  columnsClass = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  value: T;
  options: readonly T[];
  onSelect: (value: T) => void;
  columnsClass?: string;
}) {
  return (
    <div className={`grid gap-3 ${columnsClass}`}>
      {options.map((option) => {
        const isActive = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-[1.45rem] border px-4 py-4 text-left transition ${
              isActive
                ? "border-[rgba(25,46,58,0.34)] bg-[rgba(25,46,58,0.08)] text-stone-950 shadow-[0_16px_32px_rgba(25,46,58,0.07)]"
                : "border-[var(--line)] bg-[rgba(255,255,255,0.86)] text-stone-700 hover:border-[rgba(25,46,58,0.16)] hover:bg-white"
            }`}
          >
            <div className="text-sm font-semibold">{humanizeLabel(option)}</div>
          </button>
        );
      })}
    </div>
  );
}

export function MultiChoiceGrid({
  options,
  selected,
  onToggle,
  columnsClass = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  options: readonly { id: string; label: string; hint?: string }[];
  selected: readonly string[];
  onToggle: (id: string) => void;
  columnsClass?: string;
}) {
  return (
    <div className={`grid gap-3 ${columnsClass}`}>
      {options.map((option) => {
        const isActive = selected.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
              isActive
                ? "border-[rgba(25,46,58,0.34)] bg-[rgba(25,46,58,0.08)] text-stone-950 shadow-[0_16px_32px_rgba(25,46,58,0.07)]"
                : "border-[var(--line)] bg-[rgba(255,255,255,0.88)] text-stone-700 hover:border-[rgba(25,46,58,0.16)] hover:bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{option.label}</div>
                {option.hint ? (
                  <div className="mt-1 text-sm leading-6 text-stone-500">{option.hint}</div>
                ) : null}
              </div>
              <div
                className={`mt-0.5 flex min-w-16 items-center justify-center rounded-full border px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] ${
                  isActive
                    ? "border-[rgba(25,46,58,0.3)] bg-[var(--brand-strong)] text-white"
                    : "border-[var(--line)] bg-white text-stone-400"
                }`}
              >
                {isActive ? "Selected" : "Add"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function FieldLabel({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-semibold text-stone-900">{title}</div>
      {hint ? <p className="text-sm leading-6 text-stone-600">{hint}</p> : null}
    </div>
  );
}

export function LineTextarea({
  title,
  hint,
  value,
  onChange,
  placeholder,
  footer,
}: {
  title: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  footer?: string;
}) {
  return (
    <label className={SOFT_PANEL_CLASS}>
      <FieldLabel title={title} hint={hint} />
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${BUILDER_TEXTAREA_CLASS} mt-4 font-[inherit]`}
        placeholder={placeholder}
      />
      {footer ? <div className="mt-3 text-sm text-stone-500">{footer}</div> : null}
    </label>
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
  physicalCheckoutEnabled?: boolean;
  physicalDisabledMessage?: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {props.template.tiers.map((tier) => {
        const isSelected = props.selectedTier === tier.tier;
        const disabledByLaunch =
          tier.tier === ProductTier.printed_board_cards &&
          props.physicalCheckoutEnabled === false;
        const isEnabled = tier.enabled && !disabledByLaunch;
        const badgeLabel = disabledByLaunch
          ? "Paused"
          : tier.enabled
            ? isSelected
              ? "Selected"
              : "Available"
            : tier.badge ?? "Soon";

        return (
          <button
            key={tier.tier}
            type="button"
            onClick={() => isEnabled && props.onSelect(tier.tier)}
            className={`rounded-[1.75rem] border px-5 py-5 text-left transition ${
              isSelected
                ? "border-[rgba(25,46,58,0.22)] bg-[rgba(25,46,58,0.06)] shadow-[0_16px_36px_rgba(25,46,58,0.06)]"
                : "border-[var(--line)] bg-[rgba(255,255,255,0.88)]"
            } ${isEnabled ? "" : "cursor-not-allowed opacity-55"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {badgeLabel}
                </div>
                <div className="mt-3 text-xl font-semibold text-stone-950">{tier.label}</div>
              </div>
              <div className="text-right text-sm font-semibold text-stone-900">
                {isEnabled ? formatPrice(tier.amount) : badgeLabel}
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              {disabledByLaunch
                ? props.physicalDisabledMessage ?? tier.description
                : tier.description}
            </p>
          </button>
        );
      })}
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
    <label className={SOFT_PANEL_CLASS}>
      <FieldLabel
        title="Email"
        hint="Optional for the proof. Required at checkout for receipts and delivery updates."
      />
      <input
        type="email"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${BUILDER_INPUT_CLASS} mt-4`}
        placeholder="you@example.com"
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
      <label className={`${SOFT_PANEL_CLASS} md:col-span-2`}>
        <FieldLabel title="Shipping name" />
        <input
          value={shipping.fullName}
          onChange={(event) => updateField("fullName", event.target.value)}
          className={`${BUILDER_INPUT_CLASS} mt-4`}
        />
      </label>
      <label className={SOFT_PANEL_CLASS}>
        <FieldLabel title="Company" hint="Optional" />
        <input
          value={shipping.company}
          onChange={(event) => updateField("company", event.target.value)}
          className={`${BUILDER_INPUT_CLASS} mt-4`}
        />
      </label>
      <label className={SOFT_PANEL_CLASS}>
        <FieldLabel title="Phone number" hint="Helpful for delivery issues" />
        <input
          value={shipping.phoneNumber}
          onChange={(event) => updateField("phoneNumber", event.target.value)}
          className={`${BUILDER_INPUT_CLASS} mt-4`}
        />
      </label>
      {(
        [
          ["addressLine1", "Address line 1"],
          ["addressLine2", "Address line 2"],
          ["city", "City"],
          ["state", "State"],
          ["postalCode", "Postal code"],
        ] as const
      ).map(([field, label]) => (
        <label key={field} className={SOFT_PANEL_CLASS}>
          <FieldLabel title={label} />
          <input
            value={shipping[field]}
            onChange={(event) => updateField(field, event.target.value)}
            maxLength={field === "state" ? 2 : undefined}
            className={`${BUILDER_INPUT_CLASS} mt-4`}
          />
        </label>
      ))}
      <label className={SOFT_PANEL_CLASS}>
        <FieldLabel title="Country" hint="US only at launch" />
        <input
          value="United States"
          readOnly
          className={`${BUILDER_INPUT_CLASS} mt-4 cursor-not-allowed bg-stone-50 text-stone-600`}
        />
      </label>
    </div>
  );
}

export function WizardFooter({
  step,
  totalSteps,
  onPrevious,
  onNext,
  disableNext = false,
  nextLabel = "Continue",
}: {
  step: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  disableNext?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={step === 0}
        className="secondary-pill disabled:cursor-not-allowed disabled:opacity-45"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={step >= totalSteps - 1 || disableNext}
        className="cta-pill disabled:cursor-not-allowed disabled:opacity-45"
      >
        {nextLabel}
      </button>
    </div>
  );
}
