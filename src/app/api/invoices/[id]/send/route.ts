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
    const [invoice, settings] = await Promise.all([
      db.query.invoices.findFirst({
        where: eq(invoices.id, id),
        with: {
          client: true,
          lineItems: true,
        },
      }),
      db.query.practiceSettings.findFirst()
    ]);

    if (!invoice || !invoice.client) {
      return new NextResponse("Invoice not found", { status: 404 });
    }

    const practiceProfile = settings || {
      practiceName: "Aman Counseling",
      counselorName: "Vijay Gopal Sreenivasan",
      address: "Noida, Uttar Pradesh",
      phone: "+91-0000000000",
      email: "counselor@aman.com",
      monthlyQuote: "Progress is not a straight line."
    };

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; color: #1e293b;">
        <div style="border-bottom: 2px solid #bef264; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #1e3a8a; margin: 0; font-size: 24px;">${practiceProfile.practiceName}</h1>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
            ${practiceProfile.counselorName}<br>
            ${(practiceProfile.address || "").replace(/\n/g, '<br>')}<br>
            ${practiceProfile.phone} | ${practiceProfile.email}
          </p>
        </div>

        <h2 style="color: #1e3a8a; font-size: 18px;">Session Invoice</h2>
        <p>Dear ${invoice.client.name},</p>
        <p>Please find the invoice for your recent clinical sessions below.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 10px; text-align: left; font-size: 13px; color: #64748b; text-transform: uppercase;">Description</th>
                <th style="padding: 10px; text-align: right; font-size: 13px; color: #64748b; text-transform: uppercase;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map((item: any) => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 10px; font-size: 14px;">${item.description}</td>
                  <td style="padding: 12px 10px; text-align: right; font-size: 14px;">₹${item.amount}</td>
                </tr>
              `).join('')}
              <tr>
                <td style="padding: 20px 10px 10px; font-weight: bold; font-size: 15px;">Total Due</td>
                <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #1e3a8a;">₹${invoice.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; border: 1px solid #dbeafe; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px; font-size: 14px; color: #1e3a8a; text-transform: uppercase;">Payment Details</h3>
          <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.6;">
            <strong>Bank:</strong> HSBC<br>
            <strong>Branch:</strong> Noida, Sector - 18<br>
            <strong>Account #:</strong> 499 034528 006<br>
            <strong>IFSC:</strong> HSBC 0110007<br>
            <strong>Account Name:</strong> Vijay Gopal Sreenivasan
          </p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-style: italic; color: #64748b; font-size: 14px; text-align: center;">
          "${practiceProfile.monthlyQuote}"
        </div>

        <div style="margin-top: 30px; border-top: 2px solid #bef264; padding-top: 15px; text-align: center;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
            Invoice No: ${invoice.invoiceNumber} | Billing Month: ${format(new Date(invoice.billingMonth), "MMMM yyyy")}
          </p>
          <p style="font-size: 11px; color: #94a3b8; margin: 5px 0 0;">
            Powered by Aman — Clinical Practice Management
          </p>
        </div>
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
