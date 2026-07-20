"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getHiddenSources,
  getPreferredSources,
  hideSource,
  preferSource,
  unhideSource,
  unpreferSource,
} from "@/lib/recommendation/preferences";
import { formatCategory } from "@/lib/format";

type LoadState = "loading" | "success" | "error";

const SOURCE_HEALTH_SLOW_MS = 7000;
const SOURCE_HEALTH_TIMEOUT_MS = 30000;

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
  const [hiddenSources, setHiddenSources] = useState<string[]>([]);
  const [preferredSources, setPreferredSources] = useState<string[]>([]);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refreshPreferences = useCallback(() => {
    setHiddenSources(getHiddenSources());
    setPreferredSources(getPreferredSources());
  }, []);

  useEffect(() => {
    refreshPreferences();
    let cancelled = false;
    const controller = new AbortController();
    let slowTimer: ReturnType<typeof setTimeout> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    async function load() {
      try {
        setState("loading");
        setIsSlowLoading(false);
        slowTimer = setTimeout(() => {
          if (!cancelled) setIsSlowLoading(true);
        }, SOURCE_HEALTH_SLOW_MS);
        timeoutTimer = setTimeout(() => controller.abort(), SOURCE_HEALTH_TIMEOUT_MS);
        const params = new URLSearchParams({ limit: "1", health: "true" });
        const res = await fetch(`/api/rss-texts?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data: SourceHealthResponse = await res.json();
        if (cancelled) return;
        setSources(data.sourceHealth ?? []);
        setSummary(data.sourceSummary);
        setState("success");
      } catch {
        if (!cancelled) setState("error");
      } finally {
        if (slowTimer) clearTimeout(slowTimer);
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (!cancelled) setIsSlowLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
      controller.abort();
      if (slowTimer) clearTimeout(slowTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, [refreshPreferences, reloadKey]);

  const attempted = useMemo(() => sources.filter((source) => !source.skipped), [sources]);
  const yielded = useMemo(() => attempted.filter((source) => source.accepted > 0), [attempted]);

  function handleHideSource(sourceName: string) {
    hideSource(sourceName);
    refreshPreferences();
  }

  function handlePreferSource(sourceName: string) {
    preferSource(sourceName);
    refreshPreferences();
  }

  function handleUnhideSource(sourceName: string) {
    unhideSource(sourceName);
    refreshPreferences();
  }

  function handleUnpreferSource(sourceName: string) {
    unpreferSource(sourceName);
    refreshPreferences();
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Sources</h1>
          <p className="text-sm text-ink-muted">RSS feed status for the current article pool. Refreshes are warmed by the 7am/7pm cron.</p>
        </div>
      </header>

      {state === "loading" && (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-card bg-cream-dark" />
          {isSlowLoading && (
            <div className="rounded-2xl bg-cream-card px-3 py-2 shadow-card">
              <p className="text-sm font-semibold text-ink">Still checking source health.</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-ink-muted">The RSS pool can take a moment to warm.</p>
                <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="shrink-0 rounded-full bg-cream-dark px-3 py-1.5 text-xs font-semibold text-ink-muted">
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {state === "error" && (
        <div className="rounded-card bg-cream-card p-5 text-center shadow-card">
          <p className="text-sm font-bold text-ink">Source health is unavailable right now.</p>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-3 rounded-full bg-brand px-4 py-2 shadow-raised text-sm font-semibold text-white active:scale-95">
            Retry
          </button>
        </div>
      )}

      {state === "success" && (
        <>
          <section className="mb-5 space-y-3">
            <SourceControlList
              title="Preferred sources"
              empty="No preferred sources yet."
              sources={preferredSources}
              actionLabel="Remove"
              onAction={handleUnpreferSource}
            />
            <SourceControlList
              title="Hidden sources"
              empty="No hidden sources."
              sources={hiddenSources}
              actionLabel="Unhide"
              onAction={handleUnhideSource}
            />
          </section>

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
            {attempted.map((source) => (
              <article key={source.id} className="rounded-card bg-cream-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-ink">{source.name}</h2>
                    <p className="mt-0.5 text-xs capitalize text-ink-muted">
                      {source.language} / {formatCategory(source.category)}
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
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreferSource(source.name)}
                    disabled={preferredSources.includes(source.name)}
                    className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand disabled:opacity-50"
                  >
                    {preferredSources.includes(source.name) ? "Preferred" : "Prefer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHideSource(source.name)}
                    disabled={hiddenSources.includes(source.name)}
                    className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:opacity-50"
                  >
                    {hiddenSources.includes(source.name) ? "Hidden" : "Hide"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function SourceControlList({
  title,
  empty,
  sources,
  actionLabel,
  onAction,
}: {
  title: string;
  empty: string;
  sources: string[];
  actionLabel: string;
  onAction: (sourceName: string) => void;
}) {
  return (
    <div className="rounded-card bg-cream-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h2>
        <span className="rounded-full bg-cream-dark px-2 py-0.5 text-xs font-semibold text-ink-muted">{sources.length}</span>
      </div>
      {sources.length === 0 ? (
        <p className="mt-2 text-sm text-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sources.map((source) => (
            <li key={source} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-3 py-2">
              <span className="min-w-0 truncate text-sm font-semibold text-ink">{source}</span>
              <button
                type="button"
                onClick={() => onAction(source)}
                className="shrink-0 rounded-full bg-cream-dark px-3 py-1.5 text-xs font-semibold text-ink-muted active:scale-95"
              >
                {actionLabel}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-cream-card p-3 text-center shadow-card">
      <p className="text-lg font-extrabold text-ink">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}
