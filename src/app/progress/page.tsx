"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getArchive } from "@/lib/archive";
import { getSavedWords } from "@/lib/storage";
import { awardCompletedMissions, buildProgressSnapshot, type ProgressSnapshot } from "@/lib/gamification";
import {
  AchievementBadge,
  CollectionCard,
  CurrentLevelCard,
  MasteryIndicator,
  PassportStampCard,
  PersonalBestCard,
  TodaysMissionsPanel,
  TopicProgressCard,
} from "@/components/GamificationCards";

type Tab = "overview" | "missions" | "vocabulary" | "achievements" | "passport";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "missions", label: "Missions" },
  { id: "vocabulary", label: "Vocabulary" },
  { id: "achievements", label: "Achievements" },
  { id: "passport", label: "Passport" },
];

export default function ProgressPage() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [rewardNotice, setRewardNotice] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<number | null>(null);

  function refresh(showRewards = false) {
    const words = getSavedWords();
    const result = awardCompletedMissions(undefined, words);
    const next = buildProgressSnapshot(words, getArchive());
    setSnapshot(next);
    setWeekStart(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (showRewards && result.awardedXp > 0) {
      setRewardNotice(`+${result.awardedXp} XP from completed missions`);
      window.setTimeout(() => setRewardNotice(null), 2200);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("tab");
    if (requested && TABS.some((item) => item.id === requested)) setTab(requested as Tab);
    refresh(true);
  }, []);

  const weeklyArticles = useMemo(
    () => snapshot?.completions.filter((item) => weekStart !== null && new Date(item.completedAt).getTime() >= weekStart).length ?? 0,
    [snapshot, weekStart]
  );

  if (!snapshot) {
    return (
      <div className="px-4 pt-6">
        <div className="h-32 animate-pulse rounded-3xl bg-cream-dark" />
        <div className="mt-4 h-48 animate-pulse rounded-3xl bg-cream-dark" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <Link href="/" className="text-sm font-semibold text-brand">
          Back to reading
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">Progress</h1>
        <p className="text-sm text-ink-muted">A calm view of what your French reading is building toward.</p>
      </header>

      {rewardNotice && (
        <div className="mb-4 rounded-2xl bg-brand-light px-3 py-2 text-sm font-semibold text-brand shadow-sm">
          {rewardNotice}
        </div>
      )}

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold active:scale-95 ${
              tab === item.id ? "bg-brand text-white" : "bg-cream-card text-ink-muted shadow-sm"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-5">
          <CurrentLevelCard level={snapshot.level} />

          <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Weekly overview</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                ["Articles", weeklyArticles],
                ["Words read", snapshot.weeklyWords.toLocaleString()],
                ["Comprehension", `${snapshot.weeklyComprehensionAverage}%`],
                ["Vocabulary reviewed", snapshot.weeklyReviewed],
                ["Translations / 100 words", snapshot.translationsPer100Words],
                ["Reading streak", `${snapshot.currentStreak} days`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-cream p-3">
                  <p className="text-lg font-extrabold text-ink">{value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-end gap-1" aria-label="Seven-day reading activity">
              {snapshot.activityStrip.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-xl ${day.completed ? "bg-brand" : "bg-cream-dark"}`}
                    style={{ height: `${Math.max(10, Math.min(54, day.words / 18))}px` }}
                    title={`${day.date}: ${day.words} words`}
                  />
                  <span className="text-[9px] text-ink-muted">{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">Topic progression</h2>
            <div className="space-y-3">
              {snapshot.topicProgress.map((topic) => (
                <TopicProgressCard key={topic.category} topic={topic} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">Personal bests</h2>
            <div className="grid grid-cols-2 gap-3">
              {snapshot.personalBests.map((best) => (
                <PersonalBestCard key={best.id} best={best} />
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "missions" && (
        <div className="space-y-5">
          <TodaysMissionsPanel missions={snapshot.missions} />
          <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Streaks</h2>
            <p className="mt-2 text-2xl font-extrabold text-ink">{snapshot.currentStreak} days</p>
            <p className="mt-1 text-sm text-ink-muted">Longest streak: {snapshot.longestStreak} days. Activity counts when you complete an article, review meaningfully, or finish a mission.</p>
            <p className="mt-3 rounded-2xl bg-cream px-3 py-2 text-xs text-ink-muted">
              Next milestone: {snapshot.currentStreak < 3 ? "3-day streak" : snapshot.currentStreak < 7 ? "7-day streak" : "keep the week alive calmly"}.
            </p>
          </section>
        </div>
      )}

      {tab === "vocabulary" && (
        <div className="space-y-5">
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">Vocabulary collections</h2>
            <div className="space-y-3">
              {snapshot.collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">Mastery progression</h2>
            <div className="space-y-3">
              {snapshot.mastery.slice(0, 20).map((item) => (
                <article key={item.word.word} className="rounded-3xl bg-cream-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-ink">{item.word.lemma ?? item.word.word}</p>
                      <p className="text-xs text-ink-muted">{item.word.primaryTranslation}</p>
                    </div>
                    {item.advanced && <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand">Advanced</span>}
                  </div>
                  <MasteryIndicator mastery={item} />
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "achievements" && (
        <section className="space-y-3">
          {snapshot.achievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </section>
      )}

      {tab === "passport" && (
        <section>
          <div className="mb-3 rounded-3xl bg-cream-card p-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Reading Passport</h2>
            <p className="mt-1 text-sm text-ink-muted">A quiet record of topics, levels, sources and independence milestones you have explored.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {snapshot.passport.map((stamp) => (
              <PassportStampCard key={stamp.id} stamp={stamp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
