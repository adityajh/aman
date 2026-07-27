import { db } from "@/lib/db";
import { sessionNotes, sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getTenantContext, withTenantContext, hasFeature } from "@/lib/tenant";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const note = await tx.query.sessionNotes.findFirst({
        where: eq(sessionNotes.sessionId, id),
      });
      return NextResponse.json(note || null);
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const body = await req.json();
      const {
        subjective,
        objective,
        assessment,
        plan,
        riskFlag,
        updates,
        clientActions,
        myActions,
        agenda,
        feedback,
        actualStartTimeISO,
        actualEndTimeISO, // ISO strings
        orsIndividual,
        orsInterpersonal,
        orsSocial,
        orsOverall,
        orsTotal,
        srsRelationship,
        srsGoals,
        srsApproach,
        srsOverall,
        srsTotal,
        orsFlag,
        srsFlag, // auto outcome flags computed in the editor
      } = body;

      // 1. Fetch the session to get scheduledAt date
      const session = await tx.query.sessions.findFirst({
        where: eq(sessions.id, id),
        with: { feeScheme: true },
      });

      if (!session)
        return new NextResponse("Session not found", { status: 404 });

      // 2. Process Actual Times
      let actualStart: Date | null = null;
      let actualEnd: Date | null = null;
      let invoicedDurationMin = session.durationMin;

      if (actualStartTimeISO && actualEndTimeISO) {
        actualStart = new Date(actualStartTimeISO);
        actualEnd = new Date(actualEndTimeISO);

        const actualDuration = Math.abs(
          Math.round((actualEnd.getTime() - actualStart.getTime()) / 60000),
        );

        // 3. Apply Billing Formula
        //   - Round actual time to the nearest 15-min quartile (min 15).
        //   - Sessions up to 70 mins keep the "standard hour" grace band: the
        //     billed time is capped at 60, so a session that runs a few minutes
        //     short or slightly over still bills a full hour (e.g. 53-70 -> 60),
        //     while genuinely short sessions bill pro-rata (30 -> 30, 45 -> 45).
        //   - Over 70 mins bills pro-rata upward (75, 90, 105, ...).
        const rounded = Math.max(15, Math.round(actualDuration / 15) * 15);
        if (actualDuration <= 70) {
          invoicedDurationMin = Math.min(rounded, 60);
        } else {
          invoicedDurationMin = rounded;
        }
      }

      // 4. Recalculate Fee if applicable
      let newFee = session.feeCharged;
      if (session.feeScheme && !session.feeOverride && invoicedDurationMin) {
        const baseAmount = Number(session.feeScheme.amount);
        newFee = ((invoicedDurationMin / 60) * baseAmount).toFixed(2);
      }

      // Check if note exists
      const existingNote = await tx.query.sessionNotes.findFirst({
        where: eq(sessionNotes.sessionId, id),
      });

      const payload = {
        subjective,
        objective,
        assessment,
        plan,
        riskFlag,
        updates,
        clientActions,
        myActions,
        agenda,
        feedback,
        orsIndividual,
        orsInterpersonal,
        orsSocial,
        orsOverall,
        orsTotal,
        srsRelationship,
        srsGoals,
        srsApproach,
        srsOverall,
        srsTotal,
        orsFlag: orsFlag === undefined ? null : orsFlag,
        srsFlag: srsFlag === undefined ? null : srsFlag,
        completedAt: new Date(),
      };

      if (!hasFeature(planTier, "CLINICAL_MEASUREMENT")) {
        payload.orsIndividual = null;
        payload.orsInterpersonal = null;
        payload.orsSocial = null;
        payload.orsOverall = null;
        payload.orsTotal = null;
        payload.srsRelationship = null;
        payload.srsGoals = null;
        payload.srsApproach = null;
        payload.srsOverall = null;
        payload.srsTotal = null;
        payload.orsFlag = null;
        payload.srsFlag = null;
      }

      let result;
      if (existingNote) {
        result = await tx
          .update(sessionNotes)
          .set(payload)
          .where(eq(sessionNotes.sessionId, id))
          .returning();
      } else {
        result = await tx
          .insert(sessionNotes)
          .values({
            tenantId: tenantId,
            sessionId: id,
            ...payload,
          })
          .returning();
      }

      // Update the session
      await tx
        .update(sessions)
        .set({
          status: "completed",
          actualStartTime: actualStart,
          actualEndTime: actualEnd,
          invoicedDurationMin,
          feeCharged: newFee,
        })
        .where(eq(sessions.id, id));

      return NextResponse.json(result[0]);
    } catch (error: any) {
      console.error(error);
      return new NextResponse(error.message || "Internal Server Error", {
        status: 500,
      });
    }
  });
}
