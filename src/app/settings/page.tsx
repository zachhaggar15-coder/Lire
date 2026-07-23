"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AppSettings, Difficulty, FontSize, TranslationMode } from "@/types";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/settings";
import { getSelectedReadingLevel, updateSelectedReadingLevel } from "@/lib/onboarding";
import { clearKnownWords, getKnownWords } from "@/lib/knownWords";
import { clearOfflineRssTexts, getOfflineRssTextCount } from "@/lib/rss/rssTextCache";
import {
  getCurrentStreak,
  getLongestStreak,
  getStreakGraceStatus,
  getStreakWeek,
  isActiveToday,
  applyStreakGraceDay,
  type StreakDay,
  type StreakGraceStatus,
} from "@/lib/habit";
import AccountCard from "@/components/AccountCard";
import SpeechSettingsCard from "@/components/SpeechSettingsCard";
import BetaNotice from "@/components/BetaNotice";
import { AndroidBetaButton } from "@/components/AndroidBetaModal";
import { FeedbackButton } from "@/components/FeedbackModal";
import PwaInstallCard from "@/components/PwaInstallCard";
import { StreakCard } from "@/components/GamificationCards";

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const LEVEL_OPTIONS: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const TRANSLATION_MODE_OPTIONS: { value: TranslationMode; label: string; description: string }[] = [
  { value: "natural", label: "Natural", description: "Best for reading normally." },
  { value: "phrase-aware", label: "Phrase-aware", description: "Offline help for phrases and idioms." },
  { value: "literal", label: "Literal", description: "Word-by-word checking." },
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
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-card bg-cream-card p-4 text-left shadow-card active:scale-[0.99]"
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
        aria-hidden="true"
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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h2>
      <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
    </div>
  );
}

function SettingsLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-card bg-cream-card p-4 shadow-card active:scale-[0.99]"
    >
      <div className="min-w-0">
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
      </div>
      <svg
        className="h-5 w-5 shrink-0 text-ink-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

