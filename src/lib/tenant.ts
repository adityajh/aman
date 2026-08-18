import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbPool } from "@/lib/db";
import { sql } from "drizzle-orm";

export const MAX_ACTIVE_CLIENTS = 30;

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
