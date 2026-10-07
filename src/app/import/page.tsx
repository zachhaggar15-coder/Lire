"use client";


import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category, Difficulty, ReadingText } from "@/types";
import { MAX_CUSTOM_TEXTS, MAX_IMPORT_CHARS, MAX_IMPORT_TITLE_CHARS, deleteCustomText, getCustomTexts, saveCustomText } from "@/lib/customTexts";
import { persistenceFailureMessage } from "@/lib/localData/messages";
import AppBar from "@/components/AppBar";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "news-style", label: "News" },
  { value: "sport", label: "Sport" },
  { value: "culture", label: "Culture" },
  { value: "science", label: "Science" },
  { value: "everyday life", label: "Life" },
];

const LEVELS: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function ImportPageContent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>("news-style");
  const [difficulty, setDifficulty] = useState<Difficulty>("B1");
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const wordCount = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const canSave = body.trim().split(/\s+/).filter(Boolean).length >= 20;

  useEffect(() => {
    setTexts(getCustomTexts());
  }, []);

  function handleSave() {
    if (!canSave) return;
    const saved = saveCustomText({ title, body, category, difficulty });
    if (!saved.ok) {
      setSaveError(
        saved.reason === "too-long"
          ? `That text is too long to import (the limit is ${MAX_IMPORT_CHARS.toLocaleString("en-GB")} characters). Try importing it in parts.`
          : saved.reason === "limit"
            ? `You have ${MAX_CUSTOM_TEXTS} imported texts, the most Sorlio keeps. Delete one you've finished with to import another.`
            : saved.reason === "empty"
            ? "Paste some French text first."
            : persistenceFailureMessage(saved.reason),
      );
      return;
    }
    setSaveError(null);
    setTexts(getCustomTexts());
    router.push(`/reader/${saved.text.id}`);
  }

  function handleDelete(id: string) {
    const result = deleteCustomText(id);
    setTexts(result.texts);
    setSaveError(result.ok ? null : persistenceFailureMessage(result.reason));
  }

  return (
    <div className="ligne-screen">
      <AppBar title="Import text" kicker="Library" backHref="/settings" backLabel="Back to Settings" />
      <p className="-mt-3 mb-2 text-sm text-ink-muted">Paste French you found elsewhere and read it with the same dictionary, audio, review and progress tools.</p>
      <p className="mb-5 text-xs leading-relaxed text-ink-muted">
        Imported texts stay private on this device. They&rsquo;re only copied to your account if you turn on{" "}
        <Link href="/settings#sync-imported-texts" className="font-semibold text-brand underline underline-offset-2">
          Sync imported texts
        </Link>
        , and they&rsquo;re never sent for AI help unless you ask for it while reading.
      </p>

      <section className="rounded-card bg-cream-card p-4 shadow-card">
        <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted" htmlFor="custom-title">
          Title
        </label>
        <input
          id="custom-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={MAX_IMPORT_TITLE_CHARS}
          placeholder="Optional"
          className="mt-2 w-full rounded-2xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Topic</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  aria-pressed={category === item.value}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    category === item.value ? "bg-brand text-cream" : "bg-cream text-ink-muted"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Level</p>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  aria-pressed={difficulty === level}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    difficulty === level ? "bg-brand text-cream" : "bg-cream text-ink-muted"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-muted" htmlFor="custom-body">
          French text
        </label>
        <textarea
          id="custom-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={MAX_IMPORT_CHARS}
          rows={10}
          placeholder="Paste at least a short paragraph of French here."
          className="mt-2 w-full resize-none rounded-2xl bg-cream px-3 py-3 text-sm leading-relaxed text-ink outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p className="mt-1 text-xs text-ink-muted">
          At least 20 words. A complete paragraph works best because word meanings depend on context.
        </p>
        {saveError && (
          <p role="alert" className="mt-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
            {saveError}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-ink-muted">{wordCount} words</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-full bg-brand px-5 py-2.5 shadow-raised text-sm font-semibold text-cream disabled:bg-cream-dark disabled:text-ink-muted"
          >
            Save and read
          </button>
        </div>
      </section>

      {texts.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Imported Articles</h2>
          <div className="space-y-3">
            {texts.map((text) => (
              <article key={text.id} className="rounded-card bg-cream-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/reader/${text.id}`} className="min-w-0 flex-1 active:opacity-80">
                    <p className="font-bold leading-snug text-ink">{text.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{text.preview}</p>
                    <p className="mt-2 text-xs font-semibold text-brand">{text.difficulty} - {text.minutes} min</p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(text.id)}
                    aria-label={`Delete ${text.title}`}
                    className="rounded-full bg-cream-dark p-3 text-ink-muted"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ImportPage() {
  return <ImportPageContent />;
}
