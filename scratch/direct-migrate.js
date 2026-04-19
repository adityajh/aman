const { Client } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_agEO7dyRW5HL@ep-proud-wildflower-amwa5kz2.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function migrate() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log("Connecting to database...");
    await client.connect();
    
    console.log("Running migration: practice_settings additions...");
    await client.query(`ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS ors_cutoff integer NOT NULL DEFAULT 25`);
    await client.query(`ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS srs_cutoff integer NOT NULL DEFAULT 36`);
    await client.query(`ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS ors_deterioration_threshold integer NOT NULL DEFAULT 5`);
    await client.query(`ALTER TABLE practice_settings ADD COLUMN IF NOT EXISTS srs_decline_threshold integer NOT NULL DEFAULT 2`);
    
    console.log("Running migration: clients termination additions...");
    await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS termination_reason text`);
    await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS termination_type text`);
    await client.query(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS terminated_at timestamptz`);
    
    console.log("✅ Migration successful!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

migrate();
