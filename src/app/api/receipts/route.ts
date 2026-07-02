import { db } from "@/lib/db";
import { receipts } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// All receipts (payment events) with their client and allocation rows.
export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const all = await db.query.receipts.findMany({
      orderBy: [desc(receipts.paymentDate), desc(receipts.createdAt)],
      with: {
        client: true,
        allocations: { with: { invoice: true } },
      },
    });
    return NextResponse.json(all);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
