import { NextResponse } from "next/server";
import { invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTenantContext, withTenantContext } from "@/lib/tenant";
import { getActiveConnection } from "@/lib/razorpay-connect";
import { ensurePaymentLink } from "@/lib/payment-links";

// POST /api/invoices/[id]/payment-link
// Returns a pay-online link for the invoice (creating it if needed), so the
// counsellor can copy it into WhatsApp or a message.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId } = await getTenantContext();

  if (!(await getActiveConnection(tenantId))) {
    return new NextResponse("Connect Razorpay in Settings to create payment links.", { status: 400 });
  }

  return await withTenantContext(tenantId, async (tx) => {
    const [invoice, settings] = await Promise.all([
      tx.query.invoices.findFirst({ where: eq(invoices.id, id), with: { client: true } }),
      tx.query.practiceSettings.findFirst(),
    ]);
    if (!invoice) return new NextResponse("Invoice not found", { status: 404 });
    if (invoice.currency !== "INR") {
      return new NextResponse("Online payment links are available for INR invoices only.", { status: 400 });
    }
    if (!["draft", "sent", "partial", "overdue"].includes(invoice.status)) {
      return new NextResponse("This invoice has nothing left to pay.", { status: 400 });
    }

    const url = await ensurePaymentLink(tx, tenantId, invoice, settings?.practiceName);
    if (!url) {
      return new NextResponse("Couldn't create a payment link. Try again, or check the Razorpay connection in Settings.", { status: 502 });
    }
    return NextResponse.json({ url });
  });
}
