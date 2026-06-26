import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { istTodayStr } from "@/lib/tz";

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

    const today = istTodayStr();

    // Add sessionCount to each invoice and dynamically compute overdue status
    const invoicesWithCount = allInvoices.map(inv => {
      let status = inv.status;
      // If invoice is sent but past due date, it's overdue
      if (status === 'sent' && inv.dueDate && inv.dueDate < today) {
        status = 'overdue';
      }
      return {
        ...inv,
        status,
        sessionCount: inv.lineItems.filter(item => item.sessionId).length,
      };
    });

    return NextResponse.json(invoicesWithCount);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
