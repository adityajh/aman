import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants, clients, sessions } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

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
    const allTenantsRaw = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        email: tenants.email,
        phone: tenants.phone,
        planTier: tenants.planTier,
        isFounding: tenants.isFounding,
        foundingSeat: tenants.foundingSeat,
        priceInrMonthly: tenants.priceInrMonthly,
        razorpaySubscriptionId: tenants.razorpaySubscriptionId,
        isActive: tenants.isActive,
        isExempt: tenants.isExempt,
        createdAt: tenants.createdAt,
        updatedAt: tenants.updatedAt,
        clientCount: sql<number>`count(distinct ${clients.id})::int`,
        lastActive: sql<Date | null>`max(${sessions.updatedAt})`,
        monthlyActiveClients: sql<number>`(
          SELECT COALESCE(COUNT(DISTINCT sub.client_id), 0)::int
          FROM (
            SELECT s2.client_id
            FROM sessions s2
            WHERE s2.tenant_id = ${tenants.id}
              AND s2.scheduled_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'
              AND s2.scheduled_at < (DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 month') AT TIME ZONE 'Asia/Kolkata'
              AND s2.status != 'cancelled'
            UNION
            SELECT inv.client_id
            FROM invoices inv
            WHERE inv.tenant_id = ${tenants.id}
              AND (
                (inv.billing_month >= (DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'))::date
                 AND inv.billing_month < ((DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 month'))::date)
                OR
                (inv.issued_date >= (DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'))::date
                 AND inv.issued_date < ((DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 month'))::date)
              )
              AND inv.status != 'void'
          ) sub
        )`,
      })
      .from(tenants)
      .leftJoin(clients, eq(tenants.id, clients.tenantId))
      .leftJoin(sessions, eq(tenants.id, sessions.tenantId))
      .groupBy(tenants.id)
      .orderBy(desc(tenants.createdAt));

    return NextResponse.json(allTenantsRaw);
  } catch (error) {
    console.error("Failed to fetch tenants:", error);
    return NextResponse.json({ error: "Failed to fetch tenants" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tenantId, action, value } = await req.json();

    if (!tenantId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (action === "toggleActive") {
      await db.update(tenants)
        .set({ isActive: value })
        .where(eq(tenants.id, tenantId));
    } else if (action === "toggleExempt") {
      await db.update(tenants)
        .set({ isExempt: value })
        .where(eq(tenants.id, tenantId));
    } else if (action === "togglePro") {
      await db.update(tenants)
        .set({ planTier: value ? "pro" : "deepen" })
        .where(eq(tenants.id, tenantId));
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tenant" }, { status: 500 });
  }
}
