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
    const { clientId, scheduledAt, durationMin, sessionType, modality, feeCharged } = body;

    const newSession = await db.insert(sessions).values({
      clientId,
      scheduledAt: new Date(scheduledAt),
      durationMin: parseInt(durationMin),
      sessionType,
      modality,
      feeCharged: feeCharged?.toString(),
    }).returning();

    return NextResponse.json(newSession[0]);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
