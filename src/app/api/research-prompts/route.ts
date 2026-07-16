import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { appVersion, deploymentEnvironment } from "@/lib/validation/config";

const PROMPT_TYPES = new Set(["session_reaction", "return_reason", "disappearance_survey", "android_beta_prompt"]);

function clean(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`research:${ip}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many responses. Please try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const promptType = clean(body.promptType, 80);
  const response = clean(body.response, 500);
  if (!promptType || !PROMPT_TYPES.has(promptType)) return NextResponse.json({ ok: false, error: "Unknown prompt type." }, { status: 400 });
  if (!response) return NextResponse.json({ ok: false, error: "Missing prompt response." }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ ok: false, unavailable: true, error: "Research response storage is not configured." }, { status: 503 });

  const { error } = await supabase.from("lire_research_prompt_responses").insert({
    prompt_type: promptType,
    response,
    comment: clean(body.comment, 2000),
    anonymous_id: clean(body.anonymousId, 160),
    user_id: clean(body.userId, 160),
    session_id: clean(body.sessionId, 160),
    page: clean(body.page, 300) ?? "/",
    behavioural_context: body.context && typeof body.context === "object" ? body.context : {},
    app_version: appVersion(),
    deployment_environment: deploymentEnvironment(),
  });

  if (error) return NextResponse.json({ ok: false, error: "Response could not be saved." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
