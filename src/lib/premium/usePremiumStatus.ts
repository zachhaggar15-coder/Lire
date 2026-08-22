"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPremiumStatus } from "@/lib/premium/client";
import { FREE_PREMIUM_STATUS, type PremiumStatus } from "@/lib/premium/types";
import { onAuthStateChange } from "@/lib/supabase/auth";

export function usePremiumStatus() {
  const [status, setStatus] = useState<PremiumStatus>(FREE_PREMIUM_STATUS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setStatus(await fetchPremiumStatus());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    return onAuthStateChange(() => void refresh());
  }, [refresh]);

  return { status, loading, refresh };
}
