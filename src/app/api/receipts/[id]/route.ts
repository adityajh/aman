import { db } from "@/lib/db";
import { receipts, payments, invoices } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, sum } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Delete a whole receipt (the payment event). Its allocation rows cascade via
// the FK; then every invoice the receipt touched is recalculated from the
// payments that remain.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const receipt = await db.query.receipts.findFirst({
      where: eq(receipts.id, id),
      with: { allocations: true },
    });
    if (!receipt) return new NextResponse("Receipt not found", { status: 404 });

    // Invoices this receipt was applied to (recalc after delete).
    const invoiceIds = [...new Set(receipt.allocations.map((a) => a.invoiceId).filter(Boolean) as string[])];

    // Deleting the receipt cascades its allocation rows (payments.receipt_id
    // FK is ON DELETE cascade).
    await db.delete(receipts).where(eq(receipts.id, id));

    for (const invId of invoiceIds) {
      const remaining = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(eq(payments.invoiceId, invId));
      const newPaid = parseFloat(remaining[0]?.total || "0");

      const invoice = await db.query.invoices.findFirst({ where: eq(invoices.id, invId) });
      if (!invoice) continue;
      const total = parseFloat(invoice.total);
      let status: "paid" | "partial" | "sent" | "draft";
      if (newPaid <= 0) status = invoice.sentAt ? "sent" : "draft";
      else if (newPaid >= total) status = "paid";
      else status = "partial";

      await db
        .update(invoices)
        .set({ amountPaid: newPaid.toFixed(2), status, updatedAt: new Date() })
        .where(eq(invoices.id, invId));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/receipts/:id]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
