import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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
    const allTenants = await db.query.tenants.findMany({
      orderBy: [desc(tenants.createdAt)],
    });

    return NextResponse.json(allTenants);
  } catch (error) {
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
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tenant" }, { status: 500 });
  }
}
