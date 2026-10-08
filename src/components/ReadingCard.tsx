"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Difficulty, ReadingText, TextStatus } from "@/types";
import { getProgress } from "@/lib/progress";
import { formatDate, toPercent, topicLabel } from "@/lib/format";
import { estimateDifficulty, type DifficultyEstimate } from "@/lib/difficulty";
import { getEstimatedKnownVocabulary } from "@/lib/vocabulary/estimatedVocabulary";
import { editorialLevel, levelFit } from "@/lib/readingLevel";
import { getSelectedReadingLevel } from "@/lib/onboarding";
import type { ScoreBreakdown } from "@/lib/recommendation/types";
import {
  hideSource,
  isSavedForLater,
  isSourcePreferred,
  isSourceHidden,
  preferSource,
  recordArticlePreference,
  removeFromSavedLater,
  saveForLater,
  hasHideableSource,
  unhideSource,
  unpreferSource,
} from "@/lib/recommendation/preferences";

const STATUS_LABELS: Record<TextStatus, string> = {
  unread: "Unread",
  "in-progress": "In progress",
  completed: "Completed",
};

interface ReadingCardProps {
  text: ReadingText;
  difficulty?: DifficultyEstimate | null;
  score?: ScoreBreakdown | null;
}

function recommendationReasons(
  text: ReadingText,
  difficulty: DifficultyEstimate | null | undefined,
  score: ScoreBreakdown | null | undefined
): string[] {
  const reasons: string[] = [];
  if (score?.sourcePreference === 1) reasons.push("Preferred source");
  if ((score?.difficultyMatch ?? 0) >= 0.9) reasons.push("Close to your level");
  if ((score?.freshness ?? 0) >= 0.85) reasons.push("Fresh article");
  if ((score?.topicPreference ?? 0) >= 0.7) reasons.push("Matches your topics");
  if ((score?.unknownWordTarget ?? 0) >= 0.9) reasons.push("Good new-word range");
  if (text.minutes <= 3) reasons.push("Quick read");
  if (difficulty && difficulty.dictionaryCoverage >= 0.85) reasons.push("Strong dictionary coverage");
  return [...new Set(reasons)].slice(0, 3);
}

function sourceTrustLabel(text: ReadingText): string {
  if (text.id.startsWith("custom-")) return "Imported by you";
  if (text.id.startsWith("pd-")) return "Classic literature";
  // Starter texts carry a source name ("Written for Sorlio"), so they must be
  // recognised before the news case or they would be labelled as news.
  if (text.id.startsWith("starter-")) return "Written for Sorlio";
  if (text.sourceName) return "News";
  return "Written for Sorlio";
}

function learnerSourceLabel(text: ReadingText): string {
  if (text.id.startsWith("custom-")) return "Imported text";
  if (text.id.startsWith("pd-")) return "Classic story";
  if (text.sourceName) return text.sourceName;
  return "Practice text";
}

