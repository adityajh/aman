import { db } from "@/lib/db";
import { sessionNotes, sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const note = await db.query.sessionNotes.findFirst({
      where: eq(sessionNotes.sessionId, id),
    });
    return NextResponse.json(note || null);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { 
      subjective, objective, assessment, plan, riskFlag,
      updates, clientActions, myActions, agenda, feedback,
      actualStartTimeISO, actualEndTimeISO, // ISO strings
      orsIndividual, orsInterpersonal, orsSocial, orsOverall, orsTotal,
      srsRelationship, srsGoals, srsApproach, srsOverall, srsTotal
    } = body;

    // 1. Fetch the session to get scheduledAt date
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
      with: { feeScheme: true }
    });

    if (!session) return new NextResponse("Session not found", { status: 404 });

    // 2. Process Actual Times
    let actualStart: Date | null = null;
    let actualEnd: Date | null = null;
    let invoicedDurationMin = session.durationMin;

    if (actualStartTimeISO && actualEndTimeISO) {
      actualStart = new Date(actualStartTimeISO);
      actualEnd = new Date(actualEndTimeISO);

      const actualDuration = Math.abs(Math.round((actualEnd.getTime() - actualStart.getTime()) / 60000));
      
      // 3. Apply Billing Formula
      // Upto 70 mins -> 60 mins. After 70 mins -> nearest quartile
      if (actualDuration <= 70) {
        invoicedDurationMin = 60;
      } else {
        invoicedDurationMin = Math.round(actualDuration / 15) * 15;
      }
    }

    // 4. Recalculate Fee if applicable
    let newFee = session.feeCharged;
    if (session.feeScheme && !session.feeOverride && invoicedDurationMin) {
      const baseAmount = Number(session.feeScheme.amount);
      newFee = ((invoicedDurationMin / 60) * baseAmount).toFixed(2);
    }

    // Check if note exists
    const existingNote = await db.query.sessionNotes.findFirst({
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
      completedAt: new Date(),
    };

    let result;
    if (existingNote) {
      result = await db.update(sessionNotes)
        .set(payload)
        .where(eq(sessionNotes.sessionId, id))
        .returning();
    } else {
      result = await db.insert(sessionNotes)
        .values({
          sessionId: id,
          ...payload
        })
        .returning();
    }

    // Update the session
    await db.update(sessions).set({
      status: 'completed',
      actualStartTime: actualStart,
      actualEndTime: actualEnd,
      invoicedDurationMin,
      feeCharged: newFee,
    }).where(eq(sessions.id, id));

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error(error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
