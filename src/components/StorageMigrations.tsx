"use client";

import { useEffect } from "react";
import { clearManualKnownWords } from "@/lib/migrations/clearManualKnownWords";
import { awardLegacyProgressXp } from "@/lib/gamification";
import { migrateLegacyProgression } from "@/lib/progression/migration";

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
    try {
      // Converts the retired per-CEFR band score into XP so nobody loses the
      // progress they earned under it. See progression/migration.ts.
      migrateLegacyProgression(awardLegacyProgressXp);
    } catch {
      // Unmarked on failure, so it retries next launch rather than blocking.
    }
  }, []);

  return null;
}
