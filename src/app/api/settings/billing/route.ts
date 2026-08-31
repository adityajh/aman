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

      // Fetch past invoices for this subscription
      let invoicesList: any[] = [];
      try {
        const rzpInvoices = await (razorpay.invoices as any).all({
          subscription_id: tenant.razorpaySubscriptionId,
        });
        if (rzpInvoices && Array.isArray(rzpInvoices.items)) {
          invoicesList = rzpInvoices.items.map((inv: any) => ({
            id: inv.id,
            invoiceNumber: inv.invoice_number || inv.number || inv.id,
            amount: inv.amount ? inv.amount / 100 : (inv.gross_amount ? inv.gross_amount / 100 : 0),
            currency: inv.currency || "INR",
            status: inv.status,
            date: inv.created_at ? new Date(inv.created_at * 1000).toISOString() : null,
            pdfUrl: inv.invoice_pdf || inv.short_url || null,
          }));
        }
      } catch (invErr) {
        console.warn("Failed to fetch Razorpay subscription invoices:", invErr);
      }

      // Sync active status with database
      const isActiveStatus = subscription.status === "active" || subscription.status === "authenticated";
      if (tenant.isActive !== isActiveStatus) {
        await tx
          .update(tenants)
          .set({ isActive: isActiveStatus })
          .where(eq(tenants.id, tenant.id));
      }

      return NextResponse.json({
        status: subscription.status,
        planTier: tenant.planTier,
        isExempt: tenant.isExempt,
        subscriptionId: tenant.razorpaySubscriptionId,
        nextBillingDate: subscription.charge_at ? new Date(subscription.charge_at * 1000).toISOString() : null,
        cancelAtCycleEnd: (subscription as any).cancel_at_cycle_end,
        invoices: invoicesList,
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
