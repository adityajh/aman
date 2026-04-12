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
