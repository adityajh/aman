import { ReactNode } from "react";
import { LegalPage } from "@/components/legal-page";

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif text-teal-ink text-xl font-semibold mb-3">
      {children}
    </h2>
  );
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice">
      <section>
        <H2>What we collect</H2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your account details: your name, email, and practice name.</li>
          <li>The clinical records you enter: sessions, notes, and invoices.</li>
          <li>The check-in and check-out readings your clients give before and after a session.</li>
          <li>
            Payment tokens. These are held by Razorpay, our payment processor. We do not
            hold your card details.
          </li>
        </ul>
      </section>

      <section>
        <H2>Why we collect it</H2>
        <p>
          We collect this so Deepen can record and chart your sessions, notes, invoices,
          and client check-ins, and so we can bill you for your subscription.
        </p>
      </section>

      <section>
        <H2>Where it is hosted</H2>
        <p>Your data is hosted in India and encrypted at rest.</p>
      </section>

      <section>
        <H2>Who can see it</H2>
        <p>
          Nobody but you. Our own staff cannot open your clinical records. Any processing
          Deepen does on your data is automated; no person at Deepen, your employer, or
          any platform views it.
        </p>
      </section>

      <section>
        <H2>What we never do</H2>
        <ul className="list-disc pl-5 space-y-1">
          <li>We never sell or licence client-level data.</li>
          <li>We never take an insurer, an employer or a platform as a customer, and never pass data to one.</li>
          <li>We never build anything that lets an outside party look at a named counsellor.</li>
          <li>We never use your data to train any model.</li>
        </ul>
      </section>

      <section>
        <H2>What we do with de-identified data</H2>
        <p>
          Two things, and only these. First, when the comparison pool is live, we use
          de-identified readings from practices whose clients have agreed to build anonymous
          comparisons, and we show those comparisons to Deepen counsellors. Second, we may
          publish psychometric statistics about the measure itself, as aggregate figures that
          identify no client and no counsellor. Nothing here is sold or licensed to anyone.
        </p>
        <p>
          Your clients are asked at intake, in plain words, whether their anonymous scores may
          be used this way. Their answer is recorded. Saying no changes nothing about their care
          or your account.
        </p>
      </section>

      <section>
        <H2>Retention</H2>
        <p>
          We keep your data for as long as your account is live. If you cancel, we keep it
          for 30 days so you can export it, then we delete it and email you to confirm.
        </p>
      </section>

      <section>
        <H2>Your rights</H2>
        <p>
          You can export everything in one click, at any time, including after
          cancellation. You can also ask us to correct or delete your data.
        </p>
      </section>

      <section>
        <H2>Cookies</H2>
        <p>We use only the cookies that your login needs to work. Nothing else.</p>
      </section>

      <section>
        <H2>Breach notification</H2>
        <p>
          If we confirm a breach that affects your data, we will tell you within 72 hours
          of confirming it.
        </p>
      </section>

      <section>
        <H2>Contact</H2>
        <p>
          Aditya Jhunjhunwala
          <br />
          301 Mitzen, near BT Kawade Road flyover, Pune 411001, India
          <br />
          <a href="mailto:adityaj@adipa.com" className="text-teal-action underline underline-offset-4">adityaj@adipa.com</a>
        </p>
      </section>
    </LegalPage>
  );
}
