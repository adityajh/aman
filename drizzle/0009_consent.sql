ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "terms_accepted_at" timestamp with time zone;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "terms_version" text;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pool_consent" text DEFAULT 'not_asked' NOT NULL;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pool_consent_at" timestamp with time zone;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pool_consent_method" text;
