import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Passwordless email ("magic link") auth — no password to set, reset, or
 * store. Chosen over a password flow specifically because this app has no
 * existing account system to migrate and no support burden appetite for
 * password resets; a link is also the lowest-friction option for what's
 * fundamentally a "let me get my words back on a new phone" feature.
 */

export interface AuthResult {
  ok: boolean;
  error: string | null;
}

/** Sends a sign-in link to the given email. The link redirects back to whatever origin the request was made from (works for both localhost and production without extra config). */
export async function sendMagicLink(email: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: "Sync isn't configured yet." };

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  });
  return { ok: !error, error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}

/** Fires `callback` on sign-in/sign-out/token refresh. Returns an unsubscribe function. */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}
