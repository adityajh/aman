import { db } from "@/lib/db";
import { payments, invoices } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, sum } from "drizzle-orm";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      // 1. Fetch the payment before deleting so we know which invoice to recalculate
      const payment = await tx.query.payments.findFirst({
        where: eq(payments.id, id),
      });

      if (!payment) {
        return new NextResponse("Payment not found", { status: 404 });
      }

      // 2. Delete the payment record
      await tx.delete(payments).where(eq(payments.id, id));

      // 3. If this payment was linked to an invoice, recalculate its amountPaid
      if (payment.invoiceId) {
        // Sum all remaining payments for this invoice
        const result = await db
          .select({ total: sum(payments.amount) })
          .from(payments)
          .where(eq(payments.invoiceId, payment.invoiceId));

        const newAmountPaid = parseFloat(result[0]?.total || "0");

        // Fetch the invoice to determine correct status
        const invoice = await tx.query.invoices.findFirst({
          where: eq(invoices.id, payment.invoiceId),
        });

        if (invoice) {
          const invoiceTotal = parseFloat(invoice.total);
          let newStatus: "paid" | "partial" | "sent" | "overdue" | "draft";

          if (newAmountPaid <= 0) {
            // Fully reversed — revert to sent/draft as appropriate
            newStatus = invoice.sentAt ? "sent" : "draft";
          } else if (newAmountPaid >= invoiceTotal) {
            newStatus = "paid";
          } else {
            newStatus = "partial";
          }

          await db
            .update(invoices)
            .set({
              amountPaid: newAmountPaid.toFixed(2),
              status: newStatus,
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, payment.invoiceId));
        }
      }

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error("[DELETE /api/payments/:id]", error);
      return new NextResponse(error.message || "Internal Server Error", {
        status: 500,
      });
    }
  });
}
