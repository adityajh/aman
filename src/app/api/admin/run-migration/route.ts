import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// One-time migration endpoint — removes NOT NULL from payments.invoice_id
export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const results: Record<string, string> = {};

  const steps = [
    {
      name: "payments.invoice_id DROP NOT NULL",
      query: `ALTER TABLE payments ALTER COLUMN invoice_id DROP NOT NULL`
    },
    {
      name: "fee_schemes table create",
      query: `CREATE TABLE IF NOT EXISTS fee_schemes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        name text NOT NULL,
        description text,
        amount numeric(10,2) NOT NULL,
        currency text NOT NULL DEFAULT 'INR',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`
    },
    {
      name: "practice_settings.upi_id add column",
      query: `ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS upi_id text`
    },
    {
      name: "sessions.ended_at add column",
      query: `ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ended_at timestamptz`
    },
    {
      name: "practice_settings.ors_cutoff add column",
      query: `ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS ors_cutoff integer NOT NULL DEFAULT 25`
    },
    {
      name: "practice_settings.srs_cutoff add column",
      query: `ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS srs_cutoff integer NOT NULL DEFAULT 36`
    },
    {
      name: "practice_settings.ors_deterioration_threshold add column",
      query: `ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS ors_deterioration_threshold integer NOT NULL DEFAULT 5`
    },
    {
      name: "practice_settings.srs_decline_threshold add column",
      query: `ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS srs_decline_threshold integer NOT NULL DEFAULT 2`
    },
    {
      name: "clients.termination_reason add column",
      query: `ALTER TABLE clients ADD COLUMN IF NOT EXISTS termination_reason text`
    },
    {
      name: "clients.termination_type add column",
      query: `ALTER TABLE clients ADD COLUMN IF NOT EXISTS termination_type text`
    },
    {
      name: "clients.terminated_at add column",
      query: `ALTER TABLE clients ADD COLUMN IF NOT EXISTS terminated_at timestamptz`
    },
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
