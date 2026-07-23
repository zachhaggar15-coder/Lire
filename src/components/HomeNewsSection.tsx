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

  if (articles === null) {
    return (
      <section className="mt-5">
        <div className="h-5 w-28 animate-pulse rounded-full bg-cream-dark" />
        <div className="mt-3 space-y-2">
          <div className="h-24 animate-pulse rounded-card bg-cream-dark" />
          <div className="h-24 animate-pulse rounded-card bg-cream-dark" />
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="mt-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Today&apos;s News</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Fresh articles from today&apos;s feeds.</p>
        </div>
        <Link href="/live-news" className="shrink-0 text-xs font-bold text-brand underline underline-offset-2">
          More news
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {articles.map((text) => (
          <Link
            key={text.id}
            href={`/reader/${encodeURIComponent(text.id)}`}
            className="block rounded-card bg-cream-card p-4 shadow-card active:scale-[0.99]"
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
    </section>
  );
}