function StreakRecoveryCard({ grace, onUse }: { grace: StreakGraceStatus; onUse: () => void }) {
  if (!grace.available) return null;

  return (
    <div className="rounded-card bg-brand-light p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-brand">Streak save available</p>
          <p className="mt-0.5 text-sm text-ink-muted">Use this week's grace day to cover yesterday.</p>
        </div>
        <button
          type="button"
          onClick={onUse}
          className="shrink-0 rounded-full bg-brand px-3 py-2 text-sm font-semibold text-white shadow-raised active:scale-95"
        >
          Save streak
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("A1");
  const [knownCount, setKnownCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [streak, setStreak] = useState<{ current: number; longest: number; activeToday: boolean; week: StreakDay[] }>({
    current: 0,
    longest: 0,
    activeToday: false,
    week: [],
  });
  const [grace, setGrace] = useState<StreakGraceStatus>({
    available: false,
    usedThisWeek: false,
    eligibleDateKey: "",
    recoveredDateKey: null,
  });

  const refreshStreakView = useCallback(() => {
    setStreak({
      current: getCurrentStreak(),
      longest: getLongestStreak(),
      activeToday: isActiveToday(),
      week: getStreakWeek(),
    });
    setGrace(getStreakGraceStatus());
  }, []);

  useEffect(() => {
    setSettings(getSettings());
    setSelectedLevel(getSelectedReadingLevel());
    setKnownCount(getKnownWords().length);
    setOfflineCount(getOfflineRssTextCount());
    refreshStreakView();
  }, [refreshStreakView]);

  function update(patch: Partial<AppSettings>) {
    setSettings(saveSettings(patch));
  }

  function changeLevel(level: Difficulty) {
    updateSelectedReadingLevel(level);
    setSelectedLevel(level);
  }

  function handleClearKnown() {
    if (knownCount === 0) return;
    if (confirm("Forget all known words? They will show up again in the reader and can be re-reviewed.")) {
      clearKnownWords();
      setKnownCount(0);
    }
  }

  function handleClearOffline() {
    if (offlineCount === 0) return;
    clearOfflineRssTexts();
    setOfflineCount(0);
  }

  function handleUseGraceDay() {
    if (applyStreakGraceDay()) refreshStreakView();
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink">Profile</h1>
        <p className="text-sm text-ink-muted">Learning, library, app setup, and advanced tools.</p>
      </header>

      <div className="space-y-6">
        <section className="space-y-3">
          <SettingsSectionTitle title="Learning" subtitle="Streak, level, and reader preferences." />
          <StreakCard streak={streak.current} longest={streak.longest} week={streak.week} activeToday={streak.activeToday} />
          <StreakRecoveryCard grace={grace} onUse={handleUseGraceDay} />

          <div className="rounded-card bg-cream-card p-4 shadow-card">
            <p className="font-semibold text-ink">Reading level</p>
            <p className="mt-0.5 text-sm text-ink-muted">Choose the starter bank that feels closest right now.</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {LEVEL_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => changeLevel(level)}
                  aria-pressed={selectedLevel === level}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    selectedLevel === level ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-card bg-cream-card p-4 shadow-card">
            <p className="font-semibold text-ink">Font size</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {FONT_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ fontSize: opt.value })}
                  aria-pressed={settings.fontSize === opt.value}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    settings.fontSize === opt.value ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-card bg-cream-card p-4 shadow-card">
            <p className="font-semibold text-ink">English help</p>
            <p className="mt-0.5 text-sm text-ink-muted">Natural is best for beginners. Literal is for word-by-word checking.</p>
            <div className="mt-3 space-y-2">
              {TRANSLATION_MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ translationMode: opt.value })}
                  aria-pressed={settings.translationMode === opt.value}
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

          <details>
            <summary className="cursor-pointer rounded-card bg-cream-card p-4 text-sm font-semibold uppercase tracking-wide text-ink-muted shadow-card">
              Display and audio
            </summary>
            <div className="mt-3 space-y-3">
              <Toggle
                checked={settings.showSavedHighlights}
                onChange={(v) => update({ showSavedHighlights: v })}
                label="Saved word highlights"
                description="Highlight words you saved for review."
              />
              <Toggle
                checked={settings.showKnownWordStyling}
                onChange={(v) => update({ showKnownWordStyling: v })}
                label="Known word styling"
                description="Dim words you marked as known."
              />
              <SpeechSettingsCard settings={settings} onChange={update} />
            </div>
          </details>
        </section>

        <section className="space-y-3">
          <SettingsSectionTitle title="Library" subtitle="Reading tools, saved items, and history." />
          <SettingsLink href="/live-news" title="News" description="Read current French articles." />
          <SettingsLink href="/words" title="Words" description="Manage saved and known vocabulary." />
          <SettingsLink href="/phrases" title="Phrase bank" description="Review saved idioms and multi-word expressions." />
          <SettingsLink href="/progress" title="Progress" description="See XP, missions, and topic coverage." />
          <SettingsLink href="/archive" title="Lessons read" description="Review your reading history." />
          <SettingsLink href="/grammar" title="Grammar" description="Practice verbs and sentence patterns." />
        </section>

        <section className="space-y-3">
          <SettingsSectionTitle title="App" subtitle="Account, install options, feedback, and privacy." />
          <BetaNotice />
          <AccountCard />
          <div className="rounded-card bg-cream-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">Get Lire on Android</p>
                <p className="mt-0.5 text-sm text-ink-muted">Join the interest list for beta access.</p>
              </div>
              <AndroidBetaButton source="settings" label="Join" />
            </div>
          </div>
          <PwaInstallCard />
          <div className="rounded-card bg-cream-card p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">Feedback</p>
                <p className="mt-0.5 text-sm text-ink-muted">Report a dictionary, article, translation, or technical issue.</p>
              </div>
              <FeedbackButton feature="settings" label="Open" />
            </div>
          </div>
          <SettingsLink href="/privacy" title="Privacy" description="Local-first storage, analytics, beta emails, and AI use." />
          <SettingsLink href="/changelog" title="What is new" description="See recent visible changes to Lire." />
        </section>

        <details>
          <summary className="cursor-pointer rounded-card bg-cream-card p-4 text-sm font-semibold uppercase tracking-wide text-ink-muted shadow-card">
            Advanced
          </summary>
          <div className="mt-3 space-y-3">
            <Toggle
              checked={settings.aiTranslationEnabled}
              onChange={(v) => update({ aiTranslationEnabled: v })}
              label="Preload natural translations"
              description="Load one cached natural translation when you open a reading."
            />

            <div className="rounded-card bg-cream-card p-4 shadow-card">
              <p className="font-semibold text-ink">AI explanations</p>
              <p className="mt-0.5 text-sm text-ink-muted">Word and sentence AI help runs only when you ask for it.</p>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-card bg-cream-card p-4 shadow-card">
              <div className="min-w-0">
                <p className="font-semibold text-ink">Known words</p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {knownCount} {knownCount === 1 ? "word" : "words"} marked known.
                </p>
              </div>
              {knownCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearKnown}
                  className="shrink-0 rounded-full bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-600 active:scale-95"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-card bg-cream-card p-4 shadow-card">
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

            <SettingsLink href="/lookup" title="English to French lookup" description="Look up an English word offline." />
            <SettingsLink href="/dictionary" title="Dictionary quality" description="See missing entries, saved corrections, and phrase coverage." />
            <SettingsLink href="/sources" title="RSS sources" description="Check which feeds are producing French articles." />
          </div>
        </details>
      </div>
    </div>
  );
}
