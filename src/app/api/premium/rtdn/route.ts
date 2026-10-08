import { NextResponse } from "next/server";
import { googlePlayApi } from "@/lib/premium/googlePlay";
import { processNotification, verifyPushToken, type DeveloperNotification } from "@/lib/premium/rtdn";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { recordOpsEvent } from "@/lib/server/ops";

/** Google Play Real-time Developer Notifications (Pub/Sub push). See src/lib/premium/rtdn.ts. */

interface PushBody {
  message?: { data?: string; messageId?: string; message_id?: string };
}

export async function POST(request: Request) {
  const authorised = await verifyPushToken(request.headers.get("authorization"), {
    audience: process.env.RTDN_PUSH_AUDIENCE,
    serviceAccount: process.env.RTDN_PUSH_SERVICE_ACCOUNT,
  });
  if (!authorised) {
    void recordOpsEvent("billing.rtdn_rejected");
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const client = getSupabaseServiceClient();
  if (!client) return new NextResponse("Unavailable", { status: 503 });

  const body = (await request.json().catch(() => null)) as PushBody | null;
  const messageId = body?.message?.messageId ?? body?.message?.message_id;
  const data = body?.message?.data;
  if (!messageId || typeof messageId !== "string" || messageId.length > 200 || !data || typeof data !== "string" || data.length > 16_384) {
    // Malformed messages can never succeed; acknowledge so they are not redelivered forever.
    return NextResponse.json({ ok: true, outcome: "malformed" });
  }
  let notification: DeveloperNotification;
  try {
    notification = JSON.parse(Buffer.from(data, "base64").toString("utf8")) as DeveloperNotification;
  } catch {
    return NextResponse.json({ ok: true, outcome: "malformed" });
  }

  try {
    const result = await processNotification({ db: client, messageId, notification, play: googlePlayApi });
    void recordOpsEvent(result.status === 200 ? "billing.rtdn_processed" : "billing.rtdn_failed");
    return NextResponse.json({ ok: result.status === 200, outcome: result.outcome }, { status: result.status });
  } catch {
    void recordOpsEvent("billing.rtdn_failed");
    return new NextResponse("Unavailable", { status: 503 });
  }
}
