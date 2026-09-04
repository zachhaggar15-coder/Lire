import { NextResponse } from "next/server";
import { normalizeFeedbackInput } from "@/lib/feedback/types";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { appVersion, deploymentEnvironment } from "@/lib/validation/config";

async function sendFeedbackNotification(feedbackData: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

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
        html: `
          <h2>New Feedback Received</h2>
          <p><strong>Category:</strong> ${feedbackData.category || "N/A"}</p>
          <p><strong>Sentiment:</strong> ${feedbackData.sentiment || "N/A"}</p>
          <p><strong>Page:</strong> ${feedbackData.page || "N/A"}</p>
          <p><strong>Feature:</strong> ${feedbackData.feature || "N/A"}</p>
          <p><strong>App Version:</strong> ${feedbackData.app_version || "N/A"}</p>
          <p><strong>Deployment:</strong> ${feedbackData.deployment_environment || "N/A"}</p>
          ${feedbackData.comment ? `<p><strong>Comment:</strong></p><p>${(feedbackData.comment as string).replace(/\n/g, "<br>")}</p>` : ""}
          ${feedbackData.affected_term ? `<p><strong>Affected Term:</strong> ${feedbackData.affected_term}</p>` : ""}
          ${feedbackData.article_id ? `<p><strong>Article ID:</strong> ${feedbackData.article_id}</p>` : ""}
          <hr>
          <p style="font-size:12px;color:#666">User ID: ${feedbackData.user_id || "Anonymous"} | Session: ${feedbackData.session_id || "N/A"}</p>
        `,
        text: `New Feedback: ${feedbackData.category}\n\nSentiment: ${feedbackData.sentiment}\nPage: ${feedbackData.page}\nFeature: ${feedbackData.feature}\n\n${feedbackData.comment || ""}`,
      }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

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
  const feedbackRecord = {
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
  };

  const { error } = await supabase.from("sorlio_feedback").insert(feedbackRecord);

  if (error) return NextResponse.json({ ok: false, error: "Feedback could not be saved." }, { status: 502 });

  // Send notification email (don't block on failure)
  sendFeedbackNotification(feedbackRecord).catch(() => {});

  return NextResponse.json({ ok: true });
}
