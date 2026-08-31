# Measures Licence Agreement, Performance Metrics PLLC

> **Start with `2026-08-31-measures-position.md`.** That is the canonical statement and the
> change list. This document is the working detail and evidence behind it.

**Date:** 31 August 2026
**Status:** active. Decision pending.
**Source:** draft received from Scott D. Miller, PhD. "Performance Metrics Boilerplate
Licensing Agreement.docx". Effective date on the face of the draft is 10 January 2026.

Not legal advice. This is a commercial read of the document. Anything we sign needs an
Indian tech and IP lawyer to look at the arbitration seat, enforceability and the data
clauses first.

---

## 1. What the document is

A blank-form, non-exclusive licence from Performance Metrics, PLLC (Florida, Scott Miller
managing member) to administer his measures digitally. Exhibit A lists ORS, SRS, CORS,
CSRS, YCORS and GSRS, plus "predictive algorithms, statistical indices and formulas,
scoring templates and methods, regression equations, performance metrics, feedback
messages, cutoff, target, and benchmarking scores."

This is the vendor licence. It is the instrument that would make what Deepen already does
legal, because the free individual licence covers paper and pencil only and explicitly
excludes digital use.

**It is a template, not an offer.** Every commercial term is blank:

| Blank | Section |
|---|---|
| Licensee name and address | preamble |
| Upfront payment, and whether recoupable | 6.a |
| Usage fee or royalty, and the period it covers | 6.a |
| Reporting frequency and due date | 7.b |
| Initial term and renewal period | 14.a |

Nothing about price has been proposed. The negotiation has not started.

## 2. What it grants

Non-exclusive right to use, copy, distribute and transmit the measures, with associated
copyrights, trademarks and goodwill, by electronic means, through our own website and
wholly owned app only, for our customers, in healthcare evaluation, and no other purpose.

Test and demo environments are free of usage fees (6.b). The child and group versions come
bundled. That part is generous.

## 3. The clauses that matter, worst first

### 3.1 Section 3.d kills the benchmark pool. Permanently.

> "Neither Licensee nor any third party shall, for the duration of this contract or
> following its termination, create, publish, or circulate norms, cutoffs, predictive
> algorithms, or statistical indices based on the use of Licensed Rights or any data or
> experience gathered."

Two problems.

**Forward.** Build order item 5, the benchmark pool, is described in the strategy set as
the only compounding moat. As drafted this clause forbids it for anything ORS or SRS
derived, and the ban survives termination. Signing as written forfeits the moat forever in
exchange for a licence we can lose on thirty days notice.

**Backward.** We already ship one. `src/app/api/clients/[id]/predicted-progress/route.ts`
builds cohort-matched expected trajectory bands from ORS totals, banding clients whose
initial ORS is within plus or minus five and requiring a minimum cohort of five. That is a
predictive algorithm and a statistical index based on the Licensed Rights. It is also the
Pro feature.

Note also that Exhibit A claims cutoffs and benchmarking scores as his IP. The values sat
in `schema.ts` as defaults, `orsCutoff` 25, `srsCutoff` 36, `orsRciThreshold` 5, are his
numbers, not neutral constants.

**Ask:** carve out everything derived from our own tenants' data for their own use, and
narrow the ban to publishing competing norms or cutoffs for the measures themselves.

### 3.2 Section 5, invention assignment

On written request we assign him everything conceived "relating to Measures". The carve-out
returns to us only "the design components and related product/code interface developed to
fully implement the measures IP."

That carve-out protects the UI. It does not clearly protect the flag engine, the trajectory
model, the Outcome Report or the reporting layer, which is where the entire value of Deepen
sits.

**Ask:** widen to all software, analytics, models, reports and derived data, excepting only
the measures themselves and direct modifications to them.

### 3.3 Section 3.a, no integration

> "nor in any way modify, combine or integrate the Licensed Rights with any other program
> or product."

Read literally this forbids the licensed use. It is boilerplate carried over from a
different kind of licence.

**Ask:** express statement that integration into the Deepen platform is the licensed use.

### 3.4 Section 2.b, marketing pre-approval

Every marketing or promotional material related to the measures needs his written approval
before use. Against a 10 to 12 founder-hour month and a self-serve, no-demos operating
model, an approval loop across timezones is a standing tax on every page change.

**Ask:** approval deemed given if not refused in ten business days, and a pre-approved
boilerplate description we can reuse without re-asking.

### 3.5 Section 9.c, he can eject our customers

He can require us to terminate any end user's access within 48 hours of written request, on
his own reasonable judgment. A third party with a kill switch over paying counsellors sits
badly against the privacy promise the whole product rests on.

