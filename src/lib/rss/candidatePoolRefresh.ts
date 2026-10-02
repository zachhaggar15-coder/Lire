import {
  buildCandidatePool,
  type CandidatePool,
  validateCandidatePoolForPromotion,
} from "@/lib/rss/candidatePool";
import {
  acquireCandidatePoolRefreshLock,
  isRssPersistenceConfigured,
  promotePersistedCandidatePool,
  recordRssRefreshHealth,
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
  const attemptedAt = new Date().toISOString();
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
      await recordRssRefreshHealth({
        attemptedAt,
        feedsAttempted: pool.feedsSucceeded + pool.feedsFailed,
        feedsSucceeded: pool.feedsSucceeded,
        liveItemsAvailable: pool.items.length,
        status: "rejected",
        reason: validation.reason,
      });
      return {
        ok: false,
        status: "rejected",
        persistenceReason: validation.reason,
        pool,
      };
    }

    const persistence = await promotePersistedCandidatePool(pool.dateKey, pool);
    if (!persistence.ok) {
      await recordRssRefreshHealth({
        attemptedAt,
        feedsAttempted: pool.feedsSucceeded + pool.feedsFailed,
        feedsSucceeded: pool.feedsSucceeded,
        liveItemsAvailable: pool.items.length,
        status: "failed",
        reason: persistence.reason,
      });
      return {
        ok: false,
        status: "failed",
        persistenceReason: persistence.reason,
        pool,
      };
    }

    await recordRssRefreshHealth({
      attemptedAt,
      successfulRefreshAt: new Date(pool.builtAt).toISOString(),
      feedsAttempted: pool.feedsSucceeded + pool.feedsFailed,
      feedsSucceeded: pool.feedsSucceeded,
      liveItemsAvailable: pool.items.length,
      status: "refreshed",
      reason: persistence.reason,
    });
    return {
      ok: true,
      status: "refreshed",
      pool,
      persistenceReason: persistence.reason,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "RSS refresh failed unexpectedly";
    await recordRssRefreshHealth({
      attemptedAt,
      feedsAttempted: 0,
      feedsSucceeded: 0,
      liveItemsAvailable: 0,
      status: "failed",
      reason,
    });
    return {
      ok: false,
      status: "failed",
      persistenceReason: reason,
    };
  } finally {
    await releaseCandidatePoolRefreshLock(lock.token);
  }
}
