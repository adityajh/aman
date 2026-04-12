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
      orsIndividual, orsInterpersonal, orsSocial, orsOverall, orsTotal,
      srsRelationship, srsGoals, srsApproach, srsOverall, srsTotal
    } = body;

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

    // Auto-complete the session
    await db.update(sessions).set({
      status: 'completed',
    }).where(eq(sessions.id, id));

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
