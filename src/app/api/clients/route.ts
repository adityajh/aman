import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    // Alphabetical by name (case-insensitive).
    const allClients = await db.query.clients.findMany({
      orderBy: [asc(sql`LOWER(${clients.name})`)],
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
    const { name, email, phone, defaultFee, defaultFeeSchemeId, timezone, forceCreate } = body;

    // Duplicate Check
    if (email && !forceCreate) {
      const existing = await db.query.clients.findFirst({
        where: eq(clients.email, email)
      });
      if (existing) {
        return NextResponse.json({
          error: "Duplicate Email",
          client: {
            id: existing.id,
            name: existing.name,
            isActive: existing.isActive
          }
        }, { status: 409 });
      }
    }

    const newClient = await db.insert(clients).values({
      name,
      email,
      phone,
      defaultFee: defaultFee?.toString(),
      defaultFeeSchemeId: defaultFeeSchemeId || undefined,
      timezone: timezone || undefined,
    }).returning();

    return NextResponse.json(newClient[0]);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

