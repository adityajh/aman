import { db } from "@/lib/db";
import { payments, invoices } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { sql, gte } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatIST, istStartOfMonthUTC, istStartOfFYUTC } from "@/lib/tz";

export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    // payment_date is a DATE column — compare against IST calendar dates.
    const firstOfOfMonth = formatIST(istStartOfMonthUTC(), "yyyy-MM-dd");
    const firstOfFY = formatIST(istStartOfFYUTC(), "yyyy-MM-dd");

    // 1. Total outstanding (grouped by currency with explicit casting)
    const outstandingRes = await db.select({
      currency: sql<string>`COALESCE(${invoices.currency}, 'INR')`,
      total: sql<number>`SUM(CAST(${invoices.total} AS NUMERIC) - CAST(${invoices.amountPaid} AS NUMERIC))`
    }).from(invoices)
    .where(sql`status IN ('draft', 'sent', 'partial', 'overdue')`)
    .groupBy(sql`COALESCE(${invoices.currency}, 'INR')`);
    
    // 2. Total received this month (grouped by currency)
    const thisMonthRes = await db.select({
      currency: sql<string>`COALESCE(${payments.currency}, 'INR')`,
      total: sql<number>`SUM(CAST(${payments.amount} AS NUMERIC))`
    }).from(payments)
    .where(gte(payments.paymentDate, firstOfOfMonth))
    .groupBy(sql`COALESCE(${payments.currency}, 'INR')`);

    // 3. YTD total received (grouped by currency) - FY logic (April to March)
    const ytdRes = await db.select({
      currency: sql<string>`COALESCE(${payments.currency}, 'INR')`,
      total: sql<number>`SUM(CAST(${payments.amount} AS NUMERIC))`
    }).from(payments)
    .where(gte(payments.paymentDate, firstOfFY))
    .groupBy(sql`COALESCE(${payments.currency}, 'INR')`);

    return NextResponse.json({
      outstanding: outstandingRes,
      receivedMonth: thisMonthRes,
      receivedYTD: ytdRes
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
