import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbPool } from "@/lib/db";
import { sql } from "drizzle-orm";

export const MAX_MONTHLY_ACTIVE_CLIENTS = 40;
export const MAX_ACTIVE_CLIENTS = 40; // Alias for backwards compatibility
export const MAX_IMPORT_BATCH_CLIENTS = 100;

/**
 * Returns the count of distinct active clients for a tenant in the calendar month of `targetDate` (Asia/Kolkata).
 * A client is considered active in a month if:
 * 1. They have at least one non-cancelled session in that month, OR
 * 2. They have a non-void invoice issued or billing in that month.
 */
export async function getMonthlyActiveClientCount(
  tx: any,
  tenantId: string,
  targetDate: Date = new Date()
): Promise<number> {
  const result: any = await tx.execute(sql`
    SELECT COALESCE(COUNT(DISTINCT sub.client_id), 0)::int AS count
    FROM (
      SELECT s.client_id
      FROM sessions s
      WHERE s.tenant_id = ${tenantId}
        AND s.scheduled_at >= DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'
        AND s.scheduled_at < (DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 month') AT TIME ZONE 'Asia/Kolkata'
        AND s.status != 'cancelled'
      UNION
      SELECT inv.client_id
      FROM invoices inv
      WHERE inv.tenant_id = ${tenantId}
        AND (
          (inv.billing_month >= (DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata'))::date
           AND inv.billing_month < ((DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 month'))::date)
          OR
          (inv.issued_date >= (DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata'))::date
           AND inv.issued_date < ((DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 month'))::date)
        )
        AND inv.status != 'void'
    ) sub
  `);

  return result[0]?.count ?? result.rows?.[0]?.count ?? 0;
}

/**
 * Checks whether a specific client is already active in the calendar month of `targetDate`.
 */
export async function isClientActiveInMonth(
  tx: any,
  tenantId: string,
  clientId: string,
  targetDate: Date = new Date()
): Promise<boolean> {
  const result: any = await tx.execute(sql`
    SELECT 1 AS exists_active
    FROM (
      SELECT s.client_id
      FROM sessions s
      WHERE s.tenant_id = ${tenantId}
        AND s.client_id = ${clientId}
        AND s.scheduled_at >= DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'
        AND s.scheduled_at < (DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 month') AT TIME ZONE 'Asia/Kolkata'
        AND s.status != 'cancelled'
      UNION
      SELECT inv.client_id
      FROM invoices inv
      WHERE inv.tenant_id = ${tenantId}
        AND inv.client_id = ${clientId}
        AND (
          (inv.billing_month >= (DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata'))::date
           AND inv.billing_month < ((DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 month'))::date)
          OR
          (inv.issued_date >= (DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata'))::date
           AND inv.issued_date < ((DATE_TRUNC('month', ${targetDate.toISOString()}::timestamptz AT TIME ZONE 'Asia/Kolkata') + INTERVAL '1 month'))::date)
        )
        AND inv.status != 'void'
    ) sub
    LIMIT 1
  `);

  const rows = Array.isArray(result) ? result : (result.rows ?? []);
  return rows.length > 0;
}

export async function getTenantContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    throw new Error("Unauthorized: No tenant context found");
  }

  return {
    tenantId: session.user.tenantId,
    planTier: session.user.planTier || "deepen",
    tenantSlug: session.user.tenantSlug,
  };
}

/**
 * Wraps a database operation in a transaction and applies the tenant isolation
 * using Postgres Row-Level Security (RLS).
 * 
 * It strictly sets the `app.current_tenant_id` configuration parameter which
 * the RLS policies in the database use to filter rows.
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return await dbPool.transaction(async (tx) => {
    // Enable RLS for this transaction scope securely
    // We MUST switch to a non-superuser role (authenticated) so that RLS is not bypassed.
    await tx.execute(sql`SET LOCAL ROLE authenticated`);
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
    
    // Execute the requested database operations
    const result = await callback(tx);
    return result;
  });
}

// ─────────────────────────────────────────────
// FEATURE FLAGS
// ─────────────────────────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  deepen: [
    "CLIENT_MANAGEMENT",
    "BILLING",
    "SESSION_NOTES",
    "CLINICAL_MEASUREMENT",
    "FINANCIAL_REPORTS",
  ],
  pro: [
    "CLIENT_MANAGEMENT",
    "BILLING",
    "SESSION_NOTES",
    "CLINICAL_MEASUREMENT",
    "FINANCIAL_REPORTS",
    "PRACTICE_OUTCOMES",
    "PDF_EXPORT",
  ],
};

export function hasFeature(planTier: string, feature: string): boolean {
  let tier = (planTier || "deepen").toLowerCase();
  if (tier === "basic") tier = "deepen";
  const features = PLAN_FEATURES[tier] || [];
  return features.includes(feature);
}
