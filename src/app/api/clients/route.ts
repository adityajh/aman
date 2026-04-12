import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const allClients = await db.query.clients.findMany({
      where: eq(clients.isActive, true),
      orderBy: [desc(clients.createdAt)],
    });
    return NextResponse.json(allClients);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { name, email, phone, defaultFee, defaultFeeSchemeId } = body;

    const newClient = await db.insert(clients).values({
      name,
      email,
      phone,
      defaultFee: defaultFee?.toString(),
      defaultFeeSchemeId: defaultFeeSchemeId || undefined,
    }).returning();

    return NextResponse.json(newClient[0]);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
}

