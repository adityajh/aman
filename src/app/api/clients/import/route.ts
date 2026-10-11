import { db } from "@/lib/db";
import { clients, tenants } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getTenantContext, withTenantContext, MAX_ACTIVE_CLIENTS } from "@/lib/tenant";

export async function POST(req: Request) {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const body = await req.json();
      const { newClients } = body; // expecting an array

      if (!Array.isArray(newClients) || newClients.length === 0) {
        return NextResponse.json({ error: "No clients to import" }, { status: 400 });
      }

      // Active Client Limit Check
      const tenantRow = await tx.query.tenants.findFirst({
        where: eq(tenants.id, tenantId),
      });

      const isUnlimited = tenantRow?.isExempt || tenantRow?.planTier === "pro";

      if (!isUnlimited) {
        const activeCountRes: any = await tx.execute(sql`
          SELECT COUNT(*)::int AS count FROM clients WHERE is_active = true
        `);
        const count = activeCountRes[0]?.count ?? activeCountRes.rows?.[0]?.count ?? 0;
        
        if (count + newClients.length > MAX_ACTIVE_CLIENTS) {
          return NextResponse.json(
            {
              error: "CLIENT_LIMIT",
              message: `You have ${count} active clients. Adding ${newClients.length} would exceed the ${MAX_ACTIVE_CLIENTS} active client limit.`,
            },
            { status: 403 }
          );
        }
      }

      // Insert them sequentially to avoid returning a large array of errors if there's a problem
      const inserted = [];
      const errors = [];

      for (const client of newClients) {
        try {
          const { name, email, phone, defaultFeeSchemeId, defaultFee, timezone, amountDue } = client;
          
          if (!name) {
            errors.push({ email, error: "Name is required" });
            continue;
          }

          // Check duplicate
          if (email) {
            const existing = await tx.query.clients.findFirst({
              where: eq(clients.email, email),
            });
            if (existing) {
              errors.push({ name, email, error: "Duplicate email" });
              continue; // skip duplicate or update it? We'll just skip
            }
          }

          const res = await tx
            .insert(clients)
            .values({
              tenantId: tenantId,
              name,
              email: email || undefined,
              phone: phone || undefined,
              defaultFee: defaultFee ? defaultFee.toString() : undefined,
              defaultFeeSchemeId: defaultFeeSchemeId || undefined,
              timezone: timezone || "Asia/Kolkata",
              intakeNotes: (amountDue && String(amountDue).trim() !== "" && String(amountDue).trim() !== "0") 
                ? `Imported Balance Due: ${amountDue}` 
                : undefined,
            })
            .returning();
          
          inserted.push(res[0]);
        } catch (e: any) {
          errors.push({ name: client.name, error: e.message });
        }
      }

      return NextResponse.json({ inserted: inserted.length, errors, clients: inserted });
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
