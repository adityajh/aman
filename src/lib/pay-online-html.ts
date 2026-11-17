// "Pay online" button for invoice and reminder emails. Inline styles only
// (email clients ignore stylesheets).
export function payOnlineButtonHtml(url: string, currency: string, amount: number): string {
  const symbol = currency === "USD" ? "$" : "₹";
  const amt = amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `
    <div style="margin: 0 0 20px;">
      <a href="${url}" style="display: inline-block; background-color: #0F8A72; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 24px; border-radius: 8px;">Pay ${symbol}${amt} online</a>
      <p style="margin: 8px 0 0; font-size: 12px; color: #4a5568;">UPI, cards or netbanking. Secure payment by Razorpay. Or pay using the details below.</p>
    </div>`;
}
