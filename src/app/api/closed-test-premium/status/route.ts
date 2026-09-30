import { NextResponse } from "next/server";
import { closedTestPremiumGrant } from "@/lib/closedTestPremiumServer";

/** Client-safe status only; it never discloses or writes a subscription. */
export async function GET(request: Request) {
  const grant = await closedTestPremiumGrant(request);
  return NextResponse.json(
    { active: !!grant },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
