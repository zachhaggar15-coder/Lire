import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token) return new Response("Missing unsubscribe token.", { status: 400 });
  const supabase = getSupabaseServiceClient();
  if (!supabase) return new Response("Unsubscribe is unavailable right now.", { status: 503 });

  const { error } = await supabase
    .from("lire_android_beta_interest")
    .update({ unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("unsubscribe_token", token);

  if (error) return new Response("Could not unsubscribe this address.", { status: 502 });
  return new Response("You have been unsubscribed from Lire Android beta emails.", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
