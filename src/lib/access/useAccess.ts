"use client";

import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, onAuthStateChange } from "@/lib/supabase/auth";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { accessContext, accessTier, getDailyUsage, type AccessContext } from "@/lib/access/accessModel";
import { recordArticleOpened, recordLookup } from "@/lib/access/dailyUsage";

/**
 * The access context for the current reader, kept live.
 *
 * Recomputes on sign-in and sign-out so entitlement can never lag the session:
 * signing out has to drop straight back to guest, or a signed-out device would
 * keep the allowance of the account that just left it.
 *
 * `ready` matters for gating UI. Until auth and entitlement have both resolved
 * the tier is unknown, and rendering a lock in that window would flash a
 * paywall at a Premium subscriber every time they open the app.
 */
export function useAccess() {
  const { status: premium, loading: premiumLoading } = usePremiumStatus();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [usage, setUsage] = useState(() => getDailyUsage());

  useEffect(() => {
    getCurrentUser().then((user) => setAuthenticated(!!user));
    return onAuthStateChange((user) => {
      setAuthenticated(!!user);
      // Usage is stored per device and per day, not per user, so it survives
      // sign-in unchanged — which is the point. Re-reading keeps the in-memory
      // copy honest if another tab moved it on.
      setUsage(getDailyUsage());
    });
  }, []);

  const tier = accessTier(!!authenticated, premium.isPremium);
  const context: AccessContext = accessContext(tier, usage);
  const ready = authenticated !== null && !premiumLoading;

  const consumeArticle = useCallback((articleId: string) => {
    setUsage(recordArticleOpened(articleId));
  }, []);

  const consumeLookup = useCallback(() => {
    setUsage(recordLookup());
  }, []);

  const refreshUsage = useCallback(() => setUsage(getDailyUsage()), []);

  return { tier, context, ready, authenticated: !!authenticated, premium, consumeArticle, consumeLookup, refreshUsage };
}
