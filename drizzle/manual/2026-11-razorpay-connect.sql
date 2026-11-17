-- Razorpay Connect: online payment links (Nov 2026)
-- Additive only: one new table, three nullable columns, two indexes.
-- Safe to run before the code is deployed. Run once against Neon.

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link_id text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link_amount numeric(10,2);

ALTER TABLE receipts ADD COLUMN IF NOT EXISTS provider_payment_id text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_receipts_tenant_provider_payment
  ON receipts (tenant_id, provider_payment_id);

CREATE TABLE IF NOT EXISTS payment_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'razorpay',
  account_id text NOT NULL,
  mode text NOT NULL,
  access_token_enc text NOT NULL,
  refresh_token_enc text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  last_error text,
  auto_send_receipts boolean NOT NULL DEFAULT true,
  connected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_connections_tenant_provider
  ON payment_connections (tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_payment_connections_account
  ON payment_connections (account_id);

-- Tenant isolation, same policy as every other tenant table (see enable_rls.js).
ALTER TABLE payment_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_policy ON payment_connections;
CREATE POLICY tenant_isolation_policy ON payment_connections TO authenticated
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
GRANT ALL ON payment_connections TO authenticated;
