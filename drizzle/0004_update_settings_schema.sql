CREATE TABLE "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"price_inr_monthly" integer DEFAULT 699 NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_by_tenant_id" uuid,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "practice_settings" ALTER COLUMN "counselor_name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "practice_settings" ALTER COLUMN "practice_name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "practice_settings" ALTER COLUMN "address" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "practice_settings" ALTER COLUMN "phone" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "practice_settings" ALTER COLUMN "email" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "plan_tier" SET DEFAULT 'deepen';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "pool_consent" text DEFAULT 'not_asked' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "pool_consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "pool_consent_method" text;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "upi_qr_code" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "is_founding" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "founding_seat" integer;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "price_inr_monthly" integer;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "terms_version" text;--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_used_by_tenant_id_tenants_id_fk" FOREIGN KEY ("used_by_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_promo_codes_code" ON "promo_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_promo_codes_used" ON "promo_codes" USING btree ("is_used");