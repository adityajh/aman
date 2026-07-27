import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Multi-Tenancy Migration Endpoint
export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const results: Record<string, string> = {};

  const steps = [
    {
      name: "Fix admin password hash",
      query: `UPDATE "users" SET "password_hash" = '$2b$10$QUuU03.NBR8IqUgHT9VIWObzft8R9LtkYom7zIOKH8rlrQHLK8XnW' WHERE "email" = 'counselor@aman.com'`
    }
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

