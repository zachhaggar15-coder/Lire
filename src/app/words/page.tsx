"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SavedWord } from "@/types";
import { getSavedWords, deleteWord, clearWords, markWordAsKnown } from "@/lib/storage";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { formatDate } from "@/lib/format";

type WordsFilter = "learning" | "unsure" | "known" | "missing";

const FILTERS: { value: WordsFilter; label: string }[] = [
  { value: "learning", label: "Learning" },
  { value: "unsure", label: "Unsure" },
  { value: "known", label: "Known" },
  { value: "missing", label: "Missing entries" },
];

function matchesFilter(word: SavedWord, filter: WordsFilter): boolean {
  if (filter === "missing") return !!word.missingFromDictionary;
  return word.status === filter;
}

export default function WordsPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<WordsFilter>("learning");

  useEffect(() => {
    setWords(getSavedWords());
    setReady(true);
  }, []);

  function handleDelete(word: string) {
    setWords(deleteWord(word));
  }

  function handleMarkKnown(word: string) {
    setWords(markWordAsKnown(word));
  }

  function handleClear() {
    if (words.length === 0) return;
    if (confirm("Delete all saved words?")) {
      clearWords();
      setWords([]);
    }
  }

  const counts: Record<WordsFilter, number> = {
    learning: words.filter((w) => w.status === "learning").length,
    unsure: words.filter((w) => w.status === "unsure").length,
    known: words.filter((w) => w.status === "known").length,
    missing: words.filter((w) => w.missingFromDictionary).length,
  };

  const filtered = words.filter((w) => matchesFilter(w, filter));

  return (
    <div className="px-4 pt-6">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Saved words</h1>
          <p className="text-sm text-slate-500">
            {words.length} {words.length === 1 ? "word" : "words"}
          </p>
        </div>
        {words.length > 0 && (
          <button
            onClick={handleClear}
            className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 active:scale-95"
          >
            Clear all
          </button>
        )}
      </header>

      {ready && words.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-slate-500">No saved words yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Start reading
          </Link>
        </div>
      )}

      {words.length > 0 && (
        <>
          <div className="mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  filter === f.value ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {f.label} ({counts[f.value]})
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 text-center text-sm text-slate-400">
              No words in this list yet.
            </p>
          )}

          <ul className="space-y-3">
            {filtered.map((w) => (
              <li
                key={w.word}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="text-lg font-bold text-slate-900">{w.word}</p>
                      {w.lemma && w.lemma !== w.word && (
                        <span className="text-xs text-slate-400">({w.lemma})</span>
                      )}
                      {w.partOfSpeech && (
                        <span className="text-[11px] font-medium text-slate-400">
                          {w.partOfSpeech}
                          {w.gender && ` · ${w.gender}`}
                          {w.cefr && ` · ${w.cefr}`}
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-sm ${
                        w.primaryTranslation === NOT_TRANSLATED_YET
                          ? "italic text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {w.primaryTranslation}
                    </p>
                    {w.translations.length > 1 && (
                      <p className="text-xs text-slate-400">
                        Also: {w.translations.slice(1).join(", ")}
                      </p>
                    )}

                    {w.exampleSentenceFr && (
                      <p className="mt-1 text-xs italic text-slate-500">
                        {w.exampleSentenceFr}
                        <span className="not-italic text-slate-400"> — {w.exampleSentenceEn}</span>
                      </p>
                    )}
                    {w.articleContextSentence && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
                        <span className="font-semibold uppercase tracking-wide">Original article context: </span>
                        “{w.articleContextSentence}”
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                      {w.sourceTextTitle && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                          {w.sourceTextTitle}
                        </span>
                      )}
                      {w.savedAt && <span>Saved {formatDate(w.savedAt)}</span>}
                      {w.reviewCount > 0 && <span>· Reviewed {w.reviewCount}×</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      onClick={() => handleDelete(w.word)}
                      aria-label={`Delete ${w.word}`}
                      className="rounded-full bg-slate-100 p-3 text-slate-500 active:scale-95"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
                      </svg>
                    </button>
                    {w.status !== "known" && (
                      <button
                        onClick={() => handleMarkKnown(w.word)}
                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 active:scale-95"
                      >
                        Mark known
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
