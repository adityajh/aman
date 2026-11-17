import { NextResponse } from "next/server";
import { appUrl } from "@/lib/razorpay-connect";
import { syncPaymentLink, tenantForLink } from "@/lib/payment-links";

// GET /api/public/razorpay/return
// Where Razorpay sends the client after paying. Nothing in the query string is
// trusted: it only tells us which link to re-check with Razorpay.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const linkId = url.searchParams.get("razorpay_payment_link_id");
  let status = "pending";

  if (linkId) {
    try {
      const tenantId = await tenantForLink(linkId);
      if (tenantId) {
        await syncPaymentLink(tenantId, linkId);
        if (url.searchParams.get("razorpay_payment_link_status") === "paid") status = "paid";
      }
    } catch (e) {
      // The webhook or daily check will record it.
      console.error("[razorpay return] sync failed", e);
    }
  }

  return NextResponse.redirect(new URL(`/portal/paid?status=${status}`, appUrl()));
}
