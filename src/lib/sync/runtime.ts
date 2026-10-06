import { getSupabaseClient } from "@/lib/supabase/client";
import { isDeletedAccount, sameIdentity, type Identity } from "@/lib/localData/identity";
import { activeIdentity, currentGeneration, isCurrentGeneration, storeFor } from "@/lib/localData/store";
import { readSyncState, syncPartition, type SaveQuotaInfo, type SyncOutcome } from "@/lib/sync/engine";
import { configForKey } from "@/lib/sync/stores";
import { supabaseTransport } from "@/lib/sync/transport";

/**
 * When and how sync runs in the browser.
 *
 * Sync is pinned to the identity that was active when it started. If the tab
 * switches identity, or the account is deleted, while a sync is in flight, the
 * engine stops before touching local data, and the server refuses its writes
 * because they name the old account.
 */

export type SyncPhase = "idle" | "syncing" | "success" | "partial" | "error" | "offline";

export interface SyncStatus {
  phase: SyncPhase;
  lastSuccessAt: string | null;
  /** Plain-language explanation when the phase is partial/error/offline. */
  message: string | null;
}

const STATUS_EVENT = "sorlio-sync-status";
const DEBOUNCE_MS = 1500;

let status: SyncStatus | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let running: Promise<SyncOutcome | null> | null = null;
let rerun = false;
let listenersInstalled = false;

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function setStatus(next: SyncStatus): void {
  status = next;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<SyncStatus>(STATUS_EVENT, { detail: next }));
}

export function getSyncStatus(): SyncStatus {
  if (status) return status;
  const identity = activeIdentity();
  if (identity.kind !== "account") return { phase: "idle", lastSuccessAt: null, message: null };
  return { phase: "idle", lastSuccessAt: readSyncState(storeFor(identity)).lastSuccessAt, message: null };
}

export function subscribeToSyncStatus(callback: (status: SyncStatus) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => callback((event as CustomEvent<SyncStatus>).detail);
  window.addEventListener(STATUS_EVENT, handler);
  return () => window.removeEventListener(STATUS_EVENT, handler);
}

/** The server's view of today's free save allowance, from the last sync. */
export function lastKnownSaveQuota(identity: Identity = activeIdentity()): SaveQuotaInfo | null {
  if (identity.kind !== "account") return null;
  return readSyncState(storeFor(identity)).saveQuota;
}

/** Call after any write to a synced store. Debounced; a no-op for guests. */
export function notifyStoreChanged(key: string): void {
  if (!configForKey(key)) return;
  requestSync();
}

/**
 * Pages where account data must not be downloaded into the browser: someone
 * deleting their account from a borrowed computer should not leave a full
 * copy of it behind.
 */
function syncSuppressedHere(): boolean {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/account/delete");
}

export function requestSync(): void {
  if (typeof window === "undefined") return;
  installListeners();
  if (activeIdentity().kind !== "account" || syncSuppressedHere()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void syncNow();
  }, DEBOUNCE_MS);
}

async function withCrossTabLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== "undefined" ? (navigator as Navigator & { locks?: LockManager }).locks : undefined;
  if (!locks?.request) return fn();
  return locks.request(name, fn) as Promise<T>;
}

/** Runs a sync now (or joins the one already running). Resolves with its outcome. */
export async function syncNow(): Promise<SyncOutcome | null> {
  if (running) {
    rerun = true;
    return running;
  }
  running = runOnce().finally(() => {
    running = null;
    if (rerun) {
      rerun = false;
      requestSync();
    }
  });
  return running;
}

async function runOnce(): Promise<SyncOutcome | null> {
  const identity = activeIdentity();
  if (identity.kind !== "account" || syncSuppressedHere()) return null;
  const generation = currentGeneration();
  const client = getSupabaseClient();
  if (!client) return null;
  const lastSuccessAt = readSyncState(storeFor(identity)).lastSuccessAt;

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    setStatus({ phase: "offline", lastSuccessAt, message: "You're offline. Changes are saved on this device and will sync when you reconnect." });
    return null;
  }

  const stillCurrent = () =>
    isCurrentGeneration(generation) && sameIdentity(activeIdentity(), identity) && !isDeletedAccount(identity.userId);

  // The session on this device must still be the account whose partition we
  // are about to sync. If another tab signed in as someone else, stop.
  const { data } = await client.auth.getSession();
  if (!stillCurrent() || data.session?.user.id.toLowerCase() !== identity.userId) return null;

  setStatus({ phase: "syncing", lastSuccessAt, message: null });
  const outcome = await withCrossTabLock(`sorlio-sync:${identity.userId}`, () =>
    syncPartition({
      userId: identity.userId,
      store: storeFor(identity),
      transport: supabaseTransport(client),
      stillCurrent,
      today,
    }),
  );
  if (!stillCurrent()) return outcome;

  const after = readSyncState(storeFor(identity)).lastSuccessAt;
  if (outcome.status === "success") setStatus({ phase: "success", lastSuccessAt: after, message: null });
  else if (outcome.status === "partial") setStatus({ phase: "partial", lastSuccessAt: after, message: outcome.message });
  else if (outcome.status === "error") setStatus({ phase: "error", lastSuccessAt: after, message: outcome.message });
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("sorlio-sync-complete", { detail: outcome }));
  return outcome;
}

function installListeners(): void {
  if (listenersInstalled || typeof window === "undefined" || typeof document === "undefined") return;
  listenersInstalled = true;
  window.addEventListener("online", () => requestSync());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") requestSync();
  });
}

/** Test seam. */
export function __resetSyncRuntimeForTests(): void {
  status = null;
  if (timer) clearTimeout(timer);
  timer = null;
  running = null;
  rerun = false;
}
