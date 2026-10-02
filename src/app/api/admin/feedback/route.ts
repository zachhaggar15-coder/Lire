import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { hasValidationAdminToken } from "@/lib/validation/adminAuth";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";

const MAX_LIMIT = 100;
const NO_STORE_HEADERS = { "Cache-Control": "private, no-store, max-age=0" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

export async function GET(request: Request) {
  if (!(await rateLimit(`admin-feedback:${clientIp(request)}`, 30, 60_000))) {
    return json({ ok: false, error: "Too many requests. Please try again later." }, 429);
  }
  if (!hasValidationAdminToken(request)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return json({ ok: false, error: "Feedback storage is not configured." }, 503);
  }

  const rawLimit = Number(new URL(request.url).searchParams.get("limit") ?? MAX_LIMIT);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(MAX_LIMIT, Math.floor(rawLimit))) : MAX_LIMIT;
  const { data, error } = await supabase
    .from("sorlio_feedback")
    .select("id,user_id,anonymous_id,session_id,category,sentiment,page,feature,article_id,affected_term,comment,app_version,deployment_environment,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return json({ ok: false, error: "Feedback could not be loaded." }, 502);
  return json({ ok: true, feedback: data ?? [] });
}
