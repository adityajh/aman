# Home Page Plan — FINAL
## Build-ready spec for `src/app/home/page.tsx`

*July 2026. Supersedes all earlier home page briefs. Competitor data verified by direct site inspection on 31 July 2026.*

---

## 0. Read this first — the research changed the plan

Five therapy competitors were inspected page by page, plus Zoho. Four findings overturned earlier assumptions:

**0. The admin layer is free — and an Indian company is giving it away.**

**Zoho Invoice is free forever**: invoices, credit notes, automated payment reminders, online and offline payment collection, expense recording, a client self-service portal, and reports. **Zoho Bookings' free plan** adds unlimited appointments, a booking page, two-way calendar sync and automated reminders.

Together: **₹0/month**, GST-native, from a Chennai company Indian professionals already trust. That is the entire Aman Practice feature set, free, from a more established vendor. (Zoho One, if they want all 45+ apps, is ₹1,250–1,500/employee/month annual plus 18% GST — a solo practitioner is one employee.)

**Consequence: the page cannot sell administration.** Not at ₹999, not at any price. Everything below assumes the thing being sold is the clinical layer.

**1. The Practice tier cannot win on features either.**

PracFlow at ₹1,199–1,499/month ships: scheduling with Google Calendar sync, vacation mode, automated reminders, client portal, intake forms, feedback forms, digital resource library, assignments, workshops, group sessions, packages, coupons, WhatsApp and email comms, payment gateway, **GST management**, whitelabeling, and GDPR + HIPAA + ISO 27001 + **DPDP** compliance.

Aman Practice at ₹999 has less of nearly all of it, and Zoho has the rest for nothing. **The billing-and-notes layer has no pricing power in India.**

**Consequence: the home page sells Pro, on one card. See §9 for the tier decision.**

**Open question for Adi — worth deciding before build:** whether Practice should exist at all. One product at ₹1,999, doing one thing nobody else does, is a cleaner story than two tiers where the cheap one loses every comparison. The counter-argument is that Practice catches price-sensitive sign-ups who might convert later. The spec below assumes Practice survives as a footnote; killing it entirely means deleting §9's second paragraph and FAQ item 1.

**2. Several claimed differentiators don't survive contact.**

| Earlier claim | Verified reality |
|---|---|
| Multi-currency is unique | PracFlow accepts payments globally in any currency. Aman's real claim narrows to *INR and USD clients handled as separate batches in invoice totals* — an accounting distinction, not a payments one |
| RLS isolation is a selling point | PracFlow publicly claims GDPR, HIPAA, ISO 27001 and DPDP. "We use row-level security" loses to four named certifications |
| Competitors have no measurement | PracFlow's **Feedback Forms** offer custom 1–5 and 1–10 rating scales with aggregate trend reports. Adjacent, not identical — but "they have nothing" is false |
| Expense tracking | PractiPal has it. Aman doesn't. This is a loss row |
| GST | PracFlow has it. Aman doesn't. Loss row |

**3. What genuinely survives — and it's enough.**

Not one of the five does any of the following:

- **Deterioration flagging against the client's own baseline**
- **Cohort-matched trajectory prediction** (globally, only OQ-Analyst)
- **Practice-level clinical outcome statistics** — reliable change, clinically significant change, effect size, premature termination rate

Critically: **both Indian competitors label business metrics as "analytics."** PractiPal's "Practice Analytics" is client retention, revenue trends and cancellation tracking. PracFlow's "Measure What Truly Matters" is attendance, balances, projected income. Neither measures whether clients are getting better.

**That gap — clinical outcomes vs business outcomes — is the entire positioning.**

---

## 1. Verified competitor data

*Inspected directly, 31 July 2026. Re-verify before publishing; vendors change pricing without notice.*

### PractiPal (India)
- **₹1,499/mo** solo · free tier to 5 clients · ₹1,899 multi-therapist marked "Coming Really Soon"
- Billing & Tracking: financial dashboard, invoice generation, **expense tracking**
- Practice Analytics: **client retention rates, monthly revenue trends, cancellation tracking** — business metrics
- Secure Notes: HIPAA-compliant encryption, therapy templates, one-click history
- Resources: client portal, PDF/image upload, email notification on share
- Scheduling, One Page Profile
- **Compliance framed as HIPAA, not DPDP** — a US framework marketed to Indian therapists. Exploitable
- **No outcome measurement of any kind**

