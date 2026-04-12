import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// One-time migration endpoint to add missing columns — delete after use
export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const results: Record<string, string> = {};

  const steps: { name: string; query: string }[] = [
    // Add client_id to payments (nullable first to avoid constraint error on existing rows)
    {
      name: "payments.client_id",
      query: `ALTER TABLE payments ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE RESTRICT`
    },
    // Add fee_scheme_id to sessions
    {
      name: "sessions.fee_scheme_id",
      query: `ALTER TABLE sessions ADD COLUMN IF NOT EXISTS fee_scheme_id uuid REFERENCES fee_schemes(id) ON DELETE SET NULL`
    },
    // Add default_fee_scheme_id to clients
    {
      name: "clients.default_fee_scheme_id",
      query: `ALTER TABLE clients ADD COLUMN IF NOT EXISTS default_fee_scheme_id uuid REFERENCES fee_schemes(id) ON DELETE SET NULL`
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
