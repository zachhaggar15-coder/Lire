"use client";

import { useState, type FormEvent } from "react";

export default function AdminFeedbackLogin() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Sign-in failed.");
        return;
      }
      window.location.reload();
    } catch {
      setError("Sign-in failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6 pt-16">
      <p className="text-xs font-bold uppercase tracking-wide text-brand">Admin</p>
      <h1 className="mt-1 text-2xl font-bold text-ink">Feedback access</h1>
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-card bg-cream-card p-4 shadow-card">
        <label className="block text-sm font-semibold text-ink">
          Validation admin token
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <button type="submit" disabled={loading || !token.trim()} className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50">
          {loading ? "Checking…" : "Continue"}
        </button>
        {error && <p role="alert" className="text-sm font-semibold text-rose-700">{error}</p>}
      </form>
    </main>
  );
}
