import type { SavedWord } from "@/types";
import { canSaveWord, type AccessContext } from "@/lib/access/accessModel";
import { saveWordForAccess } from "@/lib/access/saveWord";

/**
 * What the walkthrough's "save" step does for each kind of reader.
 *
 * The tour must describe the real product. Only a reader who is genuinely
 * entitled to save goes through the same guarded write path as the Reader; for
 * everyone else the step is a preview that never touches storage, so nothing
 * claims to be saved that will vanish — or never existed — after onboarding.
 */

export type WalkthroughSaveOutcome =
  | { kind: "checking"; message: string }
  | { kind: "preview"; message: string }
  | { kind: "failed"; message: string }
  | { kind: "saved"; message: string }
  | { kind: "exists"; message: string };

export type WalkthroughSaveMode = "checking" | "save" | "preview";

export function walkthroughSaveMode(ready: boolean, context: AccessContext): WalkthroughSaveMode {
  if (!ready) return "checking";
  return canSaveWord(context).allowed ? "save" : "preview";
}

export function walkthroughAccessCopy(ready: boolean, context: AccessContext, authenticated: boolean): string {
  switch (walkthroughSaveMode(ready, context)) {
    case "checking":
      return "Checking available learning features…";
    case "save":
      return "Your Premium access lets this tour save a real word to Review.";
    case "preview":
      return authenticated
        ? "Your free account can look up words. Saving words and Review are Premium features."
        : "Anyone can look up words. A free account adds more daily reading and lookups; saving words and Review require Premium.";
  }
}

export function walkthroughPreviewMessage(authenticated: boolean): string {
  return authenticated
    ? "Premium lets you save vocabulary and review it later. You're on a free account, so nothing was saved."
    : "Premium lets you save vocabulary and review it later. You're not on Premium, so nothing was saved.";
}

export function runWalkthroughWordAction(
  ready: boolean,
  context: AccessContext,
  authenticated: boolean,
  buildEntry: () => SavedWord,
  save: typeof saveWordForAccess = saveWordForAccess,
): WalkthroughSaveOutcome {
  const mode = walkthroughSaveMode(ready, context);
  if (mode === "checking") return { kind: "checking", message: "Checking which learning features are available…" };
  // Not entitled: explain, never call the save path.
  if (mode === "preview") return { kind: "preview", message: walkthroughPreviewMessage(authenticated) };

  const saved = save(context, buildEntry());
  if (!saved.decision.allowed) return { kind: "preview", message: walkthroughPreviewMessage(authenticated) };
  if (!saved.result?.persisted) {
    return { kind: "failed", message: "Couldn't save the word on this device. Try again after freeing some storage." };
  }
  return saved.result.created
    ? { kind: "saved", message: "Saved to your real Review deck." }
    : { kind: "exists", message: "That word is already in your Review deck." };
}
