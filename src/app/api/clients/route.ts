import { db } from "@/lib/db";
import { clients, tenants } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { getTenantContext, withTenantContext, MAX_ACTIVE_CLIENTS } from "@/lib/tenant";

export async function GET() {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      // Alphabetical by name (case-insensitive).
      const allClients = await tx.query.clients.findMany({
        orderBy: [asc(sql`LOWER(${clients.name})`)],
      });

      // Each client's LATEST completed-session note flags
      const flagRes: any = await tx.execute(sql`
        SELECT DISTINCT ON (s.client_id) s.client_id AS cid, n.ors_flag AS o, n.srs_flag AS sr
        FROM sessions s JOIN session_notes n ON n.session_id = s.id
        WHERE s.status = 'completed'
        ORDER BY s.client_id, s.scheduled_at DESC, n.created_at DESC
      `);
      const flagRows = Array.isArray(flagRes) ? flagRes : (flagRes.rows ?? []);
      const flagMap = new Map<
        string,
        { o: boolean | null; sr: boolean | null }
      >(flagRows.map((r: any) => [r.cid, { o: r.o, sr: r.sr }]));

      // Latest session date per client (for 90-day nudge)
      const lastSessionRes: any = await tx.execute(sql`
        SELECT client_id AS cid, MAX(scheduled_at) AS last_session_at
        FROM sessions
        GROUP BY client_id
      `);
      const lastSessionRows = Array.isArray(lastSessionRes) ? lastSessionRes : (lastSessionRes.rows ?? []);
      const lastSessionMap = new Map<string, string>(lastSessionRows.map((r: any) => [r.cid, r.last_session_at]));

      const enriched = allClients.map((c: any) => ({
        ...c,
        latestOrsFlag: flagMap.get(c.id)?.o ?? null,
        latestSrsFlag: flagMap.get(c.id)?.sr ?? null,
        lastSessionAt: lastSessionMap.get(c.id) ?? null,
      }));
      return NextResponse.json(enriched);
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
        name,
        email,
        phone,
        defaultFee,
        defaultFeeSchemeId,
        timezone,
        forceCreate,
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

      // Active Client Limit Check
      const tenantRow = await tx.query.tenants.findFirst({
        where: eq(tenants.id, tenantId),
      });

      if (!tenantRow?.isExempt) {
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

      // Duplicate Check
      if (email && !forceCreate) {
        const existing = await tx.query.clients.findFirst({
          where: eq(clients.email, email),
        });
        if (existing) {
          return NextResponse.json(
            {
              error: "Duplicate Email",
              client: {
                id: existing.id,
                name: existing.name,
                isActive: existing.isActive,
              },
            },
            { status: 409 },
          );
        }
      }

      const newClient = await tx
        .insert(clients)
        .values({
          tenantId: tenantId,
          name,
          email,
          phone,
          defaultFee: defaultFee?.toString(),
          defaultFeeSchemeId: defaultFeeSchemeId || undefined,
          timezone: timezone || undefined,
          poolConsent: poolConsent || undefined,
          poolConsentMethod: poolConsentMethod || undefined,
          poolConsentAt: poolConsent === "yes" || poolConsent === "no" ? new Date() : undefined,
        })
        .returning();

      return NextResponse.json(newClient[0]);
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
