# Aman — Business Strategy

*July 2026. The strategic document. The market analysis and home page plan sit underneath this one.*

---

## 1. The thesis

> **In India, there is no way to tell a good counsellor from a bad one — including for the counsellor themselves. Aman gives counsellors evidence of their own effectiveness, so they can improve their practice and charge what they're worth.**

Counselling in India is effectively unregulated. Anyone can practise. Clients choose on price, proximity or instinct. Referrers have nothing to go on. And the counsellor who is genuinely excellent has no way to demonstrate it — so they compete on the same terms as everyone else, and price accordingly.

That vacuum is the market. Not admin. Not invoicing. **The absence of any signal of quality.**

---

## 1.5 Who this is for — and why it's a hard filter

**Aman is for counsellors who want to know whether they are actually helping, including when the answer is uncomfortable. Business is a byproduct.**

This is a values-based segmentation, not a demographic one, and it is deliberately narrow. The counsellor we want is the one who asks *"is this working?"* about a client who isn't improving. The counsellor we don't want is the one who wants a number for their website.

### Why this is a product requirement, not a preference

Every downstream capability — flags, trajectories, reports, benchmarks — rests on self-reported data. A counsellor motivated by marketing will measure their straightforward clients, skip the difficult ones, and stop entirely in a bad month. Their data is worse than useless: it degrades the benchmark pool that every other counsellor's prognosis depends on.

**Honest users are not a nice-to-have. They are the raw material.**

### What this changes

- **The deterioration flag leads, not Predicted Progress.** "We'll show you which clients are sliding backwards" is a filter. It attracts people who want to know and repels people who want a badge. Predicted Progress is the better demo; the flag is the better opening line.
- **Never lead with fee increases.** Better pricing is a real consequence of demonstrable results and belongs in an FAQ or a month-three email — never in a hero, never in an ad.
- **Screen the beta explicitly.** Ask each candidate about a client they didn't help. The answer is the whole assessment.
- **Never build anything that turns evidence into advertising.** No badges, no seals, no verified-counsellor widgets, no public directory. The moment outcome data becomes a marketing asset, the rational move is to stop taking hard clients.

### The trade being made

This caps the market. There are likely a few hundred counsellors in India who fit this description today, not a few thousand. For a target of 100 paying users that is ample. If Aman ever stops being a side product, this constraint is the first thing to revisit — and revisiting it will be genuinely difficult, because a product built on honest data cannot easily absorb users who aren't.

---

## 2. The two things we do

Everything else is either a wedge or a distraction.

### Thing one — make measurement effortless enough to actually happen

The reason most counsellors don't measure isn't disagreement; it's friction. Hand-scoring a form doesn't survive a full caseload. Every serious platform in this category solves delivery automatically. Aman currently doesn't — the counsellor types scores in by hand.

**This is the single most important gap in the product.** Measurement that depends on remembering does not happen, and everything downstream — flags, trajectories, proof — is built on data that must arrive reliably.

### Thing two — turn that measurement into proof the counsellor can use

Raw scores are clinically useful in the moment. But the artefact that compounds is a counsellor being able to say — first to themselves, then to whoever they choose:

> *"Across the clients I've closed, this proportion reliably improved. Here's the data. Here's how it compares to the benchmark."*

No counsellor in India can currently say that. It is a credential where none exists — usable with supervisors, referrers, employers, institutions, and clients.

The first audience is the counsellor themselves. Most practitioners have never seen their own outcome data and have no idea whether they are improving over their career. That is the point.

**Better pricing follows, but it is a consequence and never the pitch.** A counsellor who can evidence their outcomes can defend a higher fee — which makes the subscription pay for itself several times over. Say this once, late, to people already using the product. Leading with it recruits exactly the users whose data cannot be trusted.

---

## 3. What we are not

Focus is enforced by a published list, not by intention.

**We will never build:** scheduling or calendars · telehealth or video · client booking pages · insurance or claims · marketing sites or directories · AI note drafting · GST filing or accounting · expense management · clinic and multi-therapist management · public badges, seals or a counsellor directory · gamification, streaks, scores or grades.

**And we will never sell to organisations.** Not platforms, not startups, not employers, not EAP providers — at any price, ever. This is the highest-risk revenue available to us: financially attractive, and it would destroy the product's meaning for the exact counsellor we are built for. See §3.5.

Some of these are genuinely useful. All of them are available elsewhere, several of them free. Every one we build costs us the thing we are actually good at.

**When a customer asks for one, the answer is a link to the list — not a roadmap conversation.**

