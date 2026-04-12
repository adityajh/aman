const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_agEO7dyRW5HL@ep-proud-wildflower-amwa5kz2.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function checkSessions() {
  const sql = neon(DATABASE_URL);
  
  console.log("--- SESSIONS ---");
  const sessions = await sql`SELECT id, status, invoice_id, fee_charged, client_id FROM sessions`;
  console.table(sessions);
  
  console.log("\n--- INVOICES ---");
  const invoices = await sql`SELECT id, invoice_number, status, client_id FROM invoices`;
  console.table(invoices);

  console.log("\n--- UNBILLED ACCORDING TO CURRENT QUERY ---");
  const unbilled = await sql`
    SELECT 
      c.name,
      COUNT(s.id) as session_count,
      SUM(s.fee_charged) as total_amount
    FROM clients c
    INNER JOIN sessions s ON s.client_id = c.id
    WHERE s.status = 'completed' AND s.invoice_id IS NULL
    GROUP BY c.id, c.name
  `;
  console.table(unbilled);
}

checkSessions().catch(console.error);
