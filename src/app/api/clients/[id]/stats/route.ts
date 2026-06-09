import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const completed = await db.query.sessions.findMany({
      where: and(eq(sessions.clientId, id), eq(sessions.status, "completed")),
      columns: { scheduledAt: true, feeCharged: true },
      orderBy: [desc(sessions.scheduledAt)],
    });

    const total = completed.length;
    const lastDate = completed.length > 0 ? completed[0].scheduledAt : null;
    const totalBilled = completed.reduce((sum, s) => sum + Number(s.feeCharged || 0), 0);

    return NextResponse.json({ total, lastDate, totalBilled });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
