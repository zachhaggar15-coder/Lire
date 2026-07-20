"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { getBrowserSession } from "@/lib/analytics/session";
import { peekAnonymousId } from "@/lib/analytics/identity";
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/lib/feedback/types";

const LABELS: Record<FeedbackCategory, string> = {
  useful: "Useful",
  too_easy: "Too easy",
  too_difficult: "Too difficult",
  translation_issue: "Translation issue",
  dictionary_issue: "Dictionary issue",
  article_issue: "Article issue",
  confusing: "Confusing",
  technical_problem: "Technical problem",
  other: "Other",
  return_reason: "Return reason",
  disappearance_survey: "Disappearance survey",
  session_reaction: "Session reaction",
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export function FeedbackButton({
  feature,
  articleId,
  affectedTerm,
  label = "Give feedback",
  className = "rounded-full bg-cream-dark px-3 py-2 text-xs font-semibold text-ink-muted active:scale-95",
}: {
  feature: string;
  articleId?: string | null;
  affectedTerm?: string | null;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackEvent("feedback_opened", { feature });
          setOpen(true);
        }}
        className={className}
      >
        {label}
      </button>
      <FeedbackModal feature={feature} articleId={articleId} affectedTerm={affectedTerm} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function FeedbackModal({
  open,
  onClose,
  feature,
  articleId,
  affectedTerm,
}: {
  open: boolean;
  onClose: () => void;
  feature: string;
  articleId?: string | null;
  affectedTerm?: string | null;
}) {
  const [category, setCategory] = useState<FeedbackCategory>("useful");
  const [comment, setComment] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      previousFocus.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setState("submitting");
    setMessage(null);
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        sentiment: category === "useful" ? "positive" : category === "other" ? "neutral" : "negative",
        page: window.location.pathname,
        feature,
        articleId,
        affectedTerm,
        comment,
        anonymousId: peekAnonymousId(),
        sessionId: getBrowserSession().id,
      }),
    }).then((res) => res.json().then((body) => ({ ok: res.ok, body })).catch(() => ({ ok: res.ok, body: null }))).catch(() => ({ ok: false, body: null }));

    if (response.ok && response.body?.ok) {
      trackEvent("feedback_submitted", { category, feature, articleId: articleId ?? null });
      setState("success");
      setMessage("Thanks. That feedback was saved.");
      setComment("");
      return;
    }
    setState("error");
    setMessage(response.body?.error ?? "Feedback could not be sent right now. You can keep using Lire normally.");
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md items-end bg-black/35 px-3 pb-[var(--safe-bottom)] pt-[var(--safe-top)]">
      <form onSubmit={handleSubmit} className="w-full rounded-t-3xl bg-cream-card p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Feedback</p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">How was this session?</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="rounded-full bg-cream-dark px-3 py-2 text-sm font-semibold text-ink">
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {FEEDBACK_CATEGORIES.filter((item) => !["return_reason", "disappearance_survey", "session_reaction"].includes(item)).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-2xl px-3 py-2 text-left text-xs font-semibold active:scale-95 ${
                category === item ? "bg-brand text-white" : "bg-cream text-ink-muted"
              }`}
            >
              {LABELS[item]}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          placeholder="Optional comment"
          className="mt-3 w-full resize-none rounded-2xl bg-cream px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
        />

        {message && (
          <p role="status" className={`mt-2 rounded-2xl px-3 py-2 text-sm font-semibold ${state === "success" ? "bg-brand-light text-brand" : "bg-accent-pink text-accent-pinktext"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={state === "submitting"}
          className="mt-3 w-full rounded-full bg-brand px-4 py-3 shadow-raised text-sm font-semibold text-white active:scale-95 disabled:opacity-50"
        >
          {state === "submitting" ? "Sending..." : "Submit feedback"}
        </button>
      </form>
    </div>
  );
}
