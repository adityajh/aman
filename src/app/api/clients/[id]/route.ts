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
    const { name, email, phone, defaultFee, intakeNotes, defaultFeeSchemeId, timezone, isActive, terminationReason, terminationType, cancelPendingSessions } = body;

    // Reactivation logic
    let terminationFields = {};
    if (isActive === true) {
      terminationFields = {
        terminationReason: null,
        terminationType: null,
        terminatedAt: null,
      };
    } else if (isActive === false) {
      terminationFields = {
        terminationReason: terminationReason || undefined,
        terminationType: terminationType || undefined,
        terminatedAt: new Date(),
      };

      // Issue 5: Cancel uninvoiced sessions if requested
      if (cancelPendingSessions) {
        const { sessions } = await import("@/lib/db/schema");
        const { and, isNull } = await import("drizzle-orm");
        await db.update(sessions)
          .set({ status: 'cancelled', cancellationReason: 'Client Terminated' })
          .where(and(eq(sessions.clientId, id), isNull(sessions.invoiceId)));
      }
    }

    const [updated] = await db
      .update(clients)
      .set({
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        defaultFee: defaultFee ? defaultFee.toString() : undefined,
        intakeNotes: intakeNotes || undefined,
        defaultFeeSchemeId: defaultFeeSchemeId || undefined,
        timezone: timezone || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        ...terminationFields,
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
