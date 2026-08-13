"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SavedWord } from "@/types";
import { clearWords, deleteWord, getSavedWords } from "@/lib/storage";
import { deletePhrase, getSavedPhrases, markPhraseKnown, type SavedPhrase } from "@/lib/phrases";
import { NOT_TRANSLATED_YET } from "@/lib/dictionary/constants";
import { formatDate, toPercent } from "@/lib/format";
import AppBar from "@/components/AppBar";

type WordsFilter = "learning" | "unsure" | "known" | "missing";
type VocabTab = "words" | "phrases";

const FILTERS: { value: WordsFilter; label: string }[] = [
  { value: "learning", label: "Learning" },
  { value: "unsure", label: "Unsure" },
  { value: "known", label: "Known" },
  { value: "missing", label: "Untranslated" },
];

function matchesFilter(word: SavedWord, filter: WordsFilter): boolean {
  if (filter === "missing") return !!word.missingFromDictionary;
  return word.status === filter;
}

function matchesQuery(word: SavedWord, q: string): boolean {
  return (
    word.word.toLowerCase().includes(q) ||
    (word.lemma ?? "").toLowerCase().includes(q) ||
    word.primaryTranslation.toLowerCase().includes(q) ||
    word.translations.some((t) => t.toLowerCase().includes(q)) ||
    (word.sourceTextTitle ?? "").toLowerCase().includes(q)
  );
}

function matchesPhraseQuery(phrase: SavedPhrase, q: string): boolean {
  return (
    phrase.phrase.toLowerCase().includes(q) ||
    phrase.translation.toLowerCase().includes(q) ||
    (phrase.sourceTextTitle ?? "").toLowerCase().includes(q)
  );
}