### PracFlow (Gurugram)
- **₹1,199/mo annual · ₹1,499/mo monthly** solo · same per-member for teams, admin seats free · **or 5% commission, no fixed fee** · 30-day trial
- Scheduling: availability, client-requested booking, Google Calendar sync, automated reminders (claims 30% no-show reduction), vacation mode
- Payments: **global, any currency**, invoices and statements, automated refunds and reminders, ~1 week settlement, **GST & convenience fee management**
- Client care: worksheets, assignments, digital intake forms, secure client portal, notes with PDF export
- Growth: workshops, group sessions, packages, coupons, sellable digital resources
- Analytics: attendance, balances, monthly practice-health reports, projected income, pending invoices, accounting export — **business metrics**
- **Feedback Forms**: customisable post-session forms, rating scales (1–5, 1–10), multiple choice, open-ended, aggregate satisfaction/engagement reports, automated or manual sending
- Teams: revenue sharing, client matching, supervision, role-based access, isolated data, whitelabeling
- **GDPR · HIPAA · ISO 27001 · DPDP**
- 10% affiliate commission programme

### Therasoft India
- **₹129/appointment** (min ₹999/mo) · **₹79/appointment** (min ₹699/mo per therapist) · ₹59 tier at higher volume
- Clinical assessments, treatment planner (problem → goal → objective → intervention), progress notes with dictation, DSM-5 templates
- Scheduling with SMS/email reminders, website builder with booking, therapist directory, digital intake with e-signature, insurance claims
- **HIPAA-framed legacy US product ported to India.** Nearly two decades old
- Assessments are intake instruments, **not sessional outcome monitoring**

### Greenspace (global — MBC specialist)
- **$24.99/mo** Basic · $39.99 Premium (~₹2,100 / ₹3,400)
- **500+ evidence-based assessments**, automatic delivery, symptom graphs
- Monitors symptoms, functioning, quality of life, treatment satisfaction, **therapeutic alliance**
- Client-facing results — clients see their own graphs
- G2's 2026 Best MBC Software
- **No trajectory prediction or risk alerting found on the provider page**
- Measurement layer only — no notes, no billing

### Blueprint (global)
- **Core EHR free** · AI: Standard $0.49 / Plus $0.99 / Pro $1.49 **per session**
- No monthly minimum, no contract, credits never expire, 60-day money back
- 70,000+ mental health professionals · HIPAA, PHIPA, SOC 2
- **Has effectively vacated the MBC positioning** — the pricing page is entirely AI documentation and clinical support. Measurement is not mentioned once
- At 60 sessions/month on Plus that's ~$59 (~₹5,000). "Free" applies to the EHR, not the AI

### Caveat
This is marketing-page inspection, not hands-on product testing. Absence from a marketing site is strong evidence but not proof. Any cell in a published comparison table should be re-verified before it goes live.

---

## 2. Copy rules — non-negotiable

1. **Never name ORS or SRS anywhere on the site** until IP review clears. Write "your outcome measure," "the scale you already use," "any sessional measure." Removes the exposure and reinforces the pluggable positioning.
2. **Never say "multi-tenant" or "row-level security."** Competitors list four named certifications; an architecture term loses to that. Translate to plain benefit, and don't over-invest in this section.
3. **Never claim the software improves clinical outcomes.** Unsupportable and edges toward a regulated claim. Say what it does: *shows*, *flags*, *tracks*, *compares*.
4. **Never claim novelty.** OQ-Analyst has done trajectory alerting since the 1990s. Claim *better packaged, in one system, at a fraction of the price* — never *first*.
5. **Never say competitors have "no measurement."** PracFlow has feedback forms with rating scales. The accurate claim is that their analytics measure *the business*, not *the client*.
6. **All screenshots use fabricated demo data.** Never Vijay's clients, never real scores, never a real name, not even blurred. Build a demo tenant.
7. **Any statistic needs a real citation.** No sourced study, no number.
8. **Concede losses openly.** Scheduling, client portal, automated delivery, GST, expense tracking — all absent. With clinicians, conceding builds the credibility that makes the wins land.

---

## 3. Page structure

### §1 — Hero

**H1:** *Your analytics tell you about your business. Not your clients.*

**Sub:** Aman tracks whether your clients are actually getting better — session by session — and flags the ones sliding backwards before they drop out. Billing included, so it's one system, not two.

**Primary CTA:** Start your 14-day trial
**Secondary:** Watch a 6-minute walkthrough → Loom

**Visual, above the fold:** a Predicted Progress chart on demo data — client line against the shaded cohort band, amber verdict visible. The one screenshot no Indian competitor can produce.

*The H1 is a direct strike at the category. Both Indian competitors sell "analytics" that count money and attendance. Naming that gap is sharper than any feature claim.*

---

### §2 — The problem

