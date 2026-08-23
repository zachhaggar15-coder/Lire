import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Google sign-in, on top of Supabase Auth.
 *
 * This replaced a passwordless email ("magic link") flow. The link worked, but
 * it made signing in a two-app errand — leave Lire, find the email, come back —
 * which is a poor trade for what is fundamentally "let me get my words back on
 * a new phone", and worse still inside the Android wrapper. Google sign-in
 * completes in place.
 *
 * Supabase stays underneath deliberately. Every user-owned row is keyed on
 * `auth.users.id`, RLS is written against `auth.uid()`, Play subscriptions are
 * owned by that same id, and deletion relies on its cascades. Swapping the
 * identity provider would have meant rebuilding all of that; swapping only the
 * *method* changes nothing below the session.
 *
 * There is no separate sign-up. Supabase creates the account the first time a
 * Google identity authenticates and returns the same user afterwards, so one
 * button covers both cases and Lire never stores a password, username, phone
 * number or date of birth.
 */

export interface AuthResult {
  ok: boolean;
  error: string | null;
}

/**
 * Where to send the reader back to after Google returns.
 *
 * Sign-in is always started from somewhere with intent behind it — Settings to
 * turn on sync, the Premium page to buy — so dropping everyone on the homepage
 * afterwards loses the thread. The caller passes its own path and gets it back.
 */
function redirectUrl(returnPath?: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const origin = window.location.origin;
  if (!returnPath) return origin;
  // Same-origin paths only: an absolute URL here would let a crafted link turn
  // the OAuth callback into an open redirect.
  const safePath = returnPath.startsWith("/") && !returnPath.startsWith("//") ? returnPath : "/";
  return `${origin}${safePath}`;
}

/**
 * Starts Google sign-in, returning to `returnPath` when it completes.
 *
 * Resolves as soon as the redirect is handed off; the session arrives later
 * through onAuthStateChange, which is what callers should react to.
 */
export async function signInWithGoogle(returnPath?: string): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: "Sign-in isn't configured yet." };

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl(returnPath),
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

/** Returns the current Supabase bearer token for authenticated API calls. */
export async function getAccessToken(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const {
    data: { session },
  } = await client.auth.getSession();
  return session?.access_token ?? null;
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
