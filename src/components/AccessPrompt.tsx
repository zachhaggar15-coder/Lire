"use client";

import { useState } from "react";
import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { signInWithGoogle } from "@/lib/supabase/auth";
import { TIER_LIMITS, type PremiumFeature, PREMIUM_FEATURE_LABEL } from "@/lib/access/limits";
import type { AccessDenialReason } from "@/lib/access/accessModel";

/**
 * What a reader sees when something is blocked.
 *
 * The whole point is telling the truth about *which* wall they hit. Asking a
 * signed-in reader to create an account, or asking a guest to sign in for
 * something an account will not unlock, both waste the one moment they were
 * willing to act on.
 *
 * So there are exactly two shapes:
 *   needs-account — a bigger free allowance is one sign-in away, and the copy
 *                   names the specific increase.
 *   needs-premium — the feature is Premium regardless of signing in. For a
 *                   guest that still means signing in, but as a step *towards
 *                   Premium*, described as such rather than dressed up as the
 *                   fix.
 */
interface AccessPromptProps {
  reason: AccessDenialReason;
  /** What was blocked — an allowance, or a named Premium feature. */
  blocked: "article" | "lookup" | PremiumFeature;
  /** True when nobody is signed in; changes the Premium call to action. */
  isGuest: boolean;
  /** Where sign-in should return to. */
  returnPath: string;
  onDismiss?: () => void;
}

export default function AccessPrompt({ reason, blocked, isGuest, returnPath, onDismiss }: AccessPromptProps) {
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setSigningIn(true);
    setError(null);
    const result = await signInWithGoogle(returnPath);
    if (!result.ok) {
      setSigningIn(false);
      setError(result.error);
    }
  }

  const copy = reason === "needs-account" ? accountCopy(blocked) : premiumCopy(blocked, isGuest);

  return (
    <section className="rounded-card border border-cream-dark bg-cream-card p-5 shadow-card">
      <p className="font-semibold text-ink">{copy.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{copy.body}</p>

      <div className="mt-4 grid gap-2">
        {reason === "needs-account" || isGuest ? (
          <GoogleSignInButton onClick={handleSignIn} disabled={signingIn} busy={signingIn} />
        ) : null}
        {reason === "needs-premium" && (
          <Link
            href="/premium"
            className="min-h-12 rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white"
          >
            See Premium
          </Link>
        )}
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="min-h-12 px-5 py-3 text-sm font-semibold text-ink-muted">
            Not now
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-600">
          {error}
        </p>
      )}
    </section>
  );
}

/**
 * Account copy names the actual increase.
 *
 * "Create an account to continue" is a request; "3 articles a day instead of
 * 1" is a reason.
 */
function accountCopy(blocked: AccessPromptProps["blocked"]): { title: string; body: string } {
  if (blocked === "article") {
    return {
      title: "That's today's free reading",
      body: `Guests get ${TIER_LIMITS.guest.articlesPerDay} article a day. Continue with Google for ${TIER_LIMITS.free.articlesPerDay} a day, and your progress will sync across devices.`,
    };
  }
  if (blocked === "lookup") {
    return {
      title: "That's today's free word lookups",
      body: `Guests get ${TIER_LIMITS.guest.lookupsPerDay} lookups a day. Continue with Google for ${TIER_LIMITS.free.lookupsPerDay} a day.`,
    };
  }
  return { title: "Continue with Google", body: "Sign in to keep going." };
}

function premiumCopy(blocked: AccessPromptProps["blocked"], isGuest: boolean): { title: string; body: string } {
  const signInNote = isGuest ? " Premium is tied to your account, so you'll sign in with Google first." : "";

  if (blocked === "article") {
    return {
      title: "That's today's reading on a free account",
      body: `Free accounts get ${TIER_LIMITS.free.articlesPerDay} articles a day. Premium removes the limit.${signInNote}`,
    };
  }
  if (blocked === "lookup") {
    return {
      title: "That's today's word lookups",
      body: `Free accounts get ${TIER_LIMITS.free.lookupsPerDay} lookups a day. Premium removes the limit.${signInNote}`,
    };
  }
  return {
    title: `${PREMIUM_FEATURE_LABEL[blocked]} is part of Premium`,
    body: `Premium unlocks saved vocabulary, review, practice, comprehension and the rest of the learning tools.${signInNote}`,
  };
}
