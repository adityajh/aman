import { db } from "@/lib/db";
import { feeSchemes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const data = await db.select().from(feeSchemes).orderBy(feeSchemes.name);
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const [newFeeScheme] = await db.insert(feeSchemes).values(body).returning();
    return NextResponse.json(newFeeScheme);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
