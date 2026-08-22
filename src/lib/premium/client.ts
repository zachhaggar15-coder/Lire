import { getAccessToken, getCurrentUser } from "@/lib/supabase/auth";
import { FREE_PREMIUM_STATUS, type PremiumStatus } from "@/lib/premium/types";

const PREMIUM_CACHE_KEY = "lire.premium.status.v1";

interface CachedPremiumStatus extends PremiumStatus {
  userId: string;
}

function readCachedStatus(userId: string): PremiumStatus {
  if (typeof window === "undefined") return FREE_PREMIUM_STATUS;
  try {
    const value = JSON.parse(window.localStorage.getItem(PREMIUM_CACHE_KEY) ?? "null") as CachedPremiumStatus | null;
    if (value?.userId !== userId || !value.isPremium || !value.expiresAt || new Date(value.expiresAt).getTime() <= Date.now()) return FREE_PREMIUM_STATUS;
    return value;
  } catch {
    return FREE_PREMIUM_STATUS;
  }
}

function cacheStatus(userId: string, status: PremiumStatus): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({ ...status, userId } satisfies CachedPremiumStatus));
  } catch {
    // Online status remains authoritative when storage is unavailable.
  }
}

export async function fetchPremiumStatus(): Promise<PremiumStatus> {
  const user = await getCurrentUser();
  const token = await getAccessToken();
  if (!user || !token) return FREE_PREMIUM_STATUS;
  try {
    const response = await fetch("/api/premium/status", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Premium status request failed");
    const status = (await response.json()) as PremiumStatus;
    cacheStatus(user.id, status);
    return status;
  } catch {
    return readCachedStatus(user.id);
  }
}
