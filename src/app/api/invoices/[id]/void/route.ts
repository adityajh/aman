import { db } from "@/lib/db";
import { invoices, invoiceLineItems, sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

// POST /api/invoices/[id]/void
//
// Voids a draft/sent/partial/overdue invoice:
//   1. Deletes the invoice's line items
//   2. Sets each linked session's invoice_id back to NULL (so the sessions
//      reappear as unbilled and can be re-batched)
//   3. Sets the invoice's status to 'void' (preserves the row for audit)
//
// Guards:
//   - 400 if any payment has been recorded (amountPaid > 0)
//   - 400 if the invoice is already void or fully paid
//
// Note: payments table has FK invoice_id ON DELETE SET NULL, so we don't
// touch payment rows here — by design no payments should exist if the
// amountPaid guard passed.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const invoice = await tx.query.invoices.findFirst({
        where: eq(invoices.id, id),
      });

      if (!invoice)
        return new NextResponse("Invoice not found", { status: 404 });

      if (invoice.status === "void") {
        return new NextResponse("Invoice is already voided", { status: 400 });
      }

      if (invoice.status === "paid") {
        return new NextResponse(
          "This invoice has been marked paid. Voiding it would break the audit trail.",
          { status: 400 },
        );
      }

      if (parseFloat(invoice.amountPaid || "0") > 0) {
        return new NextResponse(
          "This invoice has at least one payment recorded against it. Voiding it would break the audit trail. Delete the payment first if it was recorded in error.",
          { status: 400 },
        );
      }

      // 1. Unlink sessions back to unbilled.
      await db
        .update(sessions)
        .set({ invoiceId: null, updatedAt: new Date() })
        .where(eq(sessions.invoiceId, id));

      // 2. Remove the line items so the invoice carries no false detail.
      await db
        .delete(invoiceLineItems)
        .where(eq(invoiceLineItems.invoiceId, id));

      // 3. Mark the invoice itself as voided.
      await db
        .update(invoices)
        .set({
          status: "void",
          // Zero out totals so it can't be confused with a live obligation.
          subtotal: "0",
          total: "0",
          amountPaid: "0",
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, id));

      return NextResponse.json({ success: true, voidedInvoiceId: id });
    } catch (error: any) {
      console.error("[POST /api/invoices/:id/void]", error);
      return new NextResponse(error.message || "Internal Server Error", {
        status: 500,
      });
    }
  });
}
