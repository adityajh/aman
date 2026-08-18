import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants, users, practiceSettings } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { 
      name, 
      practiceName, 
      email, 
      password, 
      planTier,
      promoCode,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    } = await req.json();

    const isBypass = promoCode?.toUpperCase() === "FREEBIE";

    if (!isBypass) {
      if (!name || !practiceName || !email || !password || !razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
        return new NextResponse("Missing required fields or payment details", { status: 400 });
      }

      // Verify Razorpay Signature
      const secret = process.env.RAZORPAY_KEY_SECRET!;
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(`${razorpay_payment_id}|${razorpay_subscription_id}`);
      const digest = shasum.digest("hex");

      if (digest !== razorpay_signature) {
        return new NextResponse("Invalid payment signature", { status: 400 });
      }
    }

    // 1. Check if email is already in use
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return new NextResponse("Email already registered", { status: 409 });
    }

    // Generate a unique slug based on practice name
    const baseSlug = practiceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    let slug = baseSlug || "practice";
    let isUnique = false;
    let counter = 0;
    
    while (!isUnique) {
      const checkSlug = counter === 0 ? slug : `${slug}-${counter}`;
      const existingTenant = await db.query.tenants.findFirst({
        where: eq(tenants.slug, checkSlug),
      });
      if (!existingTenant) {
        slug = checkSlug;
        isUnique = true;
      } else {
        counter++;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure creation of tenant, user, and default settings
    // Using neon-http driver sequentially since it doesn't support transactions,
    // but avoids WebSocket cold-start timeouts on Vercel Serverless.
    
    // Calculate founding status if applicable
    const foundingPromo = process.env.FOUNDING_PROMO_CODE || "FOUNDING50";
    const isFoundingOffer = promoCode && promoCode.trim().toUpperCase() === foundingPromo.toUpperCase();

    let isFounding = false;
    let foundingSeat: number | null = null;
    let priceInrMonthly = 999;

    if (isFoundingOffer) {
      const existingFounding = await db.query.tenants.findMany({
        where: eq(tenants.isFounding, true),
      });
      if (existingFounding.length < 50) {
        isFounding = true;
        foundingSeat = existingFounding.length + 1;
        priceInrMonthly = 699;
      }
    }

    // Create tenant
    const [newTenant] = await db.insert(tenants).values({
      name: practiceName,
      slug,
      email,
      planTier: "deepen",
      isFounding,
      foundingSeat,
      priceInrMonthly,
      razorpaySubscriptionId: isBypass ? null : razorpay_subscription_id,
      isExempt: isBypass,
    }).returning();

    try {
      // Create user
      await db.insert(users).values({
        tenantId: newTenant.id,
        email,
        passwordHash: hashedPassword,
        name,
      });

      // Create default practice settings for the new tenant
      await db.insert(practiceSettings).values({
        tenantId: newTenant.id,
        practiceName: practiceName,
        counselorName: name,
        email: email,
      });
    } catch (err) {
      // Cleanup if user creation fails
      await db.delete(tenants).where(eq(tenants.id, newTenant.id));
      throw err;
    }

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error: any) {
    console.error("Signup error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
