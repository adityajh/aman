import { db } from "@/lib/db";
import { payments, invoices, receipts } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc, asc, eq, and, inArray } from "drizzle-orm";
import { istTodayStr } from "@/lib/tz";
import { nextReceiptNumber } from "@/lib/receipts";
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
  const { tenantId, planTier } = await getTenantContext();
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
      let remainingPayment = parseFloat(amount);

      if (isNaN(remainingPayment) || remainingPayment <= 0) {
        return new NextResponse("Invalid amount", { status: 400 });
      }

      const payDate = paymentDate || istTodayStr();

      // 0. Create the receipt (the client-facing payment event). Allocation rows
      //    below all reference this receipt.
      const rcptYear =
        parseInt(payDate.slice(0, 4), 10) || new Date().getUTCFullYear();
      const receiptNumber = await nextReceiptNumber(rcptYear);
      const [receipt] = await tx
        .insert(receipts)
        .values({
            tenantId: tenantId,
            receiptNumber,
          clientId,
          amount: remainingPayment.toFixed(2),
          currency,
          paymentDate: payDate,
          method,
          referenceId,
          notes,
        })
        .returning();

      // 1. Fetch outstanding invoices of the SAME CURRENCY (FIFO)
      const outstandingInvoices = await tx.query.invoices.findMany({
        where: and(
          eq(invoices.clientId, clientId),
          eq(invoices.currency, currency),
          inArray(invoices.status, ["draft", "sent", "partial", "overdue"]),
        ),
        orderBy: [asc(invoices.issuedDate), asc(invoices.createdAt)],
      });

      const paymentRecords = [];

      // 2. FIFO Allocation (only within the same currency)
      for (const inv of outstandingInvoices) {
        if (remainingPayment <= 0) break;

        const total = parseFloat(inv.total);
        const paid = parseFloat(inv.amountPaid || "0");
        const owed = total - paid;

        if (owed <= 0) continue;

        const allocation = Math.min(remainingPayment, owed);
        const newPaid = paid + allocation;
        remainingPayment -= allocation;

        // Update invoice
        let status: "paid" | "partial" | "sent" | "overdue" | "draft" =
          "partial";
        if (newPaid >= total) {
          status = "paid";
        } else {
          // preserve overdue/sent state if not fully paid
          status = inv.status as any;
          if (status === "draft") status = "partial";
        }

        await tx
          .update(invoices)
          .set({
            amountPaid: newPaid.toFixed(2),
            status,
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, inv.id));

        // Prepare payment record (allocation of this receipt to the invoice)
        paymentRecords.push({
          tenantId,
          receiptId: receipt.id,
          clientId,
          invoiceId: inv.id,
          amount: allocation.toFixed(2),
          paymentDate: payDate,
          currency,
          method,
          referenceId,
          notes: notes
            ? `${notes} (Allocated to ${inv.invoiceNumber})`
            : `Allocated to ${inv.invoiceNumber}`,
        });
      }

      // 3. Handle leftover (Credit / Overpayment in that currency)
      if (remainingPayment > 0) {
        paymentRecords.push({
          tenantId,
          receiptId: receipt.id,
          clientId,
          invoiceId: null,
          amount: remainingPayment.toFixed(2),
          paymentDate: payDate,
          currency,
          method,
          referenceId,
          notes: notes
            ? `${notes} (Excess ${currency} Credit)`
            : `Excess ${currency} Credit`,
        });
      }

      // 4. Batch insert payments
      if (paymentRecords.length > 0) {
        await tx.insert(payments).values(paymentRecords);
      }

      return NextResponse.json({
        success: true,
        receiptNumber,
        allocated: paymentRecords.length,
        excess: remainingPayment > 0 ? remainingPayment.toFixed(2) : "0",
        currency,
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
