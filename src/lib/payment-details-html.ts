// Builds the "Payment Information" lines shown on invoice emails and the
// invoice preview, from the practice's own settings. Nothing here is
// hardcoded: a practice that has entered no bank details and no UPI ID gets
// an empty string, and the caller leaves the block out.

type PaymentProfile = {
  counselorName?: string | null;
  upiId?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

const clean = (value?: string | null) => (value ?? "").trim();

/** Bank details count as present once an account number is entered. */
export function hasBankDetails(profile: PaymentProfile): boolean {
  return clean(profile.bankAccountNumber) !== "";
}

/**
 * HTML lines (joined with <br>) for the payment block, or "" when the
 * practice has entered neither bank details nor a UPI ID.
 */
export function paymentDetailsLines(profile: PaymentProfile): string {
  const lines: string[] = [];
  const row = (label: string, value: string) =>
    lines.push(`<strong>${label}:</strong> ${escapeHtml(value)}`);

  const accountName = clean(profile.bankAccountName) || clean(profile.counselorName);
  const hasBank = hasBankDetails(profile);
  const upiId = clean(profile.upiId);

  if (!hasBank && !upiId) return "";

  // Same order the invoice email has always used: bank lines, then the
  // account name, then UPI.
  if (hasBank) {
    if (clean(profile.bankName)) row("Bank", clean(profile.bankName));
    if (clean(profile.bankBranch)) row("Branch", clean(profile.bankBranch));
    row("Account #", clean(profile.bankAccountNumber));
    if (clean(profile.bankIfsc)) row("IFSC", clean(profile.bankIfsc));
    if (accountName) row("Account Name", accountName);
    if (upiId) row("UPI ID", upiId);
  } else {
    row("UPI ID", upiId);
    if (accountName) row("Account Name", accountName);
  }

  return lines.join("<br>\n                ");
}
