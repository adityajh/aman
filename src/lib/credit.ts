import { db } from "@/lib/db";
import { payments, invoices } from "@/lib/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";

// Apply a client's unallocated credit (overpayments held as payment rows with
// no invoice link, same currency) against a specific invoice.
//
// It "moves" money from the excess rows into allocation rows linked to the
// invoice — preserving the invariant that the sum of a client's payment rows
// equals the total they've actually paid — then updates the invoice's
// amountPaid + status. Returns the amount applied.
export async function applyClientCredit(
  clientId: string,
  currency: string,
  invoice: { id: string; total: string; amountPaid: string | null; invoiceNumber: string },
): Promise<number> {
  const owed = parseFloat(invoice.total) - parseFloat(invoice.amountPaid || "0");
  if (owed <= 0) return 0;

  // Oldest credit first (FIFO), same currency only.
  const excessRows = await db.query.payments.findMany({
    where: and(
      eq(payments.clientId, clientId),
      isNull(payments.invoiceId),
      eq(payments.currency, currency),
    ),
    orderBy: [asc(payments.paymentDate), asc(payments.createdAt)],
  });

  let remaining = owed;
  let applied = 0;

  for (const ex of excessRows) {
    if (remaining <= 0) break;
    const exAmt = parseFloat(ex.amount);
    if (exAmt <= 0) continue;
    const take = Math.min(exAmt, remaining);

    // Allocation row linked to the invoice (preserve original method/date/ref
    // so the receipt history stays accurate about when the money came in).
    await db.insert(payments).values({
      clientId,
      invoiceId: invoice.id,
      amount: take.toFixed(2),
      paymentDate: ex.paymentDate,
      currency,
      method: ex.method,
      referenceId: ex.referenceId,
      notes: `Applied advance credit to ${invoice.invoiceNumber}`,
    });

    // Draw down the excess row (delete when fully consumed).
    if (take >= exAmt) {
      await db.delete(payments).where(eq(payments.id, ex.id));
    } else {
      await db
        .update(payments)
        .set({ amount: (exAmt - take).toFixed(2) })
        .where(eq(payments.id, ex.id));
    }

    remaining -= take;
    applied += take;
  }

  if (applied > 0) {
    const newPaid = parseFloat(invoice.amountPaid || "0") + applied;
    const total = parseFloat(invoice.total);
    const status: "paid" | "partial" = newPaid >= total ? "paid" : "partial";
    await db
      .update(invoices)
      .set({ amountPaid: newPaid.toFixed(2), status, updatedAt: new Date() })
      .where(eq(invoices.id, invoice.id));
  }

  return applied;
}
