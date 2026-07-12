"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDictionaryFeedback, deleteDictionaryFeedback, type DictionaryFeedback } from "@/lib/dictionary/feedback";
import { getSavedPhrases } from "@/lib/phrases";
import { getSavedWords } from "@/lib/storage";
import type { SavedWord } from "@/types";
import { formatDate } from "@/lib/format";

export default function DictionaryQualityPage() {
  const [feedback, setFeedback] = useState<DictionaryFeedback[]>([]);
  const [missingWords, setMissingWords] = useState<SavedWord[]>([]);
  const [phraseCount, setPhraseCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFeedback(getDictionaryFeedback());
    setMissingWords(getSavedWords().filter((word) => word.missingFromDictionary));
    setPhraseCount(getSavedPhrases().length);
    setReady(true);
  }, []);

  const stats = useMemo(
    () => [
      { label: "Corrections", value: feedback.filter((entry) => entry.type === "correction").length },
      { label: "Missing", value: missingWords.length },
      { label: "Phrases", value: phraseCount },
    ],
    [feedback, missingWords.length, phraseCount]
  );

  function handleDeleteFeedback(id: string) {
    setFeedback(deleteDictionaryFeedback(id));
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink">Dictionary quality</h1>
        <p className="text-sm text-ink-muted">Corrections and gaps from your reading.</p>
      </header>

      <section className="mb-5 grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-cream-card p-3 text-center shadow-sm">
            <p className="text-lg font-extrabold text-ink">{stat.value}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      {ready && feedback.length === 0 && missingWords.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-ink-muted">No dictionary issues recorded yet.</p>
          <Link href="/" className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95">
            Start reading
          </Link>
        </div>
      )}

      {feedback.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Saved corrections</h2>
          <ul className="space-y-3">
            {feedback.map((entry) => (
              <li key={entry.id} className="rounded-3xl bg-cream-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-lg font-bold text-ink">{entry.input}</p>
                      <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-brand">{entry.type}</span>
                    </div>
                    <p className="text-sm text-ink-muted">{entry.suggestedTranslation}</p>
                    {entry.previousTranslation && (
                      <p className="text-xs text-ink-muted">Previous: {entry.previousTranslation}</p>
                    )}
                    {entry.contextSentence && (
                      <p className="mt-1 line-clamp-2 text-xs italic text-ink-muted">"{entry.contextSentence}"</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-ink-muted">
                      {entry.articleTitle && <span className="rounded-full bg-cream-dark px-2 py-0.5">{entry.articleTitle}</span>}
                      <span>{formatDate(entry.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteFeedback(entry.id)}
                    aria-label={`Delete correction for ${entry.input}`}
                    className="rounded-full bg-cream-dark p-3 text-ink-muted active:scale-95"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {missingWords.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Still missing</h2>
          <ul className="space-y-3">
            {missingWords.slice(0, 25).map((word) => (
              <li key={word.word} className="rounded-3xl bg-cream-card p-4 shadow-sm">
                <p className="text-lg font-bold text-ink">{word.word}</p>
                <p className="text-sm text-ink-muted">{word.articleContextSentence || "Saved without article context."}</p>
                {word.sourceTextTitle && (
                  <span className="mt-2 inline-flex rounded-full bg-cream-dark px-2 py-0.5 text-[11px] text-ink-muted">{word.sourceTextTitle}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
