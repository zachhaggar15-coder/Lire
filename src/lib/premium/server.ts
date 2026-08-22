import type { User } from "@supabase/supabase-js";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function authenticatedUser(request: Request): Promise<User | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const client = getSupabaseServiceClient();
  if (!token || !client) return null;
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user;
}

export const PREMIUM_PRODUCT_ID = process.env.GOOGLE_PLAY_PREMIUM_PRODUCT_ID || "lire_premium_monthly";
