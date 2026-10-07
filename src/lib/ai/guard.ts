import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authenticatedUser } from "@/lib/premium/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AI_FRESH_MS, currentEntitlement } from "@/lib/premium/entitlement";
import { googlePlayApi } from "@/lib/premium/googlePlay";
import { recordOpsEvent } from "@/lib/server/ops";
import { AiNotConfiguredError, AiProviderError } from "@/lib/ai/openai";

/**
 * The gate in front of every AI route.
 *
 * These four endpoints are the only place in the app where an incoming request
 * spends money, so they are the only place that needs a gate this strict.
 * Until this existed they accepted unauthenticated POSTs and forwarded the
 * body straight to OpenAI on the project's API key — a loop against
 * /api/ai/explain-sentence billed the developer with nothing to stop it.
 *
 * Nothing here is a new product rule. accessModel.ts already declared
 * aiExplanation and practice to be Premium features; that decision was simply
 * never enforced anywhere but the UI, which the client controls. This moves
 * the existing rule to the server, where it means something.
 */

/** Anti-abuse ceiling, not a product limit — see supabase/migrations/0008_ai_usage.sql. */
const DEFAULT_DAILY_AI_CALL_LIMIT = 300;

export function dailyAiCallLimit(): number {
  const configured = Number(process.env.AI_DAILY_CALL_LIMIT);
  return Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : DEFAULT_DAILY_AI_CALL_LIMIT;
}

export interface AiCaller {
  entitlement: "subscription";
  userId: string | null;
  client: SupabaseClient | null;
}

/** A ready-to-return refusal, or the caller that passed every check. */
export type AiGateResult = { ok: true; caller: AiCaller } | { ok: false; response: NextResponse };

/**
 * Premium, as decided by the server's entitlement authority. A stored
 * subscription older than AI_FRESH_MS is re-verified with Google before it can
 * spend money, so a refund or revocation is noticed within a day even if the
 * Real-time Developer Notification was missed.
 */
async function hasActivePremium(client: SupabaseClient, userId: string): Promise<boolean> {
  const view = await currentEntitlement({ db: client, play: googlePlayApi, userId, freshMs: AI_FRESH_MS });
  return view.isPremium;
}

/**
 * Authenticates the request, requires an active subscription, and books one
 * call against today's budget.
 *
 * The budget is consumed before the OpenAI call rather than after, so a
 * request that times out or fails upstream still counts. That is the safer
 * direction to be wrong in: the alternative lets a caller spend money
 * repeatedly by triggering failures.
 */
export async function requirePaidAiCaller(request: Request): Promise<AiGateResult> {
  const client = getSupabaseServiceClient();
  if (!client) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "AI is not configured.", code: "not_configured" },
        { status: 503 }
      ),
    };
  }

  const user = await authenticatedUser(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sign in to use AI features.", code: "needs-account" },
        { status: 401 }
      ),
    };
  }

  let premium: boolean;
  try {
    premium = await hasActivePremium(client, user.id);
  } catch {
    void recordOpsEvent("billing.verify_unavailable");
    return {
      ok: false,
      response: NextResponse.json(
        { error: "AI help isn't available right now. Please try again shortly.", code: "entitlement_unavailable" },
        { status: 503 }
      ),
    };
  }
  if (!premium) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "AI features are part of Premium.", code: "needs-premium" },
        { status: 402 }
      ),
    };
  }

  const { data: allowed, error } = await client.rpc("sorlio_consume_ai_call", {
    p_user_id: user.id,
    p_limit: dailyAiCallLimit(),
  });

  // A missing function means migration 0008 has not been applied. Fail closed:
  // an unmetered AI endpoint is the exact problem this file exists to prevent.
  if (error) {
    void recordOpsEvent("ai.quota_unavailable");
    return {
      ok: false,
      response: NextResponse.json(
        { error: "AI help isn't available right now. Please try again shortly.", code: "quota_unavailable" },
        { status: 503 }
      ),
    };
  }

  if (allowed !== true) {
    void recordOpsEvent("ai.quota_exhausted");
    return {
      ok: false,
      response: NextResponse.json(
        { error: "You have reached today's AI limit. It resets tomorrow.", code: "rate_limited" },
        { status: 429 }
      ),
    };
  }

  return { ok: true, caller: { entitlement: "subscription", userId: user.id, client } };
}

/**
 * Input ceilings.
 *
 * Cost scales with input length, and the routes previously checked only that
 * a field was a non-empty string — so a single request could carry megabytes
 * of text. These are far above any real sentence or article and exist to stop
 * that, not to constrain normal use.
 */
export const MAX_TEXT_CHARS = 2_000;
export const MAX_TITLE_CHARS = 300;
export const MAX_ARTICLE_SENTENCES = 200;
export const MAX_ARTICLE_TOTAL_CHARS = 60_000;

/** Rejects a field that is missing, empty, or implausibly long. */
export function requireText(value: unknown, field: string, max = MAX_TEXT_CHARS): { ok: true; value: string } | { ok: false; response: NextResponse } {
  if (typeof value !== "string" || !value.trim()) {
    return { ok: false, response: NextResponse.json({ error: "Something was missing from the request.", field }, { status: 400 }) };
  }
  if (value.length > max) {
    return {
      ok: false,
      response: NextResponse.json({ error: "That's too much text for AI help in one go.", field }, { status: 400 }),
    };
  }
  return { ok: true, value };
}

/** Truncates an optional field instead of rejecting it — context is nice to have, never worth a 400. */
export function optionalText(value: unknown, max = MAX_TEXT_CHARS): string | null {
  return typeof value === "string" && value ? value.slice(0, max) : null;
}

/**
 * The learner level put into prompts. Only the six CEFR codes are accepted;
 * anything else (including free text a client might send to steer the model)
 * falls back to the default. The level never reaches the prompt verbatim.
 */
const CEFR = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
export function learnerLevel(value: unknown): string {
  const code = typeof value === "string" ? value.trim().toUpperCase().slice(0, 2) : "";
  return CEFR.has(code) ? `CEFR ${code} French learner` : "A2/B1 French learner";
}

/**
 * Turns any AI failure into a short, honest message. Provider details are
 * never returned to the client.
 */
export function aiFailureResponse(error: unknown): NextResponse {
  if (error instanceof AiNotConfiguredError) {
    void recordOpsEvent("ai.not_configured");
    return NextResponse.json({ error: "AI help isn't available right now.", code: "not_configured" }, { status: 503 });
  }
  void recordOpsEvent("ai.provider_error");
  if (error instanceof AiProviderError) console.warn(JSON.stringify({ sorlio_ai_provider_status: error.status }));
  return NextResponse.json({ error: "AI help couldn't answer just now. Please try again.", code: "provider_error" }, { status: 502 });
}
