"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReadingText } from "@/types";
import type { RssReadingText } from "@/lib/rss/rssToReadingText";
import { rssReadingTextToReadingText } from "@/lib/rss/adaptReadingText";
import { cacheRssTexts } from "@/lib/rss/rssTextCache";
import { getHiddenSources } from "@/lib/recommendation/preferences";
import { formatDate } from "@/lib/format";

const HOME_NEWS_FETCH_LIMIT = 12;
const HOME_NEWS_VISIBLE_LIMIT = 3;

function publishedTime(text: ReadingText): number {
  if (!text.publishedAt) return 0;
  const time = new Date(text.publishedAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sourceMeta(text: ReadingText): string {
  return [text.sourceName, text.publishedAt ? formatDate(text.publishedAt) : null, `${text.minutes} min`]
    .filter(Boolean)
    .join(" - ");
}

export default function HomeNewsSection() {
  const [articles, setArticles] = useState<ReadingText[] | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams({
          limit: String(HOME_NEWS_FETCH_LIMIT),
          snippets: "exclude",
        });
        const res = await fetch(`/api/rss-texts?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data: { texts: RssReadingText[] } = await res.json();
        if (cancelled) return;

        const hiddenSources = new Set(getHiddenSources());
        const texts = data.texts
          .map(rssReadingTextToReadingText)
          .filter((text) => !text.sourceName || !hiddenSources.has(text.sourceName))
          .sort((a, b) => publishedTime(b) - publishedTime(a))
          .slice(0, HOME_NEWS_VISIBLE_LIMIT);

        cacheRssTexts(texts);
        setArticles(texts);
      } catch {
        if (!cancelled) setArticles([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const readyCount = articles?.length ?? 0;

  return (
    <section>
      <div className="rounded-card bg-cream-card shadow-card">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="home-news-list"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center gap-3 p-4 text-left active:scale-[0.99]"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold uppercase tracking-wide text-ink-muted">Today&apos;s News</span>
            <span className="mt-0.5 block truncate text-xs text-ink-muted">
              {articles === null ? "Preparing fresh articles" : `${readyCount} fresh article${readyCount === 1 ? "" : "s"} ready`}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">
            {articles === null ? "..." : readyCount}
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

        <div id="home-news-list" hidden={!isOpen} className="border-t border-cream-dark px-3 pb-3">
          {articles === null ? (
            <div className="space-y-2 pt-3">
              <div className="h-20 animate-pulse rounded-2xl bg-cream-dark" />
              <div className="h-20 animate-pulse rounded-2xl bg-cream-dark" />
            </div>
          ) : articles.length === 0 ? (
            <p className="px-1 pt-3 text-sm font-semibold text-ink-muted">No fresh articles are ready yet.</p>
          ) : (
            <>
              <div className="divide-y divide-cream-dark rounded-2xl border border-cream-dark bg-cream/60">
                {articles.map((text) => (
                  <Link
                    key={text.id}
                    href={`/reader/${encodeURIComponent(text.id)}`}
                    className="block px-3 py-3 active:bg-cream-dark/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 min-w-0 text-sm font-bold leading-snug text-ink">{text.title}</h3>
                      <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">Read</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{text.blurbEn ?? text.preview}</p>
                    <p className="mt-2 truncate text-xs font-semibold text-ink-muted">{sourceMeta(text)}</p>
                  </Link>
                ))}
              </div>
              <Link href="/live-news" className="mt-3 inline-flex text-xs font-bold text-brand underline underline-offset-2">
                More news
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
