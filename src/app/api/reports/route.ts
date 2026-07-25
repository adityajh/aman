import { db } from "@/lib/db";
import { clients, sessions, practiceSettings } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stddev(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
}

export async function GET() {
  const serverSession = await getServerSession(authOptions);
  if (!serverSession) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const settingsArr = await db.select().from(practiceSettings).limit(1);
    const settings = settingsArr[0];
    const orsCutoff = settings?.orsCutoff ?? 25;
    const orsRciThreshold = settings?.orsRciThreshold ?? 5;

    // Closed clients with completed sessions and notes
    const closedClients = await db.query.clients.findMany({
      where: eq(clients.isActive, false),
      with: {
        sessions: {
          where: (s, { eq }) => eq(s.status, "completed"),
          orderBy: (s, { asc }) => [asc(s.scheduledAt)],
          with: { note: true },
        },
      },
    });

    // Active clients — latest session note per client for At Risk count
    const activeSessions = await db.query.sessions.findMany({
      where: and(eq(sessions.status, "completed")),
      with: { client: true, note: true },
      orderBy: (s, { desc }) => [desc(s.scheduledAt)],
    });
    const activeLatestNote = new Map<string, any>();
    for (const s of activeSessions) {
      if (!s.client?.isActive) continue;
      if (!activeLatestNote.has(s.clientId) && s.note) {
        activeLatestNote.set(s.clientId, s.note);
      }
    }
    const atRiskClients = [...activeLatestNote.values()].filter(
      (n) => n.orsFlag === true || n.srsFlag === true
    ).length;

    // Per-client derived values
    const clientData = closedClients.map((c) => {
      const withOrs = c.sessions.filter((s) => s.note?.orsTotal != null);
      const initialOrs = withOrs.length > 0 ? parseFloat(withOrs[0].note!.orsTotal!) : null;
      const finalOrs =
        withOrs.length > 0 ? parseFloat(withOrs[withOrs.length - 1].note!.orsTotal!) : null;

      let tenureWeeks: number | null = null;
      if (c.sessions.length > 0) {
        const first = new Date(c.sessions[0].scheduledAt).getTime();
        const last = c.terminatedAt
          ? new Date(c.terminatedAt).getTime()
          : new Date(c.sessions[c.sessions.length - 1].scheduledAt).getTime();
        tenureWeeks = (last - first) / (1000 * 60 * 60 * 24 * 7);
      }

      const srsScores = c.sessions
        .filter((s) => s.note?.srsTotal != null)
        .map((s) => parseFloat(s.note!.srsTotal!));

      return {
        id: c.id,
        initialOrs,
        finalOrs,
        tenureWeeks,
        sessionCount: c.sessions.length,
        srsScores,
        prematureTerminationManual: c.prematureTerminationManual ?? null,
      };
    });

    const totalClosed = clientData.length;

    // % Initial ORS ≤ cutoff
    const lowOrsCohort = clientData.filter((c) => c.initialOrs != null && c.initialOrs <= orsCutoff);
    const pctInitialLowOrs =
      totalClosed > 0 ? (lowOrsCohort.length / totalClosed) * 100 : null;

    // Median tenure (weeks) and sessions
    const medianTenureWeeks = median(
      clientData.filter((c) => c.tenureWeeks != null).map((c) => c.tenureWeeks!)
    );
    const medianSessions = median(clientData.map((c) => c.sessionCount));

    // Outcome ratios — cohort: low-ORS clients with both initial + final ORS recorded
    const outcomeCohort = lowOrsCohort.filter(
      (c) => c.initialOrs != null && c.finalOrs != null
    );

    let rciCount = 0;
    let deteriorationCount = 0;
    let noChangeCount = 0;
    let cscCount = 0;
    let ptrICount = 0;

    for (const c of outcomeCohort) {
      const diff = c.finalOrs! - c.initialOrs!;
      if (diff >= orsRciThreshold) {
        rciCount++;
        if (c.finalOrs! > orsCutoff) cscCount++;
      } else if (c.initialOrs! - c.finalOrs! >= orsRciThreshold) {
        deteriorationCount++;
      } else {
        noChangeCount++;
      }
      // PTR-I: not a CSC outcome (diff < threshold OR final still in distress range)
      if (diff < orsRciThreshold || c.finalOrs! <= orsCutoff) ptrICount++;
    }

    const outcomeDenom = outcomeCohort.length;
    const pctRci = outcomeDenom > 0 ? (rciCount / outcomeDenom) * 100 : null;
    const pctDeterioration = outcomeDenom > 0 ? (deteriorationCount / outcomeDenom) * 100 : null;
    const pctNoChange = outcomeDenom > 0 ? (noChangeCount / outcomeDenom) * 100 : null;
    const pctCsc = outcomeDenom > 0 ? (cscCount / outcomeDenom) * 100 : null;
    const ptrIRate = outcomeDenom > 0 ? (ptrICount / outcomeDenom) * 100 : null;

    // PTR-II and Final PTR
    const highOrsCohort = clientData.filter(
      (c) => c.initialOrs != null && c.initialOrs > orsCutoff
    );
    const highOrsUnflagged = highOrsCohort.filter(
      (c) => c.prematureTerminationManual == null
    ).length;
    const ptrIIManualCount = highOrsCohort.filter(
      (c) => c.prematureTerminationManual === true
    ).length;
    const finalPtrRate =
      totalClosed > 0 ? ((ptrICount + ptrIIManualCount) / totalClosed) * 100 : null;

    // Average SRS (all sessions of all closed clients)
    const allSrs = clientData.flatMap((c) => c.srsScores);
    const avgSrs =
      allSrs.length > 0 ? allSrs.reduce((a, b) => a + b, 0) / allSrs.length : null;

    // Effect Size: (avg final ORS - avg initial ORS) / sd(initial ORS)
    const bothOrsCohort = clientData.filter(
      (c) => c.initialOrs != null && c.finalOrs != null
    );
    const avgInitial =
      bothOrsCohort.length > 0
        ? bothOrsCohort.reduce((s, c) => s + c.initialOrs!, 0) / bothOrsCohort.length
        : null;
    const avgFinal =
      bothOrsCohort.length > 0
        ? bothOrsCohort.reduce((s, c) => s + c.finalOrs!, 0) / bothOrsCohort.length
        : null;
    const sdInitial = stddev(bothOrsCohort.map((c) => c.initialOrs!));
    const effectSize =
      avgInitial != null && avgFinal != null && sdInitial != null && sdInitial > 0
        ? (avgFinal - avgInitial) / sdInitial
        : null;

    return NextResponse.json({
      totalClosed,
      pctInitialLowOrs,
      medianTenureWeeks,
      medianSessions,
      outcomeCohortSize: outcomeDenom,
      pctRci,
      pctDeterioration,
      pctNoChange,
      pctCsc,
      ptrIRate,
      ptrICount,
      ptrIIManualCount,
      highOrsUnflagged,
      finalPtrRate,
      avgSrs,
      effectSize,
      atRiskClients,
    });
  } catch (error) {
    console.error("[GET /api/reports]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
