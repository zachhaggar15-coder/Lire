import { NextResponse } from "next/server";
import { normalizeFeedbackInput } from "@/lib/feedback/types";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { authenticatedUser } from "@/lib/premium/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { appVersion, deploymentEnvironment } from "@/lib/config";
import { recordOpsEvent } from "@/lib/server/ops";

/**
 * Feedback and content reports.
 *
 * Stored in Sorlio's database only (read in the protected admin view). No
 * e-mail copies, no device or session identifiers. When the sender is signed
 * in, the verified account id is stored so that deleting the account deletes
 * the feedback; otherwise the row is anonymous. Retained 12 months
 * (sorlio_maintenance).
 */

const MAX_BODY_BYTES = 8_192;

export async function POST(request: Request) {
  if (!(await rateLimit(`feedback:${clientIp(request)}`, 10, 60_000))) {
    return NextResponse.json({ ok: false, error: "Too much feedback too quickly. Please try again later." }, { status: 429 });
  }
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "Feedback is too long." }, { status: 413 });

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "Feedback is too long." }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid feedback." }, { status: 400 });
  }

  const parsed = normalizeFeedbackInput(body);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Feedback can't be sent right now." }, { status: 503 });

  const { value } = parsed;
  // Identity comes only from a verified bearer token, never from the body.
  const user = await authenticatedUser(request);
  const { error } = await supabase.from("sorlio_feedback").insert({
    user_id: user?.id ?? null,
    category: value.category,
    sentiment: value.sentiment,
    page: value.page,
    feature: value.feature,
    article_id: value.articleId,
    affected_term: value.affectedTerm,
    comment: value.comment,
    app_version: appVersion(),
    deployment_environment: deploymentEnvironment(),
  });
  if (error) return NextResponse.json({ ok: false, error: "Feedback couldn't be saved. Please try again." }, { status: 502 });
  void recordOpsEvent("feedback.stored");
  return NextResponse.json({ ok: true });
}
