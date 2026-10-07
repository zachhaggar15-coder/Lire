import type { SavedWord } from "@/types";
import { isWordSaved, saveWord, type SaveWordResult } from "@/lib/storage";
import { canSaveNewWord, type AccessContext, type AccessDecision } from "@/lib/access/accessModel";
import { recordNewSave } from "@/lib/access/saveAllowance";

export interface GuardedSaveWordResult {
  decision: AccessDecision;
  result: SaveWordResult | null;
}

/**
 * The one write path for vocabulary saves. A save control must never outrun
 * the allowance that permits it, and the allowance counts only words that
 * were actually created and stored. Re-saving a word that is already saved is
 * not a new save and is never blocked.
 */
export function saveWordForAccess(context: AccessContext, entry: SavedWord): GuardedSaveWordResult {
  const decision = canSaveNewWord(context);
  if (!decision.allowed) {
    if (isWordSaved(entry.word)) return { decision: { allowed: true, reason: null, remaining: 0 }, result: saveWord(entry) };
    return { decision, result: null };
  }
  const result = saveWord(entry);
  if (result.created && result.persisted) recordNewSave();
  return { decision, result };
}
