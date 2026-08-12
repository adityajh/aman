import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import {
  invoices,
  payments,
  receipts,
  practiceSettings,
} from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { formatIST, istTodayStr } from "@/lib/tz";
import { nextReceiptNumber } from "@/lib/receipts";
import { getTenantContext, withTenantContext } from "@/lib/tenant";

// POST /api/invoices/[id]/receipt
// Body: { amount, paymentDate?, method?, referenceId?, notes?, sendEmail? }
//
// Records a single payment against THIS invoice (not FIFO), updates the
// invoice's amountPaid + status, and optionally emails a receipt to the
// client. Honors the practice-wide Test Mode (email_override).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { tenantId, planTier } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const body = await req.json();
      const amountNum = parseFloat(body.amount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        return new NextResponse("Invalid amount", { status: 400 });
      }

      const [invoice, settings] = await Promise.all([
        tx.query.invoices.findFirst({
          where: eq(invoices.id, id),
          with: { client: true, lineItems: true },
        }),
        tx.query.practiceSettings.findFirst(),
      ]);

      if (!invoice || !invoice.client) {
        return new NextResponse("Invoice not found", { status: 404 });
      }

      const total = parseFloat(invoice.total);
      const alreadyPaid = parseFloat(invoice.amountPaid || "0");
      const newPaid = alreadyPaid + amountNum;

      let newStatus: "paid" | "partial" | "sent" | "overdue" | "draft" =
        "partial";
      if (newPaid >= total) {
        newStatus = "paid";
      } else if (invoice.status === "draft") {
        newStatus = "partial";
      } else {
        newStatus = invoice.status as any;
        if (newStatus === "draft") newStatus = "partial";
      }

      const payDate = body.paymentDate || istTodayStr();

      // Create the receipt (payment event), then the allocation against this invoice.
      const rcptYear =
        parseInt(payDate.slice(0, 4), 10) || new Date().getUTCFullYear();
      const receiptNumber = await nextReceiptNumber(rcptYear);
      const [receipt] = await tx
        .insert(receipts)
        .values({
            tenantId: tenantId,
            receiptNumber,
          clientId: invoice.clientId,
          amount: amountNum.toFixed(2),
          currency: invoice.currency,
          paymentDate: payDate,
          method: body.method || "upi",
          referenceId: body.referenceId || null,
          notes: body.notes || null,
        })
        .returning();

      await tx.insert(payments).values({
          tenantId: tenantId,
        receiptId: receipt.id,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        amount: amountNum.toFixed(2),
        paymentDate: payDate,
        currency: invoice.currency,
        method: body.method || "upi",
        referenceId: body.referenceId || null,
        notes: body.notes
          ? `${body.notes} (Receipt for ${invoice.invoiceNumber})`
          : `Receipt for ${invoice.invoiceNumber}`,
      });

      await tx
        .update(invoices)
        .set({
          amountPaid: newPaid.toFixed(2),
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      // Email the receipt if requested + client has an address on file.
      let emailedTo: string | null = null;
      let testMode = false;
      if (body.sendEmail && invoice.client.email) {
        const practiceProfile = settings || {
          practiceName: "Deepen Counseling",
          counselorName: "",
          address: "",
          phone: "",
          email: "",
          upiId: "",
        };
        const overrideOn = (settings as any)?.emailOverride === true;
        const counselorEmail = (settings as any)?.email;
        const sendTo =
          overrideOn && counselorEmail ? counselorEmail : invoice.client.email;
        testMode = overrideOn;

        const currencySymbol = invoice.currency === "USD" ? "$" : "₹";
        const fmt = (v: any) =>
          parseFloat(v || "0").toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          });
        const balance = Math.max(0, total - newPaid);

        const testBanner = overrideOn
          ? `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;color:#78350f;">
             <strong>TEST MODE</strong> — In live mode this receipt would have been sent to <strong>${invoice.client.email}</strong>.
           </div>`
          : "";

        const html = `${testBanner}
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #edf2f7; border-radius: 12px; color: #1a202c; background-color: #ffffff;">
          <div style="border-bottom: 4px solid #34d399; padding-bottom: 24px; margin-bottom: 24px;">
            <h1 style="color: #065f46; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">${practiceProfile.practiceName}</h1>
            <p style="margin: 8px 0 0; color: #4a5568; font-size: 15px; line-height: 1.5;">
              ${(practiceProfile.address || "").replace(/\n/g, "<br>")}<br>
                  ${practiceProfile.phone || ""} ${practiceProfile.email ? `| ${practiceProfile.email}` : ""}
                </p>
              </div>

              <h2 style="color: #047857; font-size: 20px; font-weight: 700; margin-bottom: 8px;">Payment Receipt</h2>
              <p style="font-size: 15px; color: #4a5568; margin-bottom: 24px;">Receipt <strong>${receiptNumber}</strong> · for invoice <strong>${invoice.invoiceNumber}</strong></p>
              <p style="font-size: 16px; margin-bottom: 24px;">Dear <strong>${invoice.client.name}</strong>,</p>
              <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin-bottom: 24px;">Thank you. We have received your payment. Details below for your records.</p>

              <div style="background-color: #f0fdf4; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid #d1fae5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-size: 14px; color: #4a5568;">Amount Received</td><td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: 700;">${currencySymbol}${fmt(amountNum)}</td></tr>
                  <tr><td style="padding: 8px 0; font-size: 14px; color: #4a5568;">Payment Date</td><td style="padding: 8px 0; font-size: 14px; text-align: right;">${formatIST(body.paymentDate || new Date(), "d MMM yyyy")}</td></tr>
                  <tr><td style="padding: 8px 0; font-size: 14px; color: #4a5568;">Method</td><td style="padding: 8px 0; font-size: 14px; text-align: right; text-transform: capitalize;">${(body.method || "upi").replace("_", " ")}</td></tr>
                  ${body.referenceId ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #4a5568;">Reference</td><td style="padding: 8px 0; font-size: 14px; text-align: right; font-family: monospace;">${body.referenceId}</td></tr>` : ""}
                  <tr style="border-top: 1px solid #d1fae5;"><td style="padding: 12px 0 4px; font-size: 14px; color: #4a5568;">Invoice Total</td><td style="padding: 12px 0 4px; font-size: 14px; text-align: right;">${currencySymbol}${fmt(total)}</td></tr>
                  <tr><td style="padding: 4px 0; font-size: 14px; color: #4a5568;">Paid So Far</td><td style="padding: 4px 0; font-size: 14px; text-align: right;">${currencySymbol}${fmt(newPaid)}</td></tr>
                  <tr><td style="padding: 4px 0; font-size: 16px; font-weight: 700; color: ${balance > 0 ? "#b45309" : "#047857"};">${balance > 0 ? "Balance Outstanding" : "Balance"}</td><td style="padding: 4px 0; font-size: 16px; text-align: right; font-weight: 700; color: ${balance > 0 ? "#b45309" : "#047857"};">${currencySymbol}${fmt(balance)}</td></tr>
                </table>
              </div>

              <p style="font-size: 13px; color: #718096; line-height: 1.6; margin-top: 32px;">${practiceProfile.counselorName ? `Warmly,<br>${practiceProfile.counselorName}` : ""}</p>
            </div>`;

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const subject = overrideOn
          ? `[TEST → ${invoice.client.email}] Receipt for invoice ${invoice.invoiceNumber}`
          : `Receipt for invoice ${invoice.invoiceNumber}`;

        await transporter.sendMail({
          from: `"${practiceProfile.practiceName}" <${process.env.SMTP_USER}>`,
          to: sendTo,
          subject,
          html,
        });
        emailedTo = sendTo;
        // Stamp when the receipt was sent (for tracking).
        await tx
          .update(receipts)
          .set({ sentAt: new Date() })
          .where(eq(receipts.id, receipt.id));
      }

      return NextResponse.json({
        success: true,
        receiptNumber,
        newStatus,
        amountPaid: newPaid.toFixed(2),
        balance: Math.max(0, total - newPaid).toFixed(2),
        emailedTo,
        testMode,
      });
    } catch (error: any) {
      console.error("[POST /api/invoices/:id/receipt]", error);
      return new NextResponse(error.message || "Internal Server Error", {
        status: 500,
      });
    }
  });
}
