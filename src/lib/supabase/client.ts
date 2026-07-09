import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Entirely optional — the app works exactly as before (localStorage-only)
 * if `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` aren't set,
 * same posture as the optional Upstash Redis (rssTextStore.ts) and OpenAI
 * (ai/openai.ts) integrations. See "Cross-device sync" in the README for
 * the exact setup steps.
 */

let cached: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cached = url && anonKey ? createClient(url, anonKey) : null;
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}
