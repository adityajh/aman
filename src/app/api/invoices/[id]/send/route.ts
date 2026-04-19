import nodemailer from 'nodemailer';
import { db } from "@/lib/db";
import { invoices, invoiceLineItems, clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

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

    if (!invoice.client.email) {
      return new NextResponse("Client email is required to send invoice", { status: 400 });
    }

    const practiceProfile = settings || {
      practiceName: "Aman Practice Management",
      counselorName: "Vijay Gopal Sreenivasan",
      address: "Noida, Uttar Pradesh",
      phone: "+91-0000000000",
      email: "counselor@aman.com",
      monthlyQuote: "Progress is not a straight line.",
      upiId: ""
    };

    const formatCurrency = (val: any) => {
      const num = parseFloat(val || "0");
      return num.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    };

    const currencySymbol = invoice.currency === 'USD' ? '$' : '₹';

    // Configure Nodemailer transporter (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // This should be a Gmail App Password
      },
    });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #edf2f7; border-radius: 12px; color: #1a202c; background-color: #ffffff;">
        <div style="border-bottom: 4px solid #bef264; padding-bottom: 24px; margin-bottom: 24px;">
          <h1 style="color: #1a365d; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em;">${practiceProfile.practiceName}</h1>
          <p style="margin: 8px 0 0; color: #4a5568; font-size: 15px; line-height: 1.5;">
            ${(practiceProfile.address || "").replace(/\n/g, '<br>')}<br>
            ${practiceProfile.phone} | ${practiceProfile.email}
          </p>
        </div>

        <h2 style="color: #2b6cb0; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Invoice: #${invoice.invoiceNumber}</h2>
        <p style="font-size: 16px; margin-bottom: 24px;">Dear <strong>${invoice.client.name}</strong>,</p>
        <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin-bottom: 24px;">Please find the billing details for your recent therapy sessions. Thank you for your continued trust in the therapeutic process.</p>
        
        <div style="background-color: #f7fafc; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e0;">
                <th style="padding: 12px; text-align: left; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Description</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map((item: any) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 16px 12px; font-size: 15px; color: #2d3748;">${item.description}</td>
                  <td style="padding: 16px 12px; text-align: right; font-size: 15px; color: #2d3748; font-weight: 600;">${currencySymbol}${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
              <tr>
                <td style="padding: 24px 12px 12px; font-weight: 800; font-size: 16px; color: #1a365d;">Total Payable</td>
                <td style="padding: 24px 12px 12px; text-align: right; font-weight: 800; font-size: 22px; color: #2b6cb0;">${currencySymbol}${formatCurrency(invoice.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background-color: #ebf8ff; padding: 20px; border-radius: 8px; border: 1px solid #bee3f8; margin-bottom: 32px;">
          <h3 style="margin: 0 0 12px; font-size: 13px; color: #2c5282; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Payment Information</h3>
          <p style="margin: 0; font-size: 14px; color: #2d3748; line-height: 1.8;">
            <strong>Bank:</strong> HSBC<br>
            <strong>Branch:</strong> Noida, Sector - 18<br>
            <strong>Account #:</strong> 499 034528 006<br>
            <strong>IFSC:</strong> HSBC 0110007<br>
            <strong>Account Name:</strong> Vijay Gopal Sreenivasan
            ${practiceProfile.upiId ? `<br><strong>UPI ID:</strong> ${practiceProfile.upiId}` : ''}
          </p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; font-style: italic; color: #718096; font-size: 15px; text-align: center; line-height: 1.6;">
          "${practiceProfile.monthlyQuote}"
        </div>

        <div style="margin-top: 40px; border-top: 2px solid #bef264; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #a0aec0; margin: 0; text-transform: uppercase; font-weight: 600; letter-spacing: 0.1em;">
            Billing Month: ${format(new Date(invoice.billingMonth), "MMMM yyyy")}
          </p>
          <p style="font-size: 11px; color: #cbd5e0; margin: 8px 0 0;">
            Aman Clinical Practice Management System
          </p>
        </div>
      </div>
    `;

    // Send email using Nodemailer
    await transporter.sendMail({
      from: `"${practiceProfile.practiceName}" <${process.env.SMTP_USER}>`,
      to: invoice.client.email,
      subject: `Invoice ${invoice.invoiceNumber} for therapy sessions`,
      html: htmlContent,
    });

    // Update status to 'sent'
    await db.update(invoices).set({
      status: 'sent',
      sentAt: new Date(),
    }).where(eq(invoices.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Nodemailer Error:", error);
    return new NextResponse(`Email delivery failed: ${error.message || 'Unknown error'}`, { status: 500 });
  }
}

