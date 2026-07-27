import { db } from "@/lib/db";
import { payments, invoices } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { sql, gte } from "drizzle-orm";
import { formatIST, istStartOfMonthUTC, istStartOfFYUTC } from "@/lib/tz";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function GET() {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      // payment_date is a DATE column — compare against IST calendar dates.
      const firstOfOfMonth = formatIST(istStartOfMonthUTC(), "yyyy-MM-dd");
      const firstOfFY = formatIST(istStartOfFYUTC(), "yyyy-MM-dd");

      // 1. Total outstanding (grouped by currency with explicit casting)
      const outstandingRes = await tx
        .select({
          currency: sql<string>`COALESCE(${invoices.currency}, 'INR')`,
          total: sql<number>`SUM(CAST(${invoices.total} AS NUMERIC) - CAST(${invoices.amountPaid} AS NUMERIC))`,
        })
        .from(invoices)
        .where(sql`status IN ('draft', 'sent', 'partial', 'overdue')`)
        .groupBy(sql`COALESCE(${invoices.currency}, 'INR')`);

      // 2. Total received this month (grouped by currency)
      const thisMonthRes = await tx
        .select({
          currency: sql<string>`COALESCE(${payments.currency}, 'INR')`,
          total: sql<number>`SUM(CAST(${payments.amount} AS NUMERIC))`,
        })
        .from(payments)
        .where(gte(payments.paymentDate, firstOfOfMonth))
        .groupBy(sql`COALESCE(${payments.currency}, 'INR')`);

      // 3. YTD total received (grouped by currency) - FY logic (April to March)
      const ytdRes = await tx
        .select({
          currency: sql<string>`COALESCE(${payments.currency}, 'INR')`,
          total: sql<number>`SUM(CAST(${payments.amount} AS NUMERIC))`,
        })
        .from(payments)
        .where(gte(payments.paymentDate, firstOfFY))
        .groupBy(sql`COALESCE(${payments.currency}, 'INR')`);

      return NextResponse.json({
        outstanding: outstandingRes,
        receivedMonth: thisMonthRes,
        receivedYTD: ytdRes,
      });
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
