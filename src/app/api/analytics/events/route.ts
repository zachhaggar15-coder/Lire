import { NextResponse } from "next/server";
import { isAnalyticsEventName, validateAnalyticsPayload, type AnalyticsEvent } from "@/lib/analytics/events";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { authenticatedUser } from "@/lib/premium/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { appVersion, deploymentEnvironment } from "@/lib/validation/config";

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!(await rateLimit(`analytics:${ip}`, 240, 60_000))) {
    return NextResponse.json({ ok: false, error: "Too many analytics events." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const event = (body ?? {}) as Partial<AnalyticsEvent>;
  if (typeof event.name !== "string" || !isAnalyticsEventName(event.name)) {
    return NextResponse.json({ ok: false, error: "Unknown analytics event." }, { status: 400 });
  }
  const payload = event.payload && typeof event.payload === "object" ? event.payload : {};
  const valid = validateAnalyticsPayload(event.name, payload);
  if (!valid.ok) return NextResponse.json({ ok: false, error: valid.error }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, unavailable: true, error: "Analytics storage is not configured." }, { status: 503 });
  }

  const user = await authenticatedUser(request);
  const { error } = await supabase.from("sorlio_analytics_events").insert({
    event_name: event.name,
    anonymous_id: typeof event.anonymousId === "string" ? event.anonymousId : null,
    // A body field is not evidence of identity. Only a verified bearer token
    // can associate an event with an account.
    user_id: user?.id ?? null,
    session_id: typeof event.sessionId === "string" ? event.sessionId : null,
    payload,
    app_version: appVersion(),
    deployment_environment: deploymentEnvironment(),
    created_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ ok: false, error: "Analytics event could not be stored." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
