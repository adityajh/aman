import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbPool } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function getTenantContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    throw new Error("Unauthorized: No tenant context found");
  }

  return {
    tenantId: session.user.tenantId,
    planTier: session.user.planTier || "basic",
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
    await tx.execute(
      sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
    );
    
    // Execute the requested database operations
    const result = await callback(tx);
    return result;
  });
}

// ─────────────────────────────────────────────
// FEATURE FLAGS
// ─────────────────────────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  basic: [
    "CLIENT_MANAGEMENT",
    "SCHEDULING",
    "BILLING",
    "REPORTS",
    "SESSION_NOTES"
  ],
  pro: [
    "CLIENT_MANAGEMENT",
    "SCHEDULING",
    "BILLING",
    "REPORTS",
    "SESSION_NOTES",
    "CLINICAL_MEASUREMENT",
    "PROGRESS_CHARTS",
    "PDF_EXPORT"
  ],
};

export function hasFeature(planTier: string, feature: string): boolean {
  const tier = (planTier || "basic").toLowerCase();
  const features = PLAN_FEATURES[tier] || [];
  return features.includes(feature);
}
