import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authenticatedUser } from "@/lib/premium/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

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
  userId: string;
  client: SupabaseClient;
}

/** A ready-to-return refusal, or the caller that passed every check. */
export type AiGateResult = { ok: true; caller: AiCaller } | { ok: false; response: NextResponse };

/**
 * Subscription state as this project already models it.
 *
 * Reads the stored entitlement rather than re-verifying against Google on
 * every AI call: /api/premium/status re-verifies whenever the client loads,
 * so the row is kept fresh there. Doing it here too would add a Google
 * round-trip to every explanation for no extra safety.
 *
 * "cancelled" still counts while unexpired — a reader who cancelled has paid
 * through the end of the period and should keep what they paid for.
 */
async function hasActivePremium(client: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await client
    .from("sorlio_subscriptions")
    .select("status,expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return false;

  const expiresAt = data.expires_at as string | null;
  const withinPaidPeriod = !!expiresAt && new Date(expiresAt).getTime() > Date.now();
  return ["active", "grace_period", "cancelled"].includes(data.status as string) && withinPaidPeriod;
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

  if (!(await hasActivePremium(client, user.id))) {
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
    return {
      ok: false,
      response: NextResponse.json(
        { error: "AI is temporarily unavailable.", code: "quota_unavailable" },
        { status: 503 }
      ),
    };
  }

  if (allowed !== true) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "You have reached today's AI limit. It resets tomorrow.", code: "rate_limited" },
        { status: 429 }
      ),
    };
  }

  return { ok: true, caller: { userId: user.id, client } };
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
    return { ok: false, response: NextResponse.json({ error: `'${field}' is a required string.` }, { status: 400 }) };
  }
  if (value.length > max) {
    return {
      ok: false,
      response: NextResponse.json({ error: `'${field}' is too long (max ${max} characters).` }, { status: 400 }),
    };
  }
  return { ok: true, value };
}

/** Truncates an optional field instead of rejecting it — context is nice to have, never worth a 400. */
export function optionalText(value: unknown, max = MAX_TEXT_CHARS): string | null {
  return typeof value === "string" && value ? value.slice(0, max) : null;
}
