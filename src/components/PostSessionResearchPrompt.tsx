"use client";

import { useEffect, useMemo, useState } from "react";
import { AndroidBetaButton } from "@/components/AndroidBetaModal";
import { FeedbackButton } from "@/components/FeedbackModal";
import { trackEvent } from "@/lib/analytics/client";
import { peekAnonymousId } from "@/lib/analytics/identity";
import { getBrowserSession } from "@/lib/analytics/session";
import { buildValidationBehaviourContext } from "@/lib/validation/context";
import { getValidationState, markPromptAnswered, markPromptDismissed } from "@/lib/validation/state";

type PromptKind = "android" | "session_reaction" | "return_reason" | "disappearance";

const LAST_PROMPT_KEY = "lire.validation.lastPromptAt";
const MIN_DAYS_BETWEEN_PROMPTS = 3;

function daysSince(iso: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000);
}

function choosePrompt(): PromptKind | null {
  const state = getValidationState();
  if (state.meaningfulSessionCount < 1) return null;
  if (typeof window !== "undefined") {
    const last = window.localStorage.getItem(LAST_PROMPT_KEY);
    if (daysSince(last) < MIN_DAYS_BETWEEN_PROMPTS) return null;
  }
  if (state.meaningfulSessionCount === 1 && !state.firstAndroidInterestAt && !state.dismissedPromptIds.includes("android-beta")) {
    return "android";
  }
  const latestDate = state.activeDates[state.activeDates.length - 1];
  if (state.activeDates.length > 1 && !state.answeredPromptIds.includes(`return-reason-${latestDate}`)) {
    return "return_reason";
  }
  if (state.meaningfulSessionCount >= 3 && !state.answeredPromptIds.includes("disappearance-survey")) {
    return "disappearance";
  }
  if (state.meaningfulSessionCount % 3 === 0 && !state.dismissedPromptIds.includes(`session-reaction-${state.meaningfulSessionCount}`)) {
    return "session_reaction";
  }
  return null;
}

export default function PostSessionResearchPrompt({ articleId }: { articleId: string }) {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const prompt = useMemo(() => choosePrompt(), []);

  useEffect(() => {
    if (prompt) setVisible(true);
  }, [prompt]);

  if (!visible || !prompt) return null;

  async function submit(promptType: string, response: string) {
    setSubmitted(true);
    if (typeof window !== "undefined") window.localStorage.setItem(LAST_PROMPT_KEY, new Date().toISOString());
    const today = new Date().toISOString().slice(0, 10);
    const answeredId =
      promptType === "disappearance_survey"
        ? "disappearance-survey"
        : promptType === "return_reason"
          ? `return-reason-${today}`
          : `${promptType}-${today}`;
    markPromptAnswered(answeredId);
    const context = buildValidationBehaviourContext();
    await fetch("/api/research-prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promptType,
        response,
        page: window.location.pathname,
        anonymousId: peekAnonymousId(),
        sessionId: getBrowserSession().id,
        context: { ...context, articleId },
      }),
    }).catch(() => {});
    if (promptType === "return_reason") trackEvent("return_reason_submitted", { response });
    if (promptType === "disappearance_survey") trackEvent("disappearance_survey_submitted", { response });
    if (promptType === "session_reaction") trackEvent("session_reaction_submitted", { response });
  }

  function dismiss() {
    markPromptDismissed(prompt === "android" ? "android-beta" : `${prompt}-${getValidationState().meaningfulSessionCount}`);
    if (typeof window !== "undefined") window.localStorage.setItem(LAST_PROMPT_KEY, new Date().toISOString());
    setVisible(false);
  }

  if (submitted) {
    return (
      <div className="rounded-3xl bg-brand-light p-4 text-sm font-semibold text-brand shadow-sm">
        Thanks. That helps shape Lire.
      </div>
    );
  }

  if (prompt === "android") {
    return (
      <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Help shape Lire</h2>
        <p className="mt-1 text-sm text-ink-muted">Interested in testing Lire on Android when it opens?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AndroidBetaButton source="post_session_prompt" label="Join Android beta" />
          <button type="button" onClick={dismiss} className="rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-ink-muted">
            Not now
          </button>
        </div>
      </section>
    );
  }

  if (prompt === "return_reason") {
    const options = ["Interesting articles", "Vocabulary review", "Grammar practice", "Improving reading ability", "Keeping my streak", "Testing the app", "Other"];
    return (
      <PromptCard title="What brought you back today?" options={options} onSelect={(value) => submit("return_reason", value)} onDismiss={dismiss} />
    );
  }

  if (prompt === "disappearance") {
    const options = ["Very disappointed", "Somewhat disappointed", "Not disappointed", "I have not used it enough yet"];
    return (
      <PromptCard title="How disappointed would you be if Lire disappeared?" options={options} onSelect={(value) => submit("disappearance_survey", value)} onDismiss={dismiss} />
    );
  }

  return (
    <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">How was this session?</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Useful", "Too easy", "Too difficult", "Confusing"].map((option) => (
          <button key={option} type="button" onClick={() => submit("session_reaction", option)} className="rounded-full bg-cream px-3 py-2 text-xs font-semibold text-ink">
            {option}
          </button>
        ))}
        <FeedbackButton feature="post_session_prompt" articleId={articleId} label="More feedback" />
        <button type="button" onClick={dismiss} className="rounded-full bg-cream-dark px-3 py-2 text-xs font-semibold text-ink-muted">
          Not now
        </button>
      </div>
    </section>
  );
}

function PromptCard({
  title,
  options,
  onSelect,
  onDismiss,
}: {
  title: string;
  options: string[];
  onSelect: (value: string) => void;
  onDismiss: () => void;
}) {
  return (
    <section className="rounded-3xl bg-cream-card p-4 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onSelect(option)} className="rounded-full bg-cream px-3 py-2 text-xs font-semibold text-ink">
            {option}
          </button>
        ))}
        <button type="button" onClick={onDismiss} className="rounded-full bg-cream-dark px-3 py-2 text-xs font-semibold text-ink-muted">
          Not now
        </button>
      </div>
    </section>
  );
}
