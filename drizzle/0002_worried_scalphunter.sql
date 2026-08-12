CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"receipt_number" text NOT NULL,
	"client_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"payment_date" date DEFAULT CURRENT_DATE NOT NULL,
	"method" text NOT NULL,
	"reference_id" text,
	"notes" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"plan_tier" text DEFAULT 'basic' NOT NULL,
	"razorpay_subscription_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_invoice_number_unique";--> statement-breakpoint
ALTER TABLE "practice_settings" ALTER COLUMN "practice_name" SET DEFAULT 'Deepen Counseling';--> statement-breakpoint
ALTER TABLE "practice_settings" ALTER COLUMN "email" SET DEFAULT 'counselor@deepen.health';--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "ors_individual" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "ors_interpersonal" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "ors_social" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "ors_overall" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "ors_total" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "srs_relationship" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "srs_goals" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "srs_approach" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "srs_overall" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "srs_total" SET DATA TYPE numeric(5, 1);--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "termination_reason" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "termination_type" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "terminated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "premature_termination_manual" boolean;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "timezone" text DEFAULT 'Asia/Kolkata' NOT NULL;--> statement-breakpoint
ALTER TABLE "fee_schemes" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "receipt_id" uuid;--> statement-breakpoint
ALTER TABLE "portal_tokens" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "upi_id" text;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "ors_cutoff" integer DEFAULT 25 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "srs_cutoff" integer DEFAULT 36 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "ors_deterioration_threshold" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "srs_decline_threshold" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "ors_rci_threshold" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "ors_amber_low" integer DEFAULT 26 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "ors_green_low" integer DEFAULT 32 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "invoice_due_days" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD COLUMN "email_override" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "ors_flag" boolean;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "srs_flag" boolean;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "tenant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "ended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "actual_start_time" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "actual_end_time" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "invoiced_duration_min" integer;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_receipts_client" ON "receipts" USING btree ("client_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_receipts_tenant_num" ON "receipts" USING btree ("tenant_id","receipt_number");--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_schemes" ADD CONSTRAINT "fee_schemes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_receipt_id_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_tokens" ADD CONSTRAINT "portal_tokens_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_settings" ADD CONSTRAINT "practice_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_clients_tenant_active" ON "clients" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_invoices_tenant_num" ON "invoices" USING btree ("tenant_id","invoice_number");--> statement-breakpoint
CREATE INDEX "idx_payments_receipt" ON "payments" USING btree ("receipt_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_tenant_scheduled" ON "sessions" USING btree ("tenant_id","scheduled_at");