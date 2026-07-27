import { db } from "@/lib/db";
import { receipts } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

// All receipts (payment events) with their client and allocation rows.
export async function GET() {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const all = await tx.query.receipts.findMany({
        orderBy: [desc(receipts.paymentDate), desc(receipts.createdAt)],
        with: {
          client: true,
          allocations: { with: { invoice: true } },
        },
      });
      return NextResponse.json(all);
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
