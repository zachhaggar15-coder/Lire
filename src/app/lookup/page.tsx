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
        <h1 className="text-2xl font-extrabold text-slate-900">English → French</h1>
        <p className="text-sm text-slate-500">
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
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm"
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
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">{result.input}</h2>
            {(result.partOfSpeech || result.cefr) && (
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                {result.partOfSpeech}
                {result.partOfSpeech && result.cefr && " · "}
                {result.cefr}
              </span>
            )}

            <p className="mt-3 text-lg text-slate-700">{result.translations[0]}</p>
            {result.translations.length > 1 && (
              <p className="text-sm text-slate-500">
                Also: {result.translations.slice(1).join(", ")}
              </p>
            )}

            {result.examples.length > 0 && (
              <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Example
                </p>
                <p className="mt-1 text-sm italic text-slate-600">{result.examples[0].fr}</p>
                <p className="mt-0.5 text-sm text-slate-500">{result.examples[0].en}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm italic text-slate-400">
            No local dictionary entry yet for “{result.input}”.
          </p>
        ))}
    </div>
  );
}
