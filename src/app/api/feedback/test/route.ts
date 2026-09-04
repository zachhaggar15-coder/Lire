import { NextResponse } from "next/server";
import { normalizeFeedbackInput } from "@/lib/feedback/types";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
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

export async function POST() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Feedback storage is not configured." }, { status: 503 });
  }

  const feedbackRecord = {
    user_id: null,
    anonymous_id: "test-" + Math.random().toString(36).slice(2),
    session_id: "test-session-" + new Date().getTime(),
    category: "test",
    sentiment: "neutral",
    page: "/admin/feedback",
    feature: "email-notification",
    article_id: null,
    affected_term: null,
    comment:
      "This is a test feedback email.\n\nYou should see this comment both:\n1. In the email to sorlio@proton.me\n2. In the feedback dashboard at /admin/feedback",
    app_version: appVersion(),
    deployment_environment: deploymentEnvironment(),
  };

  const { error } = await supabase.from("sorlio_feedback").insert(feedbackRecord);

  if (error) return NextResponse.json({ ok: false, error: "Feedback could not be saved." }, { status: 502 });

  sendFeedbackNotification(feedbackRecord).catch(() => {});

  return NextResponse.json({ ok: true, message: "Test feedback submitted. Check your email and /admin/feedback." });
}
