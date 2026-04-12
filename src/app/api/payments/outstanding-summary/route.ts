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

    // 1. Total outstanding (across all persistent invoices)
    const outstandingRes = await db.select({
      total: sql<number>`sum(total - amount_paid)`
    }).from(invoices)
    .where(sql`status IN ('sent', 'partial', 'overdue')`);
    
    const totalOutstanding = outstandingRes[0]?.total || 0;

    // 2. Total received this month
    const thisMonthRes = await db.select({
      total: sql<number>`sum(amount)`
    }).from(payments)
    .where(gte(payments.paymentDate, firstOfOfMonth));

    const totalReceivedThisMonth = thisMonthRes[0]?.total || 0;

    // 3. All-time total received
    const allTimeRes = await db.select({
      total: sql<number>`sum(amount)`
    }).from(payments);

    const totalReceivedAllTime = allTimeRes[0]?.total || 0;

    return NextResponse.json({
      totalOutstanding,
      totalReceivedThisMonth,
      totalReceivedAllTime
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
