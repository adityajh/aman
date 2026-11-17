-- Per-practice bank details on invoices (Nov 2026)
--
-- Replaces the HSBC account that was hardcoded into every practice's invoice
-- email and preview. Additive: five nullable text columns on
-- practice_settings, then one UPDATE that moves those same HSBC details into
-- the settings of the practice they belong to (aman-counseling), so its
-- invoices read exactly as before. Every other practice shows only what it
-- has entered itself.
--
-- Run step 1 BEFORE the code deploys (Drizzle selects every column in the
-- schema, so the new code fails on practice_settings until these exist).
-- Safe to run before: the old code ignores unknown columns.
-- Idempotent. Run once against Neon, with Adi's go-ahead.

-- 1. Columns
ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS bank_branch text;
ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS bank_account_name text;
ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS bank_account_number text;
ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS bank_ifsc text;

-- 2. Keep aman-counseling's invoices unchanged. bank_account_name stays NULL,
--    so "Account Name" keeps falling back to counselor_name, as it did before.
--    Only fills empty fields, so re-running never overwrites an edit.
UPDATE practice_settings
SET bank_name           = COALESCE(bank_name, 'HSBC'),
    bank_branch         = COALESCE(bank_branch, 'Noida, Sector - 18'),
    bank_account_number = COALESCE(bank_account_number, '499 034528 006'),
    bank_ifsc           = COALESCE(bank_ifsc, 'HSBC 0110007'),
    updated_at          = now()
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'aman-counseling');
-- Expect: UPDATE 1
