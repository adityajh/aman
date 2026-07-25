import nodemailer from 'nodemailer';
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { pdfBase64 } = await req.json();
    if (!pdfBase64) return new NextResponse("PDF content required", { status: 400 });

    const [client, settings] = await Promise.all([
      db.query.clients.findFirst({ where: eq(clients.id, id) }),
      db.query.practiceSettings.findFirst()
    ]);

    if (!client) return new NextResponse("Client not found", { status: 404 });
    if (!client.email) return new NextResponse("Client email is required", { status: 400 });

    const practiceProfile = settings || {
      practiceName: "Aman Practice Management",
      email: "counselor@aman.com"
    };

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: sans-serif; color: #1a202c; line-height: 1.6;">
        <p>Dear ${client.name},</p>
        <p>Please find attached your progress chart from our recent sessions.</p>
        <p>Best regards,<br>${practiceProfile.practiceName}</p>
      </div>
    `;

    const overrideOn = (settings as any)?.emailOverride === true;
    const counselorEmail = (settings as any)?.email;
    const sendTo = overrideOn && counselorEmail ? counselorEmail : client.email;
    const subject = overrideOn 
      ? `[TEST → ${client.email}] Your Clinical Progress Chart`
      : `Your Clinical Progress Chart`;

    const testBanner = overrideOn
      ? `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;color:#78350f;">
           <strong>TEST MODE</strong> — In live mode this email would have been sent to <strong>${client.email}</strong>. Email override is currently <strong>ON</strong> in Settings.
         </div>`
      : "";

    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    await transporter.sendMail({
      from: `"${practiceProfile.practiceName}" <${process.env.SMTP_USER}>`,
      to: sendTo,
      subject,
      html: testBanner + htmlContent,
      attachments: [
        {
          filename: `progress-chart-${client.name.replace(/\\s+/g, '-').toLowerCase()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return NextResponse.json({ success: true, testMode: overrideOn });
  } catch (error: any) {
    console.error("Mail Error:", error);
    return new NextResponse(\`Email delivery failed: \${error.message || 'Unknown error'}\`, { status: 500 });
  }
}
