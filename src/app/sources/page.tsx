"use client";

import { useEffect, useMemo, useState } from "react";

type LoadState = "loading" | "success" | "error";

interface SourceHealth {
  id: string;
  name: string;
  language: string;
  category: string;
  ok: boolean;
  skipped: boolean;
  accepted: number;
  rejected: number;
  reason: string;
}

interface SourceHealthResponse {
  sourceHealth?: SourceHealth[];
  sourceSummary?: {
    feedsSucceeded: number;
    feedsFailed: number;
    itemsRejected: number;
    candidatePoolSize: number;
    candidatePoolBuiltAt: string;
  };
}

export default function SourcesPage() {
  const [state, setState] = useState<LoadState>("loading");
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [summary, setSummary] = useState<SourceHealthResponse["sourceSummary"]>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setState("loading");
        const params = new URLSearchParams({ limit: "1", health: "true" });
        if (refreshKey > 0) params.set("refresh", "true");
        const res = await fetch(`/api/rss-texts?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data: SourceHealthResponse = await res.json();
        if (cancelled) return;
        setSources(data.sourceHealth ?? []);
        setSummary(data.sourceSummary);
        setState("success");
      } catch {
        if (!cancelled) setState("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const attempted = useMemo(() => sources.filter((source) => !source.skipped), [sources]);
  const yielded = useMemo(() => attempted.filter((source) => source.accepted > 0), [attempted]);
  const problemSources = useMemo(
    () => attempted.filter((source) => !source.ok || source.accepted === 0 || source.rejected > 0),
    [attempted]
  );

  return (
    <div className="px-4 pt-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Sources</h1>
          <p className="text-sm text-ink-muted">RSS feed status for the current article pool.</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="shrink-0 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white active:scale-95"
        >
          Refresh
        </button>
      </header>

      {state === "loading" && <div className="h-28 animate-pulse rounded-3xl bg-cream-dark" />}

      {state === "error" && (
        <p className="rounded-2xl bg-accent-pink px-3 py-2 text-sm font-medium text-accent-pinktext">
          Source health is unavailable right now.
        </p>
      )}

      {state === "success" && (
        <>
          <section className="mb-5 grid grid-cols-3 gap-2">
            <Metric label="Attempted" value={attempted.length} />
            <Metric label="Yielded" value={yielded.length} />
            <Metric label="Rejected" value={summary?.itemsRejected ?? 0} />
          </section>

          {summary && (
            <p className="mb-4 rounded-2xl bg-cream-dark px-3 py-2 text-xs text-ink-muted">
              Pool: {summary.candidatePoolSize} articles. Built {new Date(summary.candidatePoolBuiltAt).toLocaleString()}.
            </p>
          )}

          <section className="space-y-3">
            {problemSources.map((source) => (
              <article key={source.id} className="rounded-3xl bg-cream-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-ink">{source.name}</h2>
                    <p className="mt-0.5 text-xs capitalize text-ink-muted">
                      {source.language} / {source.category}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      source.ok && source.accepted > 0
                        ? "bg-emerald-100 text-emerald-700"
                        : source.ok
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {source.ok ? "OK" : "Fail"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink-muted">
                  {source.accepted} accepted, {source.rejected} rejected. {source.reason}
                </p>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-cream-card p-3 text-center shadow-sm">
      <p className="text-lg font-extrabold text-ink">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}
