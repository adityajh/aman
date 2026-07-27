import { db } from "@/lib/db";
import { feeSchemes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function GET() {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const data = await tx.select().from(feeSchemes).orderBy(feeSchemes.name);
      return NextResponse.json(data);
    } catch (error) {
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}

export async function POST(req: Request) {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const body = await req.json();
      const [newFeeScheme] = await tx
        .insert(feeSchemes)
        .values({ ...body, tenantId })
        .returning();
      return NextResponse.json(newFeeScheme);
    } catch (error) {
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