---

## 3.5 The line between medicine and poison

**The same feature helps or harms depending entirely on who holds it.**

ICP research surfaced an Indian therapist at a large mental health startup describing standardised outcome scales as a source of shame — mandated by her employer, reported to investors, and internalised by her as a verdict on her own worth.

Aman gives counsellors outcome scores, deterioration flags and an effectiveness dashboard. **To a therapist with that history, this is a reproduction of the worst thing that happened to her at work** — unless the control structure and the framing are unmistakably different.

| Poison | Medicine |
|---|---|
| Imposed by someone else | Chosen by the counsellor |
| Visible to management or investors | Visible only to the counsellor |
| Read as a verdict on worth | Read as information about a client |
| Compared against colleagues | Compared against the client's own baseline |
| Consequences attached | No consequences, ever |
| Framed as performance | Framed as curiosity |

### Five decisions that keep us on the right side

1. **Never sell to organisations.** §3.
2. **State data ownership visibly**, on the home page, not buried in a policy: nobody else can see this — not an employer, not a platform, not us — and you can export or delete it at any time.
3. **Flags describe the client, never the clinician.** Always paired with a reason string. Never a score attached to the counsellor.
4. **The practice dashboard carries a permanent framing line:** these numbers describe a caseload, not a clinician, and harder caseloads produce harder numbers.
5. **No streaks, scores, grades or gamification.** A counsellor who internalises client failure will internalise a broken streak too.

**This is not an ethics appendix. It is the difference between the product working and the product being quietly abandoned by the people it was built for.**

---

## 4. The three layers

The business is one funnel with three stages. Each has a distinct job and must not be judged by another's metric.

### Layer 1 — Practice (the wedge) · ₹999/mo · ₹9,990/yr

**Job: acquisition. Nothing else.**

We do not win this layer on features — PracFlow and PractiPal have more, and Zoho gives away invoicing and scheduling permanently. We win it on **the two things a non-technical counsellor actually cares about: it's cheap, and it works in fifteen minutes.**

A counsellor assembling Zoho must create multiple accounts, configure a booking page, build invoice templates, and then live with a system where a session and an invoice have no relationship and no clinical record exists anywhere. Most will never start. That friction is our moat, and it is more durable than any feature.

**Therefore the investment here is onboarding, not functionality:**
- Signup to first client in under five minutes
- Sensible defaults that need no configuration
- One-screen import of an existing client list
- First invoice generated inside the first session of use
- Zero required setup decisions before the product is useful

**Practice is deliberately capped.** It gets no new features after it works well. Every hour spent improving it is an hour not spent on the two things.

### Layer 2 — the habit (the conversion mechanism)

Between a Practice subscriber and a Pro subscriber sits one behaviour: **recording a few numbers each session.**

That behaviour is created by three things, in order of leverage:

1. **Automated delivery.** The client receives the measure before the session and completes it in ninety seconds. The counsellor does nothing. *This is the highest-value thing on the entire roadmap.*
2. **A free webinar.** Recorded once, run monthly, open to anyone. Teaches routine outcome monitoring as a practice — instrument-agnostic. It is marketing, not a product: no fulfilment obligation, no support burden, infinitely repeatable.
3. **Visible locked features.** Pro capabilities are shown in-app, greyed, with the webinar as the unlock path. Hidden features never get upgraded to.

*Note: the webinar is free and stays free. It is a funnel, not a deliverable — that distinction is what keeps it from consuming the founder.*

### Layer 3 — Pro (the business) · ₹1,999/mo · ₹19,990/yr

Outcome tracking · deterioration flags · progress charts · Predicted Progress · practice outcomes dashboard · **the Outcome Report**.

This is where the money and the differentiation live. It is the only layer that gets significant build effort.

---

## 5. The Outcome Report — the thing that doesn't exist yet

The clinical engine is built. The **outward-facing artefact** is not, and it is what makes the thesis real.

A shareable, well-designed PDF the counsellor generates on demand:
- Number of clients closed, and over what period
- Proportion who reliably improved, recovered, stayed flat, deteriorated
- Average working alliance
- Median tenure and premature termination rate
- **Baseline-severity context** — how this caseload compares in starting difficulty
- Generated date, methodology note, instrument used

**Case-mix adjustment is not optional.** A counsellor working with severe presentations will show worse raw outcomes than one seeing mild adjustment difficulties. Publishing unadjusted numbers would punish exactly the people doing the hardest work. Aman's cohort-matching already adjusts for baseline severity — that capability is what makes this defensible where naive outcome reporting would be indefensible.

