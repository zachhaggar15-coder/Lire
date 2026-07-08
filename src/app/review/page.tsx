"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ReviewFilter, SavedWord } from "@/types";
import { getSavedWords, recordReview, markWordAsKnown } from "@/lib/storage";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { getCurrentTextTitle } from "@/lib/progress";

const FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "all", label: "All words" },
  { value: "today", label: "Saved today" },
  { value: "least-reviewed", label: "Least reviewed" },
  { value: "current-text", label: "Current text" },
];

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function applyFilter(
  words: SavedWord[],
  filter: ReviewFilter,
  currentTextTitle: string | null
): SavedWord[] {
  switch (filter) {
    case "today":
      return words.filter((w) => isToday(w.savedAt));
    case "least-reviewed":
      return [...words].sort(
        (a, b) =>
          a.reviewCount - b.reviewCount ||
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
    case "current-text":
      return currentTextTitle
        ? words.filter((w) => w.sourceTextTitle === currentTextTitle)
        : [];
    case "all":
    default:
      return words;
  }
}

export default function ReviewPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [currentTextTitle, setCurrentTextTitle] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ knew: 0, missed: 0 });

  useEffect(() => {
    setWords(getSavedWords());
    setCurrentTextTitle(getCurrentTextTitle());
    setReady(true);
  }, []);

  // Known words are never reviewed — only active learning/unsure ones.
  const reviewable = useMemo(
    () => words.filter((w) => w.status === "learning" || w.status === "unsure"),
    [words]
  );

  const deck = useMemo(
    () => applyFilter(reviewable, filter, currentTextTitle),
    [reviewable, filter, currentTextTitle]
  );

  function selectFilter(next: ReviewFilter) {
    setFilter(next);
    setIndex(0);
    setRevealed(false);
    setScore({ knew: 0, missed: 0 });
  }

  const current = deck[index];
  const done = ready && deck.length > 0 && index >= deck.length;

  function answer(knew: boolean) {
    if (current) recordReview(current.word);
    setScore((s) => ({
      knew: s.knew + (knew ? 1 : 0),
      missed: s.missed + (knew ? 0 : 1),
    }));
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  function handleMarkKnown() {
    if (!current) return;
    markWordAsKnown(current.word);
    // Re-reading drops this word from `reviewable`/`deck`, so the item now
    // sitting at `index` is already the next card — no manual advance needed.
    setWords(getSavedWords());
    setRevealed(false);
  }

  function restart() {
    // Re-read so reviewCount / lastReviewedAt reflect this session's updates.
    setWords(getSavedWords());
    setIndex(0);
    setRevealed(false);
    setScore({ knew: 0, missed: 0 });
  }

  const filterBar = (
    <div className="mb-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => selectFilter(f.value)}
          className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
            filter === f.value
              ? "bg-brand text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  // No reviewable words at all yet.
  if (ready && reviewable.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Review</h1>
        <div className="mt-16 text-center">
          <p className="text-slate-500">Nothing to review yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Words you save as Learning or Unsure while reading show up here.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Start reading
          </Link>
        </div>
      </div>
    );
  }

  // Reviewable words exist, but the current filter matches none of them.
  if (ready && reviewable.length > 0 && deck.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">Review</h1>
        {filterBar}
        <div className="mt-12 text-center">
          <p className="text-slate-500">
            {filter === "current-text"
              ? "No saved words from the text you're currently reading."
              : "No words match this filter."}
          </p>
          <button
            onClick={() => selectFilter("all")}
            className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Show all words
          </button>
        </div>
      </div>
    );
  }

  // Finished this deck.
  if (done) {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">Review</h1>
        {filterBar}
        <div className="mt-12 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 text-lg font-semibold text-slate-800">All done!</p>
          <p className="mt-1 text-sm text-slate-500">
            Knew it: {score.knew} · Didn&apos;t know: {score.missed}
          </p>
          <button
            onClick={restart}
            className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Review again
          </button>
        </div>
      </div>
    );
  }

  const hasTranslation = current && current.primaryTranslation !== NOT_TRANSLATED_YET;

  return (
    <div className="flex min-h-[70vh] flex-col px-4 pt-6">
      <header className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">Review</h1>
        <span className="text-sm text-slate-400">
          {ready ? `${index + 1} / ${deck.length}` : ""}
        </span>
      </header>

      {filterBar}

      {current && (
        <div className="flex flex-1 flex-col">
          {/* Flashcard */}
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              French
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{current.word}</p>
            {current.lemma && current.lemma !== current.word && (
              <p className="text-xs text-slate-400">from “{current.lemma}”</p>
            )}

            {revealed ? (
              <div className="mt-6 w-full border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Meaning
                </p>
                <p
                  className={`mt-1 text-xl ${
                    hasTranslation ? "text-slate-700" : "italic text-slate-400"
                  }`}
                >
                  {current.primaryTranslation}
                </p>
                {current.translations.length > 1 && (
                  <p className="mt-1 text-sm text-slate-400">
                    Also: {current.translations.slice(1).join(", ")}
                  </p>
                )}
                {(current.partOfSpeech || current.gender) && (
                  <p className="mt-1 text-xs text-slate-400">
                    {current.partOfSpeech}
                    {current.gender && ` · ${current.gender}`}
                  </p>
                )}

                {current.exampleSentenceFr && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Example
                    </p>
                    <p className="mt-1 text-sm italic text-slate-600">{current.exampleSentenceFr}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{current.exampleSentenceEn}</p>
                  </div>
                )}

                {current.articleContextSentence && (
                  <p className="mt-3 text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wide">Original article context: </span>
                    “{current.articleContextSentence}”
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="mt-6 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 active:scale-95"
              >
                Reveal meaning
              </button>
            )}
          </div>

          {/* Answer buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => answer(false)}
              disabled={!revealed}
              className="rounded-2xl bg-rose-100 py-4 text-sm font-semibold text-rose-700 active:scale-95 disabled:opacity-40"
            >
              Didn&apos;t know it
            </button>
            <button
              onClick={() => answer(true)}
              disabled={!revealed}
              className="rounded-2xl bg-emerald-100 py-4 text-sm font-semibold text-emerald-700 active:scale-95 disabled:opacity-40"
            >
              Knew it
            </button>
          </div>
          <button
            onClick={handleMarkKnown}
            className="mt-2 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 active:scale-95"
          >
            Mark as known
          </button>
        </div>
      )}
    </div>
  );
}
