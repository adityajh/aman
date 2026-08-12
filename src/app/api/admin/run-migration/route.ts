import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Multi-Tenancy Migration Endpoint
export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const results: Record<string, string> = {};

  const steps = [
    {
      name: "Update admin email and password",
      query: `UPDATE "users" SET "email" = 'vijay10gopal@gmail.com', "password_hash" = '$2b$10$QUuU03.NBR8IqUgHT9VIWObzft8R9LtkYom7zIOKH8rlrQHLK8XnW' WHERE "email" = 'counselor@deepen.health'`
    },
    {
      name: "Update tenant email",
      query: `UPDATE "tenants" SET "email" = 'vijay10gopal@gmail.com' WHERE "email" = 'counselor@deepen.health'`
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

