import { db } from "@/lib/db";
import { payments, invoices } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc, eq, and, sql, gte } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfMonth, format } from "date-fns";

export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const now = new Date();
    const firstOfOfMonth = format(startOfMonth(now), "yyyy-MM-dd");

    // 1. Total outstanding (grouped by currency)
    const outstandingRes = await db.select({
      currency: invoices.currency,
      total: sql<number>`sum(total - amount_paid)`
    }).from(invoices)
    .where(sql`status IN ('draft', 'sent', 'partial', 'overdue')`)
    .groupBy(invoices.currency);
    
    // 2. Total received this month (grouped by currency)
    const thisMonthRes = await db.select({
      currency: payments.currency,
      total: sql<number>`sum(amount)`
    }).from(payments)
    .where(gte(payments.paymentDate, firstOfOfMonth))
    .groupBy(payments.currency);

    // 3. All-time total received (grouped by currency)
    const allTimeRes = await db.select({
      currency: payments.currency,
      total: sql<number>`sum(amount)`
    }).from(payments)
    .groupBy(payments.currency);

    return NextResponse.json({
      outstanding: outstandingRes,
      receivedMonth: thisMonthRes,
      receivedAllTime: allTimeRes
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
