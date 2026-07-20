"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deletePhrase, getSavedPhrases, markPhraseKnown, type SavedPhrase } from "@/lib/phrases";
import { formatDate } from "@/lib/format";

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPhrases(getSavedPhrases());
    setReady(true);
  }, []);

  function handleKnown(phrase: string) {
    setPhrases(markPhraseKnown(phrase));
  }

  function handleDelete(phrase: string) {
    setPhrases(deletePhrase(phrase));
  }

  const learning = phrases.filter((phrase) => phrase.status !== "known");
  const known = phrases.filter((phrase) => phrase.status === "known");

  return (
    <div className="px-4 pt-6">
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold text-ink">Phrase bank</h1>
        <p className="text-sm text-ink-muted">
          {phrases.length} saved {phrases.length === 1 ? "phrase" : "phrases"}
        </p>
      </header>

      {ready && phrases.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-ink-muted">No phrases saved yet.</p>
          <Link href="/" className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 shadow-raised text-sm font-semibold text-white active:scale-95">
            Start reading
          </Link>
        </div>
      )}

      {phrases.length > 0 && (
        <div className="space-y-5">
          <PhraseList title="Learning" phrases={learning} onKnown={handleKnown} onDelete={handleDelete} />
          <PhraseList title="Known" phrases={known} onKnown={handleKnown} onDelete={handleDelete} />
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
          <li key={phrase.phrase} className="rounded-card bg-cream-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-bold text-ink">{phrase.phrase}</p>
                <p className="text-sm text-ink-muted">{phrase.translation}</p>
                {phrase.contextSentence && (
                  <p className="mt-1 line-clamp-2 text-xs italic text-ink-muted">"{phrase.contextSentence}"</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-muted">
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
                    className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 active:scale-95"
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
