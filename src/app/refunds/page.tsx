import { ReactNode } from "react";
import { LegalPage } from "@/components/legal-page";

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif text-teal-ink text-xl font-semibold mb-3">
      {children}
    </h2>
  );
}

export default function RefundsPage() {
  return (
    <LegalPage title="Refunds and cancellation">
      <section>
        <H2>The trial</H2>
        <p>
          Your 7-day trial is free. We ask for a card at signup, but you are not charged
          until day 7. You can cancel any time before then and you will not be charged
          at all.
        </p>
      </section>

      <section>
        <H2>Cancelling</H2>
        <p>
          You can cancel from your settings at any time. Your access continues until the
          end of the month you have already paid for.
        </p>
      </section>

      <section>
        <H2>Refunds</H2>
        <p>We do not refund a month that has already been charged.</p>
      </section>

      <section>
        <H2>After you cancel</H2>
        <p>
          We keep your data for 30 days so you can export it. After that, we delete it
          and send you an email to confirm.
        </p>
      </section>
    </LegalPage>
  );
}
