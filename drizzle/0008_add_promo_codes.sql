CREATE TABLE IF NOT EXISTS "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL UNIQUE,
	"price_inr_monthly" integer DEFAULT 699 NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_by_tenant_id" uuid REFERENCES "tenants"("id") ON DELETE set null,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_promo_codes_code" ON "promo_codes" ("code");
CREATE INDEX IF NOT EXISTS "idx_promo_codes_used" ON "promo_codes" ("is_used");
