import { cookies } from "next/headers";
import type { ReactNode } from "react";
import AdminFeedbackLogin from "./AdminFeedbackLogin";
import { ADMIN_SESSION_COOKIE, isAdminSessionCookie } from "@/lib/admin/auth";

export default async function FeedbackAdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const authorized = await isAdminSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  return authorized ? children : <AdminFeedbackLogin />;
}
