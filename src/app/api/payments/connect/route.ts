import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { appUrl, authorizeUrl, isConnectConfigured, signState } from "@/lib/razorpay-connect";

// GET /api/payments/connect: sends the counsellor to Razorpay to approve access.
export async function GET() {
  const { tenantId } = await getTenantContext();
  if (!isConnectConfigured()) {
    return NextResponse.redirect(new URL("/dashboard/settings?razorpay=unavailable", appUrl()));
  }
  return NextResponse.redirect(authorizeUrl(signState(tenantId)));
}
