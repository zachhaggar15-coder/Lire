"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SavedWord } from "@/types";
import { getSavedWords, recordReviewResult, markWordAsKnown } from "@/lib/storage";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { buildReviewQueue, getReviewStats } from "@/lib/spacedRepetition";

export default function ReviewPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ knew: 0, missed: 0 });

  useEffect(() => {
    setWords(getSavedWords());
    setReady(true);
  }, []);

  // Snapshotting the queue at mount (rather than recomputing on every
  // word-state change) means answering a card doesn't reshuffle the deck
  // out from under the reader mid-session.
  const queue = useMemo(() => buildReviewQueue(words), [words]);
  const stats = useMemo(() => getReviewStats(words), [words]);

  const current = queue[index];
  const done = ready && queue.length > 0 && index >= queue.length;
  const hasTranslation = current && current.primaryTranslation !== NOT_TRANSLATED_YET;

  function answer(result: "correct" | "incorrect") {
    if (current) setWords(recordReviewResult(current.word, result));
    setScore((s) => ({
      knew: s.knew + (result === "correct" ? 1 : 0),
      missed: s.missed + (result === "correct" ? 0 : 1),
    }));
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  function handleMarkKnown() {
    if (!current) return;
    setWords(markWordAsKnown(current.word));
    // markWordAsKnown drops this word from the (memoised) queue, so
    // whatever now sits at `index` is already the next card.
    setRevealed(false);
  }

  function restart() {
    setWords(getSavedWords());
    setIndex(0);
    setRevealed(false);
    setScore({ knew: 0, missed: 0 });
  }

  const statsBar = (
    <div className="mb-5 grid grid-cols-4 gap-2">
      {[
        { label: "Due today", value: stats.dueToday },
        { label: "New", value: stats.newWords },
        { label: "Not due yet", value: stats.notDueYet },
        { label: "Total", value: stats.totalLearning },
      ].map((s) => (
        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-2.5 text-center shadow-sm">
          <p className="text-lg font-extrabold text-slate-900">{s.value}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
        </div>
      ))}
    </div>
  );

  // No learning/unsure words saved at all.
  if (ready && stats.totalLearning === 0) {
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

  // Words exist, but nothing is due right now.
  if (ready && stats.totalLearning > 0 && queue.length === 0) {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">Review</h1>
        {statsBar}
        <div className="mt-8 text-center">
          <p className="text-4xl">✅</p>
          <p className="mt-2 text-slate-500">All caught up — nothing due right now.</p>
          <p className="mt-1 text-xs text-slate-400">
            {stats.notDueYet} {stats.notDueYet === 1 ? "word is" : "words are"} scheduled for later.
          </p>
        </div>
      </div>
    );
  }

  // Finished this session's queue.
  if (done) {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">Review</h1>
        {statsBar}
        <div className="mt-8 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 text-lg font-semibold text-slate-800">All done!</p>
          <p className="mt-1 text-sm text-slate-500">
            Knew it: {score.knew} · Didn&apos;t know: {score.missed}
          </p>
          <button
            onClick={restart}
            className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Check for more
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col px-4 pt-6">
      <header className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">Review</h1>
        <span className="text-sm text-slate-400">
          {ready ? `${index + 1} / ${queue.length}` : ""}
        </span>
      </header>

      {statsBar}

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
              onClick={() => answer("incorrect")}
              disabled={!revealed}
              className="rounded-2xl bg-rose-100 py-4 text-sm font-semibold text-rose-700 active:scale-95 disabled:opacity-40"
            >
              Didn&apos;t know it
            </button>
            <button
              onClick={() => answer("correct")}
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
