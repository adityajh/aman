// Public page a client lands on after paying an invoice link.
// The counsellor's practice is the host here; Deepen is only a footer mark.

export default async function PaidPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { status } = await searchParams;
  const paid = status === "paid";

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-hairline rounded-xl p-8 text-center">
        <h1 className="font-serif text-3xl text-teal-ink mb-3">Thank you</h1>
        <p className="text-ink-2 leading-relaxed">
          {paid
            ? "Your payment has gone through. A receipt is on its way to your email."
            : "Your payment is being confirmed. Once it's through, a receipt will come to your email."}
        </p>
        <p className="text-ink-muted text-sm mt-6">You can close this page.</p>
      </div>
      <p className="fixed bottom-6 text-xs text-ink-muted">
        Payments by Razorpay · <span className="font-serif">deepen<span className="text-terracotta">.</span></span>
      </p>
    </main>
  );
}
