import { db } from "@/lib/db";
import { sessions, invoices, sessionNotes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, isNull, and, gte, lt, or, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [unbilledCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessions)
      .where(and(eq(sessions.status, 'completed'), isNull(sessions.invoiceId)));

    const [upcomingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sessions)
      .where(and(eq(sessions.status, 'scheduled'), gte(sessions.scheduledAt, now), lt(sessions.scheduledAt, sevenDaysFromNow)));

    // 3. Outstanding Revenue (Split by currency)
    const outstandingRevenue = await db
      .select({ 
        currency: sql<string>`COALESCE(${invoices.currency}, 'INR')`,
        total: sql<number>`SUM(CAST(${invoices.total} AS NUMERIC) - CAST(${invoices.amountPaid} AS NUMERIC))` 
      })
      .from(invoices)
      .where(or(
        eq(invoices.status, 'draft'), 
        eq(invoices.status, 'sent'), 
        eq(invoices.status, 'partial'), 
        eq(invoices.status, 'overdue')
      ))
      .groupBy(sql`COALESCE(${invoices.currency}, 'INR')`);

    // 4. Risk Flags
    const [riskFlags] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sessionNotes)
        .where(or(eq(sessionNotes.riskFlag, 'medium'), eq(sessionNotes.riskFlag, 'high')));

    return NextResponse.json({
      unbilledSessions: unbilledCount.count || 0,
      upcomingSessions: upcomingCount.count || 0,
      outstanding: outstandingRevenue,
      activeRiskFlags: riskFlags.count || 0,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
