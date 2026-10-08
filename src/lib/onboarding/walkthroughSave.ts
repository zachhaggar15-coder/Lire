import type { SavedWord } from "@/types";
import { canSaveNewWord, type AccessContext } from "@/lib/access/accessModel";
import { saveWordForAccess } from "@/lib/access/saveWord";
import { FREE_DAILY_NEW_SAVES } from "@/lib/access/features";

/**
 * What the walkthrough's "save" step does for each kind of reader.
 *
 * The tour must describe the real product. Saving goes through the same
 * guarded write path as the Reader (and counts towards the free daily
 * allowance); when today's allowance is used up the step is a preview that
 * never touches storage, so nothing claims to be saved that wasn't.
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
  return canSaveNewWord(context).allowed ? "save" : "preview";
}

export function walkthroughAccessCopy(ready: boolean, context: AccessContext, _authenticated: boolean): string {
  switch (walkthroughSaveMode(ready, context)) {
    case "checking":
      return "Checking…";
    case "save":
      return context.tier === "premium"
        ? "Saving is unlimited with Premium. This saves a real word to Review."
        : `You can save ${FREE_DAILY_NEW_SAVES} new words a day for free. This saves a real word to Review.`;
    case "preview":
      return `You've used today's ${FREE_DAILY_NEW_SAVES} free new saves, so this step is a preview. You can still review every word you've saved.`;
  }
}

export function walkthroughPreviewMessage(_authenticated: boolean): string {
  return `Nothing was saved this time — today's ${FREE_DAILY_NEW_SAVES} free new saves are used. Saving resets tomorrow, and Premium removes the limit.`;
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
