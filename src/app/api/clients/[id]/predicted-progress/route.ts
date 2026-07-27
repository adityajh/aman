import { db } from "@/lib/db";
import { practiceSettings } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { formatIST } from "@/lib/tz";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

// ── Tuning constants (promotable to practice_settings later) ──
const COHORT_BAND = 5; // match clients whose initial ORS is within ±this
const MIN_COHORT = 5; // need at least this many similar clients for a prognosis
const MIN_SESSIONS = 3; // current client needs at least this many ORS sessions
const DISPLAY_FLOOR = 3; // need at least this many cohort clients at a session index to draw a band there

type OrsPoint = { ors: number; date: string };

function orsSequence(client: {
  sessions: {
    scheduledAt: Date | string;
    note: { orsTotal: string | null } | null;
  }[];
}): OrsPoint[] {
  return client.sessions
    .filter((s: any) => s.note?.orsTotal != null)
    .map((s: any) => ({
      ors: parseFloat(s.note!.orsTotal!),
      date: formatIST(new Date(s.scheduledAt), "d MMM"),
    }));
}

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
      const margin = settings?.orsRciThreshold ?? 5;

      // Load every client's completed sessions (asc) with notes, grouped by client.
      const allClients = await tx.query.clients.findMany({
        with: {
          sessions: {
            where: (s: any, { eq }: any) => eq(s.status, "completed"),
            orderBy: (s: any, { asc }: any) => [asc(s.scheduledAt)],
            with: { note: true },
          },
        },
      });

      const current = allClients.find((c: any) => c.id === id);
      const insufficient = (
        reason: string,
        extra: Record<string, unknown> = {},
      ) =>
        NextResponse.json({
          prognosis: "insufficient_data",
          reason,
          cohortSize: 0,
          margin,
          trajectory: [],
          ...extra,
        });

      if (!current)
        return new NextResponse("Client not found", { status: 404 });

      const currentSeq = orsSequence(current);
      if (currentSeq.length < MIN_SESSIONS) {
        return insufficient(
          `Need at least ${MIN_SESSIONS} sessions with ORS scores (have ${currentSeq.length}).`,
          { currentInitialOrs: currentSeq[0]?.ors ?? null },
        );
      }

      const currentInitialOrs = currentSeq[0].ors;
      const bandLow = currentInitialOrs - COHORT_BAND;
      const bandHigh = currentInitialOrs + COHORT_BAND;

      // Build the cohort: other clients whose initial ORS sits within the band.
      const cohort: OrsPoint[][] = [];
      for (const c of allClients) {
        if (c.id === id) continue;
        const seq = orsSequence(c);
        if (seq.length === 0) continue;
        if (seq[0].ors >= bandLow && seq[0].ors <= bandHigh) {
          cohort.push(seq);
        }
      }

      if (cohort.length < MIN_COHORT) {
        return insufficient(
          `Only ${cohort.length} similar client${cohort.length === 1 ? "" : "s"} found (need ${MIN_COHORT}).`,
          {
            cohortSize: cohort.length,
            currentInitialOrs,
            initialOrsBand: [bandLow, bandHigh],
          },
        );
      }

      // Session-indexed trajectory, spanning only the indices the client has reached.
      const trajectory = currentSeq.map((point, i) => {
        const valuesAtI = cohort
          .filter((seq) => seq.length > i)
          .map((seq) => seq[i].ors);
        const cohortN = valuesAtI.length;
        const hasBand = cohortN >= DISPLAY_FLOOR;
        const avg = hasBand
          ? valuesAtI.reduce((a: any, b: any) => a + b, 0) / cohortN
          : null;
        return {
          session: i + 1,
          date: point.date,
          clientOrs: point.ors,
          cohortAvg: avg != null ? Math.round(avg * 10) / 10 : null,
          lower: avg != null ? Math.round((avg - margin) * 10) / 10 : null,
          upper: avg != null ? Math.round((avg + margin) * 10) / 10 : null,
          cohortN,
        };
      });

      // Evaluate prognosis at the latest session index that still has a cohort band.
      const comparable = trajectory.filter((t) => t.cohortAvg != null);
      if (comparable.length === 0) {
        return insufficient(
          "Not enough similar clients reached these session numbers to compare.",
          {
            cohortSize: cohort.length,
            currentInitialOrs,
            initialOrsBand: [bandLow, bandHigh],
            trajectory,
          },
        );
      }

      const evalPoint = comparable[comparable.length - 1];
      const delta = evalPoint.clientOrs - evalPoint.cohortAvg!;
      let prognosis: "green" | "amber" | "red";
      if (delta > margin) prognosis = "green";
      else if (delta < -margin) prognosis = "red";
      else prognosis = "amber";

      return NextResponse.json({
        prognosis,
        cohortSize: cohort.length,
        currentInitialOrs,
        initialOrsBand: [bandLow, bandHigh],
        margin,
        evaluation: {
          atSession: evalPoint.session,
          clientOrs: evalPoint.clientOrs,
          cohortAvg: evalPoint.cohortAvg,
          delta: Math.round(delta * 10) / 10,
        },
        trajectory,
      });
    } catch (error) {
      console.error("[GET /api/clients/:id/predicted-progress]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
