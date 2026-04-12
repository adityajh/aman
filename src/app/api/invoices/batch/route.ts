import { db } from "@/lib/db";
import { sessions, invoices, invoiceLineItems } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, isNull, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

export async function POST(req: Request) {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { clientIds, billingMonth } = await req.json();

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return new NextResponse("Invalid client IDs provided", { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const clientId of clientIds) {
      try {
        // 1. Fetch unbilled completed sessions for this client (with fee scheme to get currency)
        const unbilledSessions = await db.query.sessions.findMany({
          where: and(
            eq(sessions.clientId, clientId),
            eq(sessions.status, 'completed'),
            isNull(sessions.invoiceId)
          ),
          with: {
            feeScheme: true
          }
        });

        if (unbilledSessions.length === 0) continue;

        // 2. Determine currency (default to INR if no scheme found)
        const currency = (unbilledSessions[0] as any).feeScheme?.currency || 'INR';

        // 3. Generate invoice number (simple count-based)
        const result = await db.select({ count: sql<number>`count(*)` }).from(invoices);
        const invoiceNumber = `INV-${new Date().getFullYear()}-${(result[0].count + 1).toString().padStart(4, '0')}`;

        // 4. Calculate totals
        let subtotal = 0;
        unbilledSessions.forEach(s => {
          subtotal += parseFloat(s.feeCharged || '0');
        });

        // 5. Create invoice with correct currency
        const [newInvoice] = await db.insert(invoices).values({
          clientId,
          invoiceNumber,
          billingMonth: billingMonth || format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
          subtotal: subtotal.toString(),
          total: subtotal.toString(),
          currency,
          status: 'draft',
        }).returning();

        // 5. Create line items and update sessions
        for (const session of unbilledSessions) {
          const description = `Session - ${format(new Date(session.scheduledAt), "d MMM yyyy")} (${session.durationMin} min)`;
          
          await db.insert(invoiceLineItems).values({
            invoiceId: newInvoice.id,
            sessionId: session.id,
            description,
            unitPrice: session.feeCharged || '0',
            amount: session.feeCharged || '0',
          });

          await db.update(sessions).set({
            invoiceId: newInvoice.id,
          }).where(eq(sessions.id, session.id));
        }

        results.push(newInvoice);
      } catch (err: any) {
        console.error(`Failed to process client ${clientId}:`, err);
        errors.push({ clientId, error: err.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: results.length, 
      invoices: results,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
