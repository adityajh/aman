ALTER TABLE "practice_settings" ADD COLUMN IF NOT EXISTS "invoice_due_days" integer NOT NULL DEFAULT 15;
