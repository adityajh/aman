import { db } from "@/lib/db";
import { receipts } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

// Next receipt number for a year: RCP-<year>-<NNNN>, derived from the highest
// existing suffix + 1 (robust to deletions/gaps — same scheme as invoices).
export async function nextReceiptNumber(year: number): Promise<string> {
  const rows = await db
    .select({
      max: sql<number>`COALESCE(MAX(CAST(split_part(${receipts.receiptNumber}, '-', 3) AS integer)), 0)`,
    })
    .from(receipts)
    .where(sql`${receipts.receiptNumber} LIKE ${`RCP-${year}-%`}`);
  const n = Number(rows[0].max) + 1;
  return `RCP-${year}-${n.toString().padStart(4, "0")}`;
}
