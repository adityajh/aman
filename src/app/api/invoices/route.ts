import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { istTodayStr } from "@/lib/tz";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function GET() {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const allInvoices = await tx.query.invoices.findMany({
        orderBy: [desc(invoices.createdAt)],
        with: {
          client: true,
          lineItems: true,
        },
      });

      const today = istTodayStr();

      // Add sessionCount to each invoice and dynamically compute overdue status
      const invoicesWithCount = allInvoices.map((inv: any) => {
        let status = inv.status;
        // If invoice is sent but past due date, it's overdue
        if (status === "sent" && inv.dueDate && inv.dueDate < today) {
          status = "overdue";
        }
        return {
          ...inv,
          status,
          sessionCount: inv.lineItems.filter((item: any) => item.sessionId).length,
        };
      });

      return NextResponse.json(invoicesWithCount);
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
