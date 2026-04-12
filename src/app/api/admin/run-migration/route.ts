import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// One-time migration endpoint — run once, then delete
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`ALTER TABLE fee_schemes ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR'`;
    await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR'`;
    await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR'`;
    return NextResponse.json({ success: true, message: "Migration completed successfully." });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
