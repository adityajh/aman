import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { recordPayment } from "@/lib/record-payment";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function GET() {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const allPayments = await tx.query.payments.findMany({
        orderBy: [desc(payments.paymentDate), desc(payments.createdAt)],
        with: {
          client: true,
          invoice: true,
        },
      });

      return NextResponse.json(allPayments);
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}

export async function POST(req: Request) {
  const { tenantId } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const {
        clientId,
        amount,
        paymentDate,
        currency = "INR",
        method,
        referenceId,
        notes,
      } = await req.json();
      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || (amountNum <= 0 && method !== "refund")) {
        return new NextResponse("Invalid amount", { status: 400 });
      }

      const result = await recordPayment(tx, {
        tenantId,
        clientId,
        amount: amountNum,
        currency,
        paymentDate,
        method,
        referenceId,
        notes,
      });

      return NextResponse.json({
        success: true,
        receiptNumber: result.receiptNumber,
        allocated: result.allocations.length,
        excess: result.excess.toFixed(2),
        currency: result.currency,
      });
    } catch (error: any) {
      console.error(
        "[POST /api/payments] Error:",
        error?.message,
        error?.code,
        JSON.stringify(error),
      );
      return new NextResponse(
        JSON.stringify({
          error: error?.message || "Unknown error",
          code: error?.code,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  });
}
