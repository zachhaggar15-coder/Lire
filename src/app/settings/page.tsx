"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AppSettings, FontSize } from "@/types";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/settings";
import { clearKnownWords, getKnownWords } from "@/lib/knownWords";

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm active:scale-[0.99]"
      aria-pressed={checked}
    >
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [knownCount, setKnownCount] = useState(0);

  useEffect(() => {
    setSettings(getSettings());
    setKnownCount(getKnownWords().length);
  }, []);

  function update(patch: Partial<AppSettings>) {
    setSettings(saveSettings(patch));
  }

  function handleClearKnown() {
    if (knownCount === 0) return;
    if (confirm("Forget all known words? They'll show up again in the reader and can be re-reviewed.")) {
      clearKnownWords();
      setKnownCount(0);
    }
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Tune how reading looks and feels.</p>
      </header>

      <div className="space-y-3">
        <Toggle
          checked={settings.showSavedHighlights}
          onChange={(v) => update({ showSavedHighlights: v })}
          label="Saved word highlights"
          description="Highlight words you've saved as Learning or Unsure while reading."
        />
        <Toggle
          checked={settings.showKnownWordStyling}
          onChange={(v) => update({ showKnownWordStyling: v })}
          label="Show known word styling"
          description="De-emphasise words you've marked as known, so your eye goes to what's actually new."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-semibold text-slate-900">AI explanations</p>
          <p className="mt-0.5 text-sm text-slate-500">
            “Ask AI for nuance” and “Ask AI to explain” call OpenAI on
            request only — never automatically while reading. Requires
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs">
              OPENAI_API_KEY
            </code>
            to be configured on the server.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-semibold text-slate-900">Font size</p>
          <p className="mt-0.5 text-sm text-slate-500">
            Adjust the reading text size.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {FONT_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ fontSize: opt.value })}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                  settings.fontSize === opt.value
                    ? "bg-brand text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">Known words</p>
            <p className="mt-0.5 text-sm text-slate-500">
              {knownCount} {knownCount === 1 ? "word" : "words"} marked known.
              These are skipped in Review and de-emphasised in the reader.
            </p>
          </div>
          {knownCount > 0 && (
            <button
              onClick={handleClearKnown}
              className="shrink-0 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 active:scale-95"
            >
              Clear
            </button>
          )}
        </div>

        <Link
          href="/lookup"
          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:scale-[0.99]"
        >
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">English → French lookup</p>
            <p className="mt-0.5 text-sm text-slate-500">
              Look up an English word offline, the other direction.
            </p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
