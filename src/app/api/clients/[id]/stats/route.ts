import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
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
    const rows = await db
      .select({
        total: sql<number>`count(*)::int`,
        lastDate: sql<string | null>`max(${sessions.scheduledAt})`,
        totalBilled: sql<string>`coalesce(sum(${sessions.feeCharged}::numeric), 0)`,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.clientId, id),
          eq(sessions.status, "completed")
        )
      );

    const row = rows[0] ?? { total: 0, lastDate: null, totalBilled: "0" };
    return NextResponse.json({
      total: row.total,
      lastDate: row.lastDate,
      totalBilled: Number(row.totalBilled),
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
