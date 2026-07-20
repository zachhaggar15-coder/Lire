"use client";

import { useEffect, useState } from "react";
import type { Category, Difficulty } from "@/types";
import { getOnboardingState, saveOnboarding, type OnboardingGoal } from "@/lib/onboarding";
import { knownWordEstimateForLevel } from "@/lib/knownWordBootstrap";
import { trackEvent } from "@/lib/analytics/client";

const STARTING_POINTS: { value: Difficulty; label: string; detail: string }[] = [
  { value: "A1", label: "I'm brand new", detail: "Very short texts with lots of help." },
  { value: "A2", label: "I know the basics", detail: "Simple stories and everyday language." },
  { value: "B1", label: "I can read a little", detail: "Short articles with some challenge." },
  { value: "B2", label: "I want a stretch", detail: "Richer texts and faster vocabulary growth." },
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
    <section className={`${variant === "focus" ? "rounded-card bg-cream-card p-5 shadow-card" : "mb-5 rounded-card bg-cream-card p-4 shadow-card"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand">Start here</h2>
          <p className="mt-1 text-lg font-extrabold leading-tight text-ink">How much French do you know?</p>
          <p className="mt-1 text-sm text-ink-muted">Pick the closest answer. Lire will open your first short reading next.</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid gap-2">
          {STARTING_POINTS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setLevel(option.value);
                finish(option.value);
              }}
              aria-pressed={level === option.value}
              className={`rounded-2xl px-3 py-3 text-left active:scale-[0.99] ${
                level === option.value ? "bg-brand text-white" : "bg-cream-dark text-ink"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold">{option.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${level === option.value ? "bg-white/20 text-white" : "bg-cream-card text-ink-muted"}`}>
                  {option.value}
                </span>
              </span>
              <span className={`mt-0.5 block text-xs ${level === option.value ? "text-white/80" : "text-ink-muted"}`}>
                {option.detail}
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
                onClick={() => {
                  setLevel(option);
                  finish(option);
                }}
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
      </div>

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

        <button
          type="button"
          onClick={() => finish()}
          className="mt-3 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white active:scale-95"
        >
          Start with these choices
        </button>
      </details>

      <button
        type="button"
        onClick={() => finish("A1")}
        className="mt-3 w-full rounded-full bg-cream-dark py-2.5 text-sm font-semibold text-ink-muted active:scale-95"
      >
        Start with A1
      </button>
    </section>
  );
}
