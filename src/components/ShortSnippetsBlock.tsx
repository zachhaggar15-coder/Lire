"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";
import { getHiddenSources } from "@/lib/recommendation/preferences";

const SNIPPET_LIMIT = 6;

export default function ShortSnippetsBlock() {
  const [snippets, setSnippets] = useState<ReadingText[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/rss-texts?limit=${SNIPPET_LIMIT}&snippets=only`);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data: { texts: RssReadingText[] } = await res.json();
        if (cancelled) return;

        const hiddenSources = new Set(getHiddenSources());
        const texts = data.texts
          .map(rssReadingTextToReadingText)
          .filter((text) => !text.sourceName || !hiddenSources.has(text.sourceName))
          .slice(0, SNIPPET_LIMIT);
        cacheRssTexts(texts);
        setSnippets(texts);
      } catch {
        if (!cancelled) setSnippets([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (snippets === null) {
    return <div className="mb-5 h-28 animate-pulse rounded-3xl bg-cream-dark" />;
  }

  if (snippets.length === 0) return null;

  return (
    <section className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Short Snippets</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Tiny reads from today&apos;s feeds.</p>
        </div>
        <span className="shrink-0 rounded-full bg-cream-dark px-2.5 py-1 text-xs font-bold text-ink-muted">
          {snippets.length}
        </span>
      </div>

      <div className="mt-3 divide-y divide-cream-dark rounded-2xl border border-cream-dark bg-cream/60">
        {snippets.map((text) => (
          <Link
            key={text.id}
            href={`/reader/${encodeURIComponent(text.id)}`}
            className="block px-3 py-3 active:bg-cream-dark/60"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">{text.title}</h3>
              <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-bold text-brand">
                {text.minutes} min
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{text.preview}</p>
            {text.sourceName && <p className="mt-1 truncate text-[11px] font-semibold text-ink-muted">{text.sourceName}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
