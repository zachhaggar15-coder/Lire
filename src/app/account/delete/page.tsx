import type { Metadata } from "next";
import DeleteAccountPageClient from "@/app/account/delete/DeleteAccountPageClient";

export const metadata: Metadata = {
  title: "Delete your Sorlio account",
  description: "Sign in with Google to permanently delete your Sorlio account and the learning data synced to it.",
};

/**
 * Web-accessible account deletion.
 *
 * Exists so deletion does not require having the Android app installed, which
 * both Play policy and a reader who has already uninstalled need. It reuses the
 * same dialog and the same authenticated endpoint as Settings rather than
 * carrying a second implementation.
 */
export default function DeleteAccountPage() {
  return <DeleteAccountPageClient />;
}
