"use client";

import { useEffect, useState } from "react";
import type { Category, Difficulty } from "@/types";
import { getOnboardingState, saveOnboarding, skipOnboarding, type OnboardingGoal } from "@/lib/onboarding";
import { knownWordEstimateForLevel } from "@/lib/knownWordBootstrap";
import { trackEvent } from "@/lib/analytics/client";

const LEVELS: Difficulty[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

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
}

export default function FirstRunOnboarding({ onComplete }: FirstRunOnboardingProps) {
  const [visible, setVisible] = useState(false);
  const [level, setLevel] = useState<Difficulty>("A2");
  const [topics, setTopics] = useState<Category[]>(["news-style", "science"]);
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

  function finish() {
    saveOnboarding(level, topics, goal);
    trackEvent("onboarding_completed", {
      level,
      topicCount: topics.length,
      goal,
      skipped: false,
    });
    setVisible(false);
    onComplete?.();
  }

  function skip() {
    skipOnboarding();
    trackEvent("onboarding_completed", { skipped: true });
    setVisible(false);
    onComplete?.();
  }

  return (
    <section className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">First Filter</h2>
          <p className="mt-0.5 text-sm font-semibold text-ink">Pick a level and a few topics.</p>
        </div>
        <button
          type="button"
          onClick={skip}
          className="shrink-0 rounded-full bg-cream-dark px-3 py-1.5 text-xs font-semibold text-ink-muted active:scale-95"
        >
          Skip
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Level</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {LEVELS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLevel(option)}
              className={`rounded-xl px-1 py-2 text-center ${
                level === option ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
              }`}
            >
              <span className="block text-sm font-semibold">{option}</span>
              <span className="block text-[10px]">~{knownWordEstimateForLevel(option).toLocaleString()} words</span>
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-ink-muted">
          Used to estimate your known words so recommendations are not too easy at the start.
        </p>
      </div>

      <div className="mt-3">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Topics</p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <button
              key={topic.value}
              type="button"
              onClick={() => toggleTopic(topic.value)}
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
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Goal</p>
        <div className="grid grid-cols-3 gap-2">
          {GOALS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGoal(option.value)}
              className={`rounded-xl px-2 py-2 text-center ${
                goal === option.value ? "bg-brand text-white" : "bg-cream-dark text-ink-muted"
              }`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="block text-[11px]">{option.detail}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={finish}
        className="mt-4 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white active:scale-95"
      >
        Save filter
      </button>
    </section>
  );
}
