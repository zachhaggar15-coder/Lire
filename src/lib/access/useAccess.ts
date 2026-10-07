"use client";

import { useCallback, useEffect, useState } from "react";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { accessContext, accessTier, type AccessContext } from "@/lib/access/accessModel";
import { newSavesToday } from "@/lib/access/saveAllowance";
import { activeIdentity } from "@/lib/localData/store";
import { lastKnownSaveQuota } from "@/lib/sync/runtime";
import { localDateKey } from "@/lib/access/saveAllowance";

/**
 * The access context for the current reader.
 *
 * The tier comes from the identity partition this tab is using (identity
 * changes reload the page) and the server-verified entitlement.
 *
 * `ready` matters for gating UI: until entitlement is known, rendering a lock
 * would flash a paywall at a subscriber on every cold start.
 */
export function useAccess() {
  const { status: premium, loading } = usePremiumStatus();
  const authenticated = activeIdentity().kind === "account";
  const [saves, setSaves] = useState(0);

  const refreshUsage = useCallback(() => {
    const local = newSavesToday();
    const server = lastKnownSaveQuota();
    const serverToday = server && server.day === localDateKey() ? server.used : 0;
    setSaves(Math.max(local, serverToday));
  }, []);

  useEffect(() => {
    refreshUsage();
    const onSync = () => refreshUsage();
    window.addEventListener("sorlio-sync-complete", onSync);
    return () => window.removeEventListener("sorlio-sync-complete", onSync);
  }, [refreshUsage]);

  const tier = accessTier(authenticated, premium.isPremium);
  const context: AccessContext = accessContext(tier, saves);
  const ready = !authenticated || !loading;

  return { tier, context, ready, authenticated, premium, refreshUsage };
}