Build this in the same phase as automated delivery. Together they are the product.

---

## 6. Pricing

| | Practice | Pro |
|---|---|---|
| Monthly | ₹999 | ₹1,999 |
| Annual | ₹9,990 | ₹19,990 |
| Job | Acquisition | Revenue |

**Why ₹999 and not lower:** against free, the argument is never price — it is effort saved. ₹33/day against an afternoon of setup plus permanent two-system friction is an easy case. Going to ₹499 wouldn't strengthen it and would make the 4× jump to Pro much harder to climb. A 2× step is a decision; a 4× step is a re-evaluation.

**No free tier.** 14-day trial, card at signup.

**Annual is the default** on both tiers. Indian recurring-mandate failures are an admin tax a low-time operator cannot absorb.

### The Pro pricing argument — and where it belongs

> Counsellors who can evidence their outcomes can defend their fees. If this helps you raise yours by ₹100 a session, twenty sessions a month covers the subscription several times over.

**This does not go on the home page.** It belongs in the pricing FAQ, or an email to someone already measuring. It is a true and useful argument that attracts the wrong buyer when used as a hook.

---

## 7. The north-star metric

Not signups. Not MRR. Not Pro conversion.

> **Number of counsellors who have recorded outcome scores for four consecutive weeks.**

This is the only number that predicts everything else. A counsellor who measures for a month keeps measuring, upgrades, generates reports, feeds the benchmark pool, and refers peers. One who doesn't will churn regardless of what they're paying.

**Report it weekly. Judge every product decision against it.**

Secondary: Practice→Pro conversion rate · benchmark pool opt-in rate · founder hours per month.

---

## 8. Sequence

| Phase | Build | Why |
|---|---|---|
| **Now** | Strip ORS/SRS from public copy · IP review · rename · onboarding to <5 min | Unblocks everything; removes the only public legal exposure |
| **Next** | **Automated measure delivery** (re-scope the client portal) | Without it, thing one doesn't work and nothing downstream is reliable |
| **Then** | **The Outcome Report** | Without it, thing two doesn't exist |
| **Then** | Benchmark pool + peer comparison | **A substitute for the peer reference these counsellors cannot otherwise get.** Supervision in India is gatekept by academic network and cost; the pool is the only accessible answer to "is my experience normal?" It is also the only compounding moat available |
| **Later** | Fee guidance from outcome percentile | Closes the loop from evidence to pricing |
| **Never** | See §3 | |

The client portal was scoped as a payment-history view. **Re-scope it entirely to measure delivery.** It outranks AI note drafting, which is a commodity within a year and not the differentiator.

---

## 9. Risks

| Risk | Severity | Response |
|---|---|---|
| **Self-reported data is gameable** — a counsellor can measure only their easy clients | High | Report completeness alongside outcomes: "based on X of Y closed clients." An incomplete report is visibly incomplete |
| **Case-mix punishes hard caseloads** | High | Baseline-severity adjustment, always. Never publish raw comparative rankings |
| **The credential becomes a marketing badge** and encourages cream-skimming | Medium–High | Never build a public directory or league table. The report is counsellor-controlled and shared at their discretion. We provide evidence, not verdicts |
| **Outcome data used against counsellors** by employers or platforms | Medium | Data belongs to the counsellor. No third-party access, ever. State this publicly |
| ORS/SRS digital licensing | High | Pluggable instruments; PHQ-9/GAD-7 defaults; IP review before launch |
| Clinical data and DPDP | High | Encryption at rest, India residency, documented breach process, benchmark pool opt-in and de-identified |
| Single maintainer | Medium | Permanent one-click full export, published as a trust feature |
| A funded competitor localises | Medium | The benchmark pool compounds; nothing else here does |

**The ethical line to hold:** Aman shows a counsellor their own data and helps them improve. It does not rank counsellors, does not publish verdicts, and does not tell clients who is good. The moment it does any of those, the incentive to select easy clients overwhelms the incentive to help hard ones — and the product starts damaging the thing it exists to improve.

---

## 10. The one-sentence test

Every proposed feature gets asked:

> **Does this help a counsellor find out whether they are actually helping — including when the answer is uncomfortable?**

Automated delivery: yes. Outcome report: yes. Benchmarking: yes. Deterioration flags: emphatically yes.
Scheduling: no. Telehealth: no. AI notes: no. GST: no. Expense tracking: no.
Public badges, verified seals, a counsellor directory: no — and not later either.

If the answer is no, it goes on the list in §3.
