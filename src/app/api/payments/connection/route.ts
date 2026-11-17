import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTenantContext } from "@/lib/tenant";
import { getConnection, isConnectConfigured, revokeConnection } from "@/lib/razorpay-connect";
import { closeAllLinks } from "@/lib/payment-links";

// GET: connection status for Settings (never returns tokens).
export async function GET() {
  const { tenantId } = await getTenantContext();
  const conn = await getConnection(tenantId);
  return NextResponse.json({
    available: isConnectConfigured(),
    connected: conn?.status === "active",
    status: conn?.status ?? null,
    accountId: conn?.accountId ?? null,
    mode: conn?.mode ?? null,
    connectedAt: conn?.connectedAt ?? null,
    lastError: conn?.status === "error" ? conn.lastError : null,
    autoSendReceipts: conn?.autoSendReceipts ?? true,
  });
}

// PATCH { autoSendReceipts }: change preferences.
export async function PATCH(req: Request) {
  const { tenantId } = await getTenantContext();
  const conn = await getConnection(tenantId);
  if (!conn) return new NextResponse("Not connected", { status: 404 });
  const body = await req.json();
  if (typeof body.autoSendReceipts !== "boolean") {
    return new NextResponse("autoSendReceipts must be true or false", { status: 400 });
  }
  await db
    .update(paymentConnections)
    .set({ autoSendReceipts: body.autoSendReceipts, updatedAt: new Date() })
    .where(eq(paymentConnections.id, conn.id));
  return NextResponse.json({ success: true });
}

// DELETE: disconnect. Revokes Deepen's access at Razorpay and removes the tokens.
// Open links are cancelled first; payments already recorded stay.
export async function DELETE() {
  const { tenantId } = await getTenantContext();
  const conn = await getConnection(tenantId);
  if (!conn) return NextResponse.json({ success: true });
  await closeAllLinks(tenantId);
  await revokeConnection(conn);
  await db.delete(paymentConnections).where(eq(paymentConnections.id, conn.id));
  return NextResponse.json({ success: true });
}