**Ask:** limited to users in demonstrable breach, with notice to us and a cure period.

### 3.6 Section 7.c, audit right over "books and records"

Right to visit, audit and make extracts from records relating to the transactions. As
drafted it is not clearly limited to financial records.

**Ask:** expressly limited to financial books of account. No access to client-level or
clinical data, in any form, ever. Under the DPDP Act giving a US licensor extract rights
over records containing personal data is not something we can agree to casually.

### 3.7 Sections 11 and 12, the risk allocation is entirely one-way

The measures come "AS IS" with no warranty of any kind, including non-infringement. He
disclaims all consequential damages. We indemnify him broadly, including for "any breach of
any term" and for third-party IP claims arising from our use of the measures.

So: he does not warrant that he owns what he is licensing, and we carry the cost if someone
says he does not.

**Ask, minimum:** a warranty of ownership and authority to licence, and an IP infringement
indemnity from him for the measures themselves.

Drafting bug worth flagging back: 12 says Licensor will not settle without Licensee's
consent, which is the wrong way round for an indemnity given by Licensee.

### 3.8 Section 13, insurance

"Licensee has established, and undertakes to maintain" general and professional liability
insurance covering both parties. Present tense. We have not established it. Signing as
written is a false statement of fact on day one, and the cover itself is a real recurring
cost for a pre-revenue company.

**Ask:** change to an undertaking to obtain cover at a stated modest limit within a stated
period, or delete for a licensee of our size.

### 3.9 Section 15, arbitration in Manatee County, Florida

Single arbitrator, AAA Commercial Rules, Florida. For an Indian company that is a
practical bar on defending anything. Filing fees plus US counsel plus travel means any
dispute is won by whoever can afford to arbitrate. 15.c also lets IP matters be pulled into
a Florida court, and 16 gives him injunctive relief on a **threatened** breach of the IP
clauses, which with 3.d as drafted means building the benchmark pool is itself a trigger.

**Ask:** neutral seat with remote, documents-only procedure. Singapore or SIAC is the usual
compromise. Failing that, at minimum remote hearings and each side bearing its own costs.

### 3.10 The missing sections

14.c, 16 and 17 all refer to "non-solicitation and non-competition provisions." **There are
no such provisions in the document.** Either a section was dropped when the boilerplate was
prepared, or it is coming in the next draft.

This is the single most important thing to ask about. A non-compete in a licence from the
owner of the leading feedback-informed-treatment measures could, depending on drafting, bar
us from competing with him or his authorised vendors. That is the business.

**Ask:** send the missing sections, or confirm they are deliberately omitted and delete the
cross-references.

### 3.11 Section 18.b, no assignment

No assignment without his prior written consent, in his sole discretion. He can veto an
acquisition of Deepen.

**Ask:** consent not to be unreasonably withheld, and free assignment on a merger or sale
of substantially all assets.

## 4. The past-use question

The product is in daily use by one practice. It stores ORS and SRS sub-scale scores
digitally and runs flags off his cutoffs. The free individual licence does not cover
electronic use. There is existing exposure, small in scale but real.

Handle it plainly. Whatever route we take, ask for a written acknowledgement that use to
date was one clinician in one practice, non-commercial, zero revenue, and that it is
released on execution or on our written confirmation that the measures have been removed.
Do not volunteer more than is asked. Note that section 8 makes the negotiation itself
confidential once we engage.

## 5. Options

### A. Negotiate and sign

Only worth it if 3.d is carved back, 5 is widened, 2.b is time-boxed, the audit is limited
to financial records, the seat moves, and the money is a small flat annual figure rather
than a per-user royalty with quarterly reporting.

**For.** ORS and SRS are what Vijay actually uses. Four items, thirty seconds, sessional,
and the SRS gives us the alliance half of the product. Being a named authorised vendor is
itself a distribution asset, and Miller's network is global.

**Against.** A US licensor holding copy approval, an audit right, a customer kill switch and
a perpetual ban on the moat, over a pre-revenue Indian company. Sales and support load we
cannot afford, and a term clock starting before the product can even deliver a measure
automatically.

### B. Do not sign. Ship PHQ-9 and GAD-7 as the defaults

This is already the recommendation in `strategy/02-market-analysis.md` section 6. PHQ-9,
GAD-7 and PCL-5 carry no digital-use restriction. The licensing problem and the automated
delivery problem resolve in the same piece of work.

**Cost.** Strip the measures from the product. Roughly 105 references across the app, plus
schema columns, the flag engine and predicted-progress. And Vijay changes how he practises,
which is the real cost and a co-founder conversation, not a code one.

