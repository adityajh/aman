import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Multi-Tenancy Migration Endpoint
export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const results: Record<string, string> = {};

  const steps = [
    {
      name: "Update admin email and password",
      query: `UPDATE "users" SET "email" = 'vijay10gopal@gmail.com', "password_hash" = '$2b$10$QUuU03.NBR8IqUgHT9VIWObzft8R9LtkYom7zIOKH8rlrQHLK8XnW' WHERE "email" = 'counselor@deepen.health'`
    },
    {
      name: "Update tenant email",
      query: `UPDATE "tenants" SET "email" = 'vijay10gopal@gmail.com' WHERE "email" = 'counselor@deepen.health'`
    },
    {
      name: "0007: Plan tier & founding columns",
      query: `ALTER TABLE "tenants" ALTER COLUMN "plan_tier" SET DEFAULT 'deepen';
              UPDATE "tenants" SET "plan_tier" = 'deepen' WHERE "plan_tier" = 'basic';
              ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "is_founding" boolean DEFAULT false NOT NULL;
              ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "founding_seat" integer;
              ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "price_inr_monthly" integer;`
    },
    {
      name: "0008: Promo codes table",
      query: `CREATE TABLE IF NOT EXISTS "promo_codes" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "code" text NOT NULL UNIQUE,
                "price_inr_monthly" integer DEFAULT 699 NOT NULL,
                "is_used" boolean DEFAULT false NOT NULL,
                "used_by_tenant_id" uuid REFERENCES "tenants"("id") ON DELETE set null,
                "used_at" timestamp with time zone,
                "created_at" timestamp with time zone DEFAULT now() NOT NULL
              );
              CREATE UNIQUE INDEX IF NOT EXISTS "idx_promo_codes_code" ON "promo_codes" ("code");
              CREATE INDEX IF NOT EXISTS "idx_promo_codes_used" ON "promo_codes" ("is_used");`
    },
    {
      name: "0009: Consent columns",
      query: `ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "terms_accepted_at" timestamp with time zone;
              ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "terms_version" text;
              ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pool_consent" text DEFAULT 'not_asked' NOT NULL;
              ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pool_consent_at" timestamp with time zone;
              ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pool_consent_method" text;`
    }
  ];

  for (const step of steps) {
    try {
      await sql.query(step.query);
      results[step.name] = "ok";
    } catch (e: any) {
      results[step.name] = `error: ${e.message}`;
    }
  }

  return NextResponse.json({ success: true, results });
}

