import { Resend } from 'resend';
import { db } from "@/lib/db";
import { invoices, invoiceLineItems, clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        client: true,
        lineItems: true,
      },
    });

    if (!invoice || !invoice.client) {
      return new NextResponse("Invoice not found", { status: 404 });
    }

    if (!invoice.client.email) {
        return new NextResponse("Client email not found", { status: 400 });
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Aman Session Invoice</h2>
        <p>Dear ${invoice.client.name},</p>
        <p>Please find the invoice for your recent clinical sessions below.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 10px; text-align: left;">Description</th>
                <th style="padding: 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map((item: any) => `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 10px;">${item.description}</td>
                  <td style="padding: 10px; text-align: right;">₹${item.amount}</td>
                </tr>
              `).join('')}
              <tr>
                <td style="padding: 10px; font-weight: bold;">Total Due</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.25rem;">₹${invoice.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p style="font-size: 0.875rem; color: #6b7280;">
          Invoice No: ${invoice.invoiceNumber}<br>
          Billing Month: ${format(new Date(invoice.billingMonth), "MMMM yyyy")}
        </p>
        
        <p style="text-align: center; margin-top: 30px;">
          <small>Powered by Aman — Clinical Practice Management</small>
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'Aman <onboarding@resend.dev>', // Should use verified domain in production
      to: [invoice.client.email],
      subject: `Invoice ${invoice.invoiceNumber} from Aman`,
      html: htmlContent,
    });

    // Update status to 'sent'
    await db.update(invoices).set({
      status: 'sent',
      sentAt: new Date(),
    }).where(eq(invoices.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
