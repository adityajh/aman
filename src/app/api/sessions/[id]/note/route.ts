import { db } from "@/lib/db";
import { sessionNotes, sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const note = await db.query.sessionNotes.findFirst({
      where: eq(sessionNotes.sessionId, params.id),
    });
    return NextResponse.json(note || null);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { subjective, objective, assessment, plan, riskFlag } = body;

    // Check if note exists
    const existingNote = await db.query.sessionNotes.findFirst({
      where: eq(sessionNotes.sessionId, params.id),
    });

    let result;
    if (existingNote) {
      result = await db.update(sessionNotes).set({
        subjective,
        objective,
        assessment,
        plan,
        riskFlag,
        completedAt: new Date(),
      }).where(eq(sessionNotes.sessionId, params.id)).returning();
    } else {
      result = await db.insert(sessionNotes).values({
        sessionId: params.id,
        subjective,
        objective,
        assessment,
        plan,
        riskFlag,
        completedAt: new Date(),
      }).returning();
    }

    // Auto-complete the session
    await db.update(sessions).set({
      status: 'completed',
    }).where(eq(sessions.id, params.id));

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
