"use client";

import { useState } from "react";
import Link from "next/link";
import { lookupEnglishWord } from "@/lib/dictionary/lookup";
import type { DictionaryLookupResult } from "@/lib/dictionary/types";

export default function LookupPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DictionaryLookupResult | null>(null);

  function runSearch() {
    const trimmed = query.trim();
    setResult(trimmed ? lookupEnglishWord(trimmed) : null);
  }

  return (
    <div className="px-4 pt-6">
      <Link href="/settings" className="text-sm font-semibold text-brand">
        ← Settings
      </Link>

      <header className="mb-5 mt-2">
        <h1 className="text-2xl font-extrabold text-ink">English → French</h1>
        <p className="text-sm text-ink-muted">
          Look up an English word to find its French translation — offline,
          same as reader lookups.
        </p>
      </header>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
          placeholder="e.g. house, big, to think"
          className="min-w-0 flex-1 rounded-2xl bg-cream-card px-4 py-3 text-base text-ink shadow-sm"
        />
        <button
          onClick={runSearch}
          className="shrink-0 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white active:scale-95"
        >
          Search
        </button>
      </div>

      {result &&
        (result.source === "local" ? (
          <div className="mt-5 rounded-3xl bg-cream-card p-4 shadow-sm">
            <h2 className="text-xl font-bold text-ink">{result.input}</h2>
            {(result.partOfSpeech || result.cefr) && (
              <span className="mt-1 inline-block rounded-full bg-cream-dark px-2 py-0.5 text-xs font-semibold text-ink-muted">
                {result.partOfSpeech}
                {result.partOfSpeech && result.cefr && " · "}
                {result.cefr}
              </span>
            )}

            <p className="mt-3 text-lg text-ink">{result.translations[0]}</p>
            {result.translations.length > 1 && (
              <p className="text-sm text-ink-muted">
                Also: {result.translations.slice(1).join(", ")}
              </p>
            )}

            {result.examples.length > 0 && (
              <div className="mt-3 rounded-2xl bg-cream p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Example
                </p>
                <p className="mt-1 text-sm italic text-ink">{result.examples[0].fr}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{result.examples[0].en}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm italic text-ink-muted">
            No local dictionary entry yet for “{result.input}”.
          </p>
        ))}
    </div>
  );
}