**Open question to verify, not assert.** PHQ-9 and GAD-7 are symptom measures. Neither is an
alliance measure, and the SRS is what powers the relationship half of the product. Check
whether a freely usable alliance measure with a credible evidence base exists, the WAI-SR
is the obvious candidate, before assuming this route is a clean swap.

### C. Narrow licence, owned analytics. The middle path

Licence only digital administration and scoring of his measures, paper parity, nothing
more. Keep every compounding thing, trajectory bands, benchmark pool, Outcome Report, built
on the unrestricted instruments.

Two engines. His measures as an optional plug-in for counsellors who already use them. Our
analytics layer runs on PHQ-9 and GAD-7. This is the pluggable-instrument architecture that
03 and 07 already call for, and it makes 3.d survivable, because nothing that compounds is
built on his data.

Trade-off: honest, and it means telling counsellors that the deepest reporting works on the
open measures. That is a defensible line, and it is also true.

### D. Defer

Reply asking for the blanks, the missing sections, and what 3.d is actually meant to
prevent. Sign nothing yet. The IP review, the rename and the trademark search all block
launch anyway, and automated delivery does not exist, so there is nothing this licence
unlocks this quarter. Deferring costs nothing and keeps the relationship warm.

## 6. Recommendation

**D now, C as the target.** Do not sign as drafted.

1. Reply this week. Ask for the blanks, the missing non-compete and non-solicit sections,
   and an explanation of the intent behind 3.d. Say we are working through it seriously.
2. Do the PHQ-9 and GAD-7 default work, which is on the roadmap either way and is the
   highest-value unbuilt thing regardless of how this lands.
3. Get an Indian tech and IP lawyer to read any revised draft before signature.
4. Decide between A and C once we see the money and the missing sections.

Keeping both routes alive costs one email. Signing this draft costs the moat.

## 7. Verified facts used

- Individual licence is free, paper and pencil only. "NO ELECTRONIC OR DIGITAL USE OF THE
  SCALES IS PERMITTED." Group licences run $0 for one provider up to $2,000 for 250, with
  custom quotes above that. Source: scottdmiller.com/downloadmeasures.html, retrieved
  31 August 2026.
- Digital administration is routed through authorised vendors. MyOutcomes, FIT-Outcomes,
  Better Outcomes Now and Greenspace all operate under that model.
- Confirms the position already recorded in `strategy/02-market-analysis.md` section 5.

---

# Addendum, 31 August 2026. Exact scope of the licence

Added after a line-by-line comparison of Exhibit A against the published forms and against
our own code.

## A. The six tools

| Code | Full name | Who for | Items |
|---|---|---|---|
| ORS | Outcome Rating Scale | age 13+ | 4 |
| SRS | Session Rating Scale | age 13+ | 4 |
| CORS | Child Outcome Rating Scale | ages 6 to 12 | 4 |
| CSRS | Child Session Rating Scale | ages 6 to 12 | 4 |
| YCORS | Young Child Outcome Rating Scale | under 6 | pictorial |
| GSRS | Group Session Rating Scale | group work | 4 |

We use two of the six. The other four come bundled.

## B. The exact words

Each form is four 10cm visual analogue lines, measured to the millimetre, giving 0 to 10.0
per item and 0 to 40 total. The copyrightable material is the item wording.

**ORS, verbatim on the published form:**

- "Individually (Personal well-being)"
- "Interpersonally (Family, close relationships)"
- "Socially (Work, school, friendships)"
- "Overall (General sense of well-being)"

Plus the instruction line: "Looking back over the last week, including today, help us
understand how you have been feeling by rating how well you have been doing in the
following areas of your life, where marks to the left represent low levels and marks to the
right indicate high levels."

**Our code, `clinical-note-editor.tsx` lines 433 to 436, reproduces all four labels
character for character.**

**SRS, verbatim on the published form:** "Relationship" (anchored "I felt heard,
understood, and respected"), "Goals and Topics", "Approach or Method", "Overall" (anchored
"Overall, today's session was right for me").

Our lines 460 to 463 carry two of those anchors verbatim and two paraphrased.

Our `ScoreSelector` is a 0 to 10 slider to one decimal place, which is a faithful digital
reproduction of the 10cm line. Faithful is the point. It is still a format-shift of a
copyrighted form, and format-shifting is the thing the individual licence forbids.

## C. The numbers

Exhibit A also claims "cutoff, target, and benchmarking scores" and "regression equations".

Our `schema.ts` defaults are his published values:

