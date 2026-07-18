"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AppSettings, Difficulty, FontSize, TranslationMode } from "@/types";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/settings";
import { getSelectedReadingLevel, updateSelectedReadingLevel } from "@/lib/onboarding";
import { clearKnownWords, getKnownWords } from "@/lib/knownWords";
import { clearOfflineRssTexts, getOfflineRssTextCount } from "@/lib/rss/rssTextCache";
import AccountCard from "@/components/AccountCard";
import SpeechSettingsCard from "@/components/SpeechSettingsCard";
import BetaNotice from "@/components/BetaNotice";
import { AndroidBetaButton } from "@/components/AndroidBetaModal";
import { FeedbackButton } from "@/components/FeedbackModal";
import PwaInstallCard from "@/components/PwaInstallCard";

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const LEVEL_OPTIONS: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const TRANSLATION_MODE_OPTIONS: { value: TranslationMode; label: string; description: string }[] = [
  { value: "natural", label: "Natural", description: "AI when enabled, phrase-aware offline fallback." },
  { value: "phrase-aware", label: "Phrase-aware", description: "Offline, uses local phrases and idioms." },
  { value: "literal", label: "Literal", description: "Offline word-by-word dictionary glosses." },
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
      className="flex w-full items-center justify-between gap-4 rounded-3xl bg-cream-card p-4 text-left shadow-sm active:scale-[0.99]"
      aria-pressed={checked}
    >
      <div className="min-w-0">
        <p className="font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
      </div>
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand" : "bg-cream-dark"
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

function SettingsSectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">{title}</h2>
      <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("A2");
  const [knownCount, setKnownCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    setSettings(getSettings());
    setSelectedLevel(getSelectedReadingLevel());
    setKnownCount(getKnownWords().length);
    setOfflineCount(getOfflineRssTextCount());
  }, []);

  function update(patch: Partial<AppSettings>) {
    setSettings(saveSettings(patch));
  }

  function changeLevel(level: Difficulty) {
    updateSelectedReadingLevel(level);
    setSelectedLevel(level);
  }

  function handleClearKnown() {
    if (knownCount === 0) return;
    if (confirm("Forget all known words? They'll show up again in the reader and can be re-reviewed.")) {
      clearKnownWords();
      setKnownCount(0);
    }
  }

  function handleClearOffline() {
    if (offlineCount === 0) return;
    clearOfflineRssTexts();
    setOfflineCount(0);
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink">Settings</h1>
        <p className="text-sm text-ink-muted">Tune how reading looks and feels.</p>
      </header>

      <div className="space-y-5">
        <section className="space-y-3">
          <SettingsSectionTitle title="Account" subtitle="Install options, beta access, and sync status." />
        <BetaNotice />
        <AccountCard />
        <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">Get Lire on Android</p>
              <p className="mt-0.5 text-sm text-ink-muted">Beta testing is not open yet, but you can join the interest list.</p>
            </div>
            <AndroidBetaButton source="settings" label="Join" />
          </div>
        </div>
        <PwaInstallCard />
        </section>

        <section className="space-y-3">
          <SettingsSectionTitle title="Reading" subtitle="Level, text size, and word highlighting." />
        <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
          <p className="font-semibold text-ink">Reading level</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Controls the daily bank. Changing it never removes XP or reading history.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {LEVEL_OPTIONS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => changeLevel(level)}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                  selectedLevel === level ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
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
        <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
          <p className="font-semibold text-ink">Font size</p>
          <p className="mt-0.5 text-sm text-ink-muted">
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
                    : "bg-cream-dark text-ink-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        </section>

        <section className="space-y-3">
          <SettingsSectionTitle title="Translation and audio" subtitle="Speech playback, sentence help, and English support." />
        <SpeechSettingsCard settings={settings} onChange={update} />

        <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
          <p className="font-semibold text-ink">AI explanations</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            “Ask AI for nuance” and “Ask AI to explain” call OpenAI on
            request only — never automatically while reading. Requires
            <code className="mx-1 rounded bg-cream-dark px-1 py-0.5 text-xs">
              OPENAI_API_KEY
            </code>
            to be configured on the server.
          </p>
        </div>

        <Toggle
          checked={settings.aiTranslationEnabled}
          onChange={(v) => update({ aiTranslationEnabled: v })}
          label="Fluent AI translation"
          description="Preload one cached fluent translation when you open an article. Turn off to use only the offline dictionary translation."
        />

        <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
          <p className="font-semibold text-ink">English translation style</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Natural is the default. Use phrase-aware for free offline idiom handling, or literal when you want a word-by-word gloss.
          </p>
          <div className="mt-3 space-y-2">
            {TRANSLATION_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ translationMode: opt.value })}
                className={`w-full rounded-2xl px-3 py-2.5 text-left transition-colors ${
                  settings.translationMode === opt.value ? "bg-brand text-white" : "bg-cream-dark text-ink"
                }`}
              >
                <span className="block text-sm font-semibold">{opt.label}</span>
                <span className={`block text-xs ${settings.translationMode === opt.value ? "text-white/80" : "text-ink-muted"}`}>
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        </section>

        <details className="space-y-3">
          <summary className="cursor-pointer rounded-3xl bg-cream-card p-4 text-sm font-bold uppercase tracking-wide text-ink-muted shadow-sm">
            Advanced and support
          </summary>
          <div className="mt-3 space-y-3">

        <div className="flex items-center justify-between gap-4 rounded-3xl bg-cream-card p-4 shadow-sm">
          <div className="min-w-0">
            <p className="font-semibold text-ink">Known words</p>
            <p className="mt-0.5 text-sm text-ink-muted">
              {knownCount} {knownCount === 1 ? "word" : "words"} marked known.
              These are skipped in Review and de-emphasised in the reader.
            </p>
          </div>
          {knownCount > 0 && (
            <button
              onClick={handleClearKnown}
              className="shrink-0 rounded-full bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-600 active:scale-95"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-3xl bg-cream-card p-4 shadow-sm">
          <div className="min-w-0">
            <p className="font-semibold text-ink">Offline articles</p>
            <p className="mt-0.5 text-sm text-ink-muted">
              {offlineCount} {offlineCount === 1 ? "article" : "articles"} cached on this device.
            </p>
          </div>
          {offlineCount > 0 && (
            <button
              type="button"
              onClick={handleClearOffline}
              className="shrink-0 rounded-full bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-600 active:scale-95"
            >
              Clear
            </button>
          )}
        </div>

        <Link
          href="/lookup"
          className="flex items-center justify-between gap-4 rounded-3xl bg-cream-card p-4 shadow-sm active:scale-[0.99]"
        >
          <div className="min-w-0">
            <p className="font-semibold text-ink">English → French lookup</p>
            <p className="mt-0.5 text-sm text-ink-muted">
              Look up an English word offline, the other direction.
            </p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link
          href="/phrases"
          className="flex items-center justify-between gap-4 rounded-3xl bg-cream-card p-4 shadow-sm active:scale-[0.99]"
        >
          <div className="min-w-0">
            <p className="font-semibold text-ink">Phrase bank</p>
            <p className="mt-0.5 text-sm text-ink-muted">
              Review saved idioms and multi-word expressions.
            </p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link
          href="/dictionary"
          className="flex items-center justify-between gap-4 rounded-3xl bg-cream-card p-4 shadow-sm active:scale-[0.99]"
        >
          <div className="min-w-0">
            <p className="font-semibold text-ink">Dictionary quality</p>
            <p className="mt-0.5 text-sm text-ink-muted">
              See missing entries, saved corrections, and phrase coverage.
            </p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link
          href="/sources"
          className="flex items-center justify-between gap-4 rounded-3xl bg-cream-card p-4 shadow-sm active:scale-[0.99]"
        >
          <div className="min-w-0">
            <p className="font-semibold text-ink">RSS sources</p>
            <p className="mt-0.5 text-sm text-ink-muted">Check which feeds are producing French articles.</p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link
          href="/changelog"
          className="flex items-center justify-between gap-4 rounded-3xl bg-cream-card p-4 shadow-sm active:scale-[0.99]"
        >
          <div className="min-w-0">
            <p className="font-semibold text-ink">What&apos;s new</p>
            <p className="mt-0.5 text-sm text-ink-muted">See recent visible changes to Lire.</p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link
          href="/privacy"
          className="flex items-center justify-between gap-4 rounded-3xl bg-cream-card p-4 shadow-sm active:scale-[0.99]"
        >
          <div className="min-w-0">
            <p className="font-semibold text-ink">Privacy</p>
            <p className="mt-0.5 text-sm text-ink-muted">Local-first storage, analytics, beta emails, and AI use.</p>
          </div>
          <svg className="h-5 w-5 shrink-0 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <div className="rounded-3xl bg-cream-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">Feedback</p>
              <p className="mt-0.5 text-sm text-ink-muted">Report a dictionary, article, translation, or technical issue.</p>
            </div>
            <FeedbackButton feature="settings" label="Open" />
          </div>
        </div>
          </div>
        </details>
      </div>
    </div>
  );
}
