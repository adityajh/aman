import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function POST() {
  const { tenantId } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const tenant = await tx.query.tenants.findFirst();
      
      if (!tenant || !tenant.razorpaySubscriptionId) {
        return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
      }

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      // Pass cancel_at_cycle_end = 0 for immediate cancellation
      // Passing 1 cancels it at the end of the current billing cycle
      const subscription = await razorpay.subscriptions.cancel(
        tenant.razorpaySubscriptionId,
        true // cancel_at_cycle_end = true (1)
      );

      return NextResponse.json({
        success: true,
        status: subscription.status,
      });

    } catch (error: any) {
      console.error("Razorpay Cancel Subscription Error:", error);
      return NextResponse.json(
        { error: "Failed to cancel subscription" },
        { status: 500 }
      );
    }
  });
}
