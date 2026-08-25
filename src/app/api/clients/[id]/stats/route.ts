import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const completed = await tx.query.sessions.findMany({
        where: and(eq(sessions.clientId, id), eq(sessions.status, "completed")),
        columns: { scheduledAt: true, feeCharged: true },
        orderBy: [desc(sessions.scheduledAt)],
      });

      const total = completed.length;
      const lastDate = completed.length > 0 ? completed[0].scheduledAt : null;
      const firstDate = completed.length > 0 ? completed[completed.length - 1].scheduledAt : null;
      const totalBilled = completed.reduce(
        (sum: any, s: any) => sum + Number(s.feeCharged || 0),
        0,
      );

      return NextResponse.json({ total, lastDate, firstDate, totalBilled });
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
