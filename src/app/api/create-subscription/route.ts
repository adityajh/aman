import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { planTier } = await req.json();

    if (!planTier || (planTier !== "basic" && planTier !== "pro")) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Map planTier to Razorpay Plan IDs (TEMPORARY: Using Rs.1 test plan for all tiers)
    // const planId = planTier === "basic" ? "plan_TOl5mRuFjG4FZM" : "plan_TOl5SJ3ErBkUBB";
    const planId = "plan_TOlRGR0I1RzTUw";

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      plan_id: planId,
      total_count: 120, // 10 years, acts as open-ended
    };

    const subscription = await razorpay.subscriptions.create(options);

    return NextResponse.json({ 
      subscription_id: subscription.id,
    });

  } catch (error: any) {
    console.error("Razorpay Create Subscription Error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
