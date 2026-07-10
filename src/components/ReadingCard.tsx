"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category, ReadingText, TextStatus } from "@/types";
import { getProgress } from "@/lib/progress";
import { formatDate } from "@/lib/format";
import { estimateDifficulty, type DifficultyEstimate } from "@/lib/difficulty";
import { getKnownWords } from "@/lib/knownWords";
import type { StarRating } from "@/lib/recommendation/types";
import {
  hideSource,
  isSavedForLater,
  isSourceHidden,
  recordArticlePreference,
  removeFromSavedLater,
  saveForLater,
} from "@/lib/recommendation/preferences";

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
  difficulty?: DifficultyEstimate | null;
  starRating?: StarRating | null;
}

export default function ReadingCard({ text, difficulty: difficultyProp, starRating }: ReadingCardProps) {
  const [status, setStatus] = useState<TextStatus>("unread");
  const [computedDifficulty, setComputedDifficulty] = useState<DifficultyEstimate | null>(null);
  const [hidden, setHidden] = useState(false);
  const [savedLater, setSavedLater] = useState(false);
  const difficulty = difficultyProp !== undefined ? difficultyProp : computedDifficulty;

  useEffect(() => {
    setStatus(getProgress(text.id).status);
    setHidden(isSourceHidden(text.sourceName));
    setSavedLater(isSavedForLater(text.id));
    if (difficultyProp !== undefined) return;
    if (text.language !== "en") {
      setComputedDifficulty(estimateDifficulty(text.body, new Set(getKnownWords())));
    }
  }, [difficultyProp, text.body, text.id, text.language, text.sourceName]);

  if (hidden) return null;

  function handleSaveLater() {
    if (savedLater) {
      removeFromSavedLater(text.id);
      setSavedLater(false);
      return;
    }
    saveForLater(text.id);
    setSavedLater(true);
  }

  function handleHideSource() {
    if (!text.sourceName) return;
    hideSource(text.sourceName);
    setHidden(true);
  }

  return (
    <article className={`rounded-3xl border-l-4 bg-cream-card p-4 shadow-sm ${CATEGORY_ACCENT[text.category]}`}>
      <Link href={`/reader/${text.id}`} className="block transition active:scale-[0.99]">
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
        {text.blurbEn && <p className="mt-1 line-clamp-3 text-sm text-ink">{text.blurbEn}</p>}
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{text.preview}</p>

        {starRating && (
          <p className="mt-1 text-xs font-semibold text-brand">
            {"\u2605".repeat(starRating.stars)}
            {"\u2606".repeat(5 - starRating.stars)}
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
            {text.publishedAt && <> {"\u00b7"} {formatDate(text.publishedAt)}</>}
          </p>
        )}
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        <button
          type="button"
          onClick={() => recordArticlePreference(text, "more")}
          className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 active:scale-95"
        >
          More like this
        </button>
        <button
          type="button"
          onClick={() => recordArticlePreference(text, "less")}
          className="rounded-full bg-cream-dark px-2.5 py-1 text-xs font-semibold text-ink-muted active:scale-95"
        >
          Less like this
        </button>
        <button
          type="button"
          onClick={handleSaveLater}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold active:scale-95 ${
            savedLater ? "bg-brand text-white" : "bg-sky-100 text-sky-700"
          }`}
        >
          {savedLater ? "Saved" : "Save"}
        </button>
        {text.sourceName && (
          <button
            type="button"
            onClick={handleHideSource}
            className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 active:scale-95"
          >
            Hide source
          </button>
        )}
      </div>
    </article>
  );
}