| Ours | Value | Published |
|---|---|---|
| `orsCutoff` | 25 | adult clinical cutoff 25, adolescent 28 |
| `srsCutoff` | 36 | SRS cutoff 36 |
| `orsRciThreshold` | 5 | reliable change 5 points |

## D. What is NOT his, whatever Exhibit A says

Copyright protects expression, not method. These sit outside it:

- **Reliable Change Index.** Jacobson and Truax, 1991. Standard statistics.
- **Clinically significant change.** Same source.
- **Expected treatment response and dose-response curves.** Howard et al. 1986, and
  Lambert's programme. Published science.
- **Visual analogue scales, and summing four subscales to 40.** Neither is ownable.
- **Routine outcome monitoring as a practice.** Nobody owns it.

**This is the structural point.** Copyright reaches the item wording and the forms.
Trademark reaches the names. Everything else in Exhibit A, the algorithms, the indices,
the cutoffs, is claimed **by contract**, not because IP law reaches it. Section 3.d is not
restating the law. It is a private restriction that goes well beyond it, and it never
expires. That is why it is the clause to fight.

## E. The trademark grant is broken as drafted

Section 2 licenses "the name 'Measures'". "Measures" is the defined term for the list in
Exhibit A. Read literally he is licensing us a generic English word.

What we would actually need named is "Outcome Rating Scale", "Session Rating Scale", ORS
and SRS. His filed marks appear to be **FEEDBACK INFORMED TREATMENT** and **FIT**, serials
87955593 and 87955596, not the scale names themselves. Separately, PCOMS is Barry Duncan's
brand, not his.

Worth noting we do not currently want the trademark licence at all. The brand guide bars
naming any instrument in public copy. Meanwhile section 10 **requires** us to display his
rights notice on the interface. So the grant we do not want is optional and the obligation
we did not ask for is mandatory.

## F. Chain of title. The serious problem

The published copyright lines name more than one person:

- **ORS: "Scott D. Miller and Barry L. Duncan © 2000"**
- **SRS: "© 2002, Scott D. Miller, Barry L. Duncan, & Lynn Johnson"**

Barry Duncan separately licenses **the same six measures** through Better Outcomes Now,
under "Dr. Barry L. Duncan, P.A., a licensed entity of PCOMS International, Inc." His
licence page covers "the ORS, SRS, CORS, CSRS, YCORS/SRS, and GSRS/CGSRS", which is
Exhibit A, and states that converting the measures to electronic format is "strictly
prohibited and a violation of copyright and intellectual property laws", with digital use
negotiated separately.

So two parties independently license the identical set, and each treats digital use as
theirs to sell.

Against that, our draft says:

- Recital: "Licensor is the Owner and Licensor of the Measures."
- Section 11: no warranty of any kind, **including non-infringement**.
- Section 12.b: **we** indemnify **him** for third-party IP claims arising from our use.

Read together: he asserts sole ownership, warrants nothing, and if the other co-owner ever
comes after us, we pay and hold him harmless.

US law does let a joint owner grant a non-exclusive licence alone, so the licence is
probably effective. That is not the issue. The issue is that we would be paying one
co-owner for rights a second co-owner disputes, while carrying 100% of that risk.

**Non-negotiable ask.** A warranty that he owns or controls all rights necessary to grant
this licence, including any co-owners' rights, and an IP indemnity from him. If he will not
give it, that is itself the answer.

## G. Revised bottom line

The licence is over four sentences of item wording per form, six forms, the names, and a
set of published numbers claimed by contract. That is a thin body of protectable
expression, wrapped in very broad contractual restrictions, offered by one of at least
three named copyright holders, with no warranty of title.

It does not change the recommendation. It sharpens it. Ask for the ownership warranty
first, before the money. The answer to that one question tells us most of what we need.

---

# Addendum 2, 31 August 2026. The no-signature pathway

Question asked: can we use ORS and SRS without signing, without infringing trademark or
copyright? Answer below. Still not legal advice. Steps 1 to 4 need an Indian IP lawyer to
sign off before they ship.

## A. Trademark and copyright are not the same problem

We have been treating these as one risk. They are not, and they point in opposite
directions.

**Trademark is territorial.** Rights are national. A US registration gives its owner
nothing in India. We are an Indian company selling to Indian counsellors. His filed US
marks appear to be **FEEDBACK INFORMED TREATMENT** and **FIT**, serials 87955593 and
87955596. Not "Outcome Rating Scale", not "Session Rating Scale". Those two are
descriptive names for the thing they describe, which is the hardest kind of mark to
register.

**Copyright is international.** India and the US are both Berne signatories, so his
copyright in the ORS and SRS forms is enforceable here. Copyright covers the item wording
and the layout of the forms.

