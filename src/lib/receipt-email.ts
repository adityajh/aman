import nodemailer from "nodemailer";
import { formatIST } from "@/lib/tz";

export type ReceiptEmailInput = {
  settings: any; // practice_settings row (may be null)
  client: { name: string; email: string };
  invoiceNumber: string;
  currency: string;
  receiptNumber: string;
  amount: number;
  paymentDate?: string | Date | null;
  method: string;
  referenceId?: string | null;
  invoiceTotal: number;
  paidSoFar: number;
};

/**
 * Emails a payment receipt to the client. Honors the practice-wide Test Mode
 * (email_override): in test mode it goes to the counsellor instead.
 * Returns where it was sent.
 */
export async function sendReceiptEmail(input: ReceiptEmailInput): Promise<{ sentTo: string; testMode: boolean }> {
  const { settings, client, invoiceNumber, currency, receiptNumber, amount, method, referenceId, invoiceTotal, paidSoFar } = input;
  const practiceProfile = settings || {
    practiceName: "Deepen Counseling",
    counselorName: "",
    address: "",
    phone: "",
    email: "",
    upiId: "",
  };
  const overrideOn = settings?.emailOverride === true;
  const counselorEmail = settings?.email;
  const sendTo = overrideOn && counselorEmail ? counselorEmail : client.email;

  const currencySymbol = currency === "USD" ? "$" : "₹";
  const fmt = (v: any) =>
    parseFloat(v || "0").toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    });
  const balance = Math.max(0, invoiceTotal - paidSoFar);

  const testBanner = overrideOn
    ? `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;color:#78350f;">
         <strong>TEST MODE</strong> — In live mode this receipt would have been sent to <strong>${client.email}</strong>.
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
          <p style="font-size: 15px; color: #4a5568; margin-bottom: 24px;">Receipt <strong>${receiptNumber}</strong> · for invoice <strong>${invoiceNumber}</strong></p>
          <p style="font-size: 16px; margin-bottom: 24px;">Dear <strong>${client.name}</strong>,</p>
          <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin-bottom: 24px;">Thank you. We have received your payment. Details below for your records.</p>

          <div style="background-color: #f0fdf4; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid #d1fae5;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-size: 14px; color: #4a5568;">Amount Received</td><td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: 700;">${currencySymbol}${fmt(amount)}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 14px; color: #4a5568;">Payment Date</td><td style="padding: 8px 0; font-size: 14px; text-align: right;">${formatIST(input.paymentDate || new Date(), "d MMM yyyy")}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 14px; color: #4a5568;">Method</td><td style="padding: 8px 0; font-size: 14px; text-align: right; text-transform: capitalize;">${(method || "upi").replace("_", " ")}</td></tr>
              ${referenceId ? `<tr><td style="padding: 8px 0; font-size: 14px; color: #4a5568;">Reference</td><td style="padding: 8px 0; font-size: 14px; text-align: right; font-family: monospace;">${referenceId}</td></tr>` : ""}
              <tr style="border-top: 1px solid #d1fae5;"><td style="padding: 12px 0 4px; font-size: 14px; color: #4a5568;">Invoice Total</td><td style="padding: 12px 0 4px; font-size: 14px; text-align: right;">${currencySymbol}${fmt(invoiceTotal)}</td></tr>
              <tr><td style="padding: 4px 0; font-size: 14px; color: #4a5568;">Paid So Far</td><td style="padding: 4px 0; font-size: 14px; text-align: right;">${currencySymbol}${fmt(paidSoFar)}</td></tr>
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
    ? `[TEST → ${client.email}] Receipt for invoice ${invoiceNumber}`
    : `Receipt for invoice ${invoiceNumber}`;

  await transporter.sendMail({
    from: `"${practiceProfile.practiceName}" <${process.env.SMTP_USER}>`,
    replyTo: counselorEmail || practiceProfile.email || undefined,
    to: sendTo,
    subject,
    html,
  });

  return { sentTo: sendTo, testMode: overrideOn };
}
