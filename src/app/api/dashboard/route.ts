import { db } from "@/lib/db";
import {
  sessions,
  invoices,
  sessionNotes,
  practiceSettings,
} from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, or, sql } from "drizzle-orm";
import { istStartOfFYUTC, istStartOfMonthUTC, istAddDaysUTC } from "@/lib/tz";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function GET() {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const now = new Date();
      // Month / FY boundaries are anchored to IST so the dashboard is consistent
      // regardless of where the runtime executes (Vercel runs in UTC).
      const fyStart = istStartOfFYUTC();
      const monthStart = istStartOfMonthUTC();

      const settingsData = await tx.select().from(practiceSettings).limit(1);
      const settings = settingsData[0];
      const orsCutoff = settings?.orsCutoff ?? 25;
      const srsCutoff = settings?.srsCutoff ?? 36;
      const orsDeteriorationThreshold =
        settings?.orsDeteriorationThreshold ?? 5;
      const srsDeclineThreshold = settings?.srsDeclineThreshold ?? 2;

      // Fetch all sessions with notes
      const allSessions = await tx.query.sessions.findMany({
        with: {
          note: true,
          client: true,
        },
        orderBy: (sessions: any, { desc }: any) => [desc(sessions.scheduledAt)],
      });

      let scheduledMonth = 0;
      let completedMonth = 0;
      let scheduledYtd = 0;
      let completedYtd = 0;
      let unbilledSessions = 0;
      let upcomingSessions = 0;

      const sevenDaysFromNow = istAddDaysUTC(now, 7);

      let totalPast = 0;
      let noShows = 0;

      // Grouping for client metrics
      const clientSessions = new Map<string, any[]>();

      allSessions.forEach((s: any) => {
        const d = new Date(s.scheduledAt);

        // Time aggregations
        if (d >= fyStart) {
          if (s.status === "scheduled") scheduledYtd++;
          if (s.status === "completed" || s.invoiceId) completedYtd++; // invoiceId implies it was completed
        }
        if (d >= monthStart) {
          if (s.status === "scheduled") scheduledMonth++;
          if (s.status === "completed" || s.invoiceId) completedMonth++;
        }

        // No Show Rate
        if (s.status !== "scheduled" && s.status !== "cancelled") {
          totalPast++;
          if (s.status === "no_show") noShows++;
        }

        // Unbilled: completed but not linked to an invoice
        if (s.status === "completed" && !s.invoiceId) {
          unbilledSessions++;
        }

        // Upcoming: scheduled within the next 7 days
        const d2 = new Date(s.scheduledAt);
        if (s.status === "scheduled" && d2 >= now && d2 <= sevenDaysFromNow) {
          upcomingSessions++;
        }

        // Client mapping for clinical metrics
        if (!clientSessions.has(s.clientId)) {
          clientSessions.set(s.clientId, []);
        }
        clientSessions.get(s.clientId)!.push(s);
      });

      let deterioratingClients = 0;
      let dissatisfiedClients = 0;
      const deterioratingList: { id: string; name: string }[] = [];
      const dissatisfiedList: { id: string; name: string }[] = [];

      clientSessions.forEach((clientSess) => {
        // clientSess is ordered by descending scheduledAt (latest first)
        if (clientSess.length === 0) return;

        // Exclude inactive clients from dashboard clinical alert counts
        const clientDetails = clientSess[0].client;
        if (clientDetails && !clientDetails.isActive) return;

        const sessionsWithOrs = clientSess.filter(
          (s: any) => s.note?.orsTotal != null,
        );
        if (sessionsWithOrs.length >= 2) {
          const latestOrs = sessionsWithOrs[0].note.orsTotal;
          const initialOrs =
            sessionsWithOrs[sessionsWithOrs.length - 1].note.orsTotal;
          if (initialOrs - latestOrs > orsDeteriorationThreshold) {
            deterioratingClients++;
            deterioratingList.push({
              id: clientDetails.id,
              name: clientDetails.name,
            });
          }
        }

        const sessionsWithSrs = clientSess.filter(
          (s: any) => s.note?.srsTotal != null,
        );
        if (sessionsWithSrs.length >= 1) {
          const latestSrs = sessionsWithSrs[0].note.srsTotal;
          let isLow = latestSrs < srsCutoff;

          if (!isLow && sessionsWithSrs.length >= 2) {
            const prevSrs = sessionsWithSrs[1].note.srsTotal;
            if (prevSrs - latestSrs > srsDeclineThreshold) {
              isLow = true;
            }
          }

          if (isLow) {
            dissatisfiedClients++;
            dissatisfiedList.push({
              id: clientDetails.id,
              name: clientDetails.name,
            });
          }
        }
      });

      const noShowRate =
        totalPast > 0 ? ((noShows / totalPast) * 100).toFixed(1) : "0.0";

      // Outstanding Revenue
      const outstandingRevenue = await tx
        .select({
          currency: sql<string>`COALESCE(${invoices.currency}, 'INR')`,
          total: sql<number>`SUM(CAST(${invoices.total} AS NUMERIC) - CAST(${invoices.amountPaid} AS NUMERIC))`,
        })
        .from(invoices)
        .where(
          or(
            eq(invoices.status, "draft"),
            eq(invoices.status, "sent"),
            eq(invoices.status, "partial"),
            eq(invoices.status, "overdue"),
          ),
        )
        .groupBy(sql`COALESCE(${invoices.currency}, 'INR')`);

      // At-risk = active clients whose LATEST completed-session note has an
      // ORS or SRS flag.
      const riskRes: any = await tx.execute(sql`
      SELECT count(*)::int AS count FROM (
        SELECT DISTINCT ON (s.client_id) n.ors_flag AS o, n.srs_flag AS sr, c.is_active AS active
        FROM sessions s
        JOIN session_notes n ON n.session_id = s.id
        JOIN clients c ON c.id = s.client_id
        WHERE s.status = 'completed'
        ORDER BY s.client_id, s.scheduled_at DESC, n.created_at DESC
      ) t WHERE t.active AND (t.o OR t.sr)
    `);
      const riskRows = Array.isArray(riskRes) ? riskRes : (riskRes.rows ?? []);
      const activeRiskFlags = Number(riskRows[0]?.count ?? 0);

      return NextResponse.json({
        outstanding: outstandingRevenue,
        activeRiskFlags,
        unbilledSessions,
        upcomingSessions,
        scheduledMonth,
        completedMonth,
        scheduledYtd,
        completedYtd,
        deterioratingClients,
        deterioratingList,
        dissatisfiedClients,
        dissatisfiedList,
        noShowRate: parseFloat(noShowRate),
      });
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
