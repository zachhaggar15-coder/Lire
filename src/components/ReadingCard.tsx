"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category, ReadingText, TextStatus } from "@/types";
import { getProgress } from "@/lib/progress";
import { formatDate } from "@/lib/format";
import { estimateDifficulty, type DifficultyEstimate } from "@/lib/difficulty";
import { getKnownWords } from "@/lib/knownWords";
import type { StarRating } from "@/lib/recommendation/types";

const LABEL_STYLES: Record<DifficultyEstimate["label"], string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  "Good level": "bg-sky-100 text-sky-700",
  Stretch: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

const CATEGORY_STYLES: Record<Category, string> = {
  "news-style": "bg-rose-100 text-rose-700",
  sport: "bg-orange-100 text-orange-700",
  culture: "bg-violet-100 text-violet-700",
  science: "bg-sky-100 text-sky-700",
  "everyday life": "bg-emerald-100 text-emerald-700",
};

/** Left-border accent per category — the "colored shelf" look, echoed from the category pill above. */
const CATEGORY_ACCENT: Record<Category, string> = {
  "news-style": "border-rose-400",
  sport: "border-orange-400",
  culture: "border-violet-400",
  science: "border-sky-400",
  "everyday life": "border-emerald-400",
};

const STATUS_STYLES: Record<TextStatus, string> = {
  unread: "bg-cream-dark text-ink-muted",
  "in-progress": "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<TextStatus, string> = {
  unread: "Unread",
  "in-progress": "In progress",
  completed: "Completed",
};

interface ReadingCardProps {
  text: ReadingText;
  /**
   * Precomputed by the recommendation engine (src/lib/recommendation/) when
   * this card is rendered as part of a scored/ranked section — reuses that
   * single computation instead of redoing it here. If omitted (e.g. a
   * standalone usage with no recommendation context), the card computes its
   * own difficulty estimate as before.
   */
  difficulty?: DifficultyEstimate | null;
  starRating?: StarRating | null;
}

export default function ReadingCard({ text, difficulty: difficultyProp, starRating }: ReadingCardProps) {
  const [status, setStatus] = useState<TextStatus>("unread");
  // Starts null (matching SSR output) and fills in after mount — computing
  // this needs localStorage (known words), so doing it in the initial
  // render would cause a hydration mismatch. See "hydration gotcha" in the README.
  const [computedDifficulty, setComputedDifficulty] = useState<DifficultyEstimate | null>(null);
  const difficulty = difficultyProp !== undefined ? difficultyProp : computedDifficulty;

  useEffect(() => {
    setStatus(getProgress(text.id).status);
    // Only compute it ourselves if the caller didn't already provide one.
    if (difficultyProp !== undefined) return;
    // The estimator does French dictionary lookups — running it on an
    // English-language source (some RSS blogs are) would score every word
    // "unfamiliar" and show a meaningless "Hard" for plain English text.
    if (text.language !== "en") {
      setComputedDifficulty(estimateDifficulty(text.body, new Set(getKnownWords())));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text.id, text.body, text.language]);

  return (
    <Link
      href={`/reader/${text.id}`}
      className={`block rounded-3xl border-l-4 bg-cream-card p-4 shadow-sm transition active:scale-[0.99] ${CATEGORY_ACCENT[text.category]}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${CATEGORY_STYLES[text.category]}`}
        >
          {text.category}
        </span>
        <span className="rounded-full bg-cream-dark px-2 py-0.5 text-xs font-semibold text-ink-muted">
          {difficulty?.cefr ?? text.difficulty}
        </span>
        {difficulty && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LABEL_STYLES[difficulty.label]}`}>
            {difficulty.label}
          </span>
        )}
        <span className="ml-auto text-xs text-ink-muted">{text.minutes} min</span>
      </div>
      <h2 className="text-lg font-bold leading-snug text-ink">{text.title}</h2>
      {text.blurbEn && (
        <p className="mt-1 line-clamp-3 text-sm text-ink">{text.blurbEn}</p>
      )}
      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{text.preview}</p>

      {starRating && (
        <p className="mt-1 text-xs font-semibold text-brand">
          {"★".repeat(starRating.stars)}
          {"☆".repeat(5 - starRating.stars)}
          <span className="ml-1 font-medium text-ink-muted">{starRating.label}</span>
        </p>
      )}

      {difficulty && (
        <p className="mt-1 text-xs text-ink-muted">
          ~{Math.round(difficulty.unknownWordRatio * 100)}% of words may be unfamiliar
        </p>
      )}

      {text.sourceName && (
        <p className="mt-1.5 text-xs text-ink-muted">
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
