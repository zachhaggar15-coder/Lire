"use client";

import { useEffect, useState } from "react";
import type { Category, Difficulty } from "@/types";
import { completeWalkthrough, getOnboardingState, saveOnboarding, type OnboardingGoal } from "@/lib/onboarding";
import { knownWordEstimateForLevel } from "@/lib/knownWordBootstrap";
import { trackEvent } from "@/lib/analytics/client";
import LessonScene, { type SceneName } from "@/components/LessonScene";

const STARTING_POINTS: { value: Difficulty; label: string; detail: string; scene: SceneName; tone: string }[] = [
  { value: "A1", label: "I'm brand new", detail: "Very short texts with lots of help.", scene: "coffee", tone: "bg-accent-mint" },
  { value: "A2", label: "I know the basics", detail: "Simple stories and everyday language.", scene: "home", tone: "bg-accent-sky" },
  { value: "B1", label: "I can read a little", detail: "Short articles with some challenge.", scene: "book", tone: "bg-accent-gold" },
  { value: "B2", label: "I want a stretch", detail: "Richer texts and faster vocabulary growth.", scene: "train", tone: "bg-accent-violet" },
];

const ADVANCED_LEVELS: Difficulty[] = ["C1", "C2"];

const TOPICS: { value: Category; label: string }[] = [
  { value: "news-style", label: "News" },
  { value: "sport", label: "Sport" },
  { value: "culture", label: "Culture" },
  { value: "science", label: "Science" },
  { value: "everyday life", label: "Life" },
];

const GOALS: { value: OnboardingGoal; label: string; detail: string }[] = [
  { value: "light", label: "Light", detail: "5 min" },
  { value: "steady", label: "Steady", detail: "10 min" },
  { value: "serious", label: "Serious", detail: "20 min" },
];

interface FirstRunOnboardingProps {
  onComplete?: () => void;
  variant?: "embedded" | "focus";
}

export default function FirstRunOnboarding({ onComplete, variant = "embedded" }: FirstRunOnboardingProps) {
  const [visible, setVisible] = useState(false);
  const [level, setLevel] = useState<Difficulty>("A1");
  // Deliberately empty. Pre-ticking News and Science looked like a suggestion
  // but behaved like a selection: tapping "Science" to choose it actually
  // toggled it *off*, and anyone who picked nothing silently got News.
  const [topics, setTopics] = useState<Category[]>([]);
  const [goal, setGoal] = useState<OnboardingGoal>("steady");

  useEffect(() => {
    const state = getOnboardingState();
    const shouldShow = !state?.completed;
    setVisible(shouldShow);
    if (shouldShow) trackEvent("onboarding_started", {});
    if (state?.level) setLevel(state.level);
    if (state?.topics?.length) setTopics(state.topics);
    if (state?.goalPreset) setGoal(state.goalPreset);
  }, []);

  if (!visible) return null;

  function toggleTopic(topic: Category) {
    setTopics((current) =>
      current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]
    );
  }

  function finish(nextLevel = level) {
    saveOnboarding(nextLevel, topics, goal);
    // The first real lesson now carries the lightweight reading guidance.
    // Keep the full tutorial available from Library, but do not gate first use on it.
    completeWalkthrough();
    trackEvent("initial_level_selected", { level: nextLevel });
    trackEvent("onboarding_completed", {
      level: nextLevel,
      topicCount: topics.length,
      goal,
      skipped: false,
    });
    setVisible(false);
    onComplete?.();
  }

  return (
    <section className={variant === "focus" ? "rounded-card bg-cream-card shadow-card" : "mb-5 rounded-card bg-cream-card shadow-card"}>
      <div className="rounded-t-card bg-brand p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-bold uppercase tracking-wide text-white/75">Start here</h2>
            <p className="mt-1 text-2xl font-extrabold leading-tight">Read your first tiny French scene.</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">Pick the closest starting point, then begin your first short lesson.</p>
          </div>
          <LessonScene name="coffee" size={104} className="lesson-scene-float rounded-[1.35rem] bg-white/15 p-1 shadow-raised" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "A guided path from your first words to fluent reading",
            "A few minutes of daily practice and review",
            "Real French news once you're ready for it",
          ].map((line) => (
            <span key={line} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold leading-snug text-white/90">
              {line}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-2">
          {STARTING_POINTS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLevel(option.value)}
              aria-pressed={level === option.value}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left active:scale-[0.99] ${
                level === option.value ? "border-brand bg-brand text-white shadow-raised" : `border-transparent ${option.tone} text-ink`
              }`}
            >
              <LessonScene name={option.scene} size={44} className={level === option.value ? "rounded-2xl bg-white/15 p-0.5" : ""} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold">{option.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${level === option.value ? "bg-white/20 text-white" : "bg-cream-card/70 text-ink-muted"}`}>
                    {option.value}
                  </span>
                </span>
                <span className={`mt-0.5 block text-xs ${level === option.value ? "text-white/80" : "text-ink-muted"}`}>
                  {option.detail}
                </span>
              </span>
            </button>
          ))}
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-semibold text-ink-muted underline underline-offset-2">
            I already know my CEFR level
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...STARTING_POINTS.map((option) => option.value), ...ADVANCED_LEVELS].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLevel(option)}
                aria-pressed={level === option}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  level === option ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                }`}
              >
                {option} - about {knownWordEstimateForLevel(option).toLocaleString()} known words
              </button>
            ))}
          </div>
        </details>
      <details className="mt-4 rounded-2xl bg-cream px-3 py-2">
        <summary className="cursor-pointer text-xs font-semibold text-ink-muted underline underline-offset-2">
          Optional: topics and daily goal
        </summary>

        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Topics</p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.value}
                type="button"
                onClick={() => toggleTopic(topic.value)}
                aria-pressed={topics.includes(topic.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  topics.includes(topic.value) ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Goal</p>
          <div className="grid grid-cols-3 gap-2">
            {GOALS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGoal(option.value)}
                aria-pressed={goal === option.value}
                className={`rounded-xl px-2 py-2 text-center ${
                  goal === option.value ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="block text-xs">{option.detail}</span>
              </button>
            ))}
          </div>
        </div>

      </details>

        <div
          className="sticky bottom-0 -mx-5 mt-4 border-t border-cream-dark bg-cream-card/95 px-5 pt-3 backdrop-blur"
          style={{ paddingBottom: "calc(0.75rem + var(--safe-bottom))" }}
        >
          <button
            type="button"
            onClick={() => finish()}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white active:scale-[0.99]"
          >
            Start first lesson · {level}
          </button>
        </div>
      </div>
    </section>
  );
}
