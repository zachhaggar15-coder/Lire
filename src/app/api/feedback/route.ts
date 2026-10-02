import { after, NextResponse } from "next/server";
import { normalizeFeedbackInput } from "@/lib/feedback/types";
import { feedbackNotificationHtml } from "@/lib/feedback/email";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { authenticatedUser } from "@/lib/premium/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { appVersion, deploymentEnvironment } from "@/lib/validation/config";

async function sendFeedbackNotification(feedbackData: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[feedback] RESEND_API_KEY not configured");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@sorlio.site",
        to: "sorlio@proton.me",
        subject: `New Sorlio feedback: ${feedbackData.category || "General"}`,
        html: feedbackNotificationHtml(feedbackData),
        text: `New Feedback: ${feedbackData.category}\n\nSentiment: ${feedbackData.sentiment}\nPage: ${feedbackData.page}\nFeature: ${feedbackData.feature}\n\n${feedbackData.comment || ""}`,
      }),
    });

    if (!res.ok) {
      const error = await res.text().catch(() => `HTTP ${res.status}`);
      console.error("[feedback] Email send failed:", error);
      return false;
    }

    console.log("[feedback] Email sent successfully to sorlio@proton.me");
    return true;
  } catch (err) {
    console.error("[feedback] Email error:", err);
    return false;
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!(await rateLimit(`feedback:${ip}`, 20, 60_000))) {
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
  const user = await authenticatedUser(request);
  const feedbackRecord = {
    // Never trust an identity supplied in a public request body.
    user_id: user?.id ?? null,
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
  };

  const { error } = await supabase.from("sorlio_feedback").insert(feedbackRecord);

  if (error) return NextResponse.json({ ok: false, error: "Feedback could not be saved." }, { status: 502 });

  // Keep the serverless invocation alive without delaying the reader's
  // response. Email failure never rolls back feedback already stored.
  after(() => sendFeedbackNotification(feedbackRecord));

  return NextResponse.json({ ok: true });
}
