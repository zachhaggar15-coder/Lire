import type { SavedWord } from "@/types";
import { addWordToReview, hasVocabularyCard, type SaveWordResult } from "@/lib/storage";
import { canSaveNewWord, type AccessContext, type AccessDecision } from "@/lib/access/accessModel";
import { recordNewSave } from "@/lib/access/saveAllowance";

export interface GuardedSaveWordResult {
  decision: AccessDecision;
  result: SaveWordResult | null;
}

/**
 * The one write path for "Add to review". A save control must never outrun
 * the allowance that permits it, and the allowance counts only cards that
 * were actually created and stored.
 *
 * A word that already has a card — in Review, removed from it, or a legacy
 * "known" card — is the same vocabulary item, so adding it back is never a
 * new save and is never blocked. Removing a card does not give the allowance
 * back, so add → remove → add of different words cannot exceed it. The server
 * agrees: putting a card back is an update to an existing item, which its own
 * daily limit does not count (0010_item_sync.sql).
 */
export function saveWordForAccess(context: AccessContext, entry: SavedWord): GuardedSaveWordResult {
  const decision = canSaveNewWord(context);
  if (!decision.allowed) {
    if (hasVocabularyCard(entry.word, entry.lemma)) {
      return { decision: { allowed: true, reason: null, remaining: 0 }, result: addWordToReview(entry) };
    }
    return { decision, result: null };
  }
  const result = addWordToReview(entry);
  if (result.created && result.persisted) recordNewSave();
  return { decision, result };
}