> Every practice tool in India will tell you your revenue trend, your retention rate, and how many sessions you cancelled last month.
>
> None of them will tell you whether the person you saw on Tuesday is getting better.
>
> And a meaningful minority of clients get worse in therapy. Without measurement, that's usually invisible until they stop booking.

Then one sourced line on deterioration rates or therapist self-assessment accuracy. **Source it or cut the number.**

Close: *You don't need a research department. You need a few numbers a session and something that reads them for you.*

---

### §3 — USP 1: Deterioration flags

**Heading:** *You'll know by session three.*

Aman watches every score against that client's own baseline. When wellbeing drops past your threshold, or the working relationship weakens, the session note carries a flag — and tells you why, in plain language.

**Visual:** the flag with its reason string, generically relabelled per rule 1.
**Sub-point:** thresholds are yours to set.

---

### §4 — USP 2: Predicted Progress — the hero feature, most space on the page

**Heading:** *Is this client on track — or just not there yet?*

The hardest question in practice. Aman answers it by comparing this client against everyone who started at a similar place: a shaded band of expected recovery, their line over it, and a straight verdict — ahead, tracking, or behind.

**Visual:** full-width chart, three verdict states as small variants.

**The honesty beat — keep it, it converts:**
> When there isn't enough history to say anything useful, Aman says so. It won't guess.

**The OQ-Analyst paragraph — include it:**
> This isn't a new idea. Trajectory-based feedback has thirty years of research behind it and one serious tool built around it, priced for institutions and built like a research instrument. Aman brings the same mechanism into the system where you already log your sessions and send your invoices.

Naming your strongest competitor is disarming to a clinical audience and inoculates you against the prospect who already knows.

---

### §5 — USP 3: Your practice's real numbers

**Heading:** *The answer to the question your supervisor asks.*

Across the clients you've closed: how many reliably improved, how many recovered, how many got worse, how long they stayed, how strong the alliance was, how many left early.

**Visual:** outcomes dashboard.
**Framing:** write for someone who does not yet measure. Lead with the question, not the statistic.

---

### §6 — Billing — one compact section, below the fold

**Heading:** *And your month closes in ten minutes.*

Log sessions through the month. One click generates every invoice, keeps INR and USD in separate batches, pro-rates the short sessions, emails them out. Receipts, part-payments and credits handled properly.

Billing is why people stay. It is not why they arrive. Keep it short.

---

### §7 — Comparison

**One table, and it is deliberately not flattering.**

| | **Aman Pro** | PractiPal | PracFlow | Greenspace | Zoho (free stack) |
|---|---|---|---|---|---|
| Session notes & documentation | ✓ | ✓ | ✓ | — | DIY |
| Invoicing & payments | ✓ | ✓ | ✓ | — | ✓ |
| Client satisfaction feedback | — | — | ✓ | ✓ | DIY |
| Sessional outcome measurement | ✓ | — | — | ✓ | — |
| **Deterioration flags vs baseline** | **✓** | — | — | — | — |
| **Trajectory prediction** | **✓** | — | — | — | — |
| **Clinical outcome statistics** | **✓** | — | — | — | — |
| Business analytics (revenue, retention) | Partial | ✓ | ✓ | — | ✓ |
| Scheduling & reminders | — | ✓ | ✓ | — | ✓ |
| Client portal | — | ✓ | ✓ | ✓ | ✓ |
| Automated measure delivery to client | *on the roadmap* | — | — | ✓ | — |
| GST management | — | — | ✓ | — | ✓ |
| Expense tracking | — | ✓ | — | — | ✓ |
| Built for therapists | ✓ | ✓ | ✓ | ✓ | — |
| Price / month | **₹1,999** | ₹1,499 | ₹1,199–1,499 | ~₹2,100 | **₹0** |

**Seven losing rows, and one competitor at zero. Keep every one of them.** A table showing only wins reads as marketing; this one reads as an honest positioning statement — *we do three things nobody else does, and less of everything else.*

**On the Zoho column — corrected.** The column should show the **free** stack, not Zoho One. Zoho Invoice is free forever (invoices, reminders, payment collection, expense tracking, client portal, reports) and Zoho Bookings' free plan covers scheduling and reminders. The honest comparison is ₹0, not ₹1,250. "DIY" marks capabilities that exist in the suite but need assembling.

Including a free competitor is counter-intuitive and correct: it makes the argument for you. A reader seeing ₹0 beside a column with three blank clinical rows understands immediately what the ₹1,999 is actually for. A price-conscious Indian buyer will think of Zoho whether or not the table names it — answering it on your own page beats losing to it silently.

**Caption below:**
> Aman does less than most of these, and some of it you can get free. What it does instead is tell you whether the work is working — and it's the only one here that does that at all.

