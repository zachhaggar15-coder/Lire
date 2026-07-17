"use client";

import Link from "next/link";
import type {
  AchievementStatus,
  ArticleCompletionRecord,
  MasteryInfo,
  MissionStatus,
  PassportStamp,
  PersonalBest,
  ReaderLevel,
  TopicProgress,
  VocabularyCollection,
} from "@/lib/gamification";

export function XPProgressBar({
  value,
  label,
  className = "",
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-cream-dark"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="reward-progress-fill h-full rounded-full bg-brand transition-[width] duration-700 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function StreakEmber({
  days,
  label = "Reading streak",
  detail,
}: {
  days: number;
  label?: string;
  detail?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="reward-ember h-10 w-10 shrink-0 rounded-full bg-amber-100" aria-hidden="true" />
      <div>
        <p className="text-lg font-extrabold leading-none text-ink">{days}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
        {detail && <p className="mt-0.5 text-xs text-ink-muted">{detail}</p>}
      </div>
    </div>
  );
}

export function CurrentLevelCard({ level }: { level: ReaderLevel }) {
  const cefrSteps = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const currentStep = Math.max(0, Math.min(cefrSteps.length - 1, level.level - 1));

  return (
    <section className="rounded-3xl bg-cream-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-brand text-2xl font-extrabold text-white shadow-sm">
          {level.level}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Current level</p>
          <h2 className="mt-0.5 text-xl font-extrabold leading-tight text-ink">
            Level {level.level} - {level.title}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {level.currentLevelXp.toLocaleString()} / {level.nextLevelXp.toLocaleString()} XP
          </p>
          <XPProgressBar value={level.progress} label="XP to next level" className="mt-3" />
          <div className="mt-3 grid grid-cols-6 gap-1" aria-label="CEFR progress">
            {cefrSteps.map((step, index) => (
              <div key={step} className="text-center">
                <div
                  className={`h-1.5 rounded-full ${
                    index < currentStep
                      ? "bg-brand"
                      : index === currentStep
                        ? "reward-progress-fill bg-brand"
                        : "bg-cream-dark"
                  }`}
                />
                <p className={`mt-1 text-[10px] font-bold ${index <= currentStep ? "text-brand" : "text-ink-muted"}`}>{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-brand">+{level.recentXp} XP in the last 7 days</p>
        </div>
      </div>
    </section>
  );
}

export function MissionCard({ mission }: { mission: MissionStatus }) {
  const progress = mission.requirement === 0 ? 1 : mission.progress / mission.requirement;
  return (
    <article
      className={`rounded-3xl border p-4 shadow-sm transition-transform duration-300 motion-reduce:transition-none ${
        mission.completed ? "border-brand/20 bg-brand-light" : "border-transparent bg-cream-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold ${mission.completed ? "bg-brand text-white" : "bg-cream-dark text-ink"}`}>
          {mission.completed ? "OK" : mission.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-ink">{mission.title}</h3>
              <p className="mt-0.5 text-xs text-ink-muted">{mission.description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-xs font-bold text-brand">+{mission.xp} XP</span>
          </div>
          <XPProgressBar
            value={progress}
            label={`${mission.progress} / ${mission.requirement}`}
            className="mt-3"
          />
          <p className="mt-1 text-xs text-ink-muted">
            {mission.completed ? (mission.rewarded ? "Completed and rewarded" : "Completed") : `${mission.progress} / ${mission.requirement}`}
          </p>
        </div>
      </div>
    </article>
  );
}

export function TodaysMissionsPanel({
  missions,
  compact = false,
}: {
  missions: MissionStatus[];
  compact?: boolean;
}) {
  if (missions.length === 0) return null;
  return (
    <section className={compact ? "mb-5" : ""}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Today&apos;s Missions</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Small goals that reinforce useful reading habits.</p>
        </div>
        {compact && (
          <Link href="/progress?tab=missions" className="shrink-0 text-xs font-semibold text-brand underline underline-offset-2">
            View
          </Link>
        )}
      </div>
      <div className={compact ? "-mx-4 flex gap-3 overflow-x-auto px-4 pb-1" : "space-y-3"}>
        {missions.map((mission) => (
          <div key={mission.id} className={compact ? "w-[82%] shrink-0" : ""}>
            <MissionCard mission={mission} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TopicProgressCard({ topic }: { topic: TopicProgress }) {
  return (
    <article className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink">{topic.label}</h3>
          <p className="text-xs text-ink-muted">{topic.articlesCompleted} completed - {topic.averageComprehension}% comprehension</p>
        </div>
        <span className="rounded-full bg-brand-light px-3 py-1 text-sm font-extrabold text-brand">Lv {topic.level}</span>
      </div>
      <XPProgressBar value={topic.progress} label={topic.nextMilestone} className="mt-3" />
      <p className="mt-2 text-xs text-ink-muted">{topic.vocabularyCoverage}% estimated vocabulary coverage</p>
    </article>
  );
}

export function PersonalBestCard({ best }: { best: PersonalBest }) {
  return (
    <article className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{best.title}</p>
      <p className="mt-1 text-xl font-extrabold text-ink">{best.value}</p>
      <p className="mt-1 text-xs text-ink-muted">{best.detail}</p>
    </article>
  );
}

export function AchievementBadge({ achievement }: { achievement: AchievementStatus }) {
  const progress = achievement.requirement === 0 ? 1 : achievement.progress / achievement.requirement;
  return (
    <article className={`rounded-3xl border p-4 shadow-sm ${achievement.unlocked ? "border-brand/20 bg-brand-light" : "border-cream-dark bg-cream-card"}`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold ${
            achievement.unlocked ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
          }`}
          aria-label={`${achievement.title} ${achievement.unlocked ? "unlocked" : "locked"}`}
        >
          {achievement.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-ink">{achievement.title}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">{achievement.description}</p>
          <XPProgressBar value={progress} label={`${achievement.progress} / ${achievement.requirement}`} className="mt-3" />
          <p className="mt-1 text-xs font-semibold text-brand">
            {achievement.unlocked ? "Unlocked" : `+${achievement.xp} XP`}
          </p>
        </div>
      </div>
    </article>
  );
}

export function MasteryIndicator({ mastery }: { mastery: MasteryInfo }) {
  const labels = ["Discovered", "Learning", "Recognised", "Reliable", "Mastered"];
  return (
    <div aria-label={`Mastery: ${labels[mastery.stageIndex]}`}>
      <div className="flex gap-1">
        {labels.map((label, index) => (
          <span
            key={label}
            className={`h-2 flex-1 rounded-full ${index <= mastery.stageIndex ? "bg-brand" : "bg-cream-dark"}`}
            title={label}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] font-semibold text-ink-muted">
        {labels[mastery.stageIndex]} - {mastery.contexts} {mastery.contexts === 1 ? "context" : "contexts"}
      </p>
    </div>
  );
}

export function CollectionCard({ collection }: { collection: VocabularyCollection }) {
  return (
    <article className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink">{collection.title}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">{collection.description}</p>
        </div>
        <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">{collection.percent}%</span>
      </div>
      <XPProgressBar value={collection.percent / 100} label={`${collection.discovered} / ${collection.total} discovered`} className="mt-3" />
      <p className="mt-2 text-xs text-ink-muted">
        {collection.mastered} mastered - Next: {collection.nextSuggestion}
      </p>
    </article>
  );
}

export function PassportStampCard({ stamp }: { stamp: PassportStamp }) {
  return (
    <article className={`rounded-3xl border p-4 shadow-sm ${stamp.unlocked ? "border-brand/20 bg-cream-card" : "border-dashed border-cream-dark bg-cream/50"}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xs font-extrabold ${stamp.unlocked ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"}`}>
        {stamp.icon}
      </div>
      <h3 className="mt-3 text-sm font-bold text-ink">{stamp.title}</h3>
      <p className="mt-0.5 text-xs text-ink-muted">{stamp.description}</p>
      <p className="mt-2 text-xs font-semibold text-brand">{stamp.unlocked ? "Stamped" : "Locked"}</p>
    </article>
  );
}

export function CompletionSummary({
  completion,
  onSecondPass,
  reviewHref,
}: {
  completion: ArticleCompletionRecord;
  onSecondPass: () => void;
  reviewHref: string | null;
}) {
  const stats = [
    ["Words read", completion.wordsRead],
    ["Reading time", `${completion.readingMinutes ?? "-"} min`],
    ["Translations", completion.translationsUsed],
    ["Saved words", completion.savedWords],
    ["Phrases", completion.phrasesSaved],
    ["Comprehension", completion.comprehensionTotal ? `${completion.comprehensionCorrect}/${completion.comprehensionTotal}` : "Not scored"],
  ];

  return (
    <section className="reward-completion-reveal rounded-3xl bg-cream-card p-4 text-left shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative h-14 w-14 shrink-0">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-cream-dark" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="100"
                className="reward-completion-ring text-brand"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wide text-brand">
              Read
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Article complete</p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">+{completion.xpEarned} XP</h2>
          </div>
        </div>
        <span className="rounded-full bg-brand-light px-3 py-1 text-sm font-bold text-brand">{completion.score}/100</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {stats.map(([label, value], index) => (
          <div
            key={label}
            className="reward-stat-reveal rounded-2xl bg-cream p-2.5"
            style={{ animationDelay: `${120 + index * 55}ms` }}
          >
            <p className="text-base font-extrabold text-ink">{value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
          </div>
        ))}
      </div>
      {completion.challengeBudget !== null && (
        <p className="mt-3 rounded-2xl bg-cream px-3 py-2 text-xs text-ink-muted">
          {completion.challengeMode} challenge: {completion.translationsUsed}/{completion.challengeBudget} translations used.{" "}
          <span className="font-semibold text-ink">{completion.challengeCompleted ? "Bonus earned." : "Bonus skipped."}</span>
        </p>
      )}
      {completion.personalBests.length > 0 && (
        <div className="mt-3 rounded-2xl bg-brand-light px-3 py-2">
          <p className="text-xs font-bold text-brand">Personal best</p>
          <p className="mt-0.5 text-xs text-ink-muted">{completion.personalBests.join(" - ")}</p>
        </div>
      )}
      <div className="mt-3 rounded-2xl bg-cream px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Recommended next</p>
        <p className="mt-0.5 text-sm font-semibold text-ink">
          {completion.savedWords > 0
            ? "Review this article's saved words while the context is still fresh."
            : completion.fullTranslationUsed
              ? "Reread once without English to consolidate the sentence structure."
              : "Read another article in the same level to reinforce the vocabulary."}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white active:scale-95">
          Read another
        </Link>
        {reviewHref && (
          <Link href={reviewHref} className="rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-ink active:scale-95">
            Review words
          </Link>
        )}
        <button
          type="button"
          onClick={onSecondPass}
          className="rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-ink active:scale-95"
        >
          Reread without English
        </button>
      </div>
    </section>
  );
}
