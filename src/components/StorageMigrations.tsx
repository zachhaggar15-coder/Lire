"use client";

import { useEffect } from "react";
import { clearManualKnownWords } from "@/lib/migrations/clearManualKnownWords";

/**
 * Runs one-time local-storage migrations after hydration. Each migration
 * guards its own completion flag and is safe to call on every launch; failures
 * are swallowed so a migration can never block the app from rendering.
 */
export default function StorageMigrations() {
  useEffect(() => {
    void clearManualKnownWords().catch(() => {
      // Left unmarked on failure, so it simply retries on the next launch.
    });
  }, []);

  return null;
}
