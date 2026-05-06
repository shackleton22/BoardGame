"use client";

import { ProductTier, type ShippingQuote } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { BoardSvgFrame } from "@/components/shared/board-svg-frame";
import { buildTemplateDecorativeImageDataUrl } from "@/lib/templates/preview-art";
import { getTemplateDefinition, type TemplateSlug } from "@/lib/templates/registry";
import type { ProjectCreateInput, ProjectOutputPayload } from "@/lib/validation/project";
import { formatDate, formatPrice } from "@/lib/utils";

type PreviewEditorProps = {
  projectId: string;
  templateSlug: TemplateSlug;
  input: ProjectCreateInput;
  output: ProjectOutputPayload;
  backgroundArtUrl?: string;
  regenerationCount: number;
  shippingQuotes: ShippingQuote[];
  boxContents: string[];
  bomVersion?: string;
  recipeReadiness?: string;
  physicalCheckoutEnabled?: boolean;
  physicalDisabledMessage?: string;
  productionEtaCopy?: string;
  shippingEtaCopy?: string;
  latestOrder?: {
    id: string;
    status: string;
    shippingQuoteId?: string | null;
  } | null;
};

export function PreviewEditor({
  projectId,
  templateSlug,
  input,
  output,
  backgroundArtUrl,
  regenerationCount,
  shippingQuotes,
  boxContents,
  latestOrder,
  physicalCheckoutEnabled = true,
  physicalDisabledMessage = "Boxed checkout is temporarily paused.",
  productionEtaCopy = "Boxed games enter production after checkout.",
  shippingEtaCopy = "Live shipping options show production plus transit timing before payment.",
}: PreviewEditorProps) {
  const router = useRouter();
  const template = getTemplateDefinition(templateSlug);
  const [state, setState] = useState(output);
  const [email, setEmail] = useState(
    typeof input.customerEmail === "string" ? input.customerEmail : "",
  );
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    latestOrder?.shippingQuoteId ??
      shippingQuotes.find((quote) => quote.status === "selected")?.id ??
      shippingQuotes[0]?.id ??
      null,
  );
  const [busy, setBusy] = useState<
    "save" | "regenerate" | "checkout" | "quotes" | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isPhysicalOrder = input.productTier === ProductTier.printed_board_cards;
  const physicalCheckoutPaused = isPhysicalOrder && !physicalCheckoutEnabled;

  const boardSvg = useMemo(
    () =>
      template.renderBoard({
        output: state,
        project: {
          recipientName: input.recipientName,
          occasion: input.occasion,
          visualStyle: input.visualStyle,
          colorMood: input.colorMood,
        },
        backgroundArtDataUrl:
          backgroundArtUrl ?? buildTemplateDecorativeImageDataUrl(templateSlug),
      }),
    [
      backgroundArtUrl,
      input.colorMood,
      input.occasion,
      input.recipientName,
      input.visualStyle,
      state,
      template,
      templateSlug,
    ],
  );

  const saveChanges = async () => {
    setBusy("save");
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to save changes.");
      }

      setMessage("Proof changes saved.");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save changes.");
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async () => {
    setBusy("regenerate");
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/regenerate`, {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to regenerate preview.");
      }

      setMessage("Proof copy regenerated.");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to regenerate preview.",
      );
    } finally {
      setBusy(null);
    }
  };

  const loadQuotes = async () => {
    if (physicalCheckoutPaused) {
      setError(physicalDisabledMessage);
      return;
    }

    setBusy("quotes");
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/shipping/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to load shipping quotes.");
      }

      setMessage("Shipping options refreshed.");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load shipping quotes.",
      );
    } finally {
      setBusy(null);
    }
  };

  const checkout = async () => {
    if (physicalCheckoutPaused) {
      setError(physicalDisabledMessage);
      return;
    }

    setBusy("checkout");
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          email: email || undefined,
          shippingQuoteId: selectedQuoteId || undefined,
        }),
      });

      const data = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout.");
      }

      window.location.href = data.url;
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to start checkout.",
      );
      setBusy(null);
    }
  };

  const updateTile = (
    index: number,
    key: keyof ProjectOutputPayload["tiles"][number],
    value: string | number,
  ) => {
    const nextTiles = [...state.tiles];
    nextTiles[index] = { ...nextTiles[index], [key]: value };
    setState((current) => ({ ...current, tiles: nextTiles }));
  };

  const updateCard = (
    key: "deckPrimary" | "deckSecondary",
    index: number,
    field: keyof ProjectOutputPayload["deckPrimary"][number],
    value: string,
  ) => {
    const nextCards = [...state[key]];
    nextCards[index] = { ...nextCards[index], [field]: value };
    setState((current) => ({ ...current, [key]: nextCards }));
  };

  const selectedQuote =
    shippingQuotes.find((quote) => quote.id === selectedQuoteId) ?? shippingQuotes[0] ?? null;

  return (
    <div className="space-y-10">
      <section className="grid gap-8 xl:grid-cols-[1.14fr_0.86fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="section-label">Print proof</span>
            <span className="tag-pill">Editable before checkout</span>
            <span className="tag-pill">Final files after payment</span>
            {isPhysicalOrder ? <span className="tag-pill">{shippingEtaCopy}</span> : null}
          </div>

          <div>
            <h1 className="heading-display text-5xl font-semibold text-stone-950">
              {state.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
              {state.subtitle}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
              {state.themeSummary}
            </p>
          </div>

          <BoardSvgFrame svg={boardSvg} />

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["32 spaces", "A full board route already drafted for the proof"],
              ["48 cards", "Two custom decks you can review before checkout"],
              ["Rules included", "Playable setup and turn flow ready for the final files"],
            ].map(([value, label]) => (
              <div key={value} className="paper-panel rounded-[1.6rem] p-5">
                <div className="heading-display text-3xl font-semibold text-stone-950">
                  {value}
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="paper-panel rounded-[2rem] p-6">
            <div className="spec-label">Before checkout</div>
            <h2 className="heading-display mt-4 text-3xl font-semibold text-stone-950">
              Approve the proof and choose delivery
            </h2>
            <div className="mt-5 space-y-2">
              {[
                "Save any edits you want reflected in the final version",
                "Add the checkout email for receipts and delivery",
                isPhysicalOrder
                  ? "Choose a shipping option before proceeding"
                  : "Digital delivery will unlock after payment",
                isPhysicalOrder ? productionEtaCopy : "Digital kits are prepared immediately after payment",
              ].map((item) => (
                <div key={item} className="spec-line">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveChanges}
                disabled={busy !== null}
                className="rounded-full bg-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {busy === "save" ? "Saving..." : "Save edits"}
              </button>
              <button
                type="button"
                onClick={regenerate}
                disabled={busy !== null || regenerationCount >= 1}
                className="secondary-pill disabled:opacity-50"
              >
                {busy === "regenerate" ? "Regenerating..." : "Regenerate copy once"}
              </button>
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-semibold text-stone-700">Checkout email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
                placeholder="for receipts and delivery"
              />
            </label>

            {isPhysicalOrder ? (
              <div className="mt-5 space-y-4 rounded-[1.6rem] border border-[var(--line)] bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-stone-900">Shipping options</div>
                    <div className="text-xs uppercase tracking-[0.16em] text-stone-500">
                      US-only launch
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={loadQuotes}
                    disabled={busy !== null || physicalCheckoutPaused}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-stone-700"
                  >
                    {busy === "quotes" ? "Loading..." : "Refresh quotes"}
                  </button>
                </div>

                {physicalCheckoutPaused ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
                    {physicalDisabledMessage}
                  </div>
                ) : shippingQuotes.length ? (
                  <div className="space-y-3">
                    {shippingQuotes.map((quote) => (
                      <button
                        key={quote.id}
                        type="button"
                        onClick={() => setSelectedQuoteId(quote.id)}
                        className={`w-full rounded-2xl border px-4 py-4 text-left ${
                          selectedQuoteId === quote.id
                            ? "border-[var(--brand-strong)] bg-[rgba(38,70,83,0.06)]"
                            : "border-[var(--line)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-stone-900">
                              {quote.shippingLabel}
                            </div>
                            <div className="mt-1 text-sm text-stone-600">
                              Production {quote.productionMinBusinessDays ?? "?"}-
                              {quote.productionMaxBusinessDays ?? "?"} business days, transit{" "}
                              {quote.etaMinBusinessDays ?? "?"}-
                              {quote.etaMaxBusinessDays ?? "?"} business days
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-stone-900">
                              {formatPrice(quote.amount)}
                            </div>
                            <div className="text-xs text-stone-500">
                              quote expires {formatDate(quote.expiresAt)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-4 text-sm text-stone-600">
                    Load shipping quotes to estimate production and delivery timing.
                  </div>
                )}

                {selectedQuote ? (
                  <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
                    Selected option: {selectedQuote.shippingLabel} with an estimated ship
                    date of {formatDate(selectedQuote.estimatedShipDate) ?? "pending"}.
                  </div>
                ) : null}
              </div>
            ) : null}

            {boxContents.length ? (
              <div className="mt-5 rounded-[1.6rem] border border-[var(--line)] bg-white p-4">
                <div className="spec-label">What ships in the box</div>
                <div className="mt-3 space-y-2">
                  {boxContents.map((item) => (
                    <div key={item} className="spec-line">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={checkout}
              disabled={
                busy !== null ||
                physicalCheckoutPaused ||
                (isPhysicalOrder && !selectedQuoteId)
              }
              className="mt-5 w-full rounded-full bg-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(18,43,56,0.18)] disabled:opacity-70"
            >
              {busy === "checkout" ? "Redirecting..." : "Proceed to checkout"}
            </button>

            {message ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="paper-panel rounded-[2rem] p-6">
            <div className="spec-label">Quick edits</div>
            <h2 className="heading-display mt-4 text-3xl font-semibold text-stone-950">
              Tweak the headline copy first
            </h2>
            <div className="mt-4 space-y-4">
              <input
                value={state.title}
                onChange={(event) =>
                  setState((current) => ({ ...current, title: event.target.value }))
                }
                className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
              />
              <textarea
                value={state.subtitle}
                onChange={(event) =>
                  setState((current) => ({ ...current, subtitle: event.target.value }))
                }
                className="min-h-24 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {(
          [
            ["deckPrimary", state.deckPrimaryLabel],
            ["deckSecondary", state.deckSecondaryLabel],
          ] as const
        ).map(([kind, label]) => (
          <div key={kind} className="paper-panel rounded-[2rem] p-6">
            <div className="spec-label">Card preview</div>
            <h2 className="heading-display mt-4 text-3xl font-semibold text-stone-950">
              {label}
            </h2>
            <div className="mt-5 grid gap-4">
              {state[kind].slice(0, 3).map((card, index) => (
                <div key={`${card.title}-${index}`} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Sample {index + 1}
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold text-stone-900">{card.title}</div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{card.body}</p>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                      {card.effect}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <details className="paper-panel rounded-[2rem] p-6">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="spec-label">Detailed editing</div>
                <h2 className="heading-display mt-3 text-3xl font-semibold text-stone-950">
                  Board spaces
                </h2>
              </div>
              <div className="tag-pill">32 spaces</div>
            </div>
          </summary>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {state.tiles.map((tile, index) => (
              <div key={`${tile.name}-${index}`} className="rounded-[1.5rem] bg-white p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Space {index + 1}
                </div>
                <div className="grid gap-3">
                  <input
                    value={tile.name}
                    onChange={(event) => updateTile(index, "name", event.target.value)}
                    className="rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                  />
                  <textarea
                    value={tile.caption}
                    onChange={(event) => updateTile(index, "caption", event.target.value)}
                    className="min-h-20 rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={tile.type}
                      onChange={(event) => updateTile(index, "type", event.target.value)}
                      className="rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                    >
                      {template.tileTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={tile.points}
                      onChange={(event) =>
                        updateTile(index, "points", Number(event.target.value))
                      }
                      className="rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>

        {(
          [
            ["deckPrimary", state.deckPrimaryLabel],
            ["deckSecondary", state.deckSecondaryLabel],
          ] as const
        ).map(([kind, label]) => (
          <details key={kind} className="paper-panel rounded-[2rem] p-6">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="spec-label">Detailed editing</div>
                  <h2 className="heading-display mt-3 text-3xl font-semibold text-stone-950">
                    {label}
                  </h2>
                </div>
                <div className="tag-pill">24 cards</div>
              </div>
            </summary>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {state[kind].map((card, index) => (
                <div key={`${card.title}-${index}`} className="rounded-[1.5rem] bg-white p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Card {index + 1}
                  </div>
                  <div className="space-y-3">
                    <input
                      value={card.title}
                      onChange={(event) =>
                        updateCard(kind, index, "title", event.target.value)
                      }
                      className="w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                    />
                    <textarea
                      value={card.body}
                      onChange={(event) =>
                        updateCard(kind, index, "body", event.target.value)
                      }
                      className="min-h-24 w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                    />
                    <textarea
                      value={card.effect}
                      onChange={(event) =>
                        updateCard(kind, index, "effect", event.target.value)
                      }
                      className="min-h-16 w-full rounded-2xl border border-[var(--line)] px-4 py-3 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}

        <details className="paper-panel rounded-[2rem] p-6">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="spec-label">Detailed editing</div>
                <h2 className="heading-display mt-3 text-3xl font-semibold text-stone-950">
                  Rules
                </h2>
              </div>
              <div className="tag-pill">Playable as written</div>
            </div>
          </summary>

          <div className="mt-6 space-y-4">
            <textarea
              value={state.rules.objective}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  rules: { ...current.rules, objective: event.target.value },
                }))
              }
              className="min-h-24 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <textarea
                value={state.rules.setup.join("\n")}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    rules: {
                      ...current.rules,
                      setup: event.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    },
                  }))
                }
                className="min-h-40 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
              />
              <textarea
                value={state.rules.turn.join("\n")}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    rules: {
                      ...current.rules,
                      turn: event.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    },
                  }))
                }
                className="min-h-40 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
              />
            </div>
            <textarea
              value={state.rules.winning}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  rules: { ...current.rules, winning: event.target.value },
                }))
              }
              className="min-h-24 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
            />
          </div>
        </details>
      </section>
    </div>
  );
}
