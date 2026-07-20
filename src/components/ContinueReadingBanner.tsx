"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLastOpenedTextId, getProgress } from "@/lib/progress";
import { getCustomTextById } from "@/lib/customTexts";
import { getCachedRssTextById } from "@/lib/rss/rssTextCache";

interface ContinueReadingInfo {
  id: string;
  title: string;
}

/** A prominent banner at the top of the home page for an article left half-finished. */
export default function ContinueReadingBanner() {
  const [info, setInfo] = useState<ContinueReadingInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = getLastOpenedTextId();
    if (!id || getProgress(id).status !== "in-progress") return;

    // Imported and RSS texts come from local storage, so they resolve without
    // touching the built-in library at all. Only fall back to the bundled
    // texts (~1.3 MB) when neither has it, and load them dynamically — a
    // static import here pulled that whole library into the home page's
    // JavaScript just to render one title.
    const local = getCustomTextById(id) ?? getCachedRssTextById(id);
    if (local) {
      setInfo({ id, title: local.title });
      return;
    }

    void import("@/data/texts").then(({ getTextById }) => {
      const text = getTextById(id);
      if (!cancelled && text) setInfo({ id, title: text.title });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!info) return null;

  return (
    <Link
      href={`/reader/${info.id}`}
      className="mb-5 flex items-center justify-between gap-3 rounded-card bg-brand px-5 py-4 text-white shadow-card active:scale-[0.99]"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Continue reading</p>
        <p className="truncate text-sm font-bold">{info.title}</p>
      </div>
      <svg
        className="h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
