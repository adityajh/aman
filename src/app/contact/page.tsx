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
          Support is by email only, at <a href="mailto:adityaj@adipa.com" className="text-teal-action underline underline-offset-4">adityaj@adipa.com</a>. There is no phone
          line and no WhatsApp.
        </p>
        <p>We reply within 48 hours on working days.</p>
      </section>

      <section>
        <H2>Registered address</H2>
        <p>
          Aditya Jhunjhunwala
          <br />
          301 Mitzen, near BT Kawade Road flyover, Pune 411001, India
        </p>
      </section>
    </LegalPage>
  );
}
