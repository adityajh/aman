-- ============================================================
-- AMAN — Counselor Session Logging & Invoicing System
-- Database Schema (Neon / PostgreSQL)
-- Version 1.0 | April 2026
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────────
CREATE TABLE clients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT,
  phone          TEXT,
  date_of_birth  DATE,
  default_fee    NUMERIC(10,2),
  fee_type       TEXT DEFAULT 'per_session'
                   CHECK (fee_type IN ('hourly','per_session','package','sliding_scale')),
  tags           TEXT[],           -- e.g. ['anxiety','cbt','teenager']
  is_active      BOOLEAN NOT NULL DEFAULT true,
  intake_notes   TEXT,             -- private; NOT exposed on client portal
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_active ON clients(is_active);

-- ─────────────────────────────────────────────
-- SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  duration_min   INTEGER NOT NULL DEFAULT 60,
  session_type   TEXT NOT NULL DEFAULT 'individual'
                   CHECK (session_type IN ('individual','couples','group','intake','followup')),
  status         TEXT NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN ('scheduled','completed','no_show','cancelled','rescheduled')),
  cancellation_reason TEXT,        -- required when status = cancelled | no_show
  cancellation_fee    NUMERIC(10,2) DEFAULT 0, -- fee charged despite cancellation
  modality       TEXT NOT NULL DEFAULT 'in_person'
                   CHECK (modality IN ('in_person','video','phone')),
  fee_charged    NUMERIC(10,2),    -- actual fee; copied from client default on creation
  fee_override   BOOLEAN NOT NULL DEFAULT false, -- true if differs from client default
  invoice_id     UUID,             -- set once billed; NULL = unbilled
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_client    ON sessions(client_id);
CREATE INDEX idx_sessions_status    ON sessions(status);
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_at);
CREATE INDEX idx_sessions_invoice   ON sessions(invoice_id);

-- ─────────────────────────────────────────────
-- SESSION NOTES (SOAP)
-- ─────────────────────────────────────────────
CREATE TABLE session_notes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE RESTRICT,
  subjective     TEXT,             -- S: Client's reported feelings / complaints
  objective      TEXT,             -- O: Counselor's observations
  assessment     TEXT,             -- A: Clinical interpretation, patterns
  plan           TEXT,             -- P: Next steps, homework, goals
  mood_score     INTEGER CHECK (mood_score BETWEEN 1 AND 10), -- Phase 2
  goal_progress  TEXT,             -- Free text on progress toward treatment goals
  risk_flag      TEXT NOT NULL DEFAULT 'none'
                   CHECK (risk_flag IN ('none','low','medium','high')),
  note_type      TEXT NOT NULL DEFAULT 'SOAP'
                   CHECK (note_type IN ('SOAP','DAP','BIRP','free')),
  ai_drafted     BOOLEAN NOT NULL DEFAULT false, -- Phase 2: true if AI generated draft
  completed_at   TIMESTAMPTZ,      -- NULL = draft in progress
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_session   ON session_notes(session_id);
CREATE INDEX idx_notes_risk_flag ON session_notes(risk_flag);

-- ─────────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────────
CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number  TEXT UNIQUE NOT NULL,    -- INV-2026-0001 (auto-generated in app)
  billing_month   DATE NOT NULL,           -- First day of billed month: 2026-04-01
  issued_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,                    -- Typically issued_date + 7
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  amount_paid     NUMERIC(10,2) NOT NULL DEFAULT 0, -- Running total from payments
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','paid','partial','overdue','void')),
  sent_at         TIMESTAMPTZ,
  pdf_url         TEXT,
  payment_link    TEXT,                    -- Razorpay link (Phase 2)
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_client  ON invoices(client_id);
CREATE INDEX idx_invoices_status  ON invoices(status);
CREATE INDEX idx_invoices_month   ON invoices(billing_month);

-- Add FK from sessions to invoices (after invoices table exists)
ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_invoice
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────
-- INVOICE LINE ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE invoice_line_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id     UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  session_id     UUID REFERENCES sessions(id) ON DELETE SET NULL, -- NULL for manual items
  description    TEXT NOT NULL,   -- 'Session – 3 Apr 2026 (60 min, Video)'
  quantity       INTEGER NOT NULL DEFAULT 1,
  unit_price     NUMERIC(10,2) NOT NULL,
  amount         NUMERIC(10,2) NOT NULL,  -- quantity * unit_price
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_line_items_session ON invoice_line_items(session_id);

