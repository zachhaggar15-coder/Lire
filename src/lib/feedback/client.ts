import { getOptionalBearerHeaders } from "@/lib/supabase/auth";
import type { FeedbackInput } from "@/lib/feedback/types";

/**
 * Sends feedback or a content report to Sorlio. Reports a real outcome: the
 * UI thanks the reader only when the server stored it.
 *
 * No device or session identifiers are sent. When signed in, the bearer token
 * lets the server attach the account (so deleting the account deletes the
 * feedback); signed-out feedback is anonymous.
 */
export async function submitFeedback(input: FeedbackInput): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getOptionalBearerHeaders()) },
      body: JSON.stringify(input),
    });
    if (response.ok) return { ok: true };
    if (response.status === 429) return { ok: false, error: "You've sent a lot of feedback just now. Please try again in a minute." };
    return { ok: false, error: "Couldn't send that just now. Please try again." };
  } catch {
    return { ok: false, error: "You're offline or Sorlio can't be reached. Please try again later." };
  }
}
