"use client";

import { ProductTier, type ShippingQuote } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { BoardSvgFrame } from "@/components/shared/board-svg-frame";
import { getTemplateDefinition, type TemplateSlug } from "@/lib/templates/registry";
import type { ProjectCreateInput, ProjectOutputPayload } from "@/lib/validation/project";
import { formatDate, formatPrice } from "@/lib/utils";

type PreviewEditorProps = {
  projectId: string;
  templateSlug: TemplateSlug;
  input: ProjectCreateInput;
  output: ProjectOutputPayload;
  regenerationCount: number;
  shippingQuotes: ShippingQuote[];
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
  regenerationCount,
  shippingQuotes,
  latestOrder,
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
      }),
    [input.colorMood, input.occasion, input.recipientName, input.visualStyle, state, template],
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

      setMessage("Preview changes saved.");
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

      setMessage("Preview copy regenerated.");
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
      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="section-label">{template.name}</span>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-600">
              Preview is representative. Final print files are generated after checkout.
            </span>
          </div>
          <div>
            <h1 className="heading-display text-5xl font-semibold text-stone-950">
              {state.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">
              {state.subtitle}
            </p>
          </div>
          <BoardSvgFrame svg={boardSvg} />
        </div>

        <div className="space-y-5">
          <div className="glass-panel rounded-[2rem] p-6">
            <div className="flex flex-wrap gap-3">
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
                className="rounded-full border border-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] disabled:opacity-50"
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
                placeholder="for receipt and delivery"
              />
            </label>

            {input.productTier === ProductTier.printed_board_cards ? (
              <div className="mt-5 space-y-4 rounded-[1.5rem] bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-stone-900">Shipping options</div>
                    <div className="text-xs uppercase tracking-[0.16em] text-stone-500">
                      US-only launch · live quote required
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={loadQuotes}
                    disabled={busy !== null}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-stone-700"
                  >
                    {busy === "quotes" ? "Loading..." : "Refresh quotes"}
                  </button>
                </div>
                {shippingQuotes.length ? (
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
                              {quote.productionMaxBusinessDays ?? "?"} business days ·
                              transit {quote.etaMinBusinessDays ?? "?"}-
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
                    Load shipping quotes to estimate delivery timing and enable checkout.
                  </div>
                )}
                {selectedQuote ? (
                  <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
                    Selected option: {selectedQuote.shippingLabel} · estimated ship date{" "}
                    {formatDate(selectedQuote.estimatedShipDate) ?? "pending"}
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={checkout}
              disabled={
                busy !== null ||
                (input.productTier === ProductTier.printed_board_cards && !selectedQuoteId)
              }
              className="mt-5 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
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

          <div className="glass-panel rounded-[2rem] p-6">
            <h2 className="heading-display text-3xl font-semibold">Edit the board copy</h2>
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

      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="heading-display text-3xl font-semibold">Board spaces</h2>
            <p className="mt-2 text-sm text-stone-600">
              Fine-tune space names, captions, and points before checkout.
            </p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700">
            32 spaces
          </div>
        </div>
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
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {(
          [
            ["deckPrimary", state.deckPrimaryLabel],
            ["deckSecondary", state.deckSecondaryLabel],
          ] as const
        ).map(([kind, label]) => (
          <div key={kind} className="glass-panel rounded-[2rem] p-6">
            <h2 className="heading-display text-3xl font-semibold">{label}</h2>
            <div className="mt-6 max-h-[960px] space-y-4 overflow-y-auto pr-2">
              {state[kind].map((card, index) => (
                <div key={`${card.title}-${index}`} className="rounded-[1.5rem] bg-white p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {label.slice(0, -1)} {index + 1}
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
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-[2rem] p-6">
        <h2 className="heading-display text-3xl font-semibold">Rules</h2>
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
      </section>
    </div>
  );
}