So the trademark question, which is what we were worried about, is close to a non-issue.
The copyright question, which we were not asking, is the whole problem.

## B. Naming the instrument is lawful. Nominative fair use

Even where a registered mark exists, referring to a product by its name is permitted.
India: Section 30(2) of the Trade Marks Act 1999. The three-part test from *Consim Info
Pvt Ltd v Google India* (Madras HC):

1. The product is not readily identifiable without using the mark.
2. Only so much of the mark as is reasonably necessary is used.
3. Nothing suggests sponsorship or endorsement by the owner.

*Hawkins Cookers v Murugan Enterprises* adds: reasonably necessary, good faith, no
deception as to trade origin. *Prius Auto v Toyota* adds the practical rules: different
font, no imitation of styling, your own name displayed alongside.

**Allowed.** "Deepen records scores from the Outcome Rating Scale (ORS) and Session Rating
Scale (SRS)." Plain text, our own typeface, our name on the page, plus a line reading
"ORS and SRS are the copyright of their respective authors. Deepen is not affiliated with
or endorsed by them."

**Not allowed.** His logo or styling. Anything implying endorsement, partnership or
certification. Using "Feedback Informed Treatment" or "FIT" as a name for our product or a
feature, because those are his actual filed marks.

## C. The real line: naming versus reproducing

Nominative fair use is a trademark doctrine. It does nothing for copyright.

- **Naming** the instrument is fine.
- **Reproducing** its item wording is infringement, licence or no licence, in India too.

Right now `clinical-note-editor.tsx` reproduces all four ORS labels character for
character. That is the exposure. It is also fixable in an afternoon.

## D. The pathway. Be a system of record, not an administration platform

The distinction that makes this work:

**His licence governs administering the scales. It does not govern us storing a number a
clinician produced under their own licence.**

Every counsellor can hold a free individual licence for paper and pencil use. Lifetime, no
charge, legitimate. They administer on paper in the room, exactly as Vijay does today. We
hold the resulting numbers. Numbers are facts, and facts are not copyrightable. India
settled the standard in *Eastern Book Company v D.B. Modak* (2008): copyright needs a
modicum of creativity, not effort.

So Deepen supports the measure without ever reproducing the measure.

### What has to change

1. **Strip the verbatim wording.** `clinical-note-editor.tsx` lines 433 to 436 and 460 to
   463. Replace with our own plain-language domain labels, or generic ones. His four
   constructs are ideas. His four sentences are expression. Use the ideas, not the
   sentences.
2. **Keep internal identifiers.** `orsTotal`, `srsCutoff` and the rest stay. Code is not
   publication. `pricing-and-build-plan-2026-08.md` already says this.
3. **Stop shipping his numbers as our defaults.** `orsCutoff` 25, `srsCutoff` 36,
   `orsRciThreshold` 5 currently ship preset in `schema.ts`. Published values are facts,
   but supplying them as product defaults looks like distributing his benchmarking scores,
   which is exactly what Exhibit A claims. Make them counsellor-entered, no preset, labelled
   "enter the cutoff your instrument specifies." Cheapest large risk reduction available.
4. **Never build automated delivery on ORS or SRS.** The moment we render his items to a
   client, that is digital administration and reproduction, and it is squarely infringing.
   **This is the bright line.** Build order item 3 runs on PHQ-9 and GAD-7 only.

This costs us nothing we were not already doing. `strategy/02-market-analysis.md` section 6
reached the same place from the product side.

## E. Not signing protects the moat

The counter-intuitive part.

Section 3.d, the perpetual ban on norms, cutoffs, predictive algorithms and statistical
indices, only binds us **if we sign**. Unsigned, it does not exist. Norms computed from our
own tenants' data are ours. Copyright does not reach data or statistics, and there is no
contract.

**Signing forfeits the benchmark pool. Not signing keeps it.**

One thing to check: read the free individual licence Vijay accepted and confirm it does not
itself bar aggregation. Our terms should also make clear the counsellor owns their data and
grants us aggregation rights, which is a Deepen-to-counsellor question, not a
Deepen-to-Miller one.

## F. What to use for automated delivery

- **PHQ-9 and GAD-7.** Pfizer released these "without copyright restriction and at no
  charge", roughly 80 languages. Safe defaults, confirmed.
- **PCL-5.** US National Center for PTSD, public domain.
- **Alliance measure.** Open. The SRS is the alliance half of the product and PHQ-9 and
  GAD-7 do not replace it. WAI-SR (Hatcher and Gillaspy 2006, Munder et al 2010) is the
  obvious candidate but **its licence terms are unverified.** Confirm with the authors
  before building. Do not assume.

