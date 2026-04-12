import { db } from "./src/lib/db";
import { sessions } from "./src/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";

async function debugSessions() {
  const allSessions = await db.select().from(sessions);
  console.log("Total Sessions:", allSessions.length);
  
  const completedUnbilled = allSessions.filter(s => s.status === 'completed' && !s.invoiceId);
  console.log("Completed Unbilled Sessions:", completedUnbilled.length);
  
  allSessions.forEach(s => {
    console.log(`ID: ${s.id}, Client: ${s.clientId}, Status: ${s.status}, InvoiceId: ${s.invoiceId}`);
  });
}

debugSessions().catch(console.error);
