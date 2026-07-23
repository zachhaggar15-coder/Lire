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
  const [isOpen, setIsOpen] = useState(false);

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

  const readyCount = snippets?.length ?? 0;

  return (
    <section className="rounded-card bg-cream-card p-4 shadow-card">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="short-snippets-list"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-3 text-left active:scale-[0.99]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold uppercase tracking-wide text-ink-muted">Short Snippets</span>
          <span className="mt-0.5 block truncate text-xs text-ink-muted">
            {snippets === null ? "Preparing tiny reads" : `${readyCount} snippet${readyCount === 1 ? "" : "s"} ready`}
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-cream-dark px-2.5 py-1 text-xs font-bold text-ink-muted">
          {snippets === null ? "..." : readyCount}
        </span>
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-dark text-sm font-extrabold text-ink-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          v
        </span>
      </button>

      <div id="short-snippets-list" hidden={!isOpen} className="mt-3 border-t border-cream-dark pt-3">
        {snippets === null ? (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-2xl bg-cream-dark" />
            <div className="h-16 animate-pulse rounded-2xl bg-cream-dark" />
          </div>
        ) : snippets.length === 0 ? (
          <p className="text-sm font-semibold text-ink-muted">No short snippets are ready yet.</p>
        ) : (
          <div className="divide-y divide-cream-dark rounded-2xl border border-cream-dark bg-cream/60">
            {snippets.map((text) => (
              <Link
                key={text.id}
                href={`/reader/${encodeURIComponent(text.id)}`}
                className="block px-3 py-3 active:bg-cream-dark/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">{text.title}</h3>
                  <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand">
                    {text.minutes} min
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{text.preview}</p>
                {text.sourceName && <p className="mt-1 truncate text-xs font-semibold text-ink-muted">{text.sourceName}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