## G. The honest residue

- **Past use.** We have reproduced his wording digitally, in one practice, at zero revenue.
  Remediating now caps it. It does not erase it. Small, real, and not worth pretending away.
- **How different is different enough.** Whether our re-worded labels clear his expression
  is a judgment call. Lawyer, before it ships.
- **India trademark search.** Already open item 4 in `business/README.md`. Classes 9, 41
  and 42. Fold his marks into that search rather than running a separate one.

## H. Sequence

1. Strip the verbatim wording and de-default the cutoffs. This week. One afternoon.
2. Add the nominative-use disclaimer line wherever an instrument is named.
3. Lawyer reviews steps 1 and 2, plus past-use exposure.
4. Build automated delivery on PHQ-9 and GAD-7. Resolve the alliance measure separately.
5. Reply to Scott. Warm, unhurried, no signature. The ownership-warranty question from
   Addendum 1 section F still stands and still costs one email to ask.

We do not need his licence to run the product we are actually building. That is worth
knowing before any conversation about price.

---

# Addendum 3, 31 August 2026. OQ-45, checked as an alternative

Verdict: **worse for us than the ORS, on every axis. Do not pursue.**

| | ORS / SRS | OQ-45.2 |
|---|---|---|
| Items | 4 + 4 | 45 |
| Time | ~30 seconds | several minutes |
| Sessional | yes, designed for it | no, interval measure |
| Alliance measure | yes, the SRS | none |
| Owner | Miller, Duncan, Johnson | OQ Measures (Lambert, Burlingame) |
| Solo cost | free on paper | **from $250/yr per practitioner** |

Verified pricing, oqmeasures.com/pricing-3, retrieved 31 August 2026:

- **OQ-Analyst**, their digital platform. Solo practitioners "start at $250.00 annually"
  for up to 3 instruments, plus one-time setup. Tiers at $250 / $450 / $850 per 200 clients
  per year.
- **OQ-Paper.** One-time fee, one licence per instrument, priced per clinician.
- **OQ-Access.** Electronic publishing rights, "secure internal use only", custom quote.

Three reasons it fails for us.

1. **The economics invert.** $250/yr is roughly ₹21,000 per practitioner per year. Our plan
   is ₹999/month, about ₹12,000/yr. The instrument would cost the counsellor nearly twice
   what the software costs. Dead on arrival in the Indian market. This is the same
   affordability wall recorded in the workforce research.
2. **We would be licensing from the competitor.** OQ-Analyst is the tool named in
   `strategy/02-market-analysis.md` as the one serious product built around trajectory
   feedback. Depending on them for the instrument that powers our core feature is a worse
   position than depending on Miller, not a better one.
3. **45 items breaks the product.** OQ-Access is scoped "internal use only", which is not a
   vendor redistribution licence. And a 45-item form destroys the sessional-completion
   premise. Our entire adoption argument rests on the measure taking under a minute.

Nothing here changes the plan in Addendum 2. PHQ-9 and GAD-7 remain the defaults for
automated delivery, and the alliance measure remains the open question.

---

# Addendum 4, 31 August 2026. The individual licence, verified

Checked the actual terms printed on the distributed forms, because the whole pathway in
Addendum 2 rests on what the counsellor's own free licence permits. It holds. Quotes below
are verbatim from the licensed PDFs in circulation.

**Permits the paper leg, explicitly:**

> "Paper and pencil versions of the measures may be copied for use in connection with the
> licensee's bona fide health care practice."

So a counsellor photocopying the form and administering it in the room is squarely within
their licence. That is the foundation of the pathway and it is solid.

**Restricts the electronic version, explicitly:**

> "The administration and scoring manual, and any and all electronic versions or scoring
> products associated with the measures may NOT be copied, transmitted, or distributed by
> the licensee."

> "Since you are obtaining the license for individual use only, you may NOT distribute
> copies of the measures."

Confirms the restricted act is creating and distributing an electronic version. Confirms it
is the counsellor who is bound, alongside us.

**What it does not say.** Nothing bars a counsellor from recording their own scores in
their own clinical record system. That is ordinary record keeping, and the numbers are
facts. The pathway survives.

## Correction to a tempting misreading

The administration-versus-record-keeping distinction is correct, and it is the right
foundation. It does **not** make the current build safe.

Copyright is infringed by **copying**, not by delivery. Who hands the form to the client is
irrelevant. `clinical-note-editor.tsx` lines 433 to 436 reproduce his four ORS item labels
character for character, on screen, in a commercial product. That is the infringing act,
and it is unaffected by the client never seeing our screen.

