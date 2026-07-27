import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Multi-Tenancy Migration Endpoint
export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const results: Record<string, string> = {};

  const steps = [
    {
      name: "1. Create tenants and users tables",
      query: `CREATE TABLE IF NOT EXISTS "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"plan_tier" text DEFAULT 'basic' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
)`
    },
    {
      name: "1.1 Create users table",
      query: `CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
)`
    },
    {
      name: "1.2 Add Foreign Key for users",
      query: `DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;`
    },
    {
      name: "2.1 Add tenant_id to domain tables part 1",
      query: `ALTER TABLE "fee_schemes" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.2 Add tenant_id to domain tables part 2",
      query: `ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.3 Add tenant_id to domain tables part 3",
      query: `ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.4 Add tenant_id to domain tables part 4",
      query: `ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.5 Add tenant_id to domain tables part 5",
      query: `ALTER TABLE "session_notes" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.6 Add tenant_id to domain tables part 6",
      query: `ALTER TABLE "invoice_line_items" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.7 Add tenant_id to domain tables part 7",
      query: `ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.8 Add tenant_id to domain tables part 8",
      query: `ALTER TABLE "receipts" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.9 Add tenant_id to domain tables part 9",
      query: `ALTER TABLE "portal_tokens" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.10 Add tenant_id to domain tables part 10",
      query: `ALTER TABLE "practice_settings" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "2.11 Add tenant_id to domain tables part 11",
      query: `ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;`
    },
    {
      name: "3. Create Default Tenant and User for existing data",
      query: `DO $$ 
DECLARE
    default_tenant_id uuid := gen_random_uuid();
    admin_email text := 'counselor@aman.com';
    -- bcrypt hash for 'password123'
    admin_hash text := '$2a$10$wN3YtK/JgL00rZ948HkI3OLJz75jO8L28.1s0U7Lw0/m5zY5oHwY6'; 
BEGIN
    INSERT INTO "tenants" ("id", "name", "slug", "email", "plan_tier")
    VALUES (default_tenant_id, 'Aman Counseling', 'aman-counseling', admin_email, 'pro')
    ON CONFLICT DO NOTHING;

    INSERT INTO "users" ("tenant_id", "name", "email", "password_hash")
    VALUES (default_tenant_id, 'Vijay Gopal Sreenivasan', admin_email, admin_hash)
    ON CONFLICT DO NOTHING;

    -- Backfill all tables
    UPDATE "fee_schemes" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "clients" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "invoices" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "sessions" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "session_notes" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "invoice_line_items" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "payments" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "receipts" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "portal_tokens" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "practice_settings" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
    UPDATE "audit_log" SET "tenant_id" = default_tenant_id WHERE "tenant_id" IS NULL;
END $$;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 1",
      query: `ALTER TABLE "fee_schemes" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 2",
      query: `ALTER TABLE "clients" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 3",
      query: `ALTER TABLE "invoices" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 4",
      query: `ALTER TABLE "sessions" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 5",
      query: `ALTER TABLE "session_notes" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 6",
      query: `ALTER TABLE "invoice_line_items" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 7",
      query: `ALTER TABLE "payments" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 8",
      query: `ALTER TABLE "receipts" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 9",
      query: `ALTER TABLE "portal_tokens" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 10",
      query: `ALTER TABLE "practice_settings" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "4. Alter columns to NOT NULL and add foreign keys part 11",
      query: `ALTER TABLE "audit_log" ALTER COLUMN "tenant_id" SET NOT NULL;`
    },
    {
      name: "5. Drop old unique constraints and add scoped unique constraints 1",
      query: `ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_invoice_number_unique";`
    },
    {
      name: "5. Drop old unique constraints and add scoped unique constraints 2",
      query: `CREATE UNIQUE INDEX IF NOT EXISTS "idx_invoices_tenant_num" ON "invoices" ("tenant_id", "invoice_number");`
    },
    {
      name: "5. Drop old unique constraints and add scoped unique constraints 3",
      query: `ALTER TABLE "receipts" DROP CONSTRAINT IF EXISTS "receipts_receipt_number_unique";`
    },
    {
      name: "5. Drop old unique constraints and add scoped unique constraints 4",
      query: `CREATE UNIQUE INDEX IF NOT EXISTS "idx_receipts_tenant_num" ON "receipts" ("tenant_id", "receipt_number");`
    },
    {
      name: "5. Create new indexes",
      query: `CREATE INDEX IF NOT EXISTS "idx_clients_tenant_active" ON "clients" ("tenant_id", "is_active");`
    },
    {
      name: "5. Create new indexes 2",
      query: `CREATE INDEX IF NOT EXISTS "idx_sessions_tenant_scheduled" ON "sessions" ("tenant_id", "scheduled_at");`
    },
    {
      name: "6. Add Foreign Keys for tenant_id to domain tables",
      query: `DO $$ BEGIN
 ALTER TABLE "fee_schemes" ADD CONSTRAINT "fee_schemes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "receipts" ADD CONSTRAINT "receipts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "portal_tokens" ADD CONSTRAINT "portal_tokens_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "practice_settings" ADD CONSTRAINT "practice_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
 ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;`
    },
    {
      name: "7. Enable RLS and Create Policies part 1",
      query: `ALTER TABLE "fee_schemes" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 2",
      query: `ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 3",
      query: `ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 4",
      query: `ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 5",
      query: `ALTER TABLE "session_notes" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 6",
      query: `ALTER TABLE "invoice_line_items" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 7",
      query: `ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 8",
      query: `ALTER TABLE "receipts" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 9",
      query: `ALTER TABLE "portal_tokens" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 10",
      query: `ALTER TABLE "practice_settings" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies part 11",
      query: `ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: "7. Enable RLS and Create Policies (policies block)",
      query: `DO $$ BEGIN
  CREATE POLICY tenant_isolation_policy ON "fee_schemes" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "clients" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "invoices" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "sessions" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "session_notes" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "invoice_line_items" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "payments" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "receipts" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "portal_tokens" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "practice_settings" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
  CREATE POLICY tenant_isolation_policy ON "audit_log" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;`
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

