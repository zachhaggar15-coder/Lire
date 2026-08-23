import { NextResponse } from "next/server";
import { FREE_PREMIUM_STATUS } from "@/lib/premium/types";
import { verifyPlaySubscription } from "@/lib/premium/googlePlay";
import { authenticatedUser } from "@/lib/premium/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const user = await authenticatedUser(request);
  const client = getSupabaseServiceClient();
  if (!user || !client) return NextResponse.json(FREE_PREMIUM_STATUS, { status: user ? 503 : 401 });

  const { data } = await client
    .from("sorlio_subscriptions")
    .select("product_id,purchase_token,status,expires_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return NextResponse.json(FREE_PREMIUM_STATUS);

  try {
    const verified = await verifyPlaySubscription(data.purchase_token, data.product_id);
    await client.from("sorlio_subscriptions").update({
      status: verified.status,
      expires_at: verified.expiresAt,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);
    return NextResponse.json({ isPremium: verified.isPremium, status: verified.status, expiresAt: verified.expiresAt });
  } catch {
    const expiresAt = data.expires_at as string | null;
    const active = ["active", "grace_period", "cancelled"].includes(data.status) && Boolean(expiresAt) && new Date(expiresAt!).getTime() > Date.now();
    return NextResponse.json({ isPremium: active, status: active ? data.status : "expired", expiresAt });
  }
}
