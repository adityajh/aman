import { db } from "@/lib/db";
import { feeSchemes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const [updated] = await db
      .update(feeSchemes)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(feeSchemes.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    await db.delete(feeSchemes).where(eq(feeSchemes.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
