import { ReactNode } from "react";
import { LegalPage } from "@/components/legal-page";

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif text-teal-ink text-xl font-semibold mb-3">
      {children}
    </h2>
  );
}

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <section>
        <H2>Email us</H2>
        <p>
          Support is by email only, at <mark>[SUPPORT EMAIL]</mark>. There is no phone
          line and no WhatsApp.
        </p>
        <p>We reply within 48 hours on working days.</p>
      </section>

      <section>
        <H2>Registered address</H2>
        <p>
          <mark>[LEGAL ENTITY NAME]</mark>
          <br />
          <mark>[REGISTERED ADDRESS]</mark>
        </p>
      </section>
    </LegalPage>
  );
}
