"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPremiumStatus } from "@/lib/premium/client";
import { FREE_PREMIUM_STATUS, type PremiumStatus } from "@/lib/premium/types";
import { activeIdentity } from "@/lib/localData/store";

/**
 * The signed-in account's entitlement, fetched once per page load and shared
 * by every component that asks (so a screen with several gates makes one
 * request, not several). Identity changes reload the page, which resets it.
 */

let shared: Promise<PremiumStatus> | null = null;
const listeners = new Set<(status: PremiumStatus) => void>();

function load(force = false): Promise<PremiumStatus> {
  if (!shared || force) {
    shared = activeIdentity().kind === "account" ? fetchPremiumStatus() : Promise.resolve(FREE_PREMIUM_STATUS);
    void shared.then((status) => listeners.forEach((listener) => listener(status)));
  }
  return shared;
}

export function refreshPremiumStatus(): Promise<PremiumStatus> {
  return load(true);
}

export function usePremiumStatus() {
  const [status, setStatus] = useState<PremiumStatus>(FREE_PREMIUM_STATUS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const listener = (next: PremiumStatus) => {
      if (alive) setStatus(next);
    };
    listeners.add(listener);
    void load().then((next) => {
      if (!alive) return;
      setStatus(next);
      setLoading(false);
    });
    return () => {
      alive = false;
      listeners.delete(listener);
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await refreshPremiumStatus();
    setStatus(next);
    setLoading(false);
    return next;
  }, []);

  return { status, loading, refresh };
}