A library catalogue saying it holds a book is fine. A page that reprints chapter one is not.
The reader's route to the book does not change the analysis.

**So: the pathway is sound, the current screen is not.** The fix is the one already listed
in Addendum 2 section D, and it is an afternoon.

---

# Addendum 5, 31 August 2026. The code change list, and the attribution question

Swept every user-facing occurrence of the names. Good news: the exposure is narrower than
feared. **Eight lines in one file.** The instruction paragraph ("Looking back over the last
week, including today...") is not in our code at all.

## What is actually wrong

Only one thing: `src/components/clinical-note-editor.tsx` reproduces his item wording.

**ORS, lines 433 to 436. All four verbatim:**
"Individually (Personal well-being)" · "Interpersonally (Family, close relationships)" ·
"Socially (Work, school, friendships)" · "Overall (General sense of well-being)"

**SRS, lines 460 to 463. Two verbatim, two paraphrased:**
"Relationship (I felt heard, understood, and respected)" and "Overall (Today's session was
right for me)" are his anchor sentences word for word. The other two are already reworded.

Everything else that mentions ORS or SRS is **naming**, not reproduction, and is lawful
nominative use. Chart series, stat labels, settings field labels, the CSV header "ORS
Total", the section heading "SRS (Session Rating Scale)". All fine. Leave them.

## Changes, in priority order

### Must, this is the legal fix

1. **Rewrite the eight item labels** in `clinical-note-editor.tsx`. Either drop to a single
   total field per instrument, or keep four subscales under our own words. He owns his
   sentences, not the four constructs.
2. **Delete "PCOMS default: 5"** from `settings/page.tsx` line 369. PCOMS is Barry Duncan's
   brand, and the line presents his benchmark as our supplied default. Say "commonly used
   value: 5" or drop the number.
3. **Stop shipping his numbers as defaults.** `schema.ts` lines 411 to 417 preset
   `orsCutoff` 25, `srsCutoff` 36, `orsRciThreshold` 5, `orsAmberLow` 26, `orsGreenLow` 32.
   Move to counsellor-entered at setup, no preset.

### Should, good faith and defence

4. **In-app notice** where measures are configured. Wording in section B below.
5. **Setup confirmation**: "I hold any licence required for the measures I use." One
   checkbox. Shifts responsibility where it belongs and evidences good faith.

### Do not

- **Do not rename internal identifiers.** `orsTotal`, `srsCutoff`, the DB columns, the API
  routes. Code is not publication. Already the stated position in
  `pricing-and-build-plan-2026-08.md`.
- **Do not strip ORS and SRS from chart labels, settings or exports.** Naming is lawful and
  stripping it makes the product worse for no gain.
- **Do not add any of this to the public site.** The brand guide already bars naming
  instruments in public copy. That rule now has a second reason to exist.

## B. The attribution question

**No trademark notice. A copyright acknowledgement, in-app only.**

Four reasons not to write "ORS® is a trademark of Performance Metrics PLLC":

1. **It may not be true.** His filed US marks appear to be FEEDBACK INFORMED TREATMENT and
   FIT, not the scale names. Asserting an unverified registration, and using the ® symbol
   for it, creates a problem rather than solving one.
2. **Nominative fair use imposes no attribution duty.** There is no legal obligation.
3. **But condition 3 of the *Consim* test is no suggestion of sponsorship or endorsement**,
   and *Hawkins* weighs good faith. A short disclaimer serves both directly. Cheap
   insurance, not obligation.
4. **Section 10 of the draft contract requires a rights notice on the interface. We are not
   signing.** Do not voluntarily adopt an obligation we declined.

Credit the copyright accurately, and credit **all** the named authors, not only Miller.
That matters given the co-ownership point in Addendum 1 section F.

### Suggested wording, in-app, at the point measures are configured

> The Outcome Rating Scale (ORS) and Session Rating Scale (SRS) are the copyright of their
> authors. ORS © 2000 Scott D. Miller and Barry L. Duncan. SRS © 2002 Scott D. Miller,
> Barry L. Duncan and Lynn Johnson. Deepen is not affiliated with, sponsored by, or
> endorsed by them. Deepen records scores you have collected. It does not supply or
> administer these instruments. You are responsible for holding any licence required for
> the measures you use.

Six sentences, four jobs: credits accurately, disclaims affiliation, states plainly what we
do and do not do, and places licence responsibility on the counsellor. The third sentence
is the one that matters most, because it is the whole legal position in nine words.

