CREATE TABLE "fee_schemes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"counselor_name" text DEFAULT 'Vijay Gopal Sreenivasan' NOT NULL,
	"practice_name" text DEFAULT 'Aman Counseling' NOT NULL,
	"address" text DEFAULT 'Noida, Uttar Pradesh',
	"phone" text DEFAULT '+91-0000000000',
	"email" text DEFAULT 'counselor@aman.com',
	"monthly_quote" text DEFAULT 'Progress is not a straight line.',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "invoice_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "session_notes" ALTER COLUMN "note_type" SET DEFAULT 'CUSTOM';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "default_fee_scheme_id" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "currency" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "client_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "currency" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "updates" text;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "client_actions" text;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "my_actions" text;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "agenda" text;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "feedback" text;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "ors_individual" integer;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "ors_interpersonal" integer;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "ors_social" integer;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "ors_overall" integer;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "ors_total" integer;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "srs_relationship" integer;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "srs_goals" integer;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "srs_approach" integer;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "srs_overall" integer;--> statement-breakpoint
ALTER TABLE "session_notes" ADD COLUMN "srs_total" integer;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "fee_scheme_id" uuid;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_default_fee_scheme_id_fee_schemes_id_fk" FOREIGN KEY ("default_fee_scheme_id") REFERENCES "public"."fee_schemes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_fee_scheme_id_fee_schemes_id_fk" FOREIGN KEY ("fee_scheme_id") REFERENCES "public"."fee_schemes"("id") ON DELETE set null ON UPDATE no action;