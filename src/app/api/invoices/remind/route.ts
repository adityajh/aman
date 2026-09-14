import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { invoices, practiceSettings } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and, lt, lte, not, isNull, or } from "drizzle-orm";
import { formatIST } from "@/lib/tz";
import { getTenantContext, withTenantContext } from "@/lib/tenant";
import { sql } from "drizzle-orm";

const REMINDER_THROTTLE_DAYS = 7;

export async function POST(req: Request) {
  // Allow either a cron secret header (for external schedulers) or a
  // logged-in session (for the "Send Now" button in Settings).
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      // Also allow calls that come from the app itself (no secret header) —
      // those are authenticated via the session cookie, which Next.js validates
      // upstream. We distinguish them by the absence of any auth header.
      if (authHeader !== null) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }
  }

  const { tenantId } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      const settings = await tx.query.practiceSettings.findFirst();

      if (!settings?.reminderEnabled) {
        return NextResponse.json({ message: "Reminders are disabled.", sent: 0, skipped: 0 });
      }

      const daysAfterDue = settings.reminderDaysAfterDue ?? 3;

      // Cutoff: invoice due date must be at least N days ago
      const dueCutoff = new Date();
      dueCutoff.setUTCDate(dueCutoff.getUTCDate() - daysAfterDue);
      const dueCutoffStr = dueCutoff.toISOString().slice(0, 10);

      // Throttle: last reminder must have been sent more than 7 days ago (or never)
      const throttleCutoff = new Date();
      throttleCutoff.setUTCDate(throttleCutoff.getUTCDate() - REMINDER_THROTTLE_DAYS);

      // Fetch all candidate invoices (sent / overdue, past due, not recently reminded)
      const candidates = await tx.query.invoices.findMany({
        where: and(
          // Only invoices that have been sent (not draft/void/paid)
          not(eq(invoices.status, "void")),
          not(eq(invoices.status, "paid")),
          not(eq(invoices.status, "draft")),
          // Due date is past the trigger window
          lt(invoices.dueDate, dueCutoffStr),
          // Haven't been reminded in the last 7 days
          or(
            isNull(invoices.lastReminderAt),
            lt(invoices.lastReminderAt, throttleCutoff)
          )
        ),
        with: {
          client: true,
          lineItems: true,
        },
      });

      if (candidates.length === 0) {
        return NextResponse.json({ message: "No overdue invoices to remind.", sent: 0, skipped: 0 });
      }

      const practiceProfile = settings || {
        counselorName: "Jane Doe",
        practiceName: "Acme Counseling",
        address: "",
        phone: "",
        email: "",
        monthlyQuote: "Progress is not a straight line.",
        upiId: "",
      };

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const overrideOn = (settings as any)?.emailOverride === true;
      const counselorEmail = (settings as any)?.email;

      const formatCurrency = (val: any) => {
        const num = parseFloat(val || "0");
        return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      let sent = 0;
      let skipped = 0;

      for (const invoice of candidates) {
        if (!invoice.client?.email) {
          skipped++;
          continue;
        }

        const currencySymbol = invoice.currency === "USD" ? "$" : "₹";
        const amountOwed = parseFloat(invoice.total || "0") - parseFloat((invoice as any).amountPaid || "0");

        const reminderBanner = `
          <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#78350f;font-weight:700;">⏰ Payment Reminder</p>
            <p style="margin:6px 0 0;font-size:13px;color:#78350f;">
              This is a friendly reminder that invoice <strong>${invoice.invoiceNumber}</strong> 
              was due on <strong>${formatIST(new Date(`${invoice.dueDate}T00:00:00Z`), "d MMM yyyy")}</strong>.
              A balance of <strong>${currencySymbol}${formatCurrency(amountOwed)}</strong> remains outstanding.
            </p>
          </div>`;

        const htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #edf2f7; border-radius: 12px; color: #1a202c; background-color: #ffffff;">
            <div style="border-bottom: 4px solid #bef264; padding-bottom: 20px; margin-bottom: 20px;">
              <h1 style="color: #1a365d; margin: 0; font-size: 24px; font-weight: 800;">${practiceProfile.practiceName}</h1>
              <p style="margin: 6px 0 0; color: #4a5568; font-size: 14px;">
                ${(practiceProfile.address || "").replace(/\n/g, "<br>")}
                ${practiceProfile.phone ? `<br>${practiceProfile.phone}` : ""} 
                ${practiceProfile.email ? ` | ${practiceProfile.email}` : ""}
              </p>
            </div>
            
            ${reminderBanner}
            
            <p style="font-size: 15px; margin-bottom: 20px;">Dear <strong>${invoice.client.name}</strong>,</p>
            <p style="font-size: 14px; color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
              We hope you're doing well. We wanted to follow up on the outstanding balance for your therapy sessions.
              Please find the details below and kindly arrange payment at your earliest convenience.
            </p>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px; font-size: 14px; color: #4a5568;">Invoice Number</td>
                  <td style="padding: 10px; text-align: right; font-size: 14px; font-weight: 600; color: #1a202c;">${invoice.invoiceNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px; font-size: 14px; color: #4a5568;">Due Date</td>
                  <td style="padding: 10px; text-align: right; font-size: 14px; color: #b91c1c; font-weight: 600;">${formatIST(new Date(`${invoice.dueDate}T00:00:00Z`), "d MMM yyyy")}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 10px; font-size: 15px; font-weight: 800; color: #1a365d;">Amount Outstanding</td>
                  <td style="padding: 12px 10px; text-align: right; font-size: 18px; font-weight: 800; color: #b91c1c;">${currencySymbol}${formatCurrency(amountOwed)}</td>
                </tr>
              </table>
            </div>

            ${practiceProfile.upiId ? `
            <div style="background-color: #ebf8ff; padding: 16px; border-radius: 8px; border: 1px solid #bee3f8; margin-bottom: 24px;">
              <h3 style="margin: 0 0 10px; font-size: 13px; color: #2c5282; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Payment Information</h3>
              <p style="margin: 0; font-size: 14px; color: #2d3748; line-height: 1.8;">
                <strong>UPI ID:</strong> ${practiceProfile.upiId}<br>
                <strong>Account Name:</strong> ${practiceProfile.counselorName}
              </p>
            </div>` : ""}

            <p style="font-size: 13px; color: #718096; text-align: center; font-style: italic;">
              If you've already made this payment, please ignore this reminder. 
              Feel free to reach out if you have any questions.
            </p>

            <div style="margin-top: 32px; border-top: 2px solid #bef264; padding-top: 16px; text-align: center;">
              <p style="font-size: 11px; color: #cbd5e0; margin: 0;">Deepen Clinical Practice Management System</p>
            </div>
          </div>`;

        const sendTo = overrideOn && counselorEmail ? counselorEmail : invoice.client.email;
        const subject = overrideOn
          ? `[TEST → ${invoice.client.email}] Payment Reminder: ${invoice.invoiceNumber}`
          : `Payment Reminder: Invoice ${invoice.invoiceNumber} — ${practiceProfile.practiceName}`;

        const testBanner = overrideOn
          ? `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:10px 14px;border-radius:8px;margin-bottom:14px;font-size:12px;color:#78350f;">
              <strong>TEST MODE</strong> — In live mode this would have been sent to <strong>${invoice.client.email}</strong>.
             </div>`
          : "";

        try {
          await transporter.sendMail({
            from: `"${practiceProfile.practiceName}" <${process.env.SMTP_USER}>`,
            replyTo: counselorEmail || practiceProfile.email || undefined,
            to: sendTo,
            subject,
            html: testBanner + htmlContent,
          });

          // Update lastReminderAt to throttle future sends
          await tx
            .update(invoices)
            .set({ lastReminderAt: new Date() } as any)
            .where(eq(invoices.id, invoice.id));

          sent++;
        } catch (emailErr: any) {
          console.error(`Failed to send reminder for invoice ${invoice.invoiceNumber}:`, emailErr);
          skipped++;
        }
      }

      return NextResponse.json({
        success: true,
        sent,
        skipped,
        testMode: overrideOn,
        message: `${sent} reminder(s) sent, ${skipped} skipped.`,
      });
    } catch (error: any) {
      console.error("Reminder Error:", error);
      return new NextResponse(`Failed to send reminders: ${error.message}`, { status: 500 });
    }
  });
}
