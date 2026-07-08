"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category, ReadingText, TextStatus } from "@/types";
import { getProgress } from "@/lib/progress";
import { formatDate } from "@/lib/format";
import { estimateDifficulty, type DifficultyEstimate } from "@/lib/difficulty";
import { getKnownWords } from "@/lib/knownWords";

const LABEL_STYLES: Record<DifficultyEstimate["label"], string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  "Good level": "bg-sky-100 text-sky-700",
  Stretch: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

const CATEGORY_STYLES: Record<Category, string> = {
  "news-style": "bg-rose-100 text-rose-700",
  sport: "bg-emerald-100 text-emerald-700",
  culture: "bg-violet-100 text-violet-700",
  science: "bg-sky-100 text-sky-700",
  "everyday life": "bg-amber-100 text-amber-700",
};

const STATUS_STYLES: Record<TextStatus, string> = {
  unread: "bg-slate-100 text-slate-500",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<TextStatus, string> = {
  unread: "Unread",
  "in-progress": "In progress",
  completed: "Completed",
};

export default function ReadingCard({ text }: { text: ReadingText }) {
  const [status, setStatus] = useState<TextStatus>("unread");
  // Starts null (matching SSR output) and fills in after mount — computing
  // this needs localStorage (known words), so doing it in the initial
  // render would cause a hydration mismatch. See "hydration gotcha" in the README.
  const [difficulty, setDifficulty] = useState<DifficultyEstimate | null>(null);

  useEffect(() => {
    setStatus(getProgress(text.id).status);
    // The estimator does French dictionary lookups — running it on an
    // English-language source (some RSS blogs are) would score every word
    // "unfamiliar" and show a meaningless "Hard" for plain English text.
    if (text.language !== "en") {
      setDifficulty(estimateDifficulty(text.body, new Set(getKnownWords())));
    }
  }, [text.id, text.body, text.language]);

  return (
    <Link
      href={`/reader/${text.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99]"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${CATEGORY_STYLES[text.category]}`}
        >
          {text.category}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {difficulty?.cefr ?? text.difficulty}
        </span>
        {difficulty && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LABEL_STYLES[difficulty.label]}`}>
            {difficulty.label}
          </span>
        )}
        <span className="ml-auto text-xs text-slate-400">{text.minutes} min</span>
      </div>
      <h2 className="text-lg font-bold leading-snug text-slate-900">{text.title}</h2>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{text.preview}</p>

      {difficulty && (
        <p className="mt-1 text-xs text-slate-400">
          ~{Math.round(difficulty.unknownWordRatio * 100)}% of words may be unfamiliar
        </p>
      )}

      {text.sourceName && (
        <p className="mt-1.5 text-xs text-slate-400">
          {text.sourceName}
          {text.publishedAt && <> · {formatDate(text.publishedAt)}</>}
        </p>
      )}

      <span
        className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
      >
        {STATUS_LABELS[status]}
      </span>
    </Link>
  );
}
