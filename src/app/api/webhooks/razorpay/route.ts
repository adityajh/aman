import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new NextResponse("Missing signature", { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured. Skipping webhook signature verification for testing.");
    } else {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return new NextResponse("Invalid signature", { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log("Razorpay Webhook Event Received:", event.event);

    const payload = event.payload;
    if (!payload || !payload.subscription) {
      return NextResponse.json({ received: true });
    }

    const subscription = payload.subscription.entity;
    const subscriptionId = subscription.id;
    const status = subscription.status;

    // Find the tenant matching this subscription
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.razorpaySubscriptionId, subscriptionId),
    });

    if (!tenant) {
      console.error(`No tenant found matching subscription ID: ${subscriptionId}`);
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Determine if the subscription is active
    // Valid active states are 'active' or 'authenticated' (trial stage)
    const isActive = status === "active" || status === "authenticated";

    // Update database status
    await db
      .update(tenants)
      .set({ isActive: isActive, updatedAt: new Date() })
      .where(eq(tenants.id, tenant.id));

    console.log(`Updated tenant ${tenant.slug} isActive to ${isActive} due to Razorpay event ${event.event} (${status})`);

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
