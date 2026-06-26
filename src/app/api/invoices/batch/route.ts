import { db } from "@/lib/db";
import { sessions, invoices, invoiceLineItems, clients, feeSchemes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, isNull, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatIST, istNowParts, istFirstOfMonthStr } from "@/lib/tz";

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
        // 1. Fetch unbilled sessions for this client:
        //    - all `completed` sessions, billed at their `feeCharged`
        //    - `cancelled` / `no_show` sessions, billed at `cancellationFee`
        //      (only if it's > 0 — fee=0 means it was a free cancellation).
        const candidateSessions = await db.query.sessions.findMany({
          where: and(
            eq(sessions.clientId, clientId),
            isNull(sessions.invoiceId),
            sql`(
              ${sessions.status} = 'completed'
              OR (${sessions.status} IN ('cancelled', 'no_show') AND COALESCE(${sessions.cancellationFee}, '0')::numeric > 0)
            )`
          ),
          with: {
            feeScheme: true
          }
        });

        if (candidateSessions.length === 0) continue;

        // Compute the billable amount per session in one place so the totals
        // and line items can't disagree.
        const billable = candidateSessions.map(s => {
          const amount = s.status === 'completed'
            ? parseFloat(s.feeCharged || '0')
            : parseFloat(s.cancellationFee || '0');
          return { session: s, amount };
        }).filter(b => b.amount > 0);

        if (billable.length === 0) continue;

        // Line items must read chronologically (oldest session first) on the
        // invoice. The candidate query has no ordering guarantee, so sort here.
        billable.sort((a, b) =>
          new Date(a.session.scheduledAt).getTime() - new Date(b.session.scheduledAt).getTime()
        );

        // 2. Determine currency (default to INR if no scheme found)
        const client = await db.query.clients.findFirst({
          where: eq(clients.id, clientId)
        });

        let currency = 'INR';
        if (client?.defaultFeeSchemeId) {
          const scheme = await db.query.feeSchemes.findFirst({
            where: eq(feeSchemes.id, client.defaultFeeSchemeId)
          });
          if (scheme) currency = scheme.currency;
        }

        // 3. Generate invoice number (simple count-based) — year is the IST year
        const result = await db.select({ count: sql<number>`count(*)` }).from(invoices);
        const invoiceNumber = `INV-${istNowParts().year}-${(result[0].count + 1).toString().padStart(4, '0')}`;

        // 4. Totals
        const subtotal = billable.reduce((sum, b) => sum + b.amount, 0);

        // 5. Create invoice with correct currency
        const [newInvoice] = await db.insert(invoices).values({
          clientId,
          invoiceNumber,
          billingMonth: billingMonth || istFirstOfMonthStr(),
          subtotal: subtotal.toString(),
          total: subtotal.toString(),
          currency,
          status: 'draft',
        }).returning();

        // 6. Create line items and update sessions
        for (const { session, amount } of billable) {
          const dateStr = formatIST(session.scheduledAt, "d MMM yyyy");
          let description: string;
          if (session.status === 'completed') {
            description = `Session - ${dateStr} (${session.invoicedDurationMin ?? session.durationMin} min)`;
          } else if (session.status === 'no_show') {
            // No internal cancellation reason/notes on the client-facing invoice
            // — just label the line as a no-show.
            description = `No show - ${dateStr}`;
          } else {
            description = `Cancellation - ${dateStr}`;
          }
          const amountStr = amount.toFixed(2);

          await db.insert(invoiceLineItems).values({
            invoiceId: newInvoice.id,
            sessionId: session.id,
            description,
            unitPrice: amountStr,
            amount: amountStr,
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
