import crypto from "crypto";
import { db } from "@/lib/db";
import { paymentConnections } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { decryptSecret, encryptSecret, safeEqual } from "@/lib/secret-box";

// Razorpay OAuth ("Connect Razorpay") for counsellors' own accounts.
// Docs: https://razorpay.com/docs/partners/platform/onboard-businesses/integrate-oauth/integration-steps
//
// Env:
//   RAZORPAY_OAUTH_CLIENT_ID / RAZORPAY_OAUTH_CLIENT_SECRET  from the Razorpay partner dashboard
//   RAZORPAY_OAUTH_MODE                                     "test" or "live" (default "test")
//   RAZORPAY_CONNECT_WEBHOOK_SECRET                         secret set on the partner app webhook
//   PAYMENT_TOKEN_ENCRYPTION_KEY                            see lib/secret-box.ts
//   APP_URL (falls back to NEXTAUTH_URL)                    public base URL, no trailing slash

const AUTH_BASE = "https://auth.razorpay.com";
const API_BASE = "https://api.razorpay.com/v1";
const REFRESH_WITHIN_MS = 7 * 24 * 60 * 60 * 1000; // refresh when < 7 days left
const STATE_MAX_AGE_MS = 15 * 60 * 1000;

export type PaymentConnection = typeof paymentConnections.$inferSelect;

export function appUrl(): string {
  return (process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
}

function oauthConfig() {
  const clientId = process.env.RAZORPAY_OAUTH_CLIENT_ID;
  const clientSecret = process.env.RAZORPAY_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Razorpay OAuth is not configured");
  const mode = (process.env.RAZORPAY_OAUTH_MODE === "live" ? "live" : "test") as "test" | "live";
  return { clientId, clientSecret, mode, redirectUri: `${appUrl()}/api/payments/connect/callback` };
}

export function isConnectConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_OAUTH_CLIENT_ID &&
      process.env.RAZORPAY_OAUTH_CLIENT_SECRET &&
      process.env.PAYMENT_TOKEN_ENCRYPTION_KEY,
  );
}

// ── OAuth state (CSRF protection), signed with NEXTAUTH_SECRET ──

function stateSig(body: string): string {
  return crypto.createHmac("sha256", process.env.NEXTAUTH_SECRET || "").update(body).digest("base64url");
}

export function signState(tenantId: string): string {
  const body = Buffer.from(
    JSON.stringify({ t: tenantId, n: crypto.randomBytes(8).toString("hex"), ts: Date.now() }),
  ).toString("base64url");
  return `${body}.${stateSig(body)}`;
}

export function verifyState(state: string | null, tenantId: string): boolean {
  if (!state) return false;
  const [body, sig] = state.split(".");
  if (!body || !sig || !safeEqual(sig, stateSig(body))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return parsed.t === tenantId && Date.now() - Number(parsed.ts) < STATE_MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function authorizeUrl(state: string): string {
  const { clientId, redirectUri } = oauthConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read_write",
    state,
  });
  return `${AUTH_BASE}/authorize?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  razorpay_account_id?: string;
  public_token?: string;
};

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`Razorpay token request failed (${res.status}): ${json.error_description || json.error || "unknown"}`);
  }
  return json as TokenResponse;
}

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri, mode } = oauthConfig();
  return tokenRequest({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
    mode,
  });
}

export async function revokeConnection(conn: PaymentConnection): Promise<void> {
  const { clientId, clientSecret } = oauthConfig();
  for (const [hint, enc] of [
    ["access_token", conn.accessTokenEnc],
    ["refresh_token", conn.refreshTokenEnc],
  ] as const) {
    try {
      await fetch(`${AUTH_BASE}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          token_type_hint: hint,
          token: decryptSecret(enc),
        }),
      });
    } catch (e) {
      // Best effort: the counsellor can also revoke from her Razorpay dashboard.
      console.error("[razorpay-connect] revoke failed", e);
    }
  }
}

// ── Stored connections ──
// Read with the HTTP driver and an explicit tenant filter, because webhooks and
// the daily check run without a logged-in session.

export async function saveConnection(tenantId: string, tokens: TokenResponse): Promise<void> {
  const { mode } = oauthConfig();
  if (!tokens.razorpay_account_id) throw new Error("Razorpay did not return an account id");
  const values = {
    tenantId,
    provider: "razorpay" as const,
    accountId: tokens.razorpay_account_id,
    mode,
    accessTokenEnc: encryptSecret(tokens.access_token),
    refreshTokenEnc: encryptSecret(tokens.refresh_token),
    tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    status: "active" as const,
    lastError: null,
    connectedAt: new Date(),
    updatedAt: new Date(),
  };
  await db
    .insert(paymentConnections)
    .values(values)
    .onConflictDoUpdate({
      target: [paymentConnections.tenantId, paymentConnections.provider],
      set: values,
    });
}

