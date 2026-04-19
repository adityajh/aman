import { db } from "@/lib/db";
import { sessions, practiceSettings } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format, addWeeks } from "date-fns";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const settingsRows = await db.select().from(practiceSettings).limit(1);
    const settings = settingsRows[0];

    const clientSessions = await db.query.sessions.findMany({
      where: eq(sessions.clientId, id),
      orderBy: [desc(sessions.scheduledAt)],
      with: { note: true },
    });

    // Sort ascending for chart (oldest first)
    const chronological = [...clientSessions].reverse();

    const orsCutoff = settings?.orsCutoff ?? 25;
    const srsCutoff = settings?.srsCutoff ?? 36;
    const orsRciThreshold = settings?.orsRciThreshold ?? 5;
    const orsAmberLow = settings?.orsAmberLow ?? 26;
    const orsGreenLow = settings?.orsGreenLow ?? 32;

    // Build chart data points
    const orsPoints = chronological
      .filter(s => s.note?.orsTotal != null)
      .map(s => ({
        date: format(new Date(s.scheduledAt), "d MMM"),
        ors: s.note!.orsTotal,
        sessionId: s.id,
      }));

    const srsPoints = chronological
      .filter(s => s.note?.srsTotal != null)
      .map(s => ({
        date: format(new Date(s.scheduledAt), "d MMM"),
        srs: s.note!.srsTotal,
        sessionId: s.id,
      }));

    // Compute linear trend for ORS (next 4 data points beyond last session)
    let orsTrend: { date: string; trend: number }[] = [];
    if (orsPoints.length >= 2) {
      const n = orsPoints.length;
      const xMean = (n - 1) / 2;
      const yMean = orsPoints.reduce((a, p) => a + (p.ors ?? 0), 0) / n;
      const num = orsPoints.reduce((a, p, i) => a + (i - xMean) * ((p.ors ?? 0) - yMean), 0);
      const den = orsPoints.reduce((a, _, i) => a + (i - xMean) ** 2, 0);
      const slope = den !== 0 ? num / den : 0;

      const lastDate = new Date(chronological.filter(s => s.note?.orsTotal != null).at(-1)!.scheduledAt);
      const lastVal = orsPoints.at(-1)!.ors ?? 0;
      orsTrend = Array.from({ length: 5 }, (_, i) => ({
        date: format(addWeeks(lastDate, (i + 1) * 2), "d MMM"),
        trend: Math.min(40, Math.max(0, Math.round((lastVal + slope * (i + 1)) * 10) / 10)),
      }));
    }

    // Determine clinical flags
    const latestOrs = orsPoints.at(-1)?.ors ?? null;
    const initialOrs = orsPoints[0]?.ors ?? null;
    const latestSrs = srsPoints.at(-1)?.srs ?? null;
    const prevSrs = srsPoints.at(-2)?.srs ?? null;

    const isDeterioriating = latestOrs !== null && initialOrs !== null && (initialOrs - latestOrs) > (settings?.orsDeteriorationThreshold ?? 5);
    const isDissatisfied = latestSrs !== null && (
      latestSrs < srsCutoff ||
      (prevSrs !== null && (prevSrs - latestSrs) > (settings?.srsDeclineThreshold ?? 2))
    );

    const isRci = latestOrs !== null && initialOrs !== null && (latestOrs - initialOrs) >= orsRciThreshold;
    const isCsc = isRci && latestOrs !== null && latestOrs > orsCutoff;

    return NextResponse.json({
      orsPoints,
      srsPoints,
      orsTrend,
      flags: { isDeterioriating, isDissatisfied, isRci, isCsc },
      thresholds: { orsCutoff, srsCutoff, orsRciThreshold, orsAmberLow, orsGreenLow },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
