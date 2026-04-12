import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const allInvoices = await db.query.invoices.findMany({
      orderBy: [desc(invoices.createdAt)],
      with: {
        client: true,
        lineItems: true,
      },
    });

    // Add sessionCount to each invoice
    const invoicesWithCount = allInvoices.map(inv => ({
      ...inv,
      sessionCount: inv.lineItems.filter(item => item.sessionId).length,
    }));

    return NextResponse.json(invoicesWithCount);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