-- ─────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id     UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  amount         NUMERIC(10,2) NOT NULL,
  payment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  method         TEXT NOT NULL
                   CHECK (method IN ('cash','upi','bank_transfer','card','online','other')),
  reference_id   TEXT,            -- UPI ref, cheque no., Razorpay payment ID
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- ─────────────────────────────────────────────
-- CLIENT PORTAL TOKENS (Phase 2)
-- ─────────────────────────────────────────────
CREATE TABLE portal_tokens (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token          TEXT UNIQUE NOT NULL,  -- signed JWT or random 32-char token
  expires_at     TIMESTAMPTZ NOT NULL, -- default: now() + 30 days
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_tokens_client ON portal_tokens(client_id);
CREATE INDEX idx_portal_tokens_token  ON portal_tokens(token);

-- ─────────────────────────────────────────────
-- AUDIT LOG
-- ─────────────────────────────────────────────
CREATE TABLE audit_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name     TEXT NOT NULL,    -- clients | sessions | invoices | payments
  record_id      UUID NOT NULL,
  action         TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data       JSONB,            -- NULL on INSERT
  new_data       JSONB,            -- NULL on DELETE
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_table    ON audit_log(table_name);
CREATE INDEX idx_audit_record   ON audit_log(record_id);
CREATE INDEX idx_audit_created  ON audit_log(created_at DESC);

-- ─────────────────────────────────────────────
-- HELPER: AUTO-UPDATE updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_session_notes_updated_at
  BEFORE UPDATE ON session_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
-- HELPER: AUTO-UPDATE invoices.amount_paid
-- Run this after every INSERT on payments
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_invoice_amount_paid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET amount_paid = (
    SELECT COALESCE(SUM(amount), 0)
    FROM payments
    WHERE invoice_id = NEW.invoice_id
  ),
  status = CASE
    WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) >= total
      THEN 'paid'
    WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) > 0
      THEN 'partial'
    ELSE status
  END
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_update_invoice
  AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION update_invoice_amount_paid();

-- ─────────────────────────────────────────────
-- USEFUL VIEWS
-- ─────────────────────────────────────────────

-- Unbilled sessions (completed but not on any invoice)
CREATE VIEW v_unbilled_sessions AS
SELECT
  s.id,
  s.scheduled_at,
  s.duration_min,
  s.session_type,
  s.status,
  s.fee_charged,
  c.id AS client_id,
  c.name AS client_name,
  c.email AS client_email,
  sn.completed_at AS note_completed_at,
  CASE WHEN sn.id IS NOT NULL THEN true ELSE false END AS has_note
FROM sessions s
JOIN clients c ON c.id = s.client_id
LEFT JOIN session_notes sn ON sn.session_id = s.id
WHERE s.status = 'completed'
  AND s.invoice_id IS NULL
  AND c.is_active = true;

-- Invoice summary per client
CREATE VIEW v_client_invoice_summary AS
SELECT
  c.id AS client_id,
  c.name AS client_name,
  COUNT(i.id) AS total_invoices,
  SUM(i.total) AS total_billed,
  SUM(i.amount_paid) AS total_paid,
  SUM(i.total - i.amount_paid) AS total_outstanding,
  COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) AS overdue_count
FROM clients c
LEFT JOIN invoices i ON i.client_id = c.id AND i.status != 'void'
WHERE c.is_active = true
GROUP BY c.id, c.name;

-- Dashboard stats (single row)
CREATE VIEW v_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM sessions WHERE status = 'completed' AND invoice_id IS NULL) AS unbilled_sessions,
  (SELECT COUNT(*) FROM invoices WHERE status = 'overdue') AS overdue_invoices,
  (SELECT COALESCE(SUM(total - amount_paid), 0) FROM invoices WHERE status IN ('sent','partial','overdue')) AS total_outstanding,
  (SELECT COALESCE(SUM(amount_paid), 0) FROM invoices
   WHERE billing_month = DATE_TRUNC('month', CURRENT_DATE)::DATE) AS revenue_this_month,
  (SELECT COUNT(*) FROM sessions
   WHERE scheduled_at >= CURRENT_DATE AND scheduled_at < CURRENT_DATE + INTERVAL '7 days'
   AND status = 'scheduled') AS upcoming_sessions_7d,
  (SELECT COUNT(*) FROM session_notes WHERE risk_flag IN ('medium','high')) AS active_risk_flags;
