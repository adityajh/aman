import { db } from "@/lib/db";
import { feeSchemes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { tenantId, planTier } = await getTenantContext();
  try {
    const { id } = await params;
    const body = await req.json();
    const [updated] = await db
      .update(feeSchemes)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(feeSchemes.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const { id } = await params;
      await tx.delete(feeSchemes).where(eq(feeSchemes.id, id));
      return NextResponse.json({ success: true });
    } catch (error) {
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
