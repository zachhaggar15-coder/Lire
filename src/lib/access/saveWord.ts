import type { SavedWord } from "@/types";
import { saveWord, type SaveWordResult } from "@/lib/storage";
import { canSaveWord, type AccessContext, type AccessDecision } from "@/lib/access/accessModel";

export interface GuardedSaveWordResult {
  decision: AccessDecision;
  result: SaveWordResult | null;
}

/**
 * The one write path for product vocabulary saves. A visual save control must
 * never outrun the entitlement that permits the underlying persistence.
 */
export function saveWordForAccess(context: AccessContext, entry: SavedWord): GuardedSaveWordResult {
  const decision = canSaveWord(context);
  if (!decision.allowed) return { decision, result: null };
  return { decision, result: saveWord(entry) };
}
