"use client";

import { useEffect, useState } from "react";
import ReadingCard from "@/components/ReadingCard";
import { texts as hardcodedTexts } from "@/data/texts";
import type { ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";

type LoadState = "loading" | "success" | "empty" | "error";

export default function HomePage() {
  const [rssTexts, setRssTexts] = useState<ReadingText[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/rss-texts");
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);

        const data: { texts: RssReadingText[] } = await res.json();
        if (cancelled) return;

        const mapped = data.texts.map(rssReadingTextToReadingText);
        if (mapped.length === 0) {
          setState("empty");
          return;
        }

        cacheRssTexts(mapped);
        setRssTexts(mapped);
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
  const displayedTexts = showingRss ? rssTexts : hardcodedTexts;

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
        <div className="space-y-4">
          {displayedTexts.map((text) => (
            <ReadingCard key={text.id} text={text} />
          ))}
        </div>
      )}
    </div>
  );
}
