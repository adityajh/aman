import { invoices, payments, receipts } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { istTodayStr } from "@/lib/tz";
import { nextReceiptNumber } from "@/lib/receipts";

export type PaymentMethod =
  | "cash" | "upi" | "bank_transfer" | "card" | "online" | "write_off" | "credit" | "refund" | "other";

export type RecordPaymentInput = {
  tenantId: string;
  clientId: string;
  amount: number;
  currency?: string;
  paymentDate?: string | null; // yyyy-MM-dd (IST); defaults to today
  method: PaymentMethod;
  referenceId?: string | null;
  notes?: string | null;
  // Online payments: the gateway's payment id (unique per tenant).
  providerPaymentId?: string | null;
  // Apply to this invoice first, then FIFO across the rest.
  preferInvoiceId?: string | null;
};

export type RecordPaymentResult = {
  receipt: typeof receipts.$inferSelect;
  receiptNumber: string;
  allocations: { invoiceId: string; invoiceNumber: string; amount: number }[];
  excess: number;
  currency: string;
};

/**
 * Records one payment event: creates the receipt, then allocates it across the
 * client's outstanding invoices in the same currency (oldest first, or the
 * preferred invoice first). Leftover becomes account credit. Refunds (negative
 * amounts) are recorded unallocated.
 *
 * Must run inside withTenantContext. Used by the manual Payments form and by
 * online payments from Razorpay, so both land in the ledger the same way.
 */
export async function recordPayment(tx: any, input: RecordPaymentInput): Promise<RecordPaymentResult> {
  const {
    tenantId,
    clientId,
    currency = "INR",
    method,
    referenceId = null,
    notes = null,
    providerPaymentId = null,
    preferInvoiceId = null,
  } = input;
  let remaining = input.amount;
  const payDate = input.paymentDate || istTodayStr();

  const rcptYear = parseInt(payDate.slice(0, 4), 10) || new Date().getUTCFullYear();
  const receiptNumber = await nextReceiptNumber(rcptYear);
  const [receipt] = await tx
    .insert(receipts)
    .values({
      tenantId,
      receiptNumber,
      clientId,
      amount: remaining.toFixed(2),
      currency,
      paymentDate: payDate,
      method,
      referenceId,
      notes,
      providerPaymentId,
    })
    .returning();

  const paymentRecords: any[] = [];
  const allocations: RecordPaymentResult["allocations"] = [];
  const base = { tenantId, receiptId: receipt.id, clientId, paymentDate: payDate, currency, method, referenceId };

  if (remaining > 0) {
    const outstanding = await tx.query.invoices.findMany({
      where: and(
        eq(invoices.clientId, clientId),
        eq(invoices.currency, currency),
        inArray(invoices.status, ["draft", "sent", "partial", "overdue"]),
      ),
      orderBy: [asc(invoices.issuedDate), asc(invoices.createdAt)],
    });
    if (preferInvoiceId) {
      outstanding.sort((a: any, b: any) => (a.id === preferInvoiceId ? -1 : b.id === preferInvoiceId ? 1 : 0));
    }

    for (const inv of outstanding) {
      if (remaining <= 0) break;
      const total = parseFloat(inv.total);
      const paid = parseFloat(inv.amountPaid || "0");
      const owed = total - paid;
      if (owed <= 0) continue;

      const allocation = Math.min(remaining, owed);
      const newPaid = paid + allocation;
      remaining -= allocation;

      let status: "paid" | "partial" | "sent" | "overdue" | "draft" = "partial";
      if (newPaid >= total) {
        status = "paid";
      } else {
        // preserve overdue/sent state if not fully paid
        status = inv.status as any;
        if (status === "draft") status = "partial";
      }

      await tx
        .update(invoices)
        .set({ amountPaid: newPaid.toFixed(2), status, updatedAt: new Date() })
        .where(eq(invoices.id, inv.id));

      paymentRecords.push({
        ...base,
        invoiceId: inv.id,
        amount: allocation.toFixed(2),
        notes: notes ? `${notes} (Allocated to ${inv.invoiceNumber})` : `Allocated to ${inv.invoiceNumber}`,
      });
      allocations.push({ invoiceId: inv.id, invoiceNumber: inv.invoiceNumber, amount: allocation });
    }

    if (remaining > 0) {
      paymentRecords.push({
        ...base,
        invoiceId: null,
        amount: remaining.toFixed(2),
        notes: notes ? `${notes} (Excess ${currency} Credit)` : `Excess ${currency} Credit`,
      });
    }
  } else if (remaining < 0 && method === "refund") {
    paymentRecords.push({ ...base, invoiceId: null, amount: remaining.toFixed(2), notes: notes || `Refund` });
  }

  if (paymentRecords.length > 0) {
    await tx.insert(payments).values(paymentRecords);
  }

  return { receipt, receiptNumber, allocations, excess: remaining > 0 ? remaining : 0, currency };
}
