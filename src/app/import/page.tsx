"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category, Difficulty, ReadingText } from "@/types";
import { deleteCustomText, getCustomTexts, saveCustomText } from "@/lib/customTexts";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "news-style", label: "News" },
  { value: "sport", label: "Sport" },
  { value: "culture", label: "Culture" },
  { value: "science", label: "Science" },
  { value: "everyday life", label: "Life" },
];

const LEVELS: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function ImportPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>("news-style");
  const [difficulty, setDifficulty] = useState<Difficulty>("B1");
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const wordCount = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const canSave = body.trim().split(/\s+/).filter(Boolean).length >= 20;

  useEffect(() => {
    setTexts(getCustomTexts());
  }, []);

  function handleSave() {
    if (!canSave) return;
    const text = saveCustomText({ title, body, category, difficulty });
    setTexts(getCustomTexts());
    router.push(`/reader/${text.id}`);
  }

  function handleDelete(id: string) {
    setTexts(deleteCustomText(id));
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <Link href="/" className="text-sm font-semibold text-brand">
          Back to home
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">Import Text</h1>
        <p className="text-sm text-ink-muted">Paste French you found elsewhere and read it with the same dictionary, audio, review, and progress tools.</p>
      </header>

      <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wide text-ink-muted" htmlFor="custom-title">
          Title
        </label>
        <input
          id="custom-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Optional"
          className="mt-2 w-full rounded-2xl bg-cream px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Topic</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 ${
                    category === item.value ? "bg-brand text-white" : "bg-cream text-ink-muted"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Level</p>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 ${
                    difficulty === level ? "bg-brand text-white" : "bg-cream text-ink-muted"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-ink-muted" htmlFor="custom-body">
          French text
        </label>
        <textarea
          id="custom-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={10}
          placeholder="Paste at least a short paragraph of French here."
          className="mt-2 w-full resize-none rounded-2xl bg-cream px-3 py-3 text-sm leading-relaxed text-ink outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p className="mt-1 text-xs text-ink-muted">
          A complete paragraph works best because word meanings depend on context.
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-ink-muted">{wordCount} words</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:scale-95 disabled:bg-cream-dark disabled:text-ink-muted"
          >
            Save and read
          </button>
        </div>
      </section>

      {texts.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">Imported Articles</h2>
          <div className="space-y-3">
            {texts.map((text) => (
              <article key={text.id} className="rounded-3xl bg-cream-card p-4 shadow-sm">
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
                    className="rounded-full bg-cream-dark p-3 text-ink-muted active:scale-95"
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
