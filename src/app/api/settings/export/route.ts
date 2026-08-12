import { NextResponse } from "next/server";
import { getTenantContext, withTenantContext } from "@/lib/tenant";
import JSZip from "jszip";

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: any[][]): string {
  const headerLine = headers.map(escapeCSV).join(",");
  const dataLines = rows.map(row => row.map(escapeCSV).join(","));
  return [headerLine, ...dataLines].join("\n");
}

export async function GET() {
  const { tenantId } = await getTenantContext();
  return await withTenantContext(tenantId, async (tx) => {
    try {
      // Fetch all data
      const allClients = await tx.query.clients.findMany();
      const allSessions = await tx.query.sessions.findMany();
      const allSessionNotes = await tx.query.sessionNotes.findMany();
      const allInvoices = await tx.query.invoices.findMany();

      // Build a client name lookup for denormalization
      const clientMap = new Map(allClients.map(c => [c.id, c.name]));

      // Clients CSV
      const clientsCSV = toCSV(
        ["Name", "Email", "Phone", "Date of Birth", "Default Fee", "Fee Type", "Active", "Tags", "Intake Notes", "Terminated At", "Termination Reason", "Created At"],
        allClients.map(c => [
          c.name, c.email, c.phone, c.dateOfBirth, c.defaultFee, c.feeType,
          c.isActive ? "Yes" : "No", c.tags?.join("; "), c.intakeNotes,
          c.terminatedAt, c.terminationReason, c.createdAt
        ])
      );

      // Sessions CSV
      const sessionsCSV = toCSV(
        ["Client", "Scheduled At", "Duration (min)", "Type", "Modality", "Status", "Fee Charged", "Cancellation Reason", "Created At"],
        allSessions.map(s => [
          clientMap.get(s.clientId) || s.clientId,
          s.scheduledAt, s.durationMin, s.sessionType, s.modality, s.status,
          s.feeCharged, s.cancellationReason, s.createdAt
        ])
      );

      // Session Notes CSV
      const sessionNotesCSV = toCSV(
        ["Session ID", "Note Type", "Subjective", "Objective", "Assessment", "Plan", "Updates", "Client Actions", "My Actions", "Agenda", "Feedback", "ORS Total", "SRS Total", "Risk Flag", "Created At"],
        allSessionNotes.map(n => [
          n.sessionId, n.noteType, n.subjective, n.objective, n.assessment,
          n.plan, n.updates, n.clientActions, n.myActions, n.agenda, n.feedback,
          n.orsTotal, n.srsTotal, n.riskFlag, n.createdAt
        ])
      );

      // Invoices CSV
      const invoicesCSV = toCSV(
        ["Invoice Number", "Client", "Billing Month", "Issued Date", "Due Date", "Subtotal", "Discount", "Tax", "Total", "Amount Paid", "Status", "Created At"],
        allInvoices.map(i => [
          i.invoiceNumber, clientMap.get(i.clientId) || i.clientId,
          i.billingMonth, i.issuedDate, i.dueDate, i.subtotal, i.discount,
          i.taxAmount, i.total, i.amountPaid, i.status, i.createdAt
        ])
      );

      // Build ZIP
      const zip = new JSZip();
      zip.file("clients.csv", clientsCSV);
      zip.file("sessions.csv", sessionsCSV);
      zip.file("session_notes.csv", sessionNotesCSV);
      zip.file("invoices.csv", invoicesCSV);

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      return new NextResponse(zipBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": "attachment; filename=deepen-export.zip",
        },
      });

    } catch (error: any) {
      console.error("Export Error:", error);
      return NextResponse.json(
        { error: "Failed to export data" },
        { status: 500 }
      );
    }
  });
}
