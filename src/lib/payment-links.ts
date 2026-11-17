import { db } from "@/lib/db";
import { invoices, receipts } from "@/lib/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { withTenantContext } from "@/lib/tenant";
import { formatIST } from "@/lib/tz";
import { recordPayment } from "@/lib/record-payment";
import { sendReceiptEmail } from "@/lib/receipt-email";
import {
  appUrl,
  cancelPaymentLink,
  createPaymentLink,
  fetchPaymentLink,
  getActiveConnection,
  type PaymentConnection,
  type RzpPaymentLink,
} from "@/lib/razorpay-connect";

// Payment links live on the counsellor's own Razorpay account. One open link
// per invoice, always for the amount still owed. A payment is only recorded
// after Deepen has fetched the link from Razorpay and seen it captured, never
// on the strength of a redirect or an unverified message.

const UNPAID = ["draft", "sent", "partial", "overdue"];

function owedOn(invoice: any): number {
  return Math.round((parseFloat(invoice.total) - parseFloat(invoice.amountPaid || "0")) * 100) / 100;
}

/**
 * Returns a pay-online URL for this invoice, creating or replacing the link if
 * needed. Returns null when online payment doesn't apply (not connected, not
 * INR, nothing owed) or Razorpay fails. Never throws: an invoice must still
 * send without a link.
 */
export async function ensurePaymentLink(
  tx: any,
  tenantId: string,
  invoice: any, // invoice row with `client`
  practiceName?: string,
): Promise<string | null> {
  try {
    const conn = await getActiveConnection(tenantId);
    if (!conn || invoice.currency !== "INR" || !UNPAID.includes(invoice.status)) return null;
    const owed = owedOn(invoice);
    if (owed <= 0) return null;

    if (invoice.paymentLinkId) {
      const existing = await fetchPaymentLink(conn, invoice.paymentLinkId);
      if (existing.status === "paid" || existing.status === "partially_paid") {
        // Paid but not yet recorded. Record it; the invoice amount has changed.
        await syncPaymentLink(tenantId, existing.id);
        return null;
      }
      if (existing.status === "created" && Math.round(owed * 100) === existing.amount) {
        return existing.short_url;
      }
      if (existing.status === "created") {
        await cancelPaymentLink(conn, existing.id).catch((e) =>
          console.error("[payment-links] cancel stale link failed", e),
        );
      }
    }

    const link = await createPaymentLink(conn, {
      amount: Math.round(owed * 100),
      currency: "INR",
      description: `Invoice ${invoice.invoiceNumber}${practiceName ? ` · ${practiceName}` : ""}`.slice(0, 2048),
      reference_id: `${invoice.invoiceNumber}-${Date.now().toString(36)}`.slice(0, 40),
      customer: {
        name: invoice.client?.name || undefined,
        email: invoice.client?.email || undefined,
        contact: invoice.client?.phone || undefined,
      },
      notes: { deepen_tenant_id: tenantId, deepen_invoice_id: invoice.id },
      callback_url: `${appUrl()}/api/public/razorpay/return`,
    });

    await tx
      .update(invoices)
      .set({
        paymentLink: link.short_url,
        paymentLinkId: link.id,
        paymentLinkAmount: owed.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoice.id));

    return link.short_url;
  } catch (e) {
    console.error("[payment-links] ensurePaymentLink failed", e);
    return null;
  }
}

/**
 * Before voiding an invoice: if its link was paid, record that and report it;
 * otherwise cancel the open link. Returns true if money came in online.
 */
export async function closePaymentLinkForVoid(tenantId: string, invoice: any): Promise<boolean> {
  if (!invoice.paymentLinkId) return false;
  const conn = await getActiveConnection(tenantId);
  if (!conn) return false;
  const link = await fetchPaymentLink(conn, invoice.paymentLinkId);
  if (link.status === "paid" || link.status === "partially_paid") {
    await syncPaymentLink(tenantId, link.id);
    return true;
  }
  if (link.status === "created") await cancelPaymentLink(conn, link.id);
  await markLinkClosed(tenantId, invoice.id, link.id);
  return false;
}

export type SyncResult = { recorded: number; invoiceId: string | null };

/**
 * Fetches the link from Razorpay and records any captured payment not yet in
 * the ledger. Safe to call any number of times, from any trigger: each
 * Razorpay payment id is recorded at most once (unique index on receipts).
 */
export async function syncPaymentLink(tenantId: string, linkId: string): Promise<SyncResult> {
  const conn = await getActiveConnection(tenantId);
  if (!conn) return { recorded: 0, invoiceId: null };

  const link = await fetchPaymentLink(conn, linkId);
  const invoiceId = link.notes?.deepen_invoice_id || null;
  if (!invoiceId || link.notes?.deepen_tenant_id !== tenantId) {
    console.warn(`[payment-links] link ${linkId} has no matching Deepen invoice for tenant ${tenantId}`);
    return { recorded: 0, invoiceId: null };
  }

  let recorded = 0;
  for (const p of link.payments || []) {
    if (p.status !== "captured") continue;
    const done = await recordOnlinePayment(conn, tenantId, invoiceId, link, p);
    if (done) recorded++;
  }
  if (link.status === "paid" || link.status === "cancelled" || link.status === "expired") {
    await markLinkClosed(tenantId, invoiceId, link.id);
  }
  return { recorded, invoiceId };
}

