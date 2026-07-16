import { NextResponse } from "next/server";
import { normalizeAndroidBetaInput, mergeAndroidBetaMetadata } from "@/lib/beta/android";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { appVersion, deploymentEnvironment, productionDomain, VALIDATION_FEATURES } from "@/lib/validation/config";

function randomToken(): string {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

async function sendConfirmationEmail(email: string, unsubscribeToken: string): Promise<boolean> {
  if (!VALIDATION_FEATURES.emailConfirmationEnabled) return false;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BETA_CONFIRMATION_FROM;
  if (!apiKey || !from) return false;
  const base = productionDomain().replace(/\/$/, "");
  const unsubscribeUrl = `${base}/api/android-beta/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const continueUrl = `${base}/`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "You're on the Lire Android beta list",
      html: `
        <p>Thanks for joining the Lire Android beta list.</p>
        <p>Lire is still evolving, and your interest helps guide what gets built next. We'll contact you when Android testing opens.</p>
        <p>In the meantime, you can continue using Lire on the web.</p>
        <p><a href="${continueUrl}">Continue reading</a></p>
        <p style="font-size:12px;color:#666">You can <a href="${unsubscribeUrl}">unsubscribe</a> at any time.</p>
      `,
      text: `Thanks for joining the Lire Android beta list.\n\nLire is still evolving, and your interest helps guide what gets built next. We'll contact you when Android testing opens.\n\nContinue reading: ${continueUrl}\n\nUnsubscribe: ${unsubscribeUrl}`,
    }),
  });
  return res.ok;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`android-beta:${ip}`, 12, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many beta registrations. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = normalizeAndroidBetaInput(body);
  if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, unavailable: true, error: "Beta registration is temporarily unavailable." }, { status: 503 });
  }

  const now = new Date().toISOString();
  const { data: existing, error: readError } = await supabase
    .from("lire_android_beta_interest")
    .select("*")
    .eq("email_normalized", parsed.value.emailNormalized)
    .maybeSingle();
  if (readError) return NextResponse.json({ ok: false, error: "Could not check beta registration." }, { status: 502 });

  const unsubscribeToken = typeof existing?.unsubscribe_token === "string" ? existing.unsubscribe_token : randomToken();
  const row = {
    ...mergeAndroidBetaMetadata(existing, parsed.value, now),
    anonymous_id: parsed.value.context.anonymousId,
    user_id: null,
    app_version: appVersion(),
    deployment_environment: deploymentEnvironment(),
    consent_source: parsed.value.source,
    consent_at: existing?.consent_at ?? now,
    unsubscribe_token: unsubscribeToken,
    unsubscribed_at: null,
    created_at: existing?.created_at ?? now,
  };

  const { error } = await supabase
    .from("lire_android_beta_interest")
    .upsert(row, { onConflict: "email_normalized" });

  if (error) return NextResponse.json({ ok: false, error: "Could not save beta registration." }, { status: 502 });

  let confirmationSent = false;
  try {
    confirmationSent = await sendConfirmationEmail(parsed.value.email, unsubscribeToken);
    if (confirmationSent) {
      await supabase
        .from("lire_android_beta_interest")
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq("email_normalized", parsed.value.emailNormalized);
    }
  } catch {
    confirmationSent = false;
  }

  return NextResponse.json({ ok: true, duplicate: !!existing, confirmationSent });
}
