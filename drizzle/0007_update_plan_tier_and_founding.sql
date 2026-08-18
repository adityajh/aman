ALTER TABLE "tenants" ALTER COLUMN "plan_tier" SET DEFAULT 'deepen';
UPDATE "tenants" SET "plan_tier" = 'deepen' WHERE "plan_tier" = 'basic';
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "is_founding" boolean DEFAULT false NOT NULL;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "founding_seat" integer;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "price_inr_monthly" integer;
