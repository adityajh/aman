import { db } from "@/lib/db";
import { sessions, practiceSettings, clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { addWeeks } from "date-fns";
import { formatIST } from "@/lib/tz";
import { getTenantContext, withTenantContext } from "@/lib/tenant";
import { hasFeature } from "@/lib/tenant";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();

  if (!hasFeature(planTier, "CLINICAL_MEASUREMENT")) {
    return new NextResponse("Upgrade to Pro to access Clinical Measurements.", { status: 403 });
  }

  return await withTenantContext(tenantId, async (tx) => {
    try {
      const settingsRows = await tx.select().from(practiceSettings).limit(1);
      const settings = settingsRows[0];

      const clientSessions = await tx.query.sessions.findMany({
        where: eq(sessions.clientId, id),
        orderBy: [desc(sessions.scheduledAt)],
        with: { note: true },
      });

      const clientRecord = await tx.query.clients.findFirst({
        where: eq(clients.id, id),
      });

      // Sort ascending for chart (oldest first)
      const chronological = [...clientSessions].reverse();

      const orsCutoff = settings?.orsCutoff ?? 25;
      const srsCutoff = settings?.srsCutoff ?? 36;
      const orsRciThreshold = settings?.orsRciThreshold ?? 5;
      const orsAmberLow = settings?.orsAmberLow ?? 26;
      const orsGreenLow = settings?.orsGreenLow ?? 32;

      // Build chart data points
      // Short qualitative snippet for chart tooltips.
      const snippet = (n: any) => {
        const raw = (n?.subjective || n?.updates || "").trim();
        return raw ? raw.slice(0, 160) : null;
      };

      const orsPoints = chronological
        .filter((s: any) => s.note?.orsTotal != null)
        .map((s: any) => ({
          date: formatIST(new Date(s.scheduledAt), "d MMM"),
          ors: s.note!.orsTotal,
          sessionId: s.id,
          note: snippet(s.note),
          risk: s.note!.riskFlag || "none",
        }));

      const srsPoints = chronological
        .filter((s: any) => s.note?.srsTotal != null)
        .map((s: any) => ({
          date: formatIST(new Date(s.scheduledAt), "d MMM"),
          srs: s.note!.srsTotal,
          sessionId: s.id,
          note: snippet(s.note),
          risk: s.note!.riskFlag || "none",
        }));

      // Compute linear trend for ORS (next 4 data points beyond last session)
      let orsTrend: { date: string; trend: number }[] = [];
      if (orsPoints.length >= 2) {
        const n = orsPoints.length;
        const xMean = (n - 1) / 2;
        const yMean = orsPoints.reduce((a, p) => a + Number(p.ors ?? 0), 0) / n;
        const num = orsPoints.reduce(
          (a, p, i) => a + (i - xMean) * (Number(p.ors ?? 0) - yMean),
          0,
        );
        const den = orsPoints.reduce((a, _, i) => a + (i - xMean) ** 2, 0);
        const slope = den !== 0 ? num / den : 0;

        const lastDate = new Date(
          chronological.filter((s: any) => s.note?.orsTotal != null).at(-1)!
            .scheduledAt,
        );
        const lastVal = Number(orsPoints.at(-1)!.ors ?? 0);
        orsTrend = Array.from({ length: 5 }, (_, i) => ({
          date: formatIST(addWeeks(lastDate, (i + 1) * 2), "d MMM"),
          trend: Math.min(
            40,
            Math.max(0, Math.round((lastVal + slope * (i + 1)) * 10) / 10),
          ),
        }));
      }

      // Determine clinical flags
      const latestOrs =
        orsPoints.length > 0 ? Number(orsPoints.at(-1)?.ors ?? null) : null;
      const initialOrs =
        orsPoints.length > 0 ? Number(orsPoints[0]?.ors ?? null) : null;
      const latestSrs =
        srsPoints.length > 0 ? Number(srsPoints.at(-1)?.srs ?? null) : null;
      const prevSrs =
        srsPoints.length > 1 ? Number(srsPoints.at(-2)?.srs ?? null) : null;

      const isDeterioriating =
        latestOrs !== null &&
        initialOrs !== null &&
        initialOrs - latestOrs > (settings?.orsDeteriorationThreshold ?? 5);
      const isDissatisfied =
        latestSrs !== null &&
        (latestSrs < srsCutoff ||
          (prevSrs !== null &&
            prevSrs - latestSrs > (settings?.srsDeclineThreshold ?? 2)));

      const isRci =
        latestOrs !== null &&
        initialOrs !== null &&
        latestOrs - initialOrs >= orsRciThreshold;
      const isCsc = isRci && latestOrs !== null && latestOrs > orsCutoff;

      return NextResponse.json({
        orsPoints,
        srsPoints,
        orsTrend,
        flags: { isDeterioriating, isDissatisfied, isRci, isCsc },
        thresholds: {
          orsCutoff,
          srsCutoff,
          orsRciThreshold,
          orsAmberLow,
          orsGreenLow,
        },
        clientEmail: clientRecord?.email || "",
      });
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
