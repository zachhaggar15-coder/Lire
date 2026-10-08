"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty } from "@/types";
import { saveOnboarding } from "@/lib/onboarding";
import { getNextTextForReader } from "@/lib/journey/state";

/**
 * First run: one decision, then French.
 *
 * Closed testers found the old onboarding too much: a level picker with
 * optional topics and a daily goal, then a five-step tour, then a dashboard,
 * and only then a lesson. Now the learner sees what Sorlio is, picks how
 * comfortable they are reading French, and lands in a short reading. Each
 * interaction is explained the first time it matters (tap a word, add it to
 * Review, finish a reading), not before.
 *
 * Topics are learned from what they read; a daily goal is offered after the
 * first reading; Premium and accounts never appear here.
 */

interface LevelOption {
  value: Difficulty;
  /** How it feels, first: most learners don't know CEFR codes. */
  description: string;
}

const MAIN_LEVELS: LevelOption[] = [
  { value: "A2", description: "I understand simple French" },
  { value: "B1", description: "I can follow everyday French" },
  { value: "B2", description: "I can read fairly comfortably" },
];

const MORE_LEVELS: LevelOption[] = [
  { value: "A1", description: "I'm just starting" },
  { value: "C1", description: "I read French well" },
  { value: "C2", description: "I read French with ease" },
];

interface FirstRunOnboardingProps {
  onComplete?: () => void;
}

export default function FirstRunOnboarding({ onComplete }: FirstRunOnboardingProps) {
  const router = useRouter();
  const [screen, setScreen] = useState<"welcome" | "level">("welcome");
  const [level, setLevel] = useState<Difficulty | null>(null);
  const [showMore, setShowMore] = useState(false);

  function start() {
    if (!level) return;
    saveOnboarding(level, []);
    onComplete?.();
    // Straight into the first reading the journey would pick at this level.
    const first = getNextTextForReader({ selectedLevel: level });
    if (first) router.push(`/reader/${encodeURIComponent(first.textId)}`);
  }

  if (screen === "welcome") {
    return (
      <section className="flex min-h-[calc(100dvh-6rem)] flex-col justify-between" aria-labelledby="welcome-title">
        <div className="pt-10">
          <p className="font-french text-[40px] leading-none text-brand">Sorlio</p>
          <h1 id="welcome-title" className="mt-6 text-[30px] font-semibold leading-tight text-ink">
            Learn French by reading it.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Read French at your level, tap anything you don&rsquo;t understand, and review useful words later.
          </p>
        </div>
        <div style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}>
          <button type="button" onClick={() => setScreen("level")} className="ligne-pill min-h-12 w-full bg-brand text-cream">
            Get started
          </button>
        </div>
      </section>
    );
  }

  const options = showMore ? [MORE_LEVELS[0], ...MAIN_LEVELS, ...MORE_LEVELS.slice(1)] : MAIN_LEVELS;

  return (
    <section className="flex min-h-[calc(100dvh-6rem)] flex-col justify-between" aria-labelledby="level-title">
      <div className="pt-6">
        <button type="button" onClick={() => setScreen("welcome")} className="min-h-11 text-sm font-semibold text-ink-muted">
          ‹ Back
        </button>
        <h1 id="level-title" className="mt-2 text-[26px] font-semibold leading-tight text-ink">
          How comfortable are you reading French?
        </h1>
        <p className="mt-2 text-sm text-ink-muted">A starting point, not a test. You can change it any time.</p>

        <div role="radiogroup" aria-labelledby="level-title" className="mt-5 grid gap-2">
          {options.map((option) => {
            const selected = level === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setLevel(option.value)}
                className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left ${
                  selected ? "border-brand bg-brand text-cream" : "border-cream-dark bg-cream-card text-ink"
                }`}
              >
                <span className="text-base font-semibold">{option.description}</span>
                <span className={`text-sm font-semibold ${selected ? "text-cream/80" : "text-ink-muted"}`}>{option.value}</span>
              </button>
            );
          })}
        </div>
        {!showMore && (
          <button type="button" onClick={() => setShowMore(true)} className="mt-3 min-h-11 text-sm font-semibold text-brand underline underline-offset-2">
            More levels
          </button>
        )}
      </div>

      <div className="pt-4" style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}>
        <button
          type="button"
          onClick={start}
          disabled={!level}
          className="ligne-pill min-h-12 w-full bg-brand text-cream disabled:bg-cream-dark disabled:text-ink-muted"
        >
          Start first reading
        </button>
      </div>
    </section>
  );
}
