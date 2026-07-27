import { db } from "@/lib/db";
import { practiceSettings } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function GET() {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const settings = await tx.query.practiceSettings.findFirst();
      return NextResponse.json(settings || null);
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}

export async function POST(req: Request) {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const body = await req.json();
      const {
        counselorName,
        practiceName,
        address,
        phone,
        email,
        monthlyQuote,
        upiId,
        orsCutoff,
        srsCutoff,
        orsDeteriorationThreshold,
        srsDeclineThreshold,
        orsRciThreshold,
        orsAmberLow,
        orsGreenLow,
        emailOverride,
        invoiceDueDays,
      } = body;

      const existing = await tx.query.practiceSettings.findFirst();

      if (existing) {
        const inserted = await tx
          .update(practiceSettings)
          .set({
            counselorName,
            practiceName,
            address,
            phone,
            email,
            monthlyQuote,
            upiId,
            orsCutoff,
            srsCutoff,
            orsDeteriorationThreshold,
            srsDeclineThreshold,
            orsRciThreshold,
            orsAmberLow,
            orsGreenLow,
            invoiceDueDays,
            emailOverride:
              emailOverride === undefined ? undefined : !!emailOverride,
            updatedAt: new Date(),
          })
          .where(sql`id = ${existing.id}`)
          .returning();
        return NextResponse.json(inserted[0]);
      } else {
        const inserted = await tx
          .insert(practiceSettings)
          .values({
              tenantId: tenantId,
            counselorName,
            practiceName,
            address,
            phone,
            email,
            monthlyQuote,
            upiId,
            orsCutoff,
            srsCutoff,
            orsDeteriorationThreshold,
            srsDeclineThreshold,
            orsRciThreshold,
            orsAmberLow,
            orsGreenLow,
            invoiceDueDays,
            emailOverride: !!emailOverride,
          })
          .returning();
        return NextResponse.json(inserted[0]);
      }
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