export async function getConnection(tenantId: string): Promise<PaymentConnection | null> {
  const conn = await db.query.paymentConnections.findFirst({
    where: and(eq(paymentConnections.tenantId, tenantId), eq(paymentConnections.provider, "razorpay")),
  });
  return conn ?? null;
}

export async function getActiveConnection(tenantId: string): Promise<PaymentConnection | null> {
  if (!isConnectConfigured()) return null;
  const conn = await getConnection(tenantId);
  return conn && conn.status === "active" ? conn : null;
}

export async function findConnectionByAccount(accountId: string): Promise<PaymentConnection | null> {
  const conn = await db.query.paymentConnections.findFirst({
    where: eq(paymentConnections.accountId, accountId),
  });
  return conn ?? null;
}

async function markError(conn: PaymentConnection, message: string) {
  await db
    .update(paymentConnections)
    .set({ status: "error", lastError: message.slice(0, 500), updatedAt: new Date() })
    .where(eq(paymentConnections.id, conn.id));
}

async function accessToken(conn: PaymentConnection): Promise<string> {
  if (conn.tokenExpiresAt.getTime() - Date.now() > REFRESH_WITHIN_MS) {
    return decryptSecret(conn.accessTokenEnc);
  }
  const { clientId, clientSecret } = oauthConfig();
  try {
    const tokens = await tokenRequest({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: decryptSecret(conn.refreshTokenEnc),
    });
    await db
      .update(paymentConnections)
      .set({
        accessTokenEnc: encryptSecret(tokens.access_token),
        refreshTokenEnc: encryptSecret(tokens.refresh_token),
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        updatedAt: new Date(),
      })
      .where(eq(paymentConnections.id, conn.id));
    return tokens.access_token;
  } catch (e: any) {
    // A parallel request may have refreshed first (the old refresh token dies
    // on use). Re-read once before giving up.
    const fresh = await db.query.paymentConnections.findFirst({ where: eq(paymentConnections.id, conn.id) });
    if (fresh && fresh.tokenExpiresAt.getTime() - Date.now() > REFRESH_WITHIN_MS) {
      return decryptSecret(fresh.accessTokenEnc);
    }
    await markError(conn, e?.message || "Token refresh failed");
    throw e;
  }
}

/** Refresh the token now if it is close to expiry. Used by the daily check. */
export async function keepConnectionFresh(conn: PaymentConnection): Promise<void> {
  await accessToken(conn);
}

async function rzp<T>(conn: PaymentConnection, method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const token = await accessToken(conn);
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) {
    await markError(conn, "Razorpay rejected Deepen's access. Reconnect in Settings.");
  }
  if (!res.ok) {
    throw new Error(`Razorpay ${method} ${path} failed (${res.status}): ${json?.error?.description || "unknown"}`);
  }
  return json as T;
}

// ── Payment links ──

export type RzpPaymentLink = {
  id: string;
  short_url: string;
  status: "created" | "partially_paid" | "paid" | "expired" | "cancelled";
  amount: number; // paise
  amount_paid: number;
  currency: string;
  reference_id?: string;
  notes?: Record<string, string>;
  payments?: { payment_id: string; amount: number; status: string; method?: string; created_at?: number }[] | null;
};

export function createPaymentLink(
  conn: PaymentConnection,
  body: {
    amount: number; // paise
    currency: string;
    description: string;
    reference_id: string;
    customer?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
    callback_url?: string;
  },
): Promise<RzpPaymentLink> {
  return rzp(conn, "POST", "/payment_links", {
    ...body,
    accept_partial: false,
    // Deepen sends its own invoice and receipt emails.
    notify: { sms: false, email: false },
    reminder_enable: false,
    ...(body.callback_url ? { callback_method: "get" } : {}),
  });
}

export function fetchPaymentLink(conn: PaymentConnection, linkId: string): Promise<RzpPaymentLink> {
  return rzp(conn, "GET", `/payment_links/${encodeURIComponent(linkId)}`);
}

export function cancelPaymentLink(conn: PaymentConnection, linkId: string): Promise<RzpPaymentLink> {
  return rzp(conn, "POST", `/payment_links/${encodeURIComponent(linkId)}/cancel`);
}

// ── Webhook signature ──

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_CONNECT_WEBHOOK_SECRET;
  if (!secret || !signature) return false; // never accept unsigned events
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
