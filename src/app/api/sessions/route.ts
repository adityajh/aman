import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const query = db.query.sessions.findMany({
      where: clientId ? eq(sessions.clientId, clientId) : undefined,
      orderBy: [desc(sessions.scheduledAt)],
      with: {
        client: true,
        feeScheme: true,
        invoice: true,
      },
    });

    const allSessions = await query;
    return NextResponse.json(allSessions);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { 
      clientId, 
      scheduledAt, 
      endedAt,
      sessionType, 
      modality, 
      feeCharged, 
      feeSchemeId 
    } = body;

    let durationMin = 60; // Default
    const start = new Date(scheduledAt);
    const end = endedAt ? new Date(endedAt) : null;

    if (end && end > start) {
      const diffMs = end.getTime() - start.getTime();
      const rawMin = diffMs / (1000 * 60);
      // Round to nearest 15 mins, min 15 mins
      durationMin = Math.max(15, Math.round(rawMin / 15) * 15);
    }

    const [newSession] = await db.insert(sessions).values({
      clientId,
      scheduledAt: start,
      endedAt: end,
      durationMin: durationMin,
      sessionType,
      modality,
      feeCharged: (feeCharged && feeCharged !== "") ? feeCharged.toString() : undefined,
      feeSchemeId: (feeSchemeId && feeSchemeId !== "") ? feeSchemeId : undefined,
    }).returning();

    return NextResponse.json(newSession);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