export default function WordsPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<WordsFilter>("learning");
  const [tab, setTab] = useState<VocabTab>("words");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setWords(getSavedWords());
    setPhrases(getSavedPhrases());
    if (new URLSearchParams(window.location.search).get("tab") === "phrases") {
      setTab("phrases");
    }
    setReady(true);
  }, []);

  function handleDelete(word: string) {
    setWords(deleteWord(word));
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
    learning: words.filter((word) => word.status === "learning").length,
    unsure: words.filter((word) => word.status === "unsure").length,
    known: words.filter((word) => word.status === "known").length,
    missing: words.filter((word) => word.missingFromDictionary).length,
  };

  const q = query.trim().toLowerCase();
  const filtered = words.filter((word) => matchesFilter(word, filter) && (!q || matchesQuery(word, q)));
  const queriedPhrases = q ? phrases.filter((phrase) => matchesPhraseQuery(phrase, q)) : phrases;
  const learningPhrases = queriedPhrases.filter((phrase) => phrase.status !== "known");
  const knownPhrases = queriedPhrases.filter((phrase) => phrase.status === "known");

  return (
    <div className="ligne-screen">
      <AppBar
        title="Vocabulary"
        kicker="Saved from your texts"
        backHref="/settings"
        backLabel="Back to Library"
        action={tab === "words" && words.length > 0 ? (
          <button type="button" onClick={handleClear} className="min-h-12 rounded-full px-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-rose-ink">
            Clear all
          </button>
        ) : null}
      />
      <p className="-mt-3 mb-5 text-sm text-ink-muted">
        {words.length} {words.length === 1 ? "word" : "words"} / {phrases.length} {phrases.length === 1 ? "phrase" : "phrases"}
      </p>

      {(words.length > 0 || phrases.length > 0) && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your words and phrases…"
          aria-label="Search saved words and phrases"
          className="mb-4 w-full rounded-2xl border border-cream-dark bg-cream-card px-3.5 py-2.5 text-sm text-ink"
        />
      )}

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-cream-fill p-1">
        {[
          { id: "words" as const, label: `Words (${words.length})` },
          { id: "phrases" as const, label: `Phrases (${phrases.length})` },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`rounded-full px-3 py-2 text-sm font-semibold ${tab === item.id ? "bg-brand text-cream" : "text-ink-muted"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {ready && tab === "words" && words.length === 0 && <EmptyState copy="No saved words yet." />}

      {tab === "words" && words.length > 0 && (
        <>
          <div className="-mx-[22px] mb-4 flex gap-2 overflow-x-auto px-[22px] pb-1">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ${
                  filter === item.value ? "bg-brand text-cream" : "bg-cream-fill text-ink-muted"
                }`}
              >
                {item.label} ({counts[item.value]})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-muted">
              {q ? `No words match "${query}".` : "No words in this list yet."}
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((word) => (
                <WordCard key={word.word} word={word} onDelete={handleDelete} />
              ))}
            </ul>
          )}
        </>
      )}

      {ready && tab === "phrases" && phrases.length === 0 && <EmptyState copy="No saved phrases yet." />}

      {tab === "phrases" && phrases.length > 0 && (
        <div className="space-y-5">
          <PhraseMasterySummary phrases={phrases} />
          {q && queriedPhrases.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-muted">No phrases match &quot;{query}&quot;.</p>
          ) : (
            <>
              <PhraseList title="Learning" phrases={learningPhrases} onKnown={handlePhraseKnown} onDelete={handlePhraseDelete} />
              <PhraseList title="Known" phrases={knownPhrases} onKnown={handlePhraseKnown} onDelete={handlePhraseDelete} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ copy }: { copy: string }) {
  return (
    <div className="mt-16 text-center">
      <p className="text-ink-muted">{copy}</p>
      <Link href="/" className="ligne-pill mt-3 inline-block bg-brand text-cream">
        Start reading
      </Link>
    </div>
  );
}

function WordCard({ word, onDelete }: { word: SavedWord; onDelete: (word: string) => void }) {
  return (
    <li className="rounded-card border border-cream-dark bg-cream-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="font-french text-[24px] leading-tight text-ink">{word.word}</p>
            {word.lemma && word.lemma !== word.word && (
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">({word.lemma})</span>
            )}
            {word.partOfSpeech && (
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                {word.partOfSpeech}
                {word.gender && ` - ${word.gender}`}
              </span>
            )}
            {word.cefr && (
              <span className="rounded-full bg-brand-light px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-brand">
                {word.cefr}
              </span>
            )}
          </div>

          <p className={`mt-1 text-sm ${word.primaryTranslation === NOT_TRANSLATED_YET ? "italic text-ink-muted" : "font-semibold text-ink"}`}>
            {word.primaryTranslation}
          </p>
          {word.translations.length > 1 && <p className="text-xs text-ink-muted">Also: {word.translations.slice(1).join(", ")}</p>}

          {word.exampleSentenceFr && (
            <p className="mt-2 font-french text-[15px] italic leading-snug text-ink-muted">
              {word.exampleSentenceFr}
              <span className="not-italic text-ink-muted"> - {word.exampleSentenceEn}</span>
            </p>
          )}
          {word.articleContextSentence && (
            <p className="mt-2 line-clamp-2 text-xs text-ink-muted">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em]">Original context: </span>
              "{word.articleContextSentence}"
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-cream-fill pt-3 text-xs text-ink-muted">
            {word.sourceTextTitle && (
              <span className="max-w-[190px] truncate rounded-full border border-cream-dark bg-cream-sunken px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                {word.sourceTextTitle}
              </span>
            )}
            {word.savedAt && <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">Saved {formatDate(word.savedAt)}</span>}
            {word.reviewCount > 0 && <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">Reviewed {word.reviewCount}x</span>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(word.word)}
          aria-label={`Delete ${word.word}`}
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-cream-fill text-rose-ink"
        >
          <span aria-hidden="true">x</span>
        </button>
      </div>
    </li>
  );
}

/**
 * Kept to roughly the same height as the Words tab's filter-pill row right
 * below it (a single-line rounded strip, not a multi-part card) — the two
 * tabs used to start at very different heights, which made switching
 * between them feel like the whole page reshuffled rather than a clean tab
 * change. All the same numbers are still here, just condensed to one line.
 */
function PhraseMasterySummary({ phrases }: { phrases: SavedPhrase[] }) {
  const known = phrases.filter((phrase) => phrase.status === "known").length;
  const contexts = new Set(phrases.map((phrase) => phrase.sourceTextTitle).filter(Boolean)).size;
  const progress = phrases.length === 0 ? 0 : toPercent(known / phrases.length);
  return (
    <div className="flex items-center gap-2 rounded-full border border-cream-dark bg-cream-card py-1.5 pl-4 pr-1.5">
      <p className="min-w-0 flex-1 truncate text-sm text-ink-muted">
        <span className="font-bold text-ink">{progress}% mastery</span> · {phrases.length} saved · {known} known
        {contexts > 0 ? ` · ${contexts} ${contexts === 1 ? "context" : "contexts"}` : ""}
      </p>
      <Link href="/review" className="ligne-pill shrink-0 bg-brand-light px-3 py-1.5 text-xs text-brand">
        Review
      </Link>
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
      <h2 className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">{title}</h2>
      <ul className="space-y-3">
        {phrases.map((phrase) => (
          <li key={phrase.phrase} className="rounded-card border border-cream-dark bg-cream-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-french text-[22px] leading-tight text-ink">{phrase.phrase}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{phrase.translation}</p>
                {phrase.contextSentence && (
                  <p className="mt-2 line-clamp-2 font-french text-[15px] italic leading-snug text-ink-muted">"{phrase.contextSentence}"</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 border-t border-cream-fill pt-3 text-xs text-ink-muted">
                  {phrase.sourceTextTitle && (
                    <span className="max-w-[190px] truncate rounded-full border border-cream-dark bg-cream-sunken px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em]">
                      {phrase.sourceTextTitle}
                    </span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">Saved {formatDate(phrase.savedAt)}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(phrase.phrase)}
                  aria-label={`Delete ${phrase.phrase}`}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-cream-fill text-rose-ink"
                >
                  <span aria-hidden="true">x</span>
                </button>
                {phrase.status !== "known" && (
                  <button type="button" onClick={() => onKnown(phrase.phrase)} className="ligne-pill bg-brand-light text-brand">
                    Known
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
