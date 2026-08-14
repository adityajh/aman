import { NextResponse } from "next/server";
import { getTenantContext, withTenantContext } from "@/lib/tenant";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = await req.json();

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing Razorpay payment parameters" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("Missing RAZORPAY_KEY_SECRET environment variable");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const payload = razorpay_payment_id + "|" + razorpay_subscription_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const { tenantId } = await getTenantContext();
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return await withTenantContext(tenantId, async (tx) => {
      const tenant = await tx.query.tenants.findFirst();
      if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }

      await tx
        .update(tenants)
        .set({
          razorpaySubscriptionId: razorpay_subscription_id,
          isActive: true,
        })
        .where(eq(tenants.id, tenant.id));

      return NextResponse.json({ success: true });
    });
  } catch (error: any) {
    console.error("Reactivation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process reactivation" },
      { status: 500 }
    );
  }
}
