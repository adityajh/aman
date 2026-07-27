import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

export async function GET() {
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      // Alphabetical by name (case-insensitive).
      const allClients = await tx.query.clients.findMany({
        orderBy: [asc(sql`LOWER(${clients.name})`)],
      });

      // Each client's LATEST completed-session note flags (for the ORS/SRS
      // columns on the Clients page).
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

      const enriched = allClients.map((c: any) => ({
        ...c,
        latestOrsFlag: flagMap.get(c.id)?.o ?? null,
        latestSrsFlag: flagMap.get(c.id)?.sr ?? null,
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
      } = body;

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
        })
        .returning();

      return NextResponse.json(newClient[0]);
    } catch (error) {
      console.error(error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  });
}
