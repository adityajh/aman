import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { promoCodes, tenants } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import crypto from "crypto";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  
  const envAdmins = (process.env.ADMIN_EMAILS || "vijay10gopal@gmail.com").split(",");
  const adminEmails = [...envAdmins, "adityaj@adipa.com"].map(e => e.trim().toLowerCase());
  return adminEmails.includes(session.user.email.toLowerCase());
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const codes = await db
      .select({
        id: promoCodes.id,
        code: promoCodes.code,
        priceInrMonthly: promoCodes.priceInrMonthly,
        isUsed: promoCodes.isUsed,
        usedAt: promoCodes.usedAt,
        createdAt: promoCodes.createdAt,
        usedByTenantId: promoCodes.usedByTenantId,
        tenantName: tenants.name,
        tenantEmail: tenants.email,
        tenantSlug: tenants.slug,
      })
      .from(promoCodes)
      .leftJoin(tenants, eq(promoCodes.usedByTenantId, tenants.id))
      .orderBy(desc(promoCodes.createdAt));

    return NextResponse.json(codes);
  } catch (error) {
    console.error("Failed to fetch promo codes:", error);
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { count = 1, customCode, priceInrMonthly = 699 } = await req.json();

    const newCodesToInsert: { code: string; priceInrMonthly: number }[] = [];

    if (customCode && typeof customCode === "string" && customCode.trim()) {
      const formatted = customCode.trim().toUpperCase();
      newCodesToInsert.push({ code: formatted, priceInrMonthly });
    } else {
      const numToGenerate = Math.min(Math.max(Number(count) || 1, 1), 100);
      for (let i = 0; i < numToGenerate; i++) {
        const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
        newCodesToInsert.push({
          code: `FOUNDING-${rand}`,
          priceInrMonthly,
        });
      }
    }

    const inserted = await db.insert(promoCodes).values(newCodesToInsert).returning();

    return NextResponse.json(inserted);
  } catch (error: any) {
    console.error("Failed to create promo codes:", error);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create promo codes" }, { status: 500 });
  }
}
