import { db } from "@/lib/db";
import { sessions, sessionNotes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { status, cancellationReason } = body;

    // Guard: Prevent cancelling if already invoiced
    if (status === "cancelled") {
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, id),
      });

      if (session?.invoiceId) {
        return new NextResponse("Cannot cancel an invoiced session", { status: 400 });
      }
    }

    const [updated] = await db
      .update(sessions)
      .set({
        status: status || undefined,
        cancellationReason: cancellationReason || undefined,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, id))
      .returning();

    if (!updated) {
      return new NextResponse("Session not found", { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[PATCH /api/sessions/:id]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
    });

    if (!session) return new NextResponse("Session not found", { status: 404 });

    // Hard delete is forbidden once a session has been billed — the line item
    // and totals have already been published.
    if (session.invoiceId) {
      return new NextResponse("Cannot delete an invoiced session", { status: 400 });
    }

    // session_notes.session_id is ON DELETE RESTRICT, so the note (if any)
    // must be removed first.
    await db.delete(sessionNotes).where(eq(sessionNotes.sessionId, id));
    await db.delete(sessions).where(eq(sessions.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[DELETE /api/sessions/:id]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
      with: {
        client: true,
        feeScheme: true,
      },
    });

    if (!session) return new NextResponse("Session not found", { status: 404 });

    return NextResponse.json(session);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
