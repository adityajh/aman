import { db } from "@/lib/db";
import { payments, invoices, clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc, asc, eq, and, or, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const allPayments = await db.query.payments.findMany({
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
}

export async function POST(req: Request) {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { clientId, amount, paymentDate, currency = "INR", method, referenceId, notes } = await req.json();
    let remainingPayment = parseFloat(amount);

    if (isNaN(remainingPayment) || remainingPayment <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    // 1. Fetch outstanding invoices of the SAME CURRENCY (FIFO)
    const outstandingInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.clientId, clientId),
        eq(invoices.currency, currency),
        inArray(invoices.status, ["draft", "sent", "partial", "overdue"])
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
      let status: "paid" | "partial" | "sent" | "overdue" | "draft" = "partial";
      if (newPaid >= total) {
        status = "paid";
      } else {
        // preserve overdue/sent state if not fully paid
        status = inv.status as any;
        if (status === "draft") status = "partial";
      }

      await db.update(invoices)
        .set({ 
          amountPaid: newPaid.toFixed(2), 
          status,
          updatedAt: new Date()
        })
        .where(eq(invoices.id, inv.id));

      // Prepare payment record
      paymentRecords.push({
        clientId,
        invoiceId: inv.id,
        amount: allocation.toFixed(2),
        paymentDate: paymentDate || new Date().toISOString().split("T")[0],
        currency,
        method,
        referenceId,
        notes: notes ? `${notes} (Allocated to ${inv.invoiceNumber})` : `Allocated to ${inv.invoiceNumber}`,
      });
    }

    // 3. Handle leftover (Credit / Overpayment in that currency)
    if (remainingPayment > 0) {
      paymentRecords.push({
        clientId,
        invoiceId: null,
        amount: remainingPayment.toFixed(2),
        paymentDate: paymentDate || new Date().toISOString().split("T")[0],
        currency,
        method,
        referenceId,
        notes: notes ? `${notes} (Excess ${currency} Credit)` : `Excess ${currency} Credit`,
      });
    }

    // 4. Batch insert payments
    if (paymentRecords.length > 0) {
      await db.insert(payments).values(paymentRecords);
    }

    return NextResponse.json({ 
      success: true, 
      allocated: paymentRecords.length,
      excess: remainingPayment > 0 ? remainingPayment.toFixed(2) : "0",
      currency
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
