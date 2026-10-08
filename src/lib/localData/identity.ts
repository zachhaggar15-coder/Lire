/**
 * Who owns the local data this tab is reading and writing.
 *
 * Sorlio is local-first, so the device holds real learning data — saved words,
 * reading history, private imported texts. Before this module existed all of
 * it lived in one global set of `lire.*` keys, which meant that when account A
 * signed out and account B signed in on the same device, A's data was merged
 * into B and uploaded to B's cloud copy (and A's deletions removed B's items).
 *
 * Every learning key is now stored inside a partition owned by exactly one
 * identity:
 *
 *   guest                 → data created while signed out
 *   account:<auth user id> → data belonging to that account
 *
 * A partition is never read on behalf of a different identity. Moving guest
 * data into an account is an explicit, user-confirmed operation (see
 * guestAdoption.ts); nothing else crosses a partition boundary.
 *
 * The identity is resolved synchronously at startup from the Supabase session
 * stored on the device, so the very first render already reads the right
 * partition. Identity changes after startup (sign-in, sign-out, account
 * deletion, a sign-out in another tab) reload the page — see
 * IdentityController — so no component can keep showing one account's data
 * while another is signed in.
 */

export type Identity = { kind: "guest" } | { kind: "account"; userId: string };

export const GUEST: Identity = Object.freeze({ kind: "guest" }) as Identity;

/** Device-level record of the identity whose partition is active. */
export const ACTIVE_IDENTITY_KEY = "sorlio.identity.active.v1";

/** Device-level list of accounts deleted on this device; their partitions must never be recreated. */
export const DELETED_ACCOUNTS_KEY = "sorlio.identity.deletedAccounts.v1";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUserId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function accountIdentity(userId: string): Identity {
  if (!isValidUserId(userId)) throw new Error("Invalid account id");
  return { kind: "account", userId: userId.toLowerCase() };
}

export function identityId(identity: Identity): string {
  return identity.kind === "guest" ? "guest" : `acct.${identity.userId}`;
}

export function sameIdentity(a: Identity | null | undefined, b: Identity | null | undefined): boolean {
  if (!a || !b) return false;
  if (a.kind !== b.kind) return false;
  return a.kind === "guest" || (b.kind === "account" && a.userId === b.userId);
}

export function parseIdentityId(value: unknown): Identity | null {
  if (value === "guest") return GUEST;
  if (typeof value === "string" && value.startsWith("acct.") && isValidUserId(value.slice(5))) {
    return accountIdentity(value.slice(5));
  }
  return null;
}

function rawStorage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * The Supabase session key for this deployment's project, derived the same way
 * supabase-js derives it (`sb-<project ref>-auth-token`).
 */
export function supabaseSessionKey(supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL): string | null {
  if (!supabaseUrl) return null;
  try {
    return `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
  } catch {
    return null;
  }
}

/**
 * The account id held in the device's Supabase session, read synchronously.
 *
 * Only used to pick the partition for the first render. Supabase still
 * validates the session asynchronously; if it turns out to be invalid the auth
 * listener reports SIGNED_OUT and the tab switches to guest.
 */
export function sessionUserIdFromStorage(storage: Pick<Storage, "getItem"> | null = rawStorage()): string | null {
  const key = supabaseSessionKey();
  if (!storage || !key) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: { id?: unknown }; currentSession?: { user?: { id?: unknown } } } | null;
    const id = parsed?.user?.id ?? parsed?.currentSession?.user?.id;
    return isValidUserId(id) ? id.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function readDeletedAccounts(storage: Pick<Storage, "getItem"> | null = rawStorage()): Set<string> {
  if (!storage) return new Set();
  try {
    const parsed = JSON.parse(storage.getItem(DELETED_ACCOUNTS_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter(isValidUserId).map((id: string) => id.toLowerCase()) : []);
  } catch {
    return new Set();
  }
}

export function isDeletedAccount(userId: string): boolean {
  return readDeletedAccounts().has(userId.toLowerCase());
}

export function rememberDeletedAccount(userId: string): void {
  const storage = rawStorage();
  if (!storage || !isValidUserId(userId)) return;
  const ids = readDeletedAccounts(storage);
  ids.add(userId.toLowerCase());
  try {
    storage.setItem(DELETED_ACCOUNTS_KEY, JSON.stringify([...ids].slice(-50)));
  } catch {
    // The in-memory generation bump in localStore still stops in-flight work.
  }
}

/** The identity the device should start in, before any network work. */
export function initialIdentity(storage: Pick<Storage, "getItem"> | null = rawStorage()): Identity {
  const sessionUser = sessionUserIdFromStorage(storage);
  if (sessionUser && !readDeletedAccounts(storage).has(sessionUser)) return accountIdentity(sessionUser);
  return GUEST;
}
