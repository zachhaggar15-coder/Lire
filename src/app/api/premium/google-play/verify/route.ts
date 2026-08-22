import { NextResponse } from "next/server";
import { verifyPlaySubscription } from "@/lib/premium/googlePlay";
import { authenticatedUser, PREMIUM_PRODUCT_ID } from "@/lib/premium/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  const client = getSupabaseServiceClient();
  if (!user) return NextResponse.json({ error: "Sign in before subscribing." }, { status: 401 });
  if (!client) return NextResponse.json({ error: "Premium storage is not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { purchaseToken?: string; productId?: string } | null;
  if (!body?.purchaseToken || body.productId !== PREMIUM_PRODUCT_ID) {
    return NextResponse.json({ error: "Invalid Premium purchase." }, { status: 400 });
  }

  try {
    const verified = await verifyPlaySubscription(body.purchaseToken, PREMIUM_PRODUCT_ID);
    const { error } = await client.from("lire_subscriptions").upsert({
      user_id: user.id,
      provider: "google_play",
      product_id: verified.productId,
      purchase_token: verified.purchaseToken,
      status: verified.status,
      expires_at: verified.expiresAt,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return NextResponse.json({ isPremium: verified.isPremium, status: verified.status, expiresAt: verified.expiresAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
