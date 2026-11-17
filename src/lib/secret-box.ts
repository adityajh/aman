import crypto from "crypto";

// AES-256-GCM encryption for secrets we must store (payment gateway tokens).
// Key: PAYMENT_TOKEN_ENCRYPTION_KEY, 32 random bytes encoded as base64.
// Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
// Output format: v1.<iv>.<tag>.<ciphertext>, each part base64url.

function getKey(): Buffer {
  const raw = process.env.PAYMENT_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("PAYMENT_TOKEN_ENCRYPTION_KEY is not set");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("PAYMENT_TOKEN_ENCRYPTION_KEY must be 32 bytes, base64-encoded");
  }
  return key;
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv, tag, enc].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
}

export function decryptSecret(payload: string): string {
  const [version, iv, tag, enc] = payload.split(".");
  if (version !== "v1" || !iv || !tag || !enc) throw new Error("Unrecognised secret format");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(enc, "base64url")), decipher.final()]).toString("utf8");
}

// Constant-time comparison for signatures.
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}
