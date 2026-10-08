"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { getArchive } from "@/lib/archive";
import { getSavedWords } from "@/lib/storage";
import { getCurrentStreak, getStreakGraceStatus, isActiveToday, applyStreakGraceDay, type StreakGraceStatus } from "@/lib/habit";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

/**
 * "You": the learner's hub, not a settings page. It leads with their week,
 * then their library and learning tools, then account and Premium. The
 * app's configuration is one tap away behind the gear (/settings/preferences).
 */

interface Week {
  streak: number;
  activeToday: boolean;
  readings: number;
  reviewed: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function HubLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="flex min-h-14 items-center justify-between gap-4 rounded-card border border-cream-dark bg-cream-card px-4 py-3">
      <span className="min-w-0">
        <span className="block font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-sm text-ink-muted">{description}</span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-lg text-ink-muted">›</span>
    </Link>
  );
}

function HubSection({ title, children }: { title: string; children: ReactNode }) {
  const id = `you-${title.toLowerCase()}`;
  return (
    <section className="space-y-2" aria-labelledby={id}>
      <h2 id={id} className="text-sm font-semibold text-ink-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function YouPage() {
  useDocumentTitle("You");
  const [week, setWeek] = useState<Week | null>(null);
  const [grace, setGrace] = useState<StreakGraceStatus | null>(null);

  const refresh = useCallback(() => {
    const since = Date.now() - WEEK_MS;
    setWeek({
      streak: getCurrentStreak(),
      activeToday: isActiveToday(),
      readings: getArchive().filter((entry) => new Date(entry.completedAt).getTime() >= since).length,
      reviewed: getSavedWords().filter((word) => word.lastReviewedAt && new Date(word.lastReviewedAt).getTime() >= since).length,
    });
    setGrace(getStreakGraceStatus());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="ligne-screen">
      <header className="mb-5 flex items-start justify-between gap-3">
        <h1 className="mt-1 text-[30px] font-semibold leading-none text-ink">You</h1>
        <Link href="/settings/preferences" aria-label="Settings" className="ligne-icon-button bg-cream-card text-ink-muted">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      <div className="space-y-6">
        <section aria-label="Your week" className="rounded-card bg-cream-card p-4 shadow-card">
          <p className="text-sm font-semibold text-ink-muted">Your week</p>
          {week && (
            <div className="mt-2 space-y-1 text-ink">
              <p className="text-lg font-semibold">
                {week.streak > 0 ? `${week.streak} day streak` : "No streak yet"}
                {week.streak > 0 && !week.activeToday && <span className="text-sm font-normal text-ink-muted"> · read today to keep it</span>}
              </p>
              <p className="text-sm text-ink-muted">
                {week.readings} {week.readings === 1 ? "reading" : "readings"} · {week.reviewed} {week.reviewed === 1 ? "word" : "words"} reviewed
              </p>
            </div>
          )}
          {grace?.available && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-brand-light px-3 py-2">
              <p className="text-sm text-brand">Use this week&rsquo;s grace day to cover yesterday.</p>
              <button
                type="button"
                onClick={() => {
                  if (applyStreakGraceDay()) refresh();
                }}
                className="ligne-pill shrink-0 bg-brand text-cream"
              >
                Save streak
              </button>
            </div>
          )}
        </section>

        <HubSection title="Library">
          <HubLink href="/words" title="Words" description="Your saved words, in Review or not." />
          <HubLink href="/words?tab=phrases" title="Phrases" description="Saved expressions." />
          <HubLink href="/archive" title="Reading history" description="Your recent completed readings." />
          <HubLink href="/import" title="Import a text" description="Read your own French with the same help." />
        </HubSection>

        <HubSection title="Learn">
          <HubLink href="/grammar" title="Grammar" description="Short lessons and practice." />
          <HubLink href="/progress" title="Progress" description="XP, missions and what you've read." />
        </HubSection>

        <HubSection title="Account">
          <HubLink href="/settings/preferences#account" title="Account and sync" description="Sign in to keep your progress on all your devices." />
          <HubLink href="/premium" title="Premium" description="Unlimited saving and AI help." />
        </HubSection>

        <p className="text-center text-sm text-ink-muted">
          <Link href="/settings/preferences" className="font-semibold text-brand underline underline-offset-2">
            Settings
          </Link>{" "}
          · reading level, display, audio, privacy
        </p>
      </div>
    </div>
  );
}
