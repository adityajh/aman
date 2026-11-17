import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { appUrl, exchangeCode, saveConnection, verifyState } from "@/lib/razorpay-connect";

// GET /api/payments/connect/callback: Razorpay sends the counsellor back here.
export async function GET(req: Request) {
  const { tenantId } = await getTenantContext();
  const url = new URL(req.url);
  const back = (status: string) =>
    NextResponse.redirect(new URL(`/dashboard/settings?razorpay=${status}#online-payments`, appUrl()));

  if (url.searchParams.get("error")) return back("declined");
  if (!verifyState(url.searchParams.get("state"), tenantId)) return back("expired");

  const code = url.searchParams.get("code");
  if (!code) return back("error");

  try {
    const tokens = await exchangeCode(code);
    await saveConnection(tenantId, tokens);
    return back("connected");
  } catch (e) {
    console.error("[connect/callback]", e);
    return back("error");
  }
}
