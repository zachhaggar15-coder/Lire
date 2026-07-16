import { NextResponse } from "next/server";
import { normalizeFeedbackInput } from "@/lib/feedback/types";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { appVersion, deploymentEnvironment } from "@/lib/validation/config";

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`feedback:${ip}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too much feedback too quickly. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = normalizeFeedbackInput(body);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, unavailable: true, error: "Feedback storage is not configured." }, { status: 503 });
  }

  const { value } = parsed;
  const { error } = await supabase.from("lire_feedback").insert({
    user_id: value.userId,
    anonymous_id: value.anonymousId,
    session_id: value.sessionId,
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

  if (error) return NextResponse.json({ ok: false, error: "Feedback could not be saved." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
