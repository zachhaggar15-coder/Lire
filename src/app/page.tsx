"use client";

import { useEffect, useState } from "react";
import ReadingCard from "@/components/ReadingCard";
import { texts as hardcodedTexts } from "@/data/texts";
import type { ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";
import { pruneStaleRssProgress } from "@/lib/progress";

type LoadState = "loading" | "success" | "empty" | "error";

/** Only present in non-production responses — see /api/rss-texts/route.ts. */
interface RssDebugInfo {
  feedsSucceeded: number;
  feedsFailed: number;
  candidatePoolSize: number;
  candidatePoolBuiltAt: string;
  selectedIds: string[];
  seed: string;
}

const DAILY_LIMIT = 5;

export default function HomePage() {
  const [rssTexts, setRssTexts] = useState<ReadingText[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [debug, setDebug] = useState<RssDebugInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/rss-texts?limit=${DAILY_LIMIT}`);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);

        const data: { texts: RssReadingText[]; debug?: RssDebugInfo } = await res.json();
        if (cancelled) return;

        const mapped = data.texts.map(rssReadingTextToReadingText);
        if (mapped.length === 0) {
          setState("empty");
          return;
        }

        cacheRssTexts(mapped);
        // Drop progress for RSS ids that have rotated out of today's
        // selection, so lire.progress.v1 doesn't grow forever.
        pruneStaleRssProgress(mapped.map((t) => t.id));
        setRssTexts(mapped);
        setDebug(data.debug ?? null);
        setState("success");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const showingRss = state === "success";
  // If RSS came back with fewer than 5 (a rough day for feeds), fill the
  // remaining slots with hardcoded texts so the reader still sees a full
  // set — never fewer than 5 when hardcoded texts are available.
  const displayedTexts = !showingRss
    ? hardcodedTexts
    : rssTexts.length >= DAILY_LIMIT
      ? rssTexts
      : [...rssTexts, ...hardcodedTexts.slice(0, DAILY_LIMIT - rssTexts.length)];

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Lire
        </h1>
        <p className="text-sm text-slate-500">
          Read short French texts. Tap words you don&apos;t know.
        </p>
      </header>

      {state === "loading" && (
        <div className="space-y-4" aria-label="Loading articles">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      )}

      {(state === "error" || state === "empty") && (
        <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          Couldn&apos;t load today&apos;s articles — showing saved texts instead.
        </p>
      )}

      {state !== "loading" && (
        <>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
            Today&apos;s 5 readings
          </h2>
          <p className="mb-4 mt-0.5 text-xs text-slate-400">
            Refreshes daily — the same 5 stay all day, picked from a much
            bigger pool.
          </p>

          <div className="space-y-4">
            {displayedTexts.map((text) => (
              <ReadingCard key={text.id} text={text} />
            ))}
          </div>

          {process.env.NODE_ENV !== "production" && debug && (
            <details className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              <summary className="cursor-pointer font-semibold text-slate-600">
                Debug: RSS selection (dev only)
              </summary>
              <ul className="mt-2 space-y-0.5">
                <li>Feeds succeeded: {debug.feedsSucceeded}</li>
                <li>Feeds failed: {debug.feedsFailed}</li>
                <li>Candidate pool size: {debug.candidatePoolSize}</li>
                <li>Pool built at: {debug.candidatePoolBuiltAt}</li>
                <li>Seed: {debug.seed}</li>
                <li className="break-all">Selected ids: {debug.selectedIds.join(", ")}</li>
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