Placement: behind login, on the settings screen where thresholds are set, and optionally
collapsed under an "about these measures" link in the note editor. Not the footer. Not the
marketing site.

---

# Addendum 6, 31 August 2026. Linking counsellors to the licence, and analysing the data

## A. Should we link counsellors to the free licence? Yes, and it helps us

Linking is not distribution. We would be routing counsellors **into** his licensing system
rather than around it, which is the opposite of the infringing act.

It also does three useful things at once:

1. **Best available good-faith evidence.** *Hawkins* weighs good faith explicitly. A product
   that actively sends users to obtain a proper licence from the rights holder is the
   picture of it.
2. **Demonstrates the position rather than asserting it.** "Deepen does not supply these
   instruments" is more convincing when we point at who does.
3. **Solves compliance better than a checkbox.** A tick-box asserting a licence is weaker
   than a tick-box next to the path to get one.

### Rules for doing it

- **Link the registration page, never the PDF.** Counsellors must pass through his licence
  gate. Deep-linking past it undercuts the whole point.
- **Never host, mirror or email the forms ourselves.** Clause 5 of the individual licence
  forbids the counsellor distributing copies, and us hosting them is straightforward
  infringement.
- **No endorsement language.** "Get your free licence from the authors", not "our partner".
- **Say the solo boundary.** The free licence is individual use. A counsellor in a practice
  of two or more needs the group licence, $100 up to ten providers.

### Better: make it a Measures page, not an ORS page

List every supported instrument with its licensing status and where to get it. PHQ-9 and
GAD-7, free, no licence needed. PCL-5, public domain. ORS and SRS, free individual licence,
link. This reinforces the pluggable positioning, is genuinely useful, and avoids looking
like a distribution channel for one author's product.

## B. A finding that matters for India: no translation permitted

Clause 4 of the individual licence:

> "The licensee may NOT modify, translate into other languages, change the context,
> wording, or organization of the measures or create any derivative work based on them."

**A counsellor may not lawfully translate the ORS into Hindi, Marathi, Tamil or anything
else.** Official translations exist but must come from the licensor.

For a product whose market is Indian counsellors, many working in regional languages, that
is a hard product constraint, not a footnote. PHQ-9 and GAD-7 ship free in roughly 80
languages. This is a stronger argument for the PHQ and GAD default than anything currently
in the strategy set, and it is a product argument rather than a legal one. Add it to 02.

## C. Can we collect and analyse the data? Three separate questions

Easy to conflate. They have different answers.

### 1. Copyright: yes

Scores are facts. Facts are not copyrightable. India's standard is *Eastern Book Company v
D.B. Modak* (2008), a modicum of creativity, not effort. Aggregating, charting, computing
reliable change, building norms, none of it reproduces his expression.

### 2. Contract: yes, as things stand. Verified

Two limbs, both clear.

**Us.** Section 3.d of the draft, the perpetual ban on norms, cutoffs, predictive algorithms
and statistical indices, binds us **only if we sign**. Unsigned, it does not exist.

**The counsellor.** This was the open worry in Addendum 2 section E: does something in their
own licence flow down and bar aggregation? **Checked. It does not.** The Binding License
Agreement restricts: converting to electronic format, copying or transmitting electronic
versions, modifying or translating or creating derivative works, distributing copies, and
use outside a bona fide practice. **It contains no clause about aggregating scores, creating
norms, or analysing data gathered.** There is no equivalent of 3.d in it.

Caveat: that text is the Better Outcomes Now version. A counsellor could register through
either site. Read Miller's version too before relying on this.

### 3. DPDP: this is the real constraint, and the plan is already right

`marketing/homepage-v3-plan-2026-08.md` sections 4 and 6 already have the correct shape:
counsellor is the Data Fiduciary, Deepen processes on their instruction, benchmark pool off
by default, three numbers per reading, de-identified, switchable off, consent wording
written for DPDP.

Nothing to redesign. Two things to actually do:

- **Make the position real rather than claimed.** `homepage-copy-fixes.md` section 2 already
  flags that the public FAQ asserts "fully compliant with the DPDP Act" with no review
  behind it. That fix is still open and it is the blocker here, not the licence.
- **Get the grant in the counsellor contract.** Our terms must say the counsellor owns their
  data and grants Deepen the right to use de-identified aggregates for benchmarking, opt-in.
  That is a Deepen-to-counsellor question. It has nothing to do with Miller.

### Bottom line

Copyright does not stop us. Contract does not stop us, as long as we do not sign. DPDP is
the only real gate, and we already know what to build. **The benchmark pool is available to
us. It stops being available the day we sign Scott's agreement.**
