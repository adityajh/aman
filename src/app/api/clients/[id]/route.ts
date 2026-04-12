import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { name, email, phone, defaultFee, notes, defaultFeeSchemeId } = body;

    const [updated] = await db
      .update(clients)
      .set({
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        defaultFee: defaultFee ? defaultFee.toString() : undefined,
        notes: notes || undefined,
        defaultFeeSchemeId: defaultFeeSchemeId || undefined,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    if (!updated) {
      return new NextResponse("Client not found", { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[PATCH /api/clients/:id]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, id),
    });
    if (!client) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json(client);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
