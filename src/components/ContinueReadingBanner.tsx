"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLastOpenedTextId, getProgress } from "@/lib/progress";
import { getCustomTextById } from "@/lib/customTexts";
import { getCachedRssTextById } from "@/lib/rss/rssTextCache";
import { getTextById } from "@/data/texts";

interface ContinueReadingInfo {
  id: string;
  title: string;
}

/** A prominent banner at the top of the home page for an article left half-finished — separate from (and more visible than) TodayCard's single next-action slot. */
export default function ContinueReadingBanner() {
  const [info, setInfo] = useState<ContinueReadingInfo | null>(null);

  useEffect(() => {
    const id = getLastOpenedTextId();
    if (!id || getProgress(id).status !== "in-progress") return;
    const text = getCustomTextById(id) ?? getCachedRssTextById(id) ?? getTextById(id);
    if (text) setInfo({ id, title: text.title });
  }, []);

  if (!info) return null;

  return (
    <Link
      href={`/reader/${info.id}`}
      className="mb-5 flex items-center justify-between gap-3 rounded-3xl bg-brand px-5 py-4 text-white shadow-sm active:scale-[0.99]"
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
