import { db } from "@/lib/db";
import { sessions, clients, sessionNotes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, isNull, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    // Find clients who have completed sessions with no invoiceId
    const unbilledClients = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        sessionCount: sql<number>`count(${sessions.id})`,
        totalAmount: sql<string>`sum(${sessions.feeCharged})`,
      })
      .from(clients)
      .innerJoin(sessions, eq(sessions.clientId, clients.id))
      .where(
        and(
          eq(sessions.status, 'completed'),
          isNull(sessions.invoiceId)
        )
      )
      .groupBy(clients.id);

    return NextResponse.json(unbilledClients);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
