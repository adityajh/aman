import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const tenant = await tx.query.tenants.findFirst();
      
      if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }

      if (!tenant.razorpaySubscriptionId) {
        return NextResponse.json({ 
          status: "none", 
          planTier: tenant.planTier 
        });
      }

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const subscription = await razorpay.subscriptions.fetch(tenant.razorpaySubscriptionId);

      return NextResponse.json({
        status: subscription.status,
        planTier: tenant.planTier,
        nextBillingDate: subscription.charge_at ? new Date(subscription.charge_at * 1000).toISOString() : null,
        cancelAtCycleEnd: subscription.cancel_at_cycle_end
      });

    } catch (error: any) {
      console.error("Razorpay Fetch Subscription Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription details" },
        { status: 500 }
      );
    }
  });
}
