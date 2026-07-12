"use client";

import { useEffect, useState } from "react";
import { DEFAULT_GOALS, getGoals, getGoalsProgress, saveGoals, type ReadingGoals } from "@/lib/goals";
import { getCurrentStreak, getLongestStreak } from "@/lib/habit";

interface GoalRow {
  key: keyof ReadingGoals;
  label: string;
  unit: string;
  progress: number;
}

/** Home page card showing progress toward the reader's (optional, self-set) daily/weekly goals. Every value is derived fresh from existing data — see src/lib/goals.ts. */
export default function ReadingGoalsCard() {
  const [goals, setGoals] = useState<ReadingGoals>(DEFAULT_GOALS);
  const [progress, setProgress] = useState<ReturnType<typeof getGoalsProgress> | null>(null);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setGoals(getGoals());
    setProgress(getGoalsProgress());
    setStreak({ current: getCurrentStreak(), longest: getLongestStreak() });
  }, []);

  function updateGoal(key: keyof ReadingGoals, value: number | null) {
    setGoals(saveGoals({ [key]: value }));
  }

  if (!progress) return null;

  const allRows: GoalRow[] = [
    { key: "minutesPerDay", label: "Read", unit: "min today", progress: progress.minutesToday },
    { key: "articlesPerDay", label: "Articles", unit: "today", progress: progress.articlesToday },
    { key: "newWordsPerWeek", label: "New words", unit: "this week", progress: progress.newWordsThisWeek },
    { key: "flashcardsPerDay", label: "Reviews", unit: "today", progress: progress.flashcardsToday },
  ];
  const rows = allRows.filter((row) => goals[row.key] !== null);

  if (rows.length === 0 && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mb-5 w-full rounded-3xl border border-dashed border-cream-dark bg-cream-card p-4 text-left text-sm text-ink-muted shadow-sm"
      >
        Set a reading goal →
      </button>
    );
  }

  return (
    <div className="mb-5 rounded-3xl bg-cream-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Goals</h2>
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-xs font-semibold text-brand underline underline-offset-2"
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {!editing && (
        <div className="mt-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-cream px-3 py-2">
              <p className="text-lg font-extrabold text-ink">{streak.current}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Day streak</p>
            </div>
            <div className="rounded-2xl bg-cream px-3 py-2">
              <p className="text-lg font-extrabold text-ink">{streak.longest}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Best streak</p>
            </div>
          </div>
          {rows.map((row) => {
            const target = goals[row.key] ?? 0;
            const pct = target > 0 ? Math.min(100, Math.round((row.progress / target) * 100)) : 0;
            return (
              <div key={row.key}>
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span className="font-semibold text-ink">{row.label}</span>
                  <span>
                    {row.progress} / {target} {row.unit}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream-dark">
                  <div
                    className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-brand"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="mt-3 space-y-3">
          {(
            [
              { key: "minutesPerDay", label: "Minutes per day" },
              { key: "articlesPerDay", label: "Articles per day" },
              { key: "newWordsPerWeek", label: "New words per week" },
              { key: "flashcardsPerDay", label: "Flashcard reviews per day" },
            ] as const
          ).map((field) => (
            <label key={field.key} className="flex items-center justify-between gap-3 text-sm text-ink-muted">
              {field.label}
              <input
                type="number"
                min={0}
                value={goals[field.key] ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  updateGoal(field.key, raw === "" ? null : Math.max(0, Number(raw)));
                }}
                placeholder="off"
                className="w-20 rounded-lg bg-cream px-2 py-1 text-right text-sm text-ink"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
