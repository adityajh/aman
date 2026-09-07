const { Client } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_agEO7dyRW5HL@ep-proud-wildflower-amwa5kz2.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function migrate() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    
    const statements = [
      `ALTER TABLE "practice_settings" ADD COLUMN IF NOT EXISTS "upi_qr_code" text;`,
      `ALTER TABLE "practice_settings" ALTER COLUMN "counselor_name" SET DEFAULT '';`,
      `ALTER TABLE "practice_settings" ALTER COLUMN "practice_name" SET DEFAULT '';`,
      `ALTER TABLE "practice_settings" ALTER COLUMN "address" SET DEFAULT '';`,
      `ALTER TABLE "practice_settings" ALTER COLUMN "phone" SET DEFAULT '';`,
      `ALTER TABLE "practice_settings" ALTER COLUMN "email" SET DEFAULT '';`
    ];
    
    for (const stmt of statements) {
      console.log("Executing:", stmt);
      await client.query(stmt);
    }

    console.log("✅ Migration successful!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await client.end();
  }
}
migrate();
