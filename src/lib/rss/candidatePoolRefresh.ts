import {
  buildCandidatePool,
  type CandidatePool,
  validateCandidatePoolForPromotion,
} from "@/lib/rss/candidatePool";
import {
  acquireCandidatePoolRefreshLock,
  isRssPersistenceConfigured,
  promotePersistedCandidatePool,
  releaseCandidatePoolRefreshLock,
} from "@/lib/rss/rssTextStore";

export type CandidatePoolRefreshResult =
  | {
      ok: true;
      status: "refreshed";
      pool: CandidatePool;
      persistenceReason: string;
    }
  | {
      ok: true;
      status: "already-running";
      persistenceReason: string;
    }
  | {
      ok: false;
      status: "not-configured" | "rejected" | "failed";
      persistenceReason: string;
      pool?: CandidatePool;
    };

/**
 * Runs the expensive feed build away from the user response, then promotes
 * it only if both the quality gate and the shared Redis readback succeed.
 */
export async function refreshAndPersistCandidatePool(): Promise<CandidatePoolRefreshResult> {
  if (!isRssPersistenceConfigured()) {
    return {
      ok: false,
      status: "not-configured",
      persistenceReason:
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or the KV_REST_API equivalents)",
    };
  }

  const lock = await acquireCandidatePoolRefreshLock();
  if (lock.status === "failed") {
    return {
      ok: false,
      status: "failed",
      persistenceReason: lock.reason,
    };
  }
  if (lock.status === "busy") {
    return {
      ok: true,
      status: "already-running",
      persistenceReason: "Another server instance already owns the RSS refresh lock",
    };
  }

  try {
    const pool = await buildCandidatePool();
    const validation = validateCandidatePoolForPromotion(pool);
    if (!validation.ok) {
      return {
        ok: false,
        status: "rejected",
        persistenceReason: validation.reason,
        pool,
      };
    }

    const persistence = await promotePersistedCandidatePool(pool.dateKey, pool);
    if (!persistence.ok) {
      return {
        ok: false,
        status: "failed",
        persistenceReason: persistence.reason,
        pool,
      };
    }

    return {
      ok: true,
      status: "refreshed",
      pool,
      persistenceReason: persistence.reason,
    };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      persistenceReason: error instanceof Error ? error.message : "RSS refresh failed unexpectedly",
    };
  } finally {
    await releaseCandidatePoolRefreshLock(lock.token);
  }
}
