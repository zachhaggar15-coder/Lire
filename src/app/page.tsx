"use client";

import { useEffect, useState } from "react";
import ArticleBrowserPage from "@/components/ArticleBrowserPage";
import FirstRunOnboarding from "@/components/FirstRunOnboarding";
import { getOnboardingState } from "@/lib/onboarding";

export default function HomePage() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    setOnboardingComplete(getOnboardingState()?.completed === true);
  }, []);

  if (onboardingComplete === null) {
    return (
      <div className="px-4 pt-6">
        <div className="h-10 w-24 animate-pulse rounded-2xl bg-cream-dark" />
        <div className="mt-5 h-72 animate-pulse rounded-card bg-cream-dark" />
      </div>
    );
  }

  if (!onboardingComplete) {
    return (
      <div className="min-h-[100dvh] px-4 pt-6">
        <header className="mb-5">
          <h1 className="text-3xl font-extrabold text-ink">Lire</h1>
          <p className="mt-1 text-sm text-ink-muted">Set your starting point, then follow your guided lesson path.</p>
        </header>
        <FirstRunOnboarding
          variant="focus"
          onComplete={() => {
            setOnboardingComplete(true);
            window.dispatchEvent(new Event("storage"));
          }}
        />
      </div>
    );
  }

  return <ArticleBrowserPage mode="articles" />;
}
