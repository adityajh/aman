const { Client } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_agEO7dyRW5HL@ep-proud-wildflower-amwa5kz2.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function migrate() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    await client.query(`ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS ors_rci_threshold integer NOT NULL DEFAULT 5`);
    await client.query(`ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS ors_amber_low integer NOT NULL DEFAULT 26`);
    await client.query(`ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS ors_green_low integer NOT NULL DEFAULT 32`);
    console.log("✅ Migration successful!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await client.end();
  }
}
migrate();
