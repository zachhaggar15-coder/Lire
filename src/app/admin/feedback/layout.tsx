import { cookies } from "next/headers";
import type { ReactNode } from "react";
import AdminFeedbackLogin from "./AdminFeedbackLogin";
import { VALIDATION_ADMIN_COOKIE, isValidationAdminSessionValue } from "@/lib/validation/adminAuth";

export default async function FeedbackAdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const authorized = isValidationAdminSessionValue(cookieStore.get(VALIDATION_ADMIN_COOKIE)?.value);
  return authorized ? children : <AdminFeedbackLogin />;
}
