import { db } from "@/lib/db";
import { clients, tenants } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getTenantContext, withTenantContext, MAX_IMPORT_BATCH_CLIENTS } from "@/lib/tenant";

export async function POST(req: Request) {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const body = await req.json();
      const { newClients } = body; // expecting an array

      if (!Array.isArray(newClients) || newClients.length === 0) {
        return NextResponse.json({ error: "No clients to import" }, { status: 400 });
      }

      // Single import batch limit check (up to 100 clients per batch)
      if (newClients.length > MAX_IMPORT_BATCH_CLIENTS) {
        return NextResponse.json(
          {
            error: "IMPORT_LIMIT",
            message: `You can import up to ${MAX_IMPORT_BATCH_CLIENTS} clients in a single batch. Your file contains ${newClients.length} clients. Please split your file into batches of ${MAX_IMPORT_BATCH_CLIENTS} or fewer.`,
          },
          { status: 400 }
        );
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
