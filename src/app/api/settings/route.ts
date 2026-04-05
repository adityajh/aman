import { db } from "@/lib/db";
import { practiceSettings } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function GET() {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const settings = await db.query.practiceSettings.findFirst();
    return NextResponse.json(settings || null);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { counselorName, practiceName, address, phone, email, monthlyQuote } = body;

    const existing = await db.query.practiceSettings.findFirst();

    if (existing) {
      const updated = await db.update(practiceSettings)
        .set({
          counselorName,
          practiceName,
          address,
          phone,
          email,
          monthlyQuote,
          updatedAt: new Date(),
        })
        .where(sql`id = ${existing.id}`)
        .returning();
      return NextResponse.json(updated[0]);
    } else {
      const inserted = await db.insert(practiceSettings)
        .values({
          counselorName,
          practiceName,
          address,
          phone,
          email,
          monthlyQuote,
        })
        .returning();
      return NextResponse.json(inserted[0]);
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
