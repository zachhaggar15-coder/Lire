"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AndroidBetaSource } from "@/lib/beta/android";
import { trackEvent } from "@/lib/analytics/client";
import { buildValidationBehaviourContext } from "@/lib/validation/context";
import { markAndroidInterest } from "@/lib/validation/lifecycle";

type SubmitState = "idle" | "submitting" | "success" | "error";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function AndroidBetaButton({
  source,
  label = "Join Android beta",
  className = "rounded-full bg-brand px-4 py-2 shadow-raised text-sm font-semibold text-white active:scale-95",
}: {
  source: AndroidBetaSource;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    trackEvent("android_beta_cta_viewed", { source });
  }, [source]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackEvent("android_beta_clicked", { source });
          setOpen(true);
        }}
        className={className}
      >
        {label}
      </button>
      <AndroidBetaModal source={source} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function AndroidBetaModal({
  source,
  open,
  onClose,
}: {
  source: AndroidBetaSource;
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [frenchLevel, setFrenchLevel] = useState("");
  const [usesAndroid, setUsesAndroid] = useState<"yes" | "no" | "">("");
  const [currentLearningTools, setCurrentLearningTools] = useState("");
  const [motivation, setMotivation] = useState("");
  const [desiredImprovement, setDesiredImprovement] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    trackEvent("android_beta_form_started", { source });
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      previousFocus.current?.focus();
    };
  }, [onClose, open, source]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setState("submitting");
    setMessage(null);
    const context = buildValidationBehaviourContext();
    const result = await fetch("/api/android-beta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        source,
        currentPath: window.location.pathname,
        frenchLevel: frenchLevel || null,
        usesAndroid: usesAndroid === "yes" ? true : usesAndroid === "no" ? false : null,
        currentLearningTools,
        motivation,
        desiredImprovement,
        context,
      }),
    }).then((res) => res.json().then((body) => ({ ok: res.ok, body })).catch(() => ({ ok: res.ok, body: null }))).catch(() => ({ ok: false, body: null }));

    if (result.ok && result.body?.ok) {
      markAndroidInterest();
      trackEvent("android_beta_joined", {
        source,
        frenchLevel: frenchLevel || null,
        usesAndroid: usesAndroid || null,
        returningUser: context.isReturningUser,
      });
      setState("success");
      setMessage(result.body.duplicate ? "You're already on the beta list. I updated your latest details." : "You're on the beta list. We'll contact you when Android testing opens.");
      return;
    }

    setState("error");
    setMessage(result.body?.error ?? "Beta registration is temporarily unavailable. Your reading data is still safe on this device.");
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md items-end bg-black/35 px-3 pb-[var(--safe-bottom)] pt-[var(--safe-top)]">
      <div className="w-full rounded-t-3xl bg-cream-card p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Android beta</p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">Get Lire on Android</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              We're exploring an Android release for Lire. Join the beta list and we'll contact you when testing opens.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-full bg-cream-dark px-3 py-2 text-sm font-semibold text-ink active:scale-95"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-2xl bg-cream px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">French level</span>
              <select
                value={frenchLevel}
                onChange={(event) => setFrenchLevel(event.target.value)}
                className="mt-1 w-full rounded-2xl bg-cream px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="">Optional</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">Use Android?</span>
              <select
                value={usesAndroid}
                onChange={(event) => setUsesAndroid(event.target.value as "yes" | "no" | "")}
                className="mt-1 w-full rounded-2xl bg-cream px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="">Optional</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>

          <input
            value={currentLearningTools}
            onChange={(event) => setCurrentLearningTools(event.target.value)}
            placeholder="Current tools you use, optional"
            className="w-full rounded-2xl bg-cream px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            value={motivation}
            onChange={(event) => setMotivation(event.target.value)}
            placeholder="Main reason you want Lire on Android, optional"
            className="w-full rounded-2xl bg-cream px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />
          <textarea
            value={desiredImprovement}
            onChange={(event) => setDesiredImprovement(event.target.value)}
            rows={3}
            placeholder="What would make Lire useful enough to use regularly?"
            className="w-full resize-none rounded-2xl bg-cream px-3 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />

          {message && (
            <p
              role="status"
              className={`rounded-2xl px-3 py-2 text-sm font-semibold ${
                state === "success" ? "bg-brand-light text-brand" : "bg-accent-pink text-accent-pinktext"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={state === "submitting" || !email.trim()}
            className="w-full rounded-full bg-brand px-4 py-3 shadow-raised text-sm font-semibold text-white active:scale-95 disabled:opacity-50"
          >
            {state === "submitting" ? "Joining..." : state === "success" ? "Update beta details" : "Join beta list"}
          </button>
          <p className="text-xs leading-relaxed text-ink-muted">
            We only use this email for Lire Android beta and launch communication. No Android app is downloadable yet.
          </p>
        </form>
      </div>
    </div>
  );
}
