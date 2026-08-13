import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getTenantContext, withTenantContext } from "@/lib/tenant";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const tenant = await tx.query.tenants.findFirst();
      
      if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }

      const isVijay = tenant.slug === "aman-counseling" || tenant.email === "vijay10gopal@gmail.com";

      if (!tenant.razorpaySubscriptionId) {
        // Ensure Vijay's tenant is marked active in the database as well
        if (isVijay && !tenant.isActive) {
          await tx
            .update(tenants)
            .set({ isActive: true })
            .where(eq(tenants.id, tenant.id));
        }

        return NextResponse.json({ 
          status: isVijay ? "active" : "none", 
          planTier: tenant.planTier,
          isExempt: isVijay
        });
      }

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const subscription = await razorpay.subscriptions.fetch(tenant.razorpaySubscriptionId);

      // Sync active status with database
      const isActiveStatus = subscription.status === "active" || subscription.status === "authenticated";
      const newActiveState = isVijay ? true : isActiveStatus;
      
      if (tenant.isActive !== newActiveState) {
        await tx
          .update(tenants)
          .set({ isActive: newActiveState })
          .where(eq(tenants.id, tenant.id));
      }

      return NextResponse.json({
        status: isVijay ? "active" : subscription.status,
        planTier: tenant.planTier,
        nextBillingDate: isVijay ? null : (subscription.charge_at ? new Date(subscription.charge_at * 1000).toISOString() : null),
        cancelAtCycleEnd: isVijay ? false : (subscription as any).cancel_at_cycle_end,
        isExempt: isVijay
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
