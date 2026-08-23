import { db } from "@/lib/db";
import { clients, tenants } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getTenantContext, withTenantContext, MAX_ACTIVE_CLIENTS } from "@/lib/tenant";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const body = await req.json();
      const {
        name,
        email,
        phone,
        defaultFee,
        intakeNotes,
        defaultFeeSchemeId,
        timezone,
        isActive,
        terminationReason,
        terminationType,
        cancelPendingSessions,
        prematureTerminationManual,
        poolConsent,
        poolConsentMethod,
      } = body;

      if (poolConsent !== undefined && !["yes", "no", "not_asked"].includes(poolConsent)) {
        return NextResponse.json({ error: "Invalid poolConsent value" }, { status: 400 });
      }
      if (
        poolConsentMethod !== undefined &&
        poolConsentMethod !== null &&
        !["in_person", "paper", "message"].includes(poolConsentMethod)
      ) {
        return NextResponse.json({ error: "Invalid poolConsentMethod value" }, { status: 400 });
      }

      let poolConsentFields = {};
      if (poolConsent === "yes" || poolConsent === "no") {
        poolConsentFields = { poolConsent, poolConsentAt: new Date() };
      } else if (poolConsent === "not_asked") {
        poolConsentFields = { poolConsent, poolConsentAt: null };
      }

      // Reactivation logic & fence check
      let terminationFields = {};
      if (isActive === true) {
        const existingClient = await tx.query.clients.findFirst({
          where: eq(clients.id, id),
        });

        if (existingClient && !existingClient.isActive) {
          const tenantRow = await tx.query.tenants.findFirst({
            where: eq(tenants.id, tenantId),
          });

          const isUnlimited = tenantRow?.isExempt || tenantRow?.planTier === "pro";

          if (!isUnlimited) {
            const activeCountRes: any = await tx.execute(sql`
              SELECT COUNT(*)::int AS count FROM clients WHERE is_active = true
            `);
            const count = activeCountRes[0]?.count ?? activeCountRes.rows?.[0]?.count ?? 0;
            if (count >= MAX_ACTIVE_CLIENTS) {
              return NextResponse.json(
                {
                  error: "CLIENT_LIMIT",
                  message:
                    "Deepen is built for one counsellor. Thirty active clients is more than one person can see, so we stop here. If you're a group or an organisation, Deepen isn't for you. If this is a mistake, write to us.",
                },
                { status: 403 },
              );
            }
          }
        }

        terminationFields = {
          terminationReason: null,
          terminationType: null,
          terminatedAt: null,
        };
      } else if (isActive === false) {
        terminationFields = {
          terminationReason: terminationReason || undefined,
          terminationType: terminationType || undefined,
          terminatedAt: new Date(),
        };

        // Issue 5: Cancel uninvoiced sessions if requested
        if (cancelPendingSessions) {
          const { sessions } = await import("@/lib/db/schema");
          const { and, isNull } = await import("drizzle-orm");
          await tx
            .update(sessions)
            .set({
              status: "cancelled",
              cancellationReason: "Client Terminated",
            })
            .where(and(eq(sessions.clientId, id), isNull(sessions.invoiceId)));
        }
      }

      const [updated] = await tx
        .update(clients)
        .set({
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          defaultFee: defaultFee ? defaultFee.toString() : undefined,
          intakeNotes: intakeNotes || undefined,
          defaultFeeSchemeId: defaultFeeSchemeId || undefined,
          timezone: timezone || undefined,
          isActive: isActive !== undefined ? isActive : undefined,
          prematureTerminationManual:
            prematureTerminationManual !== undefined
              ? prematureTerminationManual
              : undefined,
          poolConsentMethod: poolConsentMethod || undefined,
          ...poolConsentFields,
          ...terminationFields,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, id))
        .returning();

      if (!updated) {
        return new NextResponse("Client not found", { status: 404 });
      }

      return NextResponse.json(updated);
    } catch (error: any) {
      console.error("[PATCH /api/clients/:id]", error);
      return new NextResponse(error.message || "Internal Server Error", {
        status: 500,
      });
    }
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const client = await tx.query.clients.findFirst({
        where: eq(clients.id, id),
      });
      if (!client) return new NextResponse("Not found", { status: 404 });
      return NextResponse.json(client);
    } catch (error: any) {
      return new NextResponse(error.message, { status: 500 });
    }
  });
}
