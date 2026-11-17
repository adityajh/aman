import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { safeEqual } from "@/lib/secret-box";
import { keepConnectionFresh } from "@/lib/razorpay-connect";
import { reconcileTenantLinks } from "@/lib/payment-links";

// GET /api/public/razorpay/reconcile (Vercel Cron, daily)
// Backstop for missed webhooks, closes links on invoices settled another way,
// and refreshes Razorpay tokens before they expire.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const conns = await db.query.paymentConnections.findMany({
    where: eq(paymentConnections.status, "active"),
  });

  const results: { tenantId: string; checked?: number; recorded?: number; error?: string }[] = [];
  for (const conn of conns) {
    try {
      await keepConnectionFresh(conn);
      const r = await reconcileTenantLinks(conn.tenantId);
      results.push({ tenantId: conn.tenantId, ...r });
    } catch (e: any) {
      console.error(`[reconcile] tenant ${conn.tenantId} failed`, e);
      results.push({ tenantId: conn.tenantId, error: e?.message || "failed" });
    }
  }

  return NextResponse.json({ connections: conns.length, results });
}
