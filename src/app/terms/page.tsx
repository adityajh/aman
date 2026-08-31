import { ReactNode } from "react";
import { LegalPage } from "@/components/legal-page";

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif text-teal-ink text-xl font-semibold mb-3">
      {children}
    </h2>
  );
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <section>
        <H2>Who Deepen is for</H2>
        <p>
          Deepen is built for one solo counsellor practising in India. It is not sold to
          clinics, hospitals, or any other organisation. If you work as part of a bigger
          practice, Deepen is not the right fit yet.
        </p>
        <p>You need to be 18 or older to open an account.</p>
      </section>

      <section>
        <H2>Your account</H2>
        <p>
          One account is for one counsellor. There is one login. Please do not share it,
          even with a colleague or an assistant.
        </p>
        <p>
          You can have up to 30 active clients at a time. A client is &ldquo;active&rdquo;
          from the point you add them until you mark them as terminated. Terminated
          clients keep their full record, and they stop counting towards your limit of 30.
          You can reactivate a terminated client later if you take them back on.
        </p>
        <p>
          If we think an account is being shared between more than one counsellor, we
          will write to you first and ask about it before doing anything else.
        </p>
      </section>

      <section>
        <H2>Your data is yours</H2>
        <p>
          Everything you put into Deepen, your sessions, notes, invoices, and client
          check-ins, belongs to you. You can export all of it in one click, at any time,
          including after you cancel. We never sell or licence client-level data. We never take an insurer, an employer
          or a platform as a customer. We never build anything that lets an outside party look at
          a named counsellor. And we never use your data to train any model.
        </p>
      </section>

      <section>
        <H2>Clinical responsibility</H2>
        <p>
          Deepen records and charts what you and your client enter. It does not diagnose
          anyone, and it does not replace your clinical judgement. It is not built for
          emergencies.
        </p>
        <p>
          A flag on a client&rsquo;s chart describes that client&rsquo;s readings. It says
          nothing about you as a counsellor.
        </p>
        <p>
          You choose the thresholds and the measures you use in check-ins. You are
          responsible for using measures you are licensed to use, and for interpreting
          what they show.
        </p>
      </section>

      <section>
        <H2>Your clients&rsquo; data</H2>
        <p>
          Under India&rsquo;s DPDP Act, you are the data fiduciary for your clients&rsquo;
          data. Deepen is the processor: we handle that data on your instructions, and we
          do not decide what happens to it beyond what you ask us to do.
        </p>
        <p>
          It is your job to tell your clients that their check-ins are recorded, and to
          get any consent your practice requires before you start.
        </p>
      </section>

      <section>
        <H2>The comparison pool</H2>
        <p>
          The comparison pool is not live yet. When it is, this is how it will work, and this
          wording is the one we are bound by.
        </p>
        <p>
          We use de-identified data from your practice to build anonymous comparisons, and we
          make those comparisons available to you and to other Deepen counsellors. That is the
          only thing we use it for.
        </p>
        <p>
          We do not sell it, licence it, or pass it to anyone outside Deepen. We will never give
          any organisation information that identifies you, and we will never build anything that
          sets your results beside a named colleague&rsquo;s. Nothing about your use of Deepen
          depends on your clients agreeing to any of this.
        </p>
        <p>
          Your clients decide for themselves. At intake, each client is asked, in plain words,
          whether their anonymous scores may be used this way, and can say no or change their
          mind at any time. Saying no changes nothing about their care, and nothing about your
          account.
        </p>
      </section>

      <section>
        <H2>Billing and the trial</H2>
        <p>
          Deepen costs ₹999 a month, billed monthly. There is no yearly plan.
        </p>
        <p>
          Your trial runs for 7 days. We ask for a card at signup, but you are not
          charged until day 7. You can cancel any time before then and you will not be
          charged at all.
        </p>
      </section>

      <section>
        <H2>Cancelling and what happens after</H2>
        <p>
          You can cancel from your settings at any time. Your access continues until the
          end of the month you have already paid for. We do not refund a month that has
          already been charged.
        </p>
        <p>
          After you cancel, we keep your data for 30 days so you can export it. After
          those 30 days, we delete it, and we send you an email confirming the deletion.
        </p>
      </section>

      <section>
        <H2>The first fifty</H2>
        <p>
          If you are one of the first fifty paying accounts, you pay ₹699 a month instead
          of ₹999, for at least three years from your first payment. This is a founding
          rate. It is stated here and in your welcome email, and nowhere else.
        </p>
      </section>

      <section>
        <H2>Changes to these terms</H2>
        <p>
          If we change our price, we will give you 30 days&rsquo; notice. The founding
          rate above does not change during its locked period, even if we change the
          price for everyone else.
        </p>
        <p>We may update the rest of these terms from time to time. We will let you know.</p>
      </section>

      <section>
        <H2>Support</H2>
        <p>
          Support is by email only. There is no phone line and no WhatsApp. We reply
          within 48 hours on working days.
        </p>
      </section>

      <section>
        <H2>Security and breaches</H2>
        <p>
          Your data is hosted in India and encrypted at rest. Nobody at Deepen, your
          employer, or any platform can see your clinical records.
        </p>
        <p>
          If we confirm a breach that affects your data, we will tell you within 72
          hours of confirming it. We follow a documented process for this.
        </p>
      </section>

      <section>
        <H2>Governing law</H2>
        <p>These terms are governed by the laws of India.</p>
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
