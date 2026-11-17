import { db } from "@/lib/db";
import {
  invoices,
  payments,
  receipts,
  practiceSettings,
} from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { istTodayStr } from "@/lib/tz";
import { sendReceiptEmail } from "@/lib/receipt-email";
import { nextReceiptNumber } from "@/lib/receipts";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

// POST /api/invoices/[id]/receipt
// Body: { amount, paymentDate?, method?, referenceId?, notes?, sendEmail? }
//
// Records a single payment against THIS invoice (not FIFO), updates the
// invoice's amountPaid + status, and optionally emails a receipt to the
// client. Honors the practice-wide Test Mode (email_override).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const body = await req.json();
      const amountNum = parseFloat(body.amount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        return new NextResponse("Invalid amount", { status: 400 });
      }

      const [invoice, settings] = await Promise.all([
        tx.query.invoices.findFirst({
          where: eq(invoices.id, id),
          with: { client: true, lineItems: true },
        }),
        tx.query.practiceSettings.findFirst(),
      ]);

      if (!invoice || !invoice.client) {
        return new NextResponse("Invoice not found", { status: 404 });
      }

      const total = parseFloat(invoice.total);
      const alreadyPaid = parseFloat(invoice.amountPaid || "0");
      const newPaid = alreadyPaid + amountNum;

      let newStatus: "paid" | "partial" | "sent" | "overdue" | "draft" =
        "partial";
      if (newPaid >= total) {
        newStatus = "paid";
      } else if (invoice.status === "draft") {
        newStatus = "partial";
      } else {
        newStatus = invoice.status as any;
        if (newStatus === "draft") newStatus = "partial";
      }

      const payDate = body.paymentDate || istTodayStr();

      // Create the receipt (payment event), then the allocation against this invoice.
      const rcptYear =
        parseInt(payDate.slice(0, 4), 10) || new Date().getUTCFullYear();
      const receiptNumber = await nextReceiptNumber(rcptYear);
      const [receipt] = await tx
        .insert(receipts)
        .values({
            tenantId: tenantId,
            receiptNumber,
          clientId: invoice.clientId,
          amount: amountNum.toFixed(2),
          currency: invoice.currency,
          paymentDate: payDate,
          method: body.method || "upi",
          referenceId: body.referenceId || null,
          notes: body.notes || null,
        })
        .returning();

      await tx.insert(payments).values({
          tenantId: tenantId,
        receiptId: receipt.id,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        amount: amountNum.toFixed(2),
        paymentDate: payDate,
        currency: invoice.currency,
        method: body.method || "upi",
        referenceId: body.referenceId || null,
        notes: body.notes
          ? `${body.notes} (Receipt for ${invoice.invoiceNumber})`
          : `Receipt for ${invoice.invoiceNumber}`,
      });

      await tx
        .update(invoices)
        .set({
          amountPaid: newPaid.toFixed(2),
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      // Email the receipt if requested + client has an address on file.
      let emailedTo: string | null = null;
      let testMode = false;
      if (body.sendEmail && invoice.client.email) {
        const sent = await sendReceiptEmail({
          settings,
          client: { name: invoice.client.name, email: invoice.client.email },
          invoiceNumber: invoice.invoiceNumber,
          currency: invoice.currency,
          receiptNumber,
          amount: amountNum,
          paymentDate: body.paymentDate,
          method: body.method || "upi",
          referenceId: body.referenceId,
          invoiceTotal: total,
          paidSoFar: newPaid,
        });
        testMode = sent.testMode;
        emailedTo = sent.sentTo;
        // Stamp when the receipt was sent (for tracking).
        await tx
          .update(receipts)
          .set({ sentAt: new Date() })
          .where(eq(receipts.id, receipt.id));
      }

      return NextResponse.json({
        success: true,
        receiptNumber,
        newStatus,
        amountPaid: newPaid.toFixed(2),
        balance: Math.max(0, total - newPaid).toFixed(2),
        emailedTo,
        testMode,
      });
    } catch (error: any) {
      console.error("[POST /api/invoices/:id/receipt]", error);
      return new NextResponse(error.message || "Internal Server Error", {
        status: 500,
      });
    }
  });
}
