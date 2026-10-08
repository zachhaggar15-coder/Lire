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
    } else if (state.walkthroughReplay) {
      // The tour only runs when the learner asks to replay it. Learners who
      // finished onboarding earlier but never the old tour go straight to
      // their lessons rather than being sent through it now.
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
      <div className="mx-auto min-h-[100dvh] max-w-md px-[22px] pt-[calc(var(--safe-top)+1rem)]">
        <FirstRunOnboarding
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
