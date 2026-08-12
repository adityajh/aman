# Homepage FAQ, corrections

*12 August 2026. Reviewed from the localhost build. Two claims must not ship as written.*

---

## 1. SERIOUS. The recovery band answer describes a product we do not have.

**Currently reads:**
> We use a proprietary algorithm trained on a large dataset of anonymized clinical trajectories, adjusting for initial severity.

**Three problems.** There is no large dataset. There is one practice on the system. The benchmark pool has not been built. The band today is drawn from clients inside the counsellor's own account and needs at least five similar starters and three scored sessions before it draws anything at all.

"Proprietary algorithm" also breaks two standing copy rules: never claim novelty, because trajectory feedback has thirty years of published research behind it, and never sound like a black box to clinicians.

This is the single most dangerous sentence on the page. A sophisticated counsellor will ask what the dataset is. There is no good answer.

**Replace with:**
> We take the clients who started at a similar score to this one and plot their average path as a band. Your client's line is drawn over it.
>
> It needs at least five similar clients and three scored sessions before it will show you anything. Below that it tells you there is not enough history yet, rather than guessing.

That is true, it is more specific, and per the homepage spec the refusal to guess is one of the strongest converting lines available.

**Optional, if the section has room:**
> This is not a new idea. Trajectory-based feedback has decades of research behind it and one serious tool built around it, priced for institutions. We brought the same mechanism into the system where you already log sessions and send invoices.

---

## 2. SERIOUS. The DPDP answer claims a compliance status we have not established.

**Currently reads:**
> Yes. All data is stored in AWS AP-South-1 (Mumbai), fully compliant with the DPDP Act. We never share or sell your data.

**Two problems.** "Fully compliant with the DPDP Act" is a legal claim, and no review has been done. Saying it in a public FAQ is the kind of statement that is quoted back at you.

And the infrastructure line needs checking. The stack is Neon and Vercel, not raw AWS. Neon does run on AWS and does offer a Mumbai region, but somebody has to confirm the actual project region before this sentence is true.

The brand guide is explicit here: competitors publish four named certifications, so do not pick that fight. Understate.

**Replace with:**
> Your records are isolated at the database level, enforced by the database itself rather than by application code. Data is hosted in India. We never use it to train anything, and we never sell or share it.
>
> You can export everything, clients, sessions, notes, invoices and receipts, in one click at any time, including after you cancel.

If DPDP must be named:
> We are building to the DPDP Act. We are not claiming a certification we do not hold.

---

## 3. Minor. Vocabulary and spelling.

- "clinicians choose to share their screen" becomes **counsellors**. The lexicon uses counsellor throughout.
- Footer reads "Deepen Counseling Software". The rest of the copy uses British spelling, counsellor and counselling. Pick one and make the legal entity match. Confirm the entity is actually registered before the © line asserts it.

---

## 4. The footer mark is not the agreed one.

The mark currently in the footer is a set of stacked horizontal bars. That is close to option B from `logo-options.html`, which was rejected: it collapses into a hamburger icon in one colour and reads as a bar chart in teal, which is the "your analytics" territory the whole positioning attacks.

The agreed mark is the circle with a waterline. Assets are in `business/marketing/logo/`:

- `lockup.svg` for the footer and header
- `mark-teal.svg`, `mark-ink.svg`, `mark-reversed.svg`
- `favicon-16.svg` with the stroke thickened for small sizes

---

## What is right, and should not be touched

The calendar answer is close to perfect. It concedes a gap, names the competitor category as already good, and states the focus in one line. That is the house voice working. Keep it.

Deep teal header, dark footer, serif headings: all on system.
