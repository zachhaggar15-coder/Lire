import type { SupabaseClient } from "@supabase/supabase-js";
import type { PullResponse, PushOp, PushResponse, SyncTransport } from "@/lib/sync/engine";

/** The sync engine's server calls, as Supabase RPCs (see 0010_item_sync.sql). */
export function supabaseTransport(client: Pick<SupabaseClient, "rpc">): SyncTransport {
  return {
    async pull(expectedUser, afterRev, limit) {
      const { data, error } = await client.rpc("sorlio_sync_pull", {
        p_expected_user: expectedUser,
        p_after_rev: afterRev,
        p_limit: limit,
      });
      if (error) throw new Error(error.message || "sync_pull_failed");
      if (!data || typeof data !== "object") throw new Error("sync_pull_invalid");
      return data as PullResponse;
    },
    async push(expectedUser, ops: PushOp[], day) {
      const { data, error } = await client.rpc("sorlio_sync_push", {
        p_expected_user: expectedUser,
        p_ops: ops,
        p_day: day,
      });
      if (error) throw new Error(error.message || "sync_push_failed");
      if (!data || typeof data !== "object") throw new Error("sync_push_invalid");
      return data as PushResponse;
    },
  };
}

export async function removeStoreFromCloud(client: Pick<SupabaseClient, "rpc">, expectedUser: string, store: string): Promise<boolean> {
  const { error } = await client.rpc("sorlio_sync_remove_store", { p_expected_user: expectedUser, p_store: store });
  return !error;
}

export async function importLegacyStore(client: Pick<SupabaseClient, "rpc">, expectedUser: string, store: string): Promise<boolean> {
  const { error } = await client.rpc("sorlio_sync_import_store", { p_expected_user: expectedUser, p_store: store });
  return !error;
}
