CREATE TABLE IF NOT EXISTS "receipts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "receipt_number" text NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE restrict,
  "amount" numeric(10,2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'INR',
  "payment_date" date NOT NULL DEFAULT CURRENT_DATE,
  "method" text NOT NULL,
  "reference_id" text,
  "notes" text,
  "sent_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "receipts_receipt_number_unique" UNIQUE ("receipt_number")
);

ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "receipt_id" uuid REFERENCES "receipts"("id") ON DELETE cascade;

CREATE INDEX IF NOT EXISTS "idx_receipts_client" ON "receipts" ("client_id");
CREATE INDEX IF NOT EXISTS "idx_payments_receipt" ON "payments" ("receipt_id");
