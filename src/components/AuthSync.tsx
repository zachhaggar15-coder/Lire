"use client";

import { useEffect } from "react";
import { onAuthStateChange } from "@/lib/supabase/auth";
import { pullAndMergeAllStores } from "@/lib/supabase/sync";

/**
 * Mounted once, app-wide (see layout.tsx), so a magic-link sign-in is
 * handled regardless of which page the reader lands back on after tapping
 * the email link. No-ops entirely if Supabase isn't configured — see
 * onAuthStateChange in auth.ts.
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
