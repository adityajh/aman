require('dotenv').config({path: '.env.local'});
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

const tables = [
  "practice_settings", "clients", "sessions", "session_notes", "invoices", 
  "invoice_line_items", "payments", "receipts", "portal_tokens", "fee_schemes"
];

async function main() {
  for (const table of tables) {
    console.log(`Enabling RLS on ${table}...`);
    try {
      await sql.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      await sql.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON ${table}`);
      await sql.query(`CREATE POLICY tenant_isolation_policy ON ${table} TO authenticated USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)`);
      await sql.query(`GRANT ALL ON ${table} TO authenticated`);
    } catch (e) {
      console.error(`Error on ${table}:`, e);
    }
  }
  console.log('Done!');
}
main();
