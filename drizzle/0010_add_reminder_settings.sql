-- Add payment reminder settings to practice_settings
ALTER TABLE practice_settings
  ADD COLUMN IF NOT EXISTS reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_days_after_due integer NOT NULL DEFAULT 3;

-- Add last_reminder_at to invoices for throttling repeat reminder emails
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz;
