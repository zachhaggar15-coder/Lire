"use client";

import { useCallback, useEffect, useState } from "react";

interface FeedbackRow {
  id: string;
  user_id: string | null;
  anonymous_id: string | null;
  session_id: string | null;
  category: string;
  sentiment: string | null;
  page: string | null;
  feature: string | null;
  article_id: string | null;
  affected_term: string | null;
  comment: string | null;
  app_version: string;
  deployment_environment: string;
  created_at: string;
}

type FeedbackResponse = { ok: true; feedback: FeedbackRow[] } | { ok: false; error: string };

/** Internal feedback viewer. Records are read only through an authenticated server route. */
export default function FeedbackDashboard() {
  const [feedback, setFeedback] = useState<FeedbackRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/feedback?limit=100", {
        cache: "no-store",
      });
      const payload = (await response.json()) as FeedbackResponse;
      if (!response.ok || !payload.ok) {
        setFeedback(null);
        setError(payload.ok ? "Feedback could not be loaded." : payload.error);
        return;
      }
      setFeedback(payload.feedback);
    } catch {
      setFeedback(null);
      setError("Feedback could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  return (
    <main className="p-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Feedback{feedback ? ` (${feedback.length})` : ""}</h1>
      </header>

      <button type="button" onClick={() => void loadFeedback()} disabled={loading} className="mb-6 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50">
        {loading ? "Loading…" : "Refresh"}
      </button>

      {error && <p role="alert" className="mb-5 rounded-xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
      {feedback?.length === 0 && !loading && !error && <p className="text-sm text-ink-muted">No feedback has been received yet.</p>}

      {feedback && feedback.length > 0 && (
        <div className="space-y-4">
          {feedback.map((item) => (
            <article key={item.id} className="rounded-lg border bg-cream-card p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold">{item.category}</p>
                  <p className="text-sm text-gray-600">{new Date(item.created_at).toLocaleString()} • {item.app_version}</p>
                </div>
                {item.sentiment && <span className="rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">{item.sentiment}</span>}
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                {item.page && <Detail label="Page" value={item.page} monospace />}
                {item.feature && <Detail label="Feature" value={item.feature} />}
                {item.affected_term && <Detail label="Affected term" value={item.affected_term} monospace />}
                {item.article_id && <Detail label="Article" value={item.article_id} monospace />}
              </div>
              {item.comment && <p className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm">{item.comment}</p>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function Detail({ label, value, monospace = false }: { label: string; value: string; monospace?: boolean }) {
  return (
    <div>
      <p className="text-gray-600">{label}:</p>
      <p className={monospace ? "font-mono text-xs" : ""}>{value}</p>
    </div>
  );
}
