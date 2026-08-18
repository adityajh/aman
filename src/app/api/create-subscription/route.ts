import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { promoCode } = await req.json();

    const defaultPlanId = process.env.RAZORPAY_PLAN_DEEPEN || "plan_TOl5mRuFjG4FZM";
    const foundingPlanId = process.env.RAZORPAY_PLAN_FOUNDING;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const foundingPromo = process.env.FOUNDING_PROMO_CODE || process.env.BETA_PROMO_CODE || "FOUNDING50";
    const offerId = process.env.RAZORPAY_FOUNDING_OFFER_ID || process.env.RAZORPAY_BETA_OFFER_ID;

    let selectedPlanId = defaultPlanId;
    let selectedOfferId: string | undefined = undefined;

    if (promoCode && promoCode.trim().toUpperCase() === foundingPromo.toUpperCase()) {
      const existingFounding = await db.query.tenants.findMany({
        where: eq(tenants.isFounding, true),
      });
      if (existingFounding.length < 50) {
        if (foundingPlanId) {
          selectedPlanId = foundingPlanId;
        } else if (offerId) {
          selectedOfferId = offerId;
        }
      }
    }

    const options: any = {
      plan_id: selectedPlanId,
      total_count: 100, // Monthly recurring
    };

    if (selectedOfferId) {
      options.offer_id = selectedOfferId;
    }

    const subscription = await razorpay.subscriptions.create(options);

    return NextResponse.json({ 
      subscription_id: subscription.id,
    });

  } catch (error: any) {
    console.error("Razorpay Create Subscription Error:", error);
    const message = error?.error?.description || error?.message || "Failed to create subscription";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