async function recordOnlinePayment(
  conn: PaymentConnection,
  tenantId: string,
  invoiceId: string,
  link: RzpPaymentLink,
  p: NonNullable<RzpPaymentLink["payments"]>[number],
): Promise<boolean> {
  let emailJob: Parameters<typeof sendReceiptEmail>[0] | null = null;
  let receiptId: string | null = null;

  try {
    await withTenantContext(tenantId, async (tx) => {
      const already = await tx.query.receipts.findFirst({
        where: eq(receipts.providerPaymentId, p.payment_id),
      });
      if (already) return;

      const invoice = await tx.query.invoices.findFirst({
        where: eq(invoices.id, invoiceId),
        with: { client: true },
      });
      if (!invoice) return;

      const amount = p.amount / 100;
      const paymentDate = formatIST(p.created_at ? new Date(p.created_at * 1000) : new Date(), "yyyy-MM-dd");
      const result = await recordPayment(tx, {
        tenantId,
        clientId: invoice.clientId,
        amount,
        currency: link.currency || "INR",
        paymentDate,
        method: "online",
        referenceId: p.payment_id,
        providerPaymentId: p.payment_id,
        preferInvoiceId: invoice.id,
        notes: `Paid online via Razorpay${p.method ? ` (${p.method})` : ""}`,
      });
      receiptId = result.receipt.id;

      if (conn.autoSendReceipts && invoice.client?.email) {
        const [after, settings] = await Promise.all([
          tx.query.invoices.findFirst({ where: eq(invoices.id, invoice.id) }),
          tx.query.practiceSettings.findFirst(),
        ]);
        emailJob = {
          settings,
          client: { name: invoice.client.name, email: invoice.client.email },
          invoiceNumber: invoice.invoiceNumber,
          currency: invoice.currency,
          receiptNumber: result.receiptNumber,
          amount,
          paymentDate,
          method: "online",
          referenceId: p.payment_id,
          invoiceTotal: parseFloat(invoice.total),
          paidSoFar: parseFloat(after?.amountPaid || "0"),
        };
      }
    });
  } catch (e: any) {
    // Two triggers raced and the other one recorded it first.
    if (e?.code === "23505" || e?.cause?.code === "23505") return false;
    throw e;
  }

  if (!receiptId) return false;

  if (emailJob) {
    try {
      await sendReceiptEmail(emailJob);
      await withTenantContext(tenantId, (tx) =>
        tx.update(receipts).set({ sentAt: new Date() }).where(eq(receipts.id, receiptId!)),
      );
    } catch (e) {
      // The payment is recorded; the counsellor can resend the receipt by hand.
      console.error("[payment-links] receipt email failed", e);
    }
  }
  return true;
}

/** Tenant that owns a link, looked up from our own records. */
export async function tenantForLink(linkId: string): Promise<string | null> {
  const row = await db
    .select({ tenantId: invoices.tenantId })
    .from(invoices)
    .where(eq(invoices.paymentLinkId, linkId))
    .limit(1);
  return row[0]?.tenantId ?? null;
}

/**
 * Daily check for one practice: records anything paid that a webhook missed,
 * and closes open links on invoices that were settled or voided another way
 * (so a client can't pay twice).
 */
export async function reconcileTenantLinks(tenantId: string): Promise<{ checked: number; recorded: number }> {
  const conn = await getActiveConnection(tenantId);
  if (!conn) return { checked: 0, recorded: 0 };

  const open = await db
    .select({ id: invoices.id, paymentLinkId: invoices.paymentLinkId })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), isNotNull(invoices.paymentLinkId), isNotNull(invoices.paymentLink)));

  let recorded = 0;
  for (const row of open) {
    try {
      const res = await syncPaymentLink(tenantId, row.paymentLinkId!);
      recorded += res.recorded;

      const [inv] = await db
        .select({ status: invoices.status })
        .from(invoices)
        .where(and(eq(invoices.tenantId, tenantId), eq(invoices.id, row.id)));
      if (inv && !UNPAID.includes(inv.status)) {
        const link = await fetchPaymentLink(conn, row.paymentLinkId!);
        if (link.status === "created") await cancelPaymentLink(conn, link.id);
        await markLinkClosed(tenantId, row.id, link.id);
      }
    } catch (e) {
      console.error(`[payment-links] reconcile failed for invoice ${row.id}`, e);
    }
  }
  return { checked: open.length, recorded };
}

/** Clears the pay URL once a link is finished; the link id stays for history. */
// Only touches the invoice if this is still its current link: paying an older,
// replaced link must not hide the open one (the daily check cancels that).
async function markLinkClosed(tenantId: string, invoiceId: string, linkId: string) {
  await db
    .update(invoices)
    .set({ paymentLink: null, updatedAt: new Date() })
    .where(and(eq(invoices.tenantId, tenantId), eq(invoices.id, invoiceId), eq(invoices.paymentLinkId, linkId)));
}

/**
 * Before disconnecting: record anything already paid, then cancel every open
 * link so no client pays a link Deepen can no longer see.
 */
export async function closeAllLinks(tenantId: string): Promise<void> {
  const conn = await getActiveConnection(tenantId);
  if (!conn) return;
  const open = await db
    .select({ id: invoices.id, paymentLinkId: invoices.paymentLinkId })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), isNotNull(invoices.paymentLinkId), isNotNull(invoices.paymentLink)));
  for (const row of open) {
    try {
      await syncPaymentLink(tenantId, row.paymentLinkId!);
      const link = await fetchPaymentLink(conn, row.paymentLinkId!);
      if (link.status === "created") await cancelPaymentLink(conn, link.id);
      await markLinkClosed(tenantId, row.id, link.id);
    } catch (e) {
      console.error(`[payment-links] closing link for invoice ${row.id} failed`, e);
    }
  }
}