**Second caption, smaller:**
> Verified [month] 2026. Compiled from public product pages; check current features before deciding.

---

### §8 — Your data

Keep this short — it's a hygiene section, not a differentiator. Competitors list four certifications; don't pick that fight.

- Client records isolated at the database level, enforced by the database rather than by application code
- Full export of everything — clients, sessions, notes, invoices, receipts — one click, any time, including after you cancel
- Hosted in India · never used to train anything

*If DPDP certification is pursued later, this section gets rewritten. Until then, understate it.*

**If the benchmark pool ships:** one honest paragraph. Three numbers leave your practice with no name attached, it's off unless you turn it on, and it's what makes the prediction work for everyone.

---

### §9 — Pricing — Pro as the product, Practice as a footnote

**One card.**

> ## Aman Pro
> **₹1,999/month · ₹19,990/year**
> Everything: clients, sessions, notes, full billing, receipts — plus outcome tracking, deterioration flags, progress charts, Predicted Progress, and your practice outcomes dashboard.
> 14-day trial. No card charged until it ends. Cancel any time, export everything.

### The tier decision — Adi's call, but the research points one way

The Practice tier now faces free. Zoho Invoice and Zoho Bookings give an Indian solo therapist invoicing, payment collection, expense tracking, a client portal, booking and reminders for ₹0, permanently, with GST built in.

**Recommended: drop the Practice tier.** Sell one product. It removes feature gating, upgrade flows, comparison-shopping questions and pricing-page complexity — all of which cost hours a low-time operator cannot spare, and all of them incurred by the tier that cannot be defended on price.

**If Practice stays, it must be sold on clinical documentation, not billing.** Zoho bills a *customer*; it does not hold a *clinical record*. No structured session note, no clinical history, no termination workflow, no per-session fee logic. The line is:

> *Zoho can send your invoices. It can't hold your clinical record.*

In that case it appears as body text below the Pro card, never as a co-equal card:
> *Not measuring outcomes yet? Aman Practice keeps your clinical records and billing in one place at ₹999/month. Move up whenever you're ready.*

**Rejected: making Practice free.** It contradicts the no-free-tier discipline and imports precisely the support load the operating model exists to avoid.

### The anchor — directly above the card

> Greenspace, for measurement alone: ~₹2,100/month.
> Add an Indian practice tool for the billing: another ₹1,199–1,499.
> **Aman Pro does both — plus trajectory prediction neither offers — for ₹1,999.**

**Verify both figures on the day this ships.**

*Badge: "Most therapists who measure choose this." Not "RECOMMENDED."*

---

### §10 — FAQ

1. **I don't currently measure outcomes. Is this for me?** — Start on Practice; move to Pro when ready.
2. **Which measure do I use?** — Bring your own, or use a built-in option. Aman reads any sessional scale.
3. **Does this replace my calendar?** — No. Deliberately.
4. **Do you have scheduling / a client portal / reminders?** — Not yet. If those are your main problem, PractiPal or PracFlow will serve you better. *(Answering this honestly costs a few sign-ups and buys credibility with everyone who stays.)*
5. **Is my client data safe?** — Point to §8.
6. **What if I stop paying?** — Full export, always.
7. **How is this different from my current tool's analytics?** — Theirs measure the business. This measures the client.
8. **I already have Zoho One / could just use Zoho. Why pay for this?** — Zoho gives you fifty apps and does most of them well. None of them will tell you a client has dropped seven points from their baseline and is about to stop booking. Aman does one thing Zoho structurally can't, and handles your billing so you're not running two systems for it.

---

### §11 — Footer

Fix the entity name once the rename lands. Currently reads "Aman Counseling Software," which is the design partner's practice name.

---

## 4. Build order

1. **Strip ORS/SRS from all copy** — one hour, independent of everything else, removes the only public licensing exposure
2. Build the demo tenant with fabricated data
3. Capture three screenshots: Predicted Progress, flag with reason string, outcomes dashboard
4. Rewrite hero and restructure sections
5. Comparison table — re-verify every cell the day it ships
6. Pricing: single Pro card at ₹1,999 with Practice as body text
7. FAQ
8. Rename product; fix footer

Steps 1–3 unblock everything else.

---

## 5. Open items for Adi

1. **Product name** — blocking the pricing page and the footer
2. **Automated measure delivery** — the one row where every specialist beats Aman. Re-scope the Phase 4 portal to this and the roadmap cell becomes a shipped ✓. Highest-value build on the list
3. **DPDP posture** — PracFlow claims four certifications. Decide whether to pursue or to stay quiet on this ground
4. **IP review** on the pluggable instrument model before launch
