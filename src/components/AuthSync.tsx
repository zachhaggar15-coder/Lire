"use client";

import { useEffect } from "react";
import { onAuthStateChange } from "@/lib/supabase/auth";
import { pullAndMergeAllStores } from "@/lib/supabase/sync";

/**
 * Mounted once, app-wide (see layout.tsx), so returning from Google sign-in is
 * handled regardless of which page the OAuth redirect lands on — Settings,
 * Premium or the deletion page all get the same merge.
 *
 * This is what carries a guest's existing progress up to a new account: the
 * merge is per-item and timestamp-aware, so an empty cloud never overwrites
 * local work (see mergeStoreValueWithMetadata in sync.ts). Being the single
 * app-wide listener also means only one merge runs per sign-in; individual
 * screens must not start their own or the two race on the same stores.
 *
 * No-ops entirely if Supabase isn't configured — see onAuthStateChange.
 */
export default function AuthSync() {
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) void pullAndMergeAllStores();
    });
    return unsubscribe;
  }, []);

  return null;
}
