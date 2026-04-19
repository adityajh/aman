import { db } from "@/lib/db";
import { sessions, invoices, sessionNotes, practiceSettings } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, or, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const now = new Date();
    // Indian Financial Year: Starts April 1st
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const fyStart = new Date(currentMonth >= 3 ? currentYear : currentYear - 1, 3, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const settingsData = await db.select().from(practiceSettings).limit(1);
    const settings = settingsData[0];
    const orsCutoff = settings?.orsCutoff ?? 25;
    const srsCutoff = settings?.srsCutoff ?? 36;
    const orsDeteriorationThreshold = settings?.orsDeteriorationThreshold ?? 5;
    const srsDeclineThreshold = settings?.srsDeclineThreshold ?? 2;

    // Fetch all sessions with notes
    const allSessions = await db.query.sessions.findMany({
      with: {
        note: true,
        client: true
      },
      orderBy: (sessions, { desc }) => [desc(sessions.scheduledAt)]
    });

    let scheduledMonth = 0;
    let completedMonth = 0;
    let scheduledYtd = 0;
    let completedYtd = 0;

    let totalPast = 0;
    let noShows = 0;

    // Grouping for client metrics
    const clientSessions = new Map<string, any[]>();

    allSessions.forEach(s => {
      const d = new Date(s.scheduledAt);
      
      // Time aggregations
      if (d >= fyStart) {
        if (s.status === 'scheduled') scheduledYtd++;
        if (s.status === 'completed' || s.invoiceId) completedYtd++; // invoiceId implies it was completed
      }
      if (d >= monthStart) {
        if (s.status === 'scheduled') scheduledMonth++;
        if (s.status === 'completed' || s.invoiceId) completedMonth++;
      }

      // No Show Rate (Look at all past sessions that are not scheduled/cancelled but count no_shows)
      if (s.status !== 'scheduled' && s.status !== 'cancelled') {
        totalPast++;
        if (s.status === 'no_show') noShows++;
      }

      // Client mapping for clinical metrics
      if (!clientSessions.has(s.clientId)) {
        clientSessions.set(s.clientId, []);
      }
      clientSessions.get(s.clientId)!.push(s);
    });

    let deterioratingClients = 0;
    let dissatisfiedClients = 0;

    clientSessions.forEach(clientSess => {
      // clientSess is ordered by descending scheduledAt (latest first)
      if (clientSess.length === 0) return;
      
      // Exclude inactive clients from dashboard clinical alert counts
      const clientDetails = clientSess[0].client;
      if (clientDetails && !clientDetails.isActive) return;

      const sessionsWithOrs = clientSess.filter(s => s.note?.orsTotal != null);
      if (sessionsWithOrs.length >= 2) {
        const latestOrs = sessionsWithOrs[0].note.orsTotal;
        const initialOrs = sessionsWithOrs[sessionsWithOrs.length - 1].note.orsTotal;
        if ((initialOrs - latestOrs) > orsDeteriorationThreshold) {
          deterioratingClients++;
        }
      }

      const sessionsWithSrs = clientSess.filter(s => s.note?.srsTotal != null);
      if (sessionsWithSrs.length >= 1) {
        const latestSrs = sessionsWithSrs[0].note.srsTotal;
        let isLow = latestSrs < srsCutoff;
        
        if (!isLow && sessionsWithSrs.length >= 2) {
          const prevSrs = sessionsWithSrs[1].note.srsTotal;
          if ((prevSrs - latestSrs) > srsDeclineThreshold) {
            isLow = true;
          }
        }
        
        if (isLow) dissatisfiedClients++;
      }
    });

    const noShowRate = totalPast > 0 ? ((noShows / totalPast) * 100).toFixed(1) : "0.0";

    // Outstanding Revenue
    const outstandingRevenue = await db
      .select({ 
        currency: sql<string>`COALESCE(${invoices.currency}, 'INR')`,
        total: sql<number>`SUM(CAST(${invoices.total} AS NUMERIC) - CAST(${invoices.amountPaid} AS NUMERIC))` 
      })
      .from(invoices)
      .where(or(
        eq(invoices.status, 'draft'), 
        eq(invoices.status, 'sent'), 
        eq(invoices.status, 'partial'), 
        eq(invoices.status, 'overdue')
      ))
      .groupBy(sql`COALESCE(${invoices.currency}, 'INR')`);

    // Risk Flags (Medium/High)
    const [riskFlags] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sessionNotes)
        .where(or(eq(sessionNotes.riskFlag, 'medium'), eq(sessionNotes.riskFlag, 'high')));

    return NextResponse.json({
      outstanding: outstandingRevenue,
      activeRiskFlags: riskFlags.count || 0,
      scheduledMonth,
      completedMonth,
      scheduledYtd,
      completedYtd,
      deterioratingClients,
      dissatisfiedClients,
      noShowRate: parseFloat(noShowRate)
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
