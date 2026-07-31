import { NextResponse } from "next/server";
import { db, dbPool } from "@/lib/db";
import { tenants, users, practiceSettings } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { name, practiceName, email, password, planTier } = await req.json();

    if (!name || !practiceName || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
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

    // Ensure atomic creation of tenant, user, and default settings
    await dbPool.transaction(async (tx) => {
      // Create tenant
      const [newTenant] = await tx.insert(tenants).values({
        name: practiceName,
        slug,
        email, // Email added for tenant
        planTier: planTier || "basic",
      }).returning();

      // Create user
      await tx.insert(users).values({
        tenantId: newTenant.id,
        email,
        passwordHash: hashedPassword,
        name,
      });

      // Create default practice settings for the new tenant
      await tx.insert(practiceSettings).values({
        tenantId: newTenant.id,
        practiceName: practiceName,
        counselorName: name,
        email: email,
      });
    });

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error: any) {
    console.error("Signup error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
