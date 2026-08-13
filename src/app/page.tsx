"use client";

import { useEffect, useState } from "react";
import ArticleBrowserPage from "@/components/ArticleBrowserPage";
import FirstRunOnboarding from "@/components/FirstRunOnboarding";
import InteractiveWalkthrough from "@/components/onboarding/InteractiveWalkthrough";
import { getOnboardingState } from "@/lib/onboarding";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

type Stage = "loading" | "picker" | "walkthrough" | "app";

export default function HomePage() {
  useDocumentTitle("Lessons");
  const [stage, setStage] = useState<Stage>("loading");
  const [walkthroughStartStep, setWalkthroughStartStep] = useState<number | null>(null);

  function refreshStage() {
    const state = getOnboardingState();
    if (!state?.completed) {
      setStage("picker");
    } else if (!state.walkthroughCompleted) {
      setWalkthroughStartStep(state.walkthroughStep);
      setStage("walkthrough");
    } else {
      setStage("app");
    }
  }

  useEffect(() => {
    refreshStage();
  }, []);

  if (stage === "loading") {
    return (
      <div className="px-4 pt-[calc(var(--safe-top)+1.5rem)]">
        <div className="h-10 w-24 animate-pulse rounded-2xl bg-cream-dark" />
        <div className="mt-5 h-72 animate-pulse rounded-card bg-cream-dark" />
      </div>
    );
  }

  if (stage === "picker") {
    return (
      <div className="min-h-[100dvh] px-4 pt-[calc(var(--safe-top)+1.5rem)]">
        <header className="mb-5">
          <h1 className="text-3xl font-extrabold text-ink">Lire</h1>
          <p className="mt-1 text-sm text-ink-muted">Set your starting point, then follow your guided lesson path.</p>
        </header>
        <FirstRunOnboarding
          variant="focus"
          onComplete={() => {
            refreshStage();
            window.dispatchEvent(new Event("storage"));
          }}
        />
      </div>
    );
  }

  if (stage === "walkthrough") {
    return (
      <InteractiveWalkthrough
        startStep={walkthroughStartStep}
        onFinish={() => {
          setStage("app");
          window.dispatchEvent(new Event("storage"));
        }}
        onSkip={() => {
          setStage("app");
          window.dispatchEvent(new Event("storage"));
        }}
      />
    );
  }

  return <ArticleBrowserPage mode="articles" />;
}
