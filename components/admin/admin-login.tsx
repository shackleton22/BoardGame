"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in.");
      }

      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel mx-auto max-w-lg rounded-[2rem] p-8">
      <h1 className="heading-display text-4xl font-semibold">Admin access</h1>
      <p className="mt-3 text-sm leading-7 text-stone-600">
        Enter the admin password from your environment variables to view projects,
        orders, generated assets, and fulfillment payloads.
      </p>
      <div className="mt-6 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          placeholder="ADMIN_PASSWORD"
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-full bg-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          {loading ? "Checking..." : "Enter admin"}
        </button>
        {error ? (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
