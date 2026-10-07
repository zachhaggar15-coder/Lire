"use client";

import { useEffect, useState } from "react";
import { ensureGeneratedDictionary, isGeneratedDictionaryReady } from "@/lib/dictionary/lookup";

/**
 * Starts loading the broad generated dictionary and returns a revision number
 * that changes once it's indexed.
 *
 * The generated layer is fetched on demand rather than bundled (see
 * data/dictionaries/generated/fr-en-generated.ts). Anything computed from
 * dictionary lookups — difficulty estimates, offline translations, "is this
 * word known" styling — silently uses curated-only coverage until it lands,
 * which understates coverage and overstates how hard a text is. Screens that
 * derive state from lookups should include this revision in the deps of that
 * derivation so it recomputes exactly once, when full coverage arrives.
 */
export function useGeneratedDictionary(): number {
  const [revision, setRevision] = useState(() => (isGeneratedDictionaryReady() ? 1 : 0));

  useEffect(() => {
    if (isGeneratedDictionaryReady()) return;
    let cancelled = false;
    const attempt = () => {
      void ensureGeneratedDictionary().then(() => {
        if (!cancelled && isGeneratedDictionaryReady()) {
          setRevision((current) => current + 1);
          window.removeEventListener("online", attempt);
        }
      });
    };
    // A failed load (offline) is retried when the connection returns, so the
    // screen does not stay on curated-only coverage until a reload.
    window.addEventListener("online", attempt);
    attempt();
    return () => {
      cancelled = true;
      window.removeEventListener("online", attempt);
    };
  }, []);

  return revision;
}
