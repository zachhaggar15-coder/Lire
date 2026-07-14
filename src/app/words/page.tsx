"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SavedWord } from "@/types";
import { getSavedWords, deleteWord, clearWords, markWordAsKnown } from "@/lib/storage";
import { deletePhrase, getSavedPhrases, markPhraseKnown, type SavedPhrase } from "@/lib/phrases";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { formatDate } from "@/lib/format";

type WordsFilter = "learning" | "unsure" | "known" | "missing";
type VocabTab = "words" | "phrases";

const FILTERS: { value: WordsFilter; label: string }[] = [
  { value: "learning", label: "Learning" },
  { value: "unsure", label: "Unsure" },
  { value: "known", label: "Known" },
  { value: "missing", label: "Untranslated" },
];

/** Cycled by row index purely for visual rhythm — matches the multi-colored word list in the design template. */
const WORD_ACCENTS = ["border-sky-400", "border-orange-400", "border-violet-400", "border-emerald-400", "border-rose-400"];

function matchesFilter(word: SavedWord, filter: WordsFilter): boolean {
  if (filter === "missing") return !!word.missingFromDictionary;
  return word.status === filter;
}

export default function WordsPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<WordsFilter>("learning");
  const [tab, setTab] = useState<VocabTab>("words");

  useEffect(() => {
    setWords(getSavedWords());
    setPhrases(getSavedPhrases());
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

  function handlePhraseKnown(phrase: string) {
    setPhrases(markPhraseKnown(phrase));
  }

  function handlePhraseDelete(phrase: string) {
    setPhrases(deletePhrase(phrase));
  }

  const counts: Record<WordsFilter, number> = {
    learning: words.filter((w) => w.status === "learning").length,
    unsure: words.filter((w) => w.status === "unsure").length,
    known: words.filter((w) => w.status === "known").length,
    missing: words.filter((w) => w.missingFromDictionary).length,
  };

  const filtered = words.filter((w) => matchesFilter(w, filter));
  const learningPhrases = phrases.filter((phrase) => phrase.status !== "known");
  const knownPhrases = phrases.filter((phrase) => phrase.status === "known");

  return (
    <div className="px-4 pt-6">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Vocabulary</h1>
          <p className="text-sm text-ink-muted">
            {words.length} {words.length === 1 ? "word" : "words"} / {phrases.length}{" "}
            {phrases.length === 1 ? "phrase" : "phrases"}
          </p>
        </div>
        {tab === "words" && words.length > 0 && (
          <button
            onClick={handleClear}
            className="rounded-full bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-600 active:scale-95"
          >
            Clear all
          </button>
        )}
      </header>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-cream-dark p-1">
        {[
          { id: "words" as const, label: `Words (${words.length})` },
          { id: "phrases" as const, label: `Phrases (${phrases.length})` },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-3 py-2 text-sm font-bold active:scale-95 ${
              tab === item.id ? "bg-cream-card text-brand shadow-sm" : "text-ink-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {ready && tab === "words" && words.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-ink-muted">No saved words yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Start reading
          </Link>
        </div>
      )}

      {tab === "words" && words.length > 0 && (
        <>
          <div className="mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                  filter === f.value ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                }`}
              >
                {f.label} ({counts[f.value]})
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 text-center text-sm text-ink-muted">
              No words in this list yet.
            </p>
          )}

          <ul className="space-y-3">
            {filtered.map((w, i) => (
              <li
                key={w.word}
                className={`rounded-3xl border-l-4 bg-cream-card p-4 shadow-sm ${WORD_ACCENTS[i % WORD_ACCENTS.length]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="text-lg font-bold text-ink">{w.word}</p>
                      {w.lemma && w.lemma !== w.word && (
                        <span className="text-xs text-ink-muted">({w.lemma})</span>
                      )}
                      {w.partOfSpeech && (
                        <span className="text-[11px] font-medium text-ink-muted">
                          {w.partOfSpeech}
                          {w.gender && ` · ${w.gender}`}
                        </span>
                      )}
                      {w.cefr && (
                        <span className="rounded-full bg-cream-dark px-2 py-0.5 text-[11px] font-semibold text-ink-muted">
                          {w.cefr}
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-sm ${
                        w.primaryTranslation === NOT_TRANSLATED_YET
                          ? "italic text-ink-muted"
                          : "text-ink-muted"
                      }`}
                    >
                      {w.primaryTranslation}
                    </p>
                    {w.translations.length > 1 && (
                      <p className="text-xs text-ink-muted">
                        Also: {w.translations.slice(1).join(", ")}
                      </p>
                    )}

                    {w.exampleSentenceFr && (
                      <p className="mt-1 text-xs italic text-ink-muted">
                        {w.exampleSentenceFr}
                        <span className="not-italic text-ink-muted"> — {w.exampleSentenceEn}</span>
                      </p>
                    )}
                    {w.articleContextSentence && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-ink-muted">
                        <span className="font-semibold uppercase tracking-wide">Original article context: </span>
                        “{w.articleContextSentence}”
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-muted">
                      {w.sourceTextTitle && (
                        <span className="rounded-full bg-cream-dark px-2 py-0.5 font-medium text-ink-muted">
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
                      className="rounded-full bg-cream-dark p-3 text-ink-muted active:scale-95"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
                      </svg>
                    </button>
                    {w.status !== "known" && (
                      <button
                        onClick={() => handleMarkKnown(w.word)}
                        className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 active:scale-95"
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

      {ready && tab === "phrases" && phrases.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-ink-muted">No saved phrases yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
          >
            Start reading
          </Link>
        </div>
      )}

      {tab === "phrases" && phrases.length > 0 && (
        <div className="space-y-5">
          <PhraseList title="Learning" phrases={learningPhrases} onKnown={handlePhraseKnown} onDelete={handlePhraseDelete} />
          <PhraseList title="Known" phrases={knownPhrases} onKnown={handlePhraseKnown} onDelete={handlePhraseDelete} />
        </div>
      )}
    </div>
  );
}

function PhraseList({
  title,
  phrases,
  onKnown,
  onDelete,
}: {
  title: string;
  phrases: SavedPhrase[];
  onKnown: (phrase: string) => void;
  onDelete: (phrase: string) => void;
}) {
  if (phrases.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">{title}</h2>
      <ul className="space-y-3">
        {phrases.map((phrase) => (
          <li key={phrase.phrase} className="rounded-3xl bg-cream-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-bold text-ink">{phrase.phrase}</p>
                <p className="text-sm text-ink-muted">{phrase.translation}</p>
                {phrase.contextSentence && (
                  <p className="mt-1 line-clamp-2 text-xs italic text-ink-muted">"{phrase.contextSentence}"</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-ink-muted">
                  {phrase.sourceTextTitle && <span className="rounded-full bg-cream-dark px-2 py-0.5">{phrase.sourceTextTitle}</span>}
                  <span>Saved {formatDate(phrase.savedAt)}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(phrase.phrase)}
                  aria-label={`Delete ${phrase.phrase}`}
                  className="rounded-full bg-cream-dark p-3 text-ink-muted active:scale-95"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
                  </svg>
                </button>
                {phrase.status !== "known" && (
                  <button
                    type="button"
                    onClick={() => onKnown(phrase.phrase)}
                    className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 active:scale-95"
                  >
                    Mark known
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
