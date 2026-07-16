import { NextResponse } from "next/server";
import {
  buildAdminValidationReport,
  type AnalyticsEventRow,
  type AndroidBetaRow,
  type FeedbackRow,
  type ResearchPromptRow,
} from "@/lib/validation/admin";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

function authorized(request: Request): boolean {
  const token = process.env.VALIDATION_ADMIN_TOKEN;
  if (!token) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${token}`;
}

function defaultFrom(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase service role is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from") || defaultFrom();
  const to = url.searchParams.get("to") || new Date().toISOString();
  const source = url.searchParams.get("source");
  const environment = url.searchParams.get("environment");

  let eventQuery = supabase
    .from("lire_analytics_events")
    .select("id,event_name,anonymous_id,user_id,session_id,payload,app_version,deployment_environment,created_at")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (environment && environment !== "all") eventQuery = eventQuery.eq("deployment_environment", environment);

  const betaQuery = supabase
    .from("lire_android_beta_interest")
    .select("email_normalized,anonymous_id,user_id,source,french_level,uses_android,motivation,desired_improvement,first_touch_source,is_returning_user,articles_completed,reading_sessions_completed,created_at")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false })
    .limit(2000);

  const feedbackQuery = supabase
    .from("lire_feedback")
    .select("category,sentiment,page,feature,comment,anonymous_id,user_id,created_at")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false })
    .limit(2000);

  const researchQuery = supabase
    .from("lire_research_prompt_responses")
    .select("prompt_type,response,comment,created_at")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false })
    .limit(2000);

  const [eventResult, betaResult, feedbackResult, researchResult] = await Promise.all([
    eventQuery,
    betaQuery,
    feedbackQuery,
    researchQuery,
  ]);
  if (eventResult.error || betaResult.error || feedbackResult.error || researchResult.error) {
    return NextResponse.json({ ok: false, error: "Could not load validation data." }, { status: 502 });
  }

  let events = (eventResult.data ?? []) as AnalyticsEventRow[];
  let beta = (betaResult.data ?? []) as AndroidBetaRow[];
  let feedback = (feedbackResult.data ?? []) as FeedbackRow[];
  const research = (researchResult.data ?? []) as ResearchPromptRow[];

  if (source && source !== "all") {
    events = events.filter((event) => event.payload?.acquisitionSource === source);
    beta = beta.filter((row) => (row.first_touch_source ?? row.source) === source);
    feedback = feedback.filter((row) => {
      const key = row.user_id || row.anonymous_id;
      return !key || events.some((event) => (event.user_id || event.anonymous_id) === key);
    });
  }

  return NextResponse.json({
    ok: true,
    report: buildAdminValidationReport({ events, beta, feedback, research, from, to }),
  });
}
