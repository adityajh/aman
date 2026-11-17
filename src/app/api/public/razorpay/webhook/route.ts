import { NextResponse } from "next/server";
import { findConnectionByAccount, verifyWebhookSignature } from "@/lib/razorpay-connect";
import { syncPaymentLink, tenantForLink } from "@/lib/payment-links";

// POST /api/public/razorpay/webhook
// Payment events from counsellors' connected Razorpay accounts (configured on
// Deepen's partner app). Public route: trust comes from the signature, and the
// payment is only recorded after re-fetching the link from Razorpay.
export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifyWebhookSignature(rawBody, req.headers.get("x-razorpay-signature"))) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }

  if (event.event !== "payment_link.paid") {
    return NextResponse.json({ received: true, ignored: event.event });
  }

  const linkId: string | undefined = event.payload?.payment_link?.entity?.id;
  if (!linkId) return NextResponse.json({ received: true, ignored: "no link id" });

  // Which practice: from our own invoice records, or (for an older link that
  // was since replaced) from the connected account the event came from.
  // syncPaymentLink then checks the link's own notes name this practice.
  const linkTenant = await tenantForLink(linkId);
  const conn = event.account_id ? await findConnectionByAccount(event.account_id) : null;
  if (linkTenant && conn && conn.tenantId !== linkTenant) {
    console.error(`[razorpay webhook] link ${linkId} account mismatch`);
    return NextResponse.json({ received: true, ignored: "account mismatch" });
  }
  const tenantId = linkTenant ?? conn?.tenantId ?? null;
  if (!tenantId) return NextResponse.json({ received: true, ignored: "unknown link" });

  try {
    const result = await syncPaymentLink(tenantId, linkId);
    return NextResponse.json({ received: true, recorded: result.recorded });
  } catch (e) {
    console.error("[razorpay webhook] sync failed", e);
    // 500 so Razorpay retries; the daily check is the backstop.
    return new NextResponse("Sync failed", { status: 500 });
  }
}