export default function ReadingCard({ text, difficulty: difficultyProp, score }: ReadingCardProps) {
  const [status, setStatus] = useState<TextStatus>("unread");
  const [computedDifficulty, setComputedDifficulty] = useState<DifficultyEstimate | null>(null);
  const [hidden, setHidden] = useState(false);
  const [savedLater, setSavedLater] = useState(false);
  const [preferred, setPreferred] = useState(false);
  // Set when the reader hid this card's source just now, so the card can offer Undo.
  const [justHid, setJustHid] = useState(false);
  const [tuned, setTuned] = useState<"more" | "less" | null>(null);
  const [readerLevel, setReaderLevel] = useState<Difficulty | null>(null);
  const difficulty = difficultyProp !== undefined ? difficultyProp : computedDifficulty;
  const reasons = recommendationReasons(text, difficulty, score);

  useEffect(() => {
    setStatus(getProgress(text.id).status);
    setHidden(hasHideableSource({ id: text.id, sourceName: text.sourceName }) && isSourceHidden(text.sourceName));
    setPreferred(isSourcePreferred(text.sourceName));
    setSavedLater(isSavedForLater(text.id));
    setReaderLevel(getSelectedReadingLevel());
    if (difficultyProp !== undefined) return;
    if (text.language !== "en") {
      setComputedDifficulty(estimateDifficulty(text.body, getEstimatedKnownVocabulary()));
    }
  }, [difficultyProp, text.body, text.id, text.language, text.sourceName]);


  if (hidden && justHid && text.sourceName) {
    return (
      <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-cream-dark bg-cream-card px-4 py-3 text-sm text-ink-muted">
        <span>
          Readings from <span className="font-semibold text-ink">{text.sourceName}</span> are hidden.
        </span>
        <span className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              unhideSource(text.sourceName!);
              setHidden(false);
              setJustHid(false);
            }}
            className="font-semibold text-brand underline underline-offset-2"
          >
            Undo
          </button>
          <Link href="/sources" className="text-xs underline underline-offset-2">
            Manage hidden sources
          </Link>
        </span>
      </div>
    );
  }
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
    setJustHid(true);
  }

  function handlePreferSource() {
    if (!text.sourceName) return;
    if (preferred) {
      unpreferSource(text.sourceName);
      setPreferred(false);
      return;
    }
    preferSource(text.sourceName);
    setPreferred(true);
  }

  // Level and fit are stated only from an assigned level, compared with the
  // level the reader chose. News has no level, so it shows neither.
  const level = editorialLevel(text);
  const fit = level && readerLevel ? levelFit(level, readerLevel) : null;
  const preview = text.blurbEn ?? text.preview;
  return (
    <article className="rounded-card border border-cream-dark bg-cream-card p-4">
      {/* What a reader needs to decide: level, length, fit, title, a preview,
          the source. Everything else is one tap away under "•••". */}
      <Link href={`/reader/${text.id}`} className="block transition">
        <p className="text-xs font-semibold text-ink-muted">
          {level ?? "News"} · {text.minutes} min
          {fit && <span className="text-brand"> · {fit}</span>}
          {status !== "unread" && <span> · {STATUS_LABELS[status]}</span>}
        </p>
        <h2 lang="fr" className="mt-1 font-french text-[21px] leading-tight text-ink">{text.title}</h2>
        <p lang={text.blurbEn ? "en" : "fr"} className="mt-1 line-clamp-2 text-sm text-ink-muted">{preview}</p>
      </Link>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs text-ink-muted">
          {learnerSourceLabel(text)}
          {text.publishedAt && hasHideableSource({ id: text.id, sourceName: text.sourceName }) && <> · {formatDate(text.publishedAt)}</>}
        </p>
        <button
          type="button"
          onClick={handleSaveLater}
          aria-pressed={savedLater}
          className={`min-h-11 shrink-0 rounded-full px-3 text-xs font-semibold ${savedLater ? "bg-brand text-cream" : "bg-brand-light text-brand"}`}
        >
          {savedLater ? "Saved" : "Save"}
        </button>
      </div>

      <details className="mt-1 text-xs text-ink-muted">
        <summary className="flex min-h-11 w-12 cursor-pointer list-none items-center text-lg font-bold leading-none text-ink-muted" aria-label="More about this reading">
          •••
        </summary>
        <div className="space-y-1 pb-1">
          <p>
            {topicLabel(text)} · {sourceTrustLabel(text)}
            {difficulty ? ` · ${toPercent(difficulty.dictionaryCoverage)}% dictionary coverage` : ""}
          </p>
          {difficulty && toPercent(difficulty.unknownWordRatio) >= 8 && <p>About {toPercent(difficulty.unknownWordRatio)}% of words may be new to you.</p>}
          {reasons.length > 0 && <p>Why: {reasons.join(" · ")}</p>}
          {text.attributionText && <p>{text.attributionText}</p>}
          {text.sourceUrl && /^https?:\/\//i.test(text.sourceUrl) && (
            <a href={text.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block underline underline-offset-2">
              Read the original source
            </a>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2" aria-label="Tune recommendations">
          <button
            type="button"
            onClick={() => {
              recordArticlePreference(text, "more");
              setTuned("more");
            }}
            aria-pressed={tuned === "more"}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tuned === "more" ? "bg-brand text-cream" : "bg-brand-light text-brand"}`}
          >
            More like this
          </button>
          <button
            type="button"
            onClick={() => {
              recordArticlePreference(text, "less");
              setTuned("less");
            }}
            aria-pressed={tuned === "less"}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tuned === "less" ? "bg-ink text-cream" : "bg-cream-fill text-ink-muted"}`}
          >
            Less like this
          </button>
          {hasHideableSource(text) && (
            <>
              <button
                type="button"
                onClick={handlePreferSource}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  preferred ? "bg-brand text-cream" : "bg-yellow text-yellow-ink"
                }`}
              >
                {preferred ? "Preferred source" : "Prefer source"}
              </button>
              <button
                type="button"
                onClick={handleHideSource}
                className="rounded-full bg-rose px-2.5 py-1 text-xs font-semibold text-rose-ink"
              >
                Hide source
              </button>
            </>
          )}
        </div>
        {(tuned || preferred) && (
          <p role="status" className="mt-2 text-xs text-ink-muted">
            {tuned === "more" && `We'll show you more ${topicLabel(text)} readings like this.`}
            {tuned === "less" && `We'll show you fewer ${topicLabel(text)} readings like this.`}
            {tuned && preferred && " "}
            {preferred && hasHideableSource(text) && `${text.sourceName} readings come first.`}
          </p>
        )}
      </details>
    </article>
  );
}
