import { db } from "@/lib/db";
import { sessions, clients, feeSchemes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, isNull, and, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    // A session is billable in the next batch when it has no invoice attached
    // and either:
    //   - it's `completed` (counts toward `feeCharged`), or
    //   - it's `cancelled` / `no_show` with `cancellationFee > 0`
    //     (counts toward `cancellationFee`).
    const billableAmount = sql<string>`
      SUM(CASE
        WHEN ${sessions.status} = 'completed' THEN COALESCE(${sessions.feeCharged}, '0')::numeric
        WHEN ${sessions.status} IN ('cancelled', 'no_show') THEN COALESCE(${sessions.cancellationFee}, '0')::numeric
        ELSE 0
      END)
    `;

    const unbilledClients = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        sessionCount: sql<number>`count(${sessions.id})`,
        totalAmount: billableAmount,
        currency: sql<string>`COALESCE(MAX(${feeSchemes.currency}), 'INR')`,
      })
      .from(clients)
      .innerJoin(sessions, eq(sessions.clientId, clients.id))
      .leftJoin(feeSchemes, eq(clients.defaultFeeSchemeId, feeSchemes.id))
      .where(
        and(
          isNull(sessions.invoiceId),
          sql`(
            ${sessions.status} = 'completed'
            OR (${sessions.status} IN ('cancelled', 'no_show') AND COALESCE(${sessions.cancellationFee}, '0')::numeric > 0)
          )`
        )
      )
      .groupBy(clients.id);

    return NextResponse.json(unbilledClients);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
