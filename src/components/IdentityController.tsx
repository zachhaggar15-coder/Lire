"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import GuestAdoptionDialog from "@/components/GuestAdoptionDialog";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ACTIVE_IDENTITY_KEY, parseIdentityId } from "@/lib/localData/identity";
import { activeIdentity } from "@/lib/localData/store";
import { followIdentityChangeFromOtherTab, forgetDeletedAccount, reconcileIdentity } from "@/lib/localData/session";
import { cleanUpDeletedAccounts } from "@/lib/localData/accountCleanup";
import {
  adoptGuestData,
  recordKeepSeparate,
  shouldOfferAdoption,
  type GuestDataSummary,
} from "@/lib/localData/guestAdoption";
import { requestSync, syncNow } from "@/lib/sync/runtime";

/**
 * Mounted once (layout.tsx). Keeps the tab's data partition in step with the
 * Supabase session, starts sync for signed-in accounts, and asks the guest
 * adoption question once after sign-in.
 *
 * Pages that must not pull account data into the browser — the public account
 * deletion page — are excluded from sync and from the adoption question.
 */
const NO_SYNC_PATHS = ["/account/delete"];

export default function IdentityController() {
  const pathname = usePathname();
  const [offer, setOffer] = useState<GuestDataSummary | null>(null);
  const quietPage = NO_SYNC_PATHS.some((path) => pathname?.startsWith(path));

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      // Defer: supabase-js warns against awaiting other auth calls inside
      // this callback, and a reload from inside it can race its own storage.
      setTimeout(() => {
        if (reconcileIdentity(session?.user.id ?? null)) return;
        const identity = activeIdentity();
        if (identity.kind !== "account" || quietPage) return;
        requestSync();
        setOffer(shouldOfferAdoption(identity));
      }, 0);
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key === ACTIVE_IDENTITY_KEY) followIdentityChangeFromOtherTab(parseIdentityId(event.newValue));
    };
    window.addEventListener("storage", onStorage);
    // Erase local data for accounts deleted elsewhere (at most daily).
    if (navigator.onLine !== false) {
      void cleanUpDeletedAccounts().then(async (result) => {
        const identity = activeIdentity();
        if (result.activeErased && identity.kind === "account") {
          await forgetDeletedAccount(identity.userId);
          window.location.replace("/settings?accountDeleted=1");
        }
      });
    }
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [quietPage]);

  if (!offer) return null;

  return (
    <GuestAdoptionDialog
      summary={offer}
      onKeepSeparate={() => {
        const identity = activeIdentity();
        recordKeepSeparate(identity, offer);
        setOffer(null);
      }}
      onAdd={async () => {
        const identity = activeIdentity();
        // Sync first so the account's existing data (and deletions) are known
        // here before guest items are merged in. Offline is fine: the merge is
        // local and uploads on the next sync.
        await syncNow().catch(() => null);
        const result = adoptGuestData(identity);
        if (!result.ok) return result.error;
        setOffer(null);
        // Reload so every screen shows the merged data.
        window.location.reload();
        return null;
      }}
    />
  );
}
